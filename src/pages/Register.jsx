import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { authService } from '../services/api';
import Swal from 'sweetalert2';
import './Login.css'; // Usa o mesmo CSS do Login

export function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    setLoading(true);

    try {
      const response = await authService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.fullName || formData.username
      );

      console.log("✅ Cadastro realizado:", response);

      // Salva o token automaticamente após registro
      localStorage.setItem('zenyx_token', response.access_token);
      
      const userData = {
        id: response.user_id,
        username: response.username,
        name: response.username,
        role: 'admin'
      };
      
      localStorage.setItem('zenyx_admin_user', JSON.stringify(userData));

      Swal.fire({
        title: 'Cadastro Realizado!',
        text: 'Sua conta foi criada com sucesso. Redirecionando...',
        icon: 'success',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff',
        timer: 2000,
        timerProgressBar: true
      }).then(() => {
        window.location.href = '/';
      });

    } catch (error) {
      console.error("❌ Erro no cadastro:", error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.response?.status === 400) {
        errorMessage = 'Usuário ou email já cadastrado.';
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