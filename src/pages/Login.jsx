import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Login.css';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const turnstileRef = useRef(null);
  const widgetId = useRef(null); // Guardar ID do widget para resetar

  useEffect(() => {
    // Função limpa para inicializar o Turnstile
    const initTurnstile = () => {
      if (window.turnstile && turnstileRef.current) {
        // Se já existir um widget, limpa antes de criar outro
        if (widgetId.current) window.turnstile.remove(widgetId.current);

        try {
          const id = window.turnstile.render(turnstileRef.current, {
            sitekey: '0x4AAAAAACOaNAV9wTIXZkZy', // 🔑 SUA CHAVE PÚBLICA
            theme: 'dark', // Para combinar com seu site
            callback: (token) => {
              console.log('✅ Captcha resolvido:', token);
              setTurnstileToken(token);
            },
            'expired-callback': () => {
              console.warn('⚠️ Captcha expirou');
              setTurnstileToken('');
            },
            'error-callback': () => {
              console.error('❌ Erro no widget Turnstile');
            }
          });
          widgetId.current = id;
        } catch (e) {
          console.error("Erro ao renderizar Turnstile:", e);
        }
      }
    };

    // Injeta script se não existir
    if (!document.getElementById('cf-turnstile')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = initTurnstile;
      document.body.appendChild(script);
    } else {
      // Se script já existe, espera um pouco e renderiza
      setTimeout(initTurnstile, 100);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      Swal.fire({
        title: 'Verificação Obrigatória',
        text: 'Aguarde a verificação de segurança (Cloudflare) completar.',
        icon: 'warning',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await login(username, password, turnstileToken);
      navigate('/dashboard');
    } catch (error) {
      console.error("Login falhou:", error);
      
      let msg = 'Erro de conexão.';
      if (error.response) {
        // Pega mensagem exata do backend se houver
        msg = error.response.data.detail || 'Dados incorretos.';
      }

      Swal.fire({
        title: 'Falha no Login',
        text: msg,
        icon: 'error',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
      
      // Reseta o captcha para o usuário tentar de novo
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
          <div className="logo-glow">Zenyx</div>
          <p>Painel Administrativo</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group-login">
            <User size={20} className="input-icon" />
            <input 
              type="text" 
              placeholder="Usuário" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group-login">
            <Lock size={20} className="input-icon" />
            <input 
              type="password" 
              placeholder="Senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Container do Widget - Importante ter altura mínima para não pular layout */}
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
            {loading ? 'Verificando...' : 'Entrar no Sistema'} <ArrowRight size={18} />
          </Button>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
              Não tem uma conta?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: 'var(--primary)', 
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Criar Conta
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}