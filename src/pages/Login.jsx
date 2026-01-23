import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import Swal from 'sweetalert2';
import './Login.css';

// 🔑 Chave do Site Key (Defina aqui ou em variáveis de ambiente)
const TURNSTILE_SITE_KEY = '0x4AAAAAACOUmpPNTu0O44Tfoa_r8qOZzJs';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const turnstileRef = useRef(null);

  // ✅ Configuração do Turnstile (Cloudflare)
  useEffect(() => {
    // Função global que o Cloudflare chama quando verifica com sucesso
    window.onTurnstileSuccess = function(token) {
      console.log('✅ Turnstile token recebido:', token.substring(0, 15) + '...');
      setTurnstileToken(token);
    };

    // Limpeza ao desmontar o componente
    return () => {
      window.onTurnstileSuccess = null;
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    // 1. Validação do Turnstile antes de tudo
    if (!turnstileToken) {
      Swal.fire({
        title: 'Verificação Necessária',
        text: 'Por favor, aguarde a verificação de segurança.',
        icon: 'warning',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // 2. Tentativa de Login
      // Nota: Se o seu backend exige o token, você precisará passar o 
      // turnstileToken para a função login() do seu AuthContext no futuro.
      const success = await login(username, password, turnstileToken);
      
      if (success) {
        navigate('/');
      } else {
        // Se falhar, reseta o token para forçar nova verificação se necessário
        if (window.turnstile) window.turnstile.reset();
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

          {/* Widget do Cloudflare Turnstile Inserido Aqui */}
          <div 
            className="turnstile-wrapper" 
            style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }} 
            ref={turnstileRef}
          >
            <div 
              className="cf-turnstile" 
              data-sitekey={TURNSTILE_SITE_KEY}
              data-callback="onTurnstileSuccess"
              data-theme="dark" 
            ></div>
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