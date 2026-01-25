import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Mail, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { authService } from '../services/api';
import Swal from 'sweetalert2';
import './Login.css';

export function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const turnstileRef = useRef(null);
  const widgetId = useRef(null);

  // 🛡️ Carrega o Script do Turnstile e Renderiza o Widget
  useEffect(() => {
    const initTurnstile = () => {
      if (window.turnstile && turnstileRef.current) {
        if (widgetId.current) window.turnstile.remove(widgetId.current);

        try {
          const id = window.turnstile.render(turnstileRef.current, {
            sitekey: '0x4AAAAAACOaNAV9wTIXZkZy',
            theme: 'dark',
            callback: (token) => {
              setTurnstileToken(token);
            },
          });
          widgetId.current = id;
        } catch (err) {
          console.error("Erro ao renderizar Turnstile:", err);
        }
      }
    };

    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = initTurnstile;
      document.body.appendChild(script);
    } else {
      initTurnstile();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return Swal.fire({
        icon: 'error',
        title: 'Senhas Diferentes',
        text: 'A confirmação de senha não confere.',
        confirmButtonColor: 'var(--primary)'
      });
    }

    if (!turnstileToken) {
      return Swal.fire({
        icon: 'warning',
        title: 'Verificação Necessária',
        text: 'Por favor, complete o desafio de segurança.',
        confirmButtonColor: 'var(--primary)'
      });
    }

    setLoading(true);
    try {
      // 1. Criar a conta
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        turnstile_token: turnstileToken
      });

      // 2. Fazer login automático para obter o token/contexto
      await login(formData.username, formData.password, turnstileToken);

      // 3. Sucesso e Redirecionamento Direto para o Dashboard
      Swal.fire({
        icon: 'success',
        title: 'Conta Criada!',
        text: 'Bem-vindo ao sistema! Você será redirecionado para o seu painel agora.',
        timer: 2000,
        showConfirmButton: false,
        background: '#1a1a1a',
        color: '#fff'
      }).then(() => {
        navigate('/dashboard'); // 🚀 ALTERADO: Agora vai direto para o Dashboard
      });

    } catch (error) {
      console.error("Erro no registro:", error);
      Swal.fire({
        icon: 'error',
        title: 'Falha no Cadastro',
        text: error.response?.data?.detail || 'Ocorreu um erro ao criar sua conta.',
        confirmButtonColor: 'var(--primary)'
      });
      
      // Reseta o Turnstile em caso de erro
      if (window.turnstile && widgetId.current) {
        window.turnstile.reset(widgetId.current);
        setTurnstileToken('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <UserPlus size={32} color="var(--primary)" />
          </div>
          <h1>Criar Conta</h1>
          <p>Junte-se à nossa plataforma</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group-login">
            <User size={20} className="input-icon" />
            <input 
              type="text" 
              name="fullName"
              placeholder="Nome Completo *" 
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group-login">
            <User size={20} className="input-icon" />
            <input 
              type="text" 
              name="username"
              placeholder="Nome de Usuário *" 
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group-login">
            <Mail size={20} className="input-icon" />
            <input 
              type="email" 
              name="email"
              placeholder="E-mail *" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group-login">
            <Lock size={20} className="input-icon" />
            <input 
              type="password" 
              name="password"
              placeholder="Senha *" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group-login">
            <Lock size={20} className="input-icon" />
            <input 
              type="password" 
              name="confirmPassword"
              placeholder="Confirmar Senha *" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* 🛡️ WIDGET CLOUDFLARE TURNSTILE */}
          <div 
            ref={turnstileRef} 
            style={{ 
              minHeight: '65px',
              margin: '15px 0', 
              display: 'flex', 
              justifyContent: 'center' 
            }}
          />

          <Button 
            type="submit" 
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'} <ArrowRight size={18} />
          </Button>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: 'var(--primary)', 
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Fazer Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}