import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        localStorage.removeItem('zenyx_token');
        localStorage.removeItem('zenyx_admin_user');
      }
    }
    setLoading(false);
  }, []);

  // ============================================================
  // 🔐 LOGIN COM API REAL (SUBSTITUI O HARDCODED)
  // ============================================================
  const login = async (username, password) => {
    try {
      const API_URL = 'https://zenyx-gbs-testesv1-production.up.railway.app';
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username: username,
        password: password
      });

      const { access_token, user_id, username: userName } = response.data;

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
      
      // Atualiza estado
      setUser(userData);
      
      console.log("✅ Login realizado:", userName);
      return true;
      
    } catch (error) {
      console.error("❌ Erro no login:", error);
      
      // Se der 401 (credenciais inválidas)
      if (error.response?.status === 401) {
        return false;
      }
      
      // Se der erro de rede, mostra mensagem
      if (!error.response) {
        alert("Erro de conexão com o servidor. Verifique sua internet.");
      }
      
      return false;
    }
  };

  // ============================================================
  // 🔥 FUNÇÃO LOGOUT
  // ============================================================
  const logout = () => {
    console.log("🚪 Fazendo logout...");
    
    // Limpa estado
    setUser(null);
    
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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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