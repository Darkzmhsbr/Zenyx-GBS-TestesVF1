import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext'; // Importamos para usar a função login do contexto
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
  const { login } = useAuth(); // Usamos o login do contexto para configurar o estado global
  const turnstileRef = useRef(null);

  // 🛡️ Carrega o Script do Turnstile e Renderiza o Widget
  useEffect(() => {
    const scriptId = 'cloudflare-turnstile-script';
    
    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: '0x4AAAAAACOaNAV9wTIXZkZy',
          theme: 'dark',
          callback: (token) => {
            setTurnstileToken(token);
          },
          'expired-callback': () => {
            setTurnstileToken('');
          },
        });
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.body.appendChild(script);
    } else {
      setTimeout(renderWidget, 500);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: 'Senhas Não Coincidem',
        text: 'As senhas digitadas não são iguais.',
        icon: 'error',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
      return;
    }

    if (!turnstileToken) {
      Swal.fire({
        title: 'Verificação Necessária',
        text: 'Por favor, complete a verificação de segurança.',
        icon: 'warning',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
      return;
    }

    setLoading(true);

    try {
      // 1. REGISTRO: Enviamos os campos exatamente como o UserCreate do main.py espera
      // Note o uso de full_name (com underline) para casar com o Pydantic do Backend
      await authService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.fullName || formData.username, // full_name
        turnstileToken
      );

      // 2. LOGIN AUTOMÁTICO: Chamamos a função login do context para setar token e user
      await login(formData.username, formData.password, turnstileToken);

      // 3. SUCESSO E REDIRECIONAMENTO
      Swal.fire({
        title: 'Cadastro Realizado!',
        text: 'Sua conta foi criada com sucesso. Bem-vindo(a)!',
        icon: 'success',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true
      }).then(() => {
        // 🚀 REDIRECIONAMENTO PARA O DASHBOARD
        navigate('/dashboard');
      });

    } catch (error) {
      console.error("❌ Erro no cadastro:", error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      // Tratamento para exibir erros de validação do Backend de forma legível
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        errorMessage = typeof detail === 'string' ? detail : "Erro de validação nos dados.";
      }

      Swal.fire({
        title: 'Erro no Cadastro',
        text: errorMessage,
        icon: 'error',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });

      if (window.turnstile) window.turnstile.reset();
      setTurnstileToken('');

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-glow">Zenyx</div>
          <p>Criar Nova Conta</p>
        </div>
        
        <form onSubmit={handleRegister} className="login-form">
          <div className="input-group-login">
            <User size={20} className="input-icon" />
            <input 
              type="text" 
              name="username"
              placeholder="Usuário *" 
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
              placeholder="Email *" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group-login">
            <UserPlus size={20} className="input-icon" />
            <input 
              type="text" 
              name="fullName"
              placeholder="Nome Completo (opcional)" 
              value={formData.fullName}
              onChange={handleChange}
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

          <div 
            ref={turnstileRef} 
            style={{ margin: '15px 0', display: 'flex', justifyContent: 'center' }}
          ></div>

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