import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { authService } from '../services/api'; // Importando o service centralizado

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // 🆕 ESTADO DE ONBOARDING: Adicionado para controlar a trava do menu
  const [hasBot, setHasBot] = useState(false);

  useEffect(() => {
    // Verifica se já tem token JWT salvo
    const token = localStorage.getItem('zenyx_token');
    const savedUser = localStorage.getItem('zenyx_admin_user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Configura o token no axios globalmente
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // 🛡️ Sincroniza o status do bot ao recarregar a página
        authService.getMe().then(response => {
          setHasBot(response.has_bots || false);
        }).catch(err => console.error("Erro ao validar status do bot:", err));

      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        localStorage.removeItem('zenyx_token');
        localStorage.removeItem('zenyx_admin_user');
      }
    }
    setLoading(false);
  }, []);

  // ============================================================
  // 🔑 LOGIN COM API REAL E TURNSTILE
  // ============================================================
  const login = async (username, password, turnstileToken) => {
    try {
      // Usando o authService em vez de chamar axios direto aqui, para manter consistência
      // Mas como seu original tinha lógica customizada, vou manter a lógica aqui
      // porém adaptada para enviar o token do turnstile
      
      const API_URL = 'https://zenyx-gbs-testesv1-production.up.railway.app';
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username: username,
        password: password,
        turnstile_token: turnstileToken // 🔥 Enviando o token para o backend
      });

      // 🚀 CAPTURA has_bots vindo do backend
      const { access_token, user_id, username: userName, has_bots } = response.data;

      // Salva o token JWT
      localStorage.setItem('zenyx_token', access_token);
      
      // Cria objeto do usuário
      const userData = {
        id: user_id,
        username: userName,
        name: userName,
        role: 'admin', // Por enquanto todos são admin
        allowed_bots: [] // FASE 2: Vai filtrar por owner_id
      };

      // Salva dados do usuário
      localStorage.setItem('zenyx_admin_user', JSON.stringify(userData));
      
      // Configura token no axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Atualiza estados
      setUser(userData);
      setHasBot(has_bots || false); // 🆕 Define se o usuário tem bot
      
      console.log("✅ Login realizado:", userName);
      return true;
      
    } catch (error) {
      console.error("❌ Erro no login:", error);
      
      // Propaga o erro para o componente tratar (mostrar alert específico)
      throw error; 
    }
  };

  // ============================================================
  // 🔥 FUNÇÃO LOGOUT
  // ============================================================
  const logout = () => {
    console.log("🚪 Fazendo logout...");
    
    // Limpa estado
    setUser(null);
    setHasBot(false);
    
    // Limpa localStorage
    localStorage.removeItem('zenyx_token');
    localStorage.removeItem('zenyx_admin_user');
    localStorage.removeItem('zenyx_selected_bot');
    localStorage.removeItem('zenyx_theme');
    
    // Remove token do axios
    delete axios.defaults.headers.common['Authorization'];
    
    // Força reload da página para garantir limpeza total
    window.location.href = '/login';
  };

  // 🆕 Função para atualizar o status do bot externamente (ex: no NewBot.jsx)
  const updateHasBotStatus = (status) => {
    setHasBot(status);
  };

  // 🆕 Função para atualizar username e token após troca de username
  const updateUserCredentials = (newUsername, newToken) => {
    // Atualiza token no localStorage e axios
    localStorage.setItem('zenyx_token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    // Atualiza dados do usuário no state e localStorage
    const updatedUser = { ...user, username: newUsername, name: newUsername };
    setUser(updatedUser);
    localStorage.setItem('zenyx_admin_user', JSON.stringify(updatedUser));
    
    console.log("✅ Credenciais atualizadas:", newUsername);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasBot, updateHasBotStatus, updateUserCredentials }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}