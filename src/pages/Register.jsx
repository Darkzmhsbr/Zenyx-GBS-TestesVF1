import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, UserPlus, ArrowRight, Ticket, MessageCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { authService } from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import './Login.css';

// 🤖 Animated Robot SVG Premium Component
const AnimatedRobot = () => (
  <div className="register-robot-wrapper">
    <svg
      viewBox="0 0 120 120"
      width="90"
      height="90"
      className="register-robot-svg"
    >
      {/* Antenna */}
      <line x1="60" y1="18" x2="60" y2="8" stroke="#c333ff" strokeWidth="2.5" strokeLinecap="round">
        <animate attributeName="y2" values="8;5;8" dur="2s" repeatCount="indefinite" />
      </line>
      <circle cx="60" cy="6" r="3.5" fill="#c333ff">
        <animate attributeName="r" values="3.5;5;3.5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>
      
      {/* Head */}
      <rect x="32" y="18" width="56" height="42" rx="12" ry="12"
        fill="rgba(195, 51, 255, 0.08)" stroke="#c333ff" strokeWidth="2" />
      
      {/* Eyes */}
      <circle cx="46" cy="38" r="6" fill="#c333ff" opacity="0.9">
        <animate attributeName="r" values="6;4;6" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="74" cy="38" r="6" fill="#c333ff" opacity="0.9">
        <animate attributeName="r" values="6;4;6" dur="3s" repeatCount="indefinite" begin="0.15s" />
      </circle>
      {/* Eye glints */}
      <circle cx="48" cy="36" r="2" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="76" cy="36" r="2" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" begin="0.15s" />
      </circle>
      
      {/* Mouth - smile */}
      <path d="M 46 48 Q 60 56 74 48" fill="none" stroke="#c333ff" strokeWidth="2" strokeLinecap="round">
        <animate attributeName="d" values="M 46 48 Q 60 56 74 48;M 46 50 Q 60 54 74 50;M 46 48 Q 60 56 74 48" dur="4s" repeatCount="indefinite" />
      </path>
      
      {/* Ears */}
      <rect x="22" y="30" width="10" height="16" rx="4" fill="rgba(195, 51, 255, 0.15)" stroke="#c333ff" strokeWidth="1.5" />
      <rect x="88" y="30" width="10" height="16" rx="4" fill="rgba(195, 51, 255, 0.15)" stroke="#c333ff" strokeWidth="1.5" />
      
      {/* Neck */}
      <rect x="52" y="60" width="16" height="8" rx="3" fill="rgba(195, 51, 255, 0.1)" stroke="#c333ff" strokeWidth="1.5" />
      
      {/* Body */}
      <rect x="28" y="68" width="64" height="36" rx="10" ry="10"
        fill="rgba(195, 51, 255, 0.06)" stroke="#c333ff" strokeWidth="2" />
      
      {/* Body detail - chest light */}
      <circle cx="60" cy="84" r="7" fill="none" stroke="#c333ff" strokeWidth="1.5" opacity="0.5">
        <animate attributeName="r" values="7;9;7" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="84" r="3" fill="#c333ff" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
      
      {/* Arms */}
      <rect x="12" y="72" width="14" height="8" rx="4" fill="rgba(195, 51, 255, 0.1)" stroke="#c333ff" strokeWidth="1.5">
        <animateTransform attributeName="transform" type="rotate" values="-5 19 76;5 19 76;-5 19 76" dur="3s" repeatCount="indefinite" />
      </rect>
      <rect x="94" y="72" width="14" height="8" rx="4" fill="rgba(195, 51, 255, 0.1)" stroke="#c333ff" strokeWidth="1.5">
        <animateTransform attributeName="transform" type="rotate" values="5 101 76;-5 101 76;5 101 76" dur="3s" repeatCount="indefinite" />
      </rect>
    </svg>
    
    {/* Glow effect behind robot */}
    <div className="register-robot-glow" />
  </div>
);

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
  const [inviteRequired, setInviteRequired] = useState(true); // 🎟️ Controle dinâmico
  const navigate = useNavigate();
  const { login } = useAuth();
  const turnstileRef = useRef(null);

  // 🎟️ Consulta o backend para saber se convite é obrigatório
  useEffect(() => {
    authService.checkInviteRequired().then(required => {
      setInviteRequired(required);
    });
  }, []);

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

  // 🎟️ Função para solicitar código de convite via Telegram
  const handleRequestInvite = () => {
    const message = encodeURIComponent('Olá, gostaria de solicitar o código de convite para a plataforma Zenyx VIPs! 🚀');
    window.open(`https://t.me/DiihNvx?text=${message}`, '_blank');
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

    // 🎟️ Validação do Código de Convite (apenas se obrigatório)
    if (inviteRequired && (!formData.inviteCode || !formData.inviteCode.trim())) {
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
        inviteRequired ? formData.inviteCode.trim().toUpperCase() : null
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

  // 🔒 Verifica se todos os campos obrigatórios estão preenchidos
  const isFormComplete = 
    (!inviteRequired || formData.inviteCode.trim().length > 0) &&
    formData.username.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.password.length >= 6 &&
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword &&
    turnstileToken.length > 0;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-glow">Zenyx</div>
          <p>Criar Nova Conta</p>
        </div>

        {/* 🤖 ROBÔ ANIMADO PREMIUM */}
        <AnimatedRobot />

        {/* 🎟️ AVISO DE PRÉ-LANÇAMENTO (só aparece se convite for obrigatório) */}
        {inviteRequired && (
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
            <p style={{ color: 'var(--muted-foreground)', fontSize: '11px', margin: '6px 0 0 0', opacity: 0.7 }}>
              Em breve o cadastro será aberto para todos.
            </p>
          </div>
        )}
        
        <form onSubmit={handleRegister} className="login-form">
          {/* 🎟️ CAMPO DE CÓDIGO DE CONVITE (só aparece se obrigatório) */}
          {inviteRequired && (
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
          )}
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

          {/* 🎟️ BOTÃO SOLICITAR CÓDIGO DE CONVITE (acima do Criar Conta) */}
          {inviteRequired && (
            <button
              type="button"
              onClick={handleRequestInvite}
              className="request-invite-btn"
            >
              <MessageCircle size={18} />
              <span>Solicitar Código de Convite</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginLeft: 'auto' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </button>
          )}

          <Button 
            type="submit" 
            style={{ 
              width: '100%', 
              marginTop: '10px',
              opacity: (!isFormComplete || loading) ? 0.5 : 1,
              cursor: (!isFormComplete || loading) ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.3s ease'
            }}
            disabled={!isFormComplete || loading}
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

      {/* 🤖 ESTILOS INLINE DO ROBÔ E BOTÃO DE CONVITE (scoped) */}
      <style>{`
        .register-robot-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 16px;
          position: relative;
        }

        .register-robot-svg {
          filter: drop-shadow(0 0 12px rgba(195, 51, 255, 0.3));
          animation: robotFloat 4s ease-in-out infinite;
        }

        .register-robot-glow {
          position: absolute;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(195, 51, 255, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: robotGlow 3s ease-in-out infinite;
        }

        @keyframes robotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes robotGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }

        .request-invite-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 18px;
          background: linear-gradient(135deg, rgba(0, 136, 204, 0.12), rgba(0, 136, 204, 0.06));
          border: 1px solid rgba(0, 136, 204, 0.35);
          border-radius: 10px;
          color: #29b6f6;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .request-invite-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 136, 204, 0.08), transparent);
          transition: left 0.5s ease;
        }

        .request-invite-btn:hover::before {
          left: 100%;
        }

        .request-invite-btn:hover {
          background: linear-gradient(135deg, rgba(0, 136, 204, 0.2), rgba(0, 136, 204, 0.1));
          border-color: rgba(0, 136, 204, 0.6);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(0, 136, 204, 0.15);
        }

        .request-invite-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}