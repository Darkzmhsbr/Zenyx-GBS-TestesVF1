import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Login.css';

const TURNSTILE_SITE_KEY = '0x4AAAAAACOaNAV9wTIXZkZy';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Função que tenta desenhar o widget
    const tryRender = () => {
      if (window.turnstile && containerRef.current && !widgetId.current) {
        try {
          // Limpa qualquer lixo anterior
          containerRef.current.innerHTML = '';
          
          const id = window.turnstile.render(containerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            theme: 'dark',
            callback: (token) => {
              console.log("Token OK:", token);
              setTurnstileToken(token);
            },
            'expired-callback': () => setTurnstileToken(''),
          });
          widgetId.current = id;
          return true; // Sucesso
        } catch (e) {
          console.error("Erro ao renderizar Turnstile:", e);
        }
      }
      return false;
    };

    // Tenta renderizar imediatamente
    if (!tryRender()) {
      // Se falhar, tenta a cada 100ms por 5 segundos
      const interval = setInterval(() => {
        if (tryRender()) {
          clearInterval(interval);
        }
      }, 100);
      
      // Limpa o intervalo após 5 segundos para não travar memória
      setTimeout(() => clearInterval(interval), 5000);
      return () => clearInterval(interval);
    }

    // Cleanup ao sair da página
    return () => {
      if (window.turnstile && widgetId.current) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!turnstileToken) {
      Swal.fire({
        title: 'Verificação Necessária',
        text: 'Por favor, aguarde o carregamento do sistema de segurança.',
        icon: 'warning',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await login(username, password, turnstileToken);
      
      if (success) {
        navigate('/');
      } else {
        if (window.turnstile && widgetId.current) window.turnstile.reset(widgetId.current);
        setTurnstileToken('');
        
        Swal.fire({
          title: 'Acesso Negado',
          text: 'Dados incorretos.',
          icon: 'error',
          background: '#1b1730',
          color: '#fff',
          confirmButtonColor: '#c333ff'
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Erro de Conexão',
        text: 'Não foi possível conectar ao servidor.',
        icon: 'error',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
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

          {/* ÁREA DO WIDGET */}
          <div 
            ref={containerRef} 
            className="turnstile-wrapper"
            style={{ minHeight: '65px', margin: '15px 0', display: 'flex', justifyContent: 'center' }}
          >
            {/* O Cloudflare vai injetar o iframe aqui dentro */}
          </div>

          <Button 
            type="submit" 
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading || !turnstileToken}
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'} <ArrowRight size={18} />
          </Button>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
              Não tem uma conta? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Criar Conta</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}