import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, UserPlus, ArrowRight, Ticket } from 'lucide-react';
import { Button } from '../components/Button';
import { authService } from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import './Login.css';

export function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    inviteCode: ''
  });
  const [turnstileToken, setTurnstileToken] = useState(''); // Estado para o token
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const turnstileRef = useRef(null);

  // 🛡️ Carrega o Script do Turnstile e Renderiza o Widget
  useEffect(() => {
    const scriptId = 'cloudflare-turnstile-script';
    
    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITEKEY,
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
    
    // Validações
    if (!formData.username || !formData.email || !formData.password) {
      Swal.fire({
        title: 'Campos Obrigatórios',
        text: 'Por favor, preencha todos os campos obrigatórios.',
        icon: 'warning',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
      return;
    }

    // 🎟️ Validação do Código de Convite
    if (!formData.inviteCode || !formData.inviteCode.trim()) {
      Swal.fire({
        title: 'Código de Convite',
        text: 'O código de convite é obrigatório nesta fase de pré-lançamento.',
        icon: 'warning',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
      return;
    }

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

    if (formData.password.length < 6) {
      Swal.fire({
        title: 'Senha Fraca',
        text: 'A senha deve ter pelo menos 6 caracteres.',
        icon: 'warning',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
      return;
    }

    // 🛡️ Validação do Turnstile
    if (!turnstileToken) {
      Swal.fire({
        title: 'Verificação Necessária',
        text: 'Por favor, confirme que você é humano clicando na caixa de verificação.',
        icon: 'warning',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Cria a conta no Backend
      await authService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.fullName || formData.username,
        turnstileToken,
        formData.inviteCode.trim().toUpperCase()
      );

      // 🔥 2. IMPORTANTE: Chame o login do contexto para setar o estado global
      // Isso evita que o sistema redirecione o usuário para o login novamente
      await login(formData.username, formData.password, turnstileToken);

      console.log("✅ Cadastro e Login realizados com sucesso");

      Swal.fire({
        title: 'Cadastro Realizado!',
        text: 'Sua conta foi criada com sucesso. Redirecionando para o setup...',
        icon: 'success',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff',
        timer: 2000,
        timerProgressBar: true
      }).then(() => {
        // 🚀 Redireciona para o passo obrigatório
        navigate('/bots/new'); 
      });

    } catch (error) {
      console.error("❌ Erro no cadastro:", error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data.detail || 'Usuário ou email já cadastrado.';
      } else if (!error.response) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }

      Swal.fire({
        title: 'Erro no Cadastro',
        text: errorMessage,
        icon: 'error',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });

      // Reseta o Turnstile
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

        {/* 🎟️ AVISO DE PRÉ-LANÇAMENTO */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(195, 51, 255, 0.15), rgba(99, 51, 255, 0.1))',
          border: '1px solid rgba(195, 51, 255, 0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          margin: '0 0 20px 0',
          textAlign: 'center'
        }}>
          <p style={{ color: '#c333ff', fontWeight: 'bold', fontSize: '13px', margin: '0 0 4px 0' }}>
            🚀 Fase de Pré-Lançamento
          </p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '12px', margin: 0 }}>
            O cadastro é exclusivo via Código de Convite.
          </p>
        </div>
        
        <form onSubmit={handleRegister} className="login-form">
          {/* 🎟️ CAMPO DE CÓDIGO DE CONVITE (DESTAQUE) */}
          <div className="input-group-login" style={{
            borderColor: 'rgba(195, 51, 255, 0.4)',
            background: 'rgba(195, 51, 255, 0.05)'
          }}>
            <Ticket size={20} className="input-icon" style={{ color: '#c333ff' }} />
            <input 
              type="text" 
              name="inviteCode"
              placeholder="Código de Convite *" 
              value={formData.inviteCode}
              onChange={handleChange}
              style={{ textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}
              required
            />
          </div>
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

          {/* 🛡️ WIDGET CLOUDFLARE TURNSTILE */}
          <div 
            ref={turnstileRef} 
            className="turnstile-container" 
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