import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const turnstileRef = useRef(null);

  // 🔑 Substitua pela sua Site Key do Cloudflare Turnstile
  const TURNSTILE_SITE_KEY = '0x4AAAAAACOUmpPNTu0O44Tfoa_r8qOZzJs';
  const API_URL = 'https://zenyx-gbs-testesv1-production.up.railway.app';

  // ✅ Callback quando Turnstile verifica com sucesso
  useEffect(() => {
    window.onTurnstileSuccess = function(token) {
      console.log('✅ Turnstile token recebido:', token.substring(0, 20) + '...');
      setTurnstileToken(token);
      setError(''); // Limpa erro anterior
    };

    // Cleanup
    return () => {
      window.onTurnstileSuccess = null;
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    if (!turnstileToken) {
      setError('Complete a verificação de segurança');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📤 Enviando login...');
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email,
        password: password,
        turnstile_token: turnstileToken
      });

      console.log('✅ Login bem-sucedido!', response.data);

      // Salva dados no localStorage
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('email', response.data.email);

      // Redireciona para dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      if (error.response?.status === 400) {
        setError('Verificação de segurança falhou. Recarregue a página.');
      } else if (error.response?.status === 401) {
        setError('Email ou senha incorretos');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }

      // Reset Turnstile para nova tentativa
      if (window.turnstile) {
        window.turnstile.reset();
      }
      setTurnstileToken('');
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={loading}
              required
            />
          </div>

          {/* Senha */}
          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              disabled={loading}
              required
            />
          </div>

          {/* Cloudflare Turnstile */}
          <div className="turnstile-container" ref={turnstileRef}>
            <div 
              className="cf-turnstile" 
              data-sitekey={TURNSTILE_SITE_KEY}
              data-callback="onTurnstileSuccess"
              data-theme="light"
            ></div>
          </div>

          {/* Botão Login */}
          <button 
            type="submit" 
            className="login-button"
            disabled={loading || !turnstileToken}
          >
            {loading ? 'Entrando...' : 'Login'}
          </button>
        </form>

        {/* Link para Registro */}
        <p className="register-link">
          Não tem uma conta? <a href="/register">Criar Conta</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
