import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Login.css';

const TURNSTILE_SITE_KEY = '0x4AAAAAACOUmpPNTu0O44Tfoa_r8qOZzJs';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Referência para o container onde o widget VAI aparecer
  const turnstileRef = useRef(null);
  // ID para rastrear o widget renderizado
  const widgetId = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // --- LÓGICA DE FORÇA BRUTA PARA EXIBIR O WIDGET ---
  useEffect(() => {
    // 1. Injetar o script dinamicamente se não existir
    const scriptId = 'cloudflare-turnstile-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // 2. Função para renderizar o widget
    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current && !widgetId.current) {
        try {
          // Limpa conteúdo anterior para evitar duplicação
          turnstileRef.current.innerHTML = '';
          
          const id = window.turnstile.render(turnstileRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            theme: 'dark',
            callback: (token) => {
              console.log('Token Cloudflare Gerado:', token);
              setTurnstileToken(token);
            },
            'expired-callback': () => {
              setTurnstileToken('');
            },
            'error-callback': () => {
              console.error('Erro no Cloudflare');
            }
          });
          widgetId.current = id;
        } catch (error) {
          console.error("Erro ao renderizar Turnstile:", error);
        }
      }
    };

    // 3. Tenta renderizar a cada 500ms até conseguir (limite de 10 tentativas)
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.turnstile) {
        renderWidget();
        clearInterval(interval); // Para de tentar quando consegue
      }
      if (attempts > 20) clearInterval(interval); // Desiste após 10 segundos
    }, 500);

    return () => {
      clearInterval(interval);
      // Opcional: remover o widget ao sair da tela
      if (window.turnstile && widgetId.current) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, []);
  // --------------------------------------------------

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!turnstileToken) {
      Swal.fire({
        title: 'Atenção',
        text: 'Aguarde o carregamento da verificação de segurança.',
        icon: 'warning',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Passa o token para o login (se seu backend validar)
      const success = await login(username, password, turnstileToken);
      
      if (success) {
        navigate('/');
      } else {
        // Reseta o widget em caso de erro
        if (window.turnstile) window.turnstile.reset(widgetId.current);
        setTurnstileToken('');
        
        Swal.fire({
          title: 'Acesso Negado',
          text: 'Usuário ou senha incorretos.',
          icon: 'error',
          background: '#1b1730',
          color: '#fff',
          confirmButtonColor: '#c333ff'
        });
      }
    } catch (error) {
      console.error("Erro no login:", error);
      Swal.fire({
        title: 'Erro',
        text: 'Erro ao conectar com o servidor.',
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

          {/* ÁREA RESERVADA PARA O WIDGET - COM ALTURA MÍNIMA PARA NÃO PISCAR */}
          <div 
            ref={turnstileRef}
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '15px', 
              marginBottom: '15px',
              minHeight: '65px' 
            }}
          ></div>

          <Button 
            type="submit" 
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading || !turnstileToken}
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'} <ArrowRight size={18} />
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