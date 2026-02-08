import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// 🔐 INTERCEPTOR: ADICIONA TOKEN JWT EM TODAS AS REQUISIÇÕES
// ============================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zenyx_token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// 🔐 INTERCEPTOR: DETECTA TOKEN EXPIRADO E PREVINE LOOP
// ============================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 (não autorizado)
    if (error.response?.status === 401) {
      console.warn("⚠ Token inválido ou expirado.");
      
      // Limpa dados locais
      localStorage.removeItem('zenyx_token');
      localStorage.removeItem('zenyx_admin_user');
      
      // 🔥 CORREÇÃO DO LOOP INFINITO:
      // Só redireciona se NÃO estivermos já na tela de login, registro ou home
      const path = window.location.pathname;
      
      // Verifica se é uma rota protegida antes de chutar para login
      // Se estiver na Landing Page ('/'), não faz nada, pois é pública
      if (!path.includes('/login') && !path.includes('/register') && path !== '/') {
         console.log("🔄 Redirecionando para login...");
         window.location.href = '/login';
      } else {
         console.log("⚠️ Já estamos no login/home, ignorando redirect.");
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================================
// 🌐 SERVIÇO PÚBLICO (SEM AUTENTICAÇÃO) - LANDING PAGE 🆕
// ============================================================
export const publicService = {
  getActivityFeed: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/public/activity-feed`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar feed de atividades:', error);
      // Retorna dados mock em caso de erro
      return {
        activities: [
          { name: "João P.", plan: "Acesso Semanal", price: 2.00, action: "ADICIONADO", icon: "✅" },
          { name: "Maria S.", plan: "Grupo VIP Premium", price: 5.00, action: "ADICIONADO", icon: "✅" },
          { name: "Carlos A.", plan: "Acesso Mensal", price: 10.00, action: "REMOVIDO", icon: "❌" },
        ]
      };
    }
  },

  getStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/public/stats`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Retorna valores padrão em caso de erro
      return {
        total_bots: 500,
        total_sales: 5000,
        total_revenue: 50000.00,
        active_users: 1200
      };
    }
  }
};

// ============================================================
// 🤖 SERVIÇO DE BOTS
// ============================================================
export const botService = {  
  createBot: async (dados) => (await api.post('/api/admin/bots', dados)).data,
  listBots: async () => (await api.get('/api/admin/bots')).data,
  getBot: async (botId) => (await api.get(`/api/admin/bots/${botId}`)).data,
  updateBot: async (botId, dados) => (await api.put(`/api/admin/bots/${botId}`, dados)).data,
  toggleBot: async (botId) => (await api.post(`/api/admin/bots/${botId}/toggle`)).data,
  deleteBot: async (botId) => (await api.delete(`/api/admin/bots/${botId}`)).data,
  getStats: async (botId, start, end) => (await api.get(`/api/admin/dashboard/stats?bot_id=${botId}&start_date=${start}&end_date=${end}`)).data,
  // ... dentro de botService ...
  deleteBot: async (botId) => (await api.delete(`/api/admin/bots/${botId}`)).data,
  getStats: async (botId, start, end) => (await api.get(`/api/admin/dashboard/stats?bot_id=${botId}&start_date=${start}&end_date=${end}`)).data,
  
  // 🔥 NOVA FUNÇÃO: TESTAR CANAL
  testChannel: async (token, channelId) => {
    try {
      const response = await api.post('/api/admin/utils/test-channel', { token, channel_id: channelId });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

// ============================================================
// 💬 SERVIÇO DE FLUXO E MENSAGENS
// ============================================================
// 🔥 SERVIÇO DE FLUXO E PLANOS (ATUALIZADO)
export const flowService = {
  getFlow: async (botId) => {
    const response = await api.get(`/api/admin/bots/${botId}/flow`);
    return response.data;
  },
  saveFlow: async (botId, flowData) => {
    const response = await api.put(`/api/admin/bots/${botId}/flow`, flowData);
    return response.data;
  },
  getSteps: async (botId) => {
    const response = await api.get(`/api/admin/bots/${botId}/flow/steps`);
    return response.data;
  },
  addStep: async (botId, stepData) => {
    const response = await api.post(`/api/admin/bots/${botId}/flow/steps`, stepData);
    return response.data;
  },
  updateStep: async (botId, stepId, stepData) => {
    const response = await api.put(`/api/admin/bots/${botId}/flow/steps/${stepId}`, stepData);
    return response.data;
  },
  deleteStep: async (botId, stepId) => {
    const response = await api.delete(`/api/admin/bots/${botId}/flow/steps/${stepId}`);
    return response.data;
  },
  
  // 🔥 [NOVO] BUSCAR PLANOS PARA O DROPDOWN
  getPlans: async (botId) => {
    const response = await api.get(`/api/admin/bots/${botId}/plans`);
    return response.data;
  }
};

// ============================================================
// 💲 SERVIÇO DE PLANOS
// ============================================================
export const planService = {
  listPlans: async (botId) => (await api.get(`/api/admin/bots/${botId}/plans`)).data,
  
  createPlan: async (botId, planData) => {
    return (await api.post(`/api/admin/bots/${botId}/plans`, planData)).data;
  },
  
  updatePlan: async (botId, planId, planData) => {
    const pid = String(planId); 
    return (await api.put(`/api/admin/bots/${botId}/plans/${pid}`, planData)).data;
  },
  
  deletePlan: async (botId, planId) => {
    const pid = String(planId);
    return (await api.delete(`/api/admin/bots/${botId}/plans/${pid}`)).data;
  },
};

// ============================================================
// 🛒 SERVIÇO DE ORDER BUMP
// ============================================================
export const orderBumpService = {
  get: async (botId) => (await api.get(`/api/admin/bots/${botId}/order-bump`)).data,
  save: async (botId, data) => (await api.post(`/api/admin/bots/${botId}/order-bump`, data)).data
};

// ============================================================
// 📢 SERVIÇO DE REMARKETING
// ============================================================
export const remarketingService = {
  send: async (botId, data, isTest = false, specificUserId = null) => {
    const payload = {
      bot_id: botId,
      target: data.target || 'todos',
      mensagem: data.mensagem,
      media_url: data.media_url,
      incluir_oferta: data.incluir_oferta,
      plano_oferta_id: data.plano_oferta_id,
      price_mode: data.price_mode || 'original',
      custom_price: data.custom_price ? parseFloat(data.custom_price) : 0.0,
      expiration_mode: data.expiration_mode || 'none',
      expiration_value: data.expiration_value ? parseInt(data.expiration_value) : 0,
      is_test: isTest,
      specific_user_id: specificUserId
    };
    return (await api.post('/api/admin/remarketing/send', payload)).data;
  },
  
  getHistory: async (id, page = 1, perPage = 10) => {
    try { 
        return (await api.get(`/api/admin/remarketing/history/${id}?page=${page}&per_page=${perPage}`)).data; 
    } catch { 
        return { data: [], total: 0, page: 1, per_page: perPage, total_pages: 0 }; 
    }
  },
  
  deleteHistory: async (historyId) => {
    return (await api.delete(`/api/admin/remarketing/history/${historyId}`)).data;
  },
  
  sendIndividual: async (botId, telegramId, historyId) => {
    return (await api.post('/api/admin/remarketing/send-individual', {
        bot_id: botId,
        user_telegram_id: telegramId,
        campaign_history_id: historyId
    })).data;
  }
};

// ============================================================
// 🚀 SERVIÇO DE DISPARO AUTOMÁTICO (NOVO)
// ============================================================
export const remarketingAutoService = {
  // Busca as configurações principais (Aba 1)
  getRemarketingConfig: async (botId) => {
    try {
      const response = await api.get(`/api/admin/auto-remarketing/${botId}`);
      return response.data;
    } catch (error) {
      console.warn("Configuração auto não encontrada, retornando padrão.");
      return null;
    }
  },

  // Salva as configurações principais (Aba 1)
  saveRemarketingConfig: async (botId, data) => {
    const response = await api.post(`/api/admin/auto-remarketing/${botId}`, data);
    return response.data;
  },

  // Busca as mensagens alternantes (Aba 2)
  getAlternatingMessages: async (botId) => {
    try {
      const response = await api.get(`/api/admin/auto-remarketing/${botId}/messages`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Salva as mensagens alternantes (Aba 2)
  saveAlternatingMessages: async (botId, data) => {
    const response = await api.post(`/api/admin/auto-remarketing/${botId}/messages`, data);
    return response.data;
  },

  // Busca estatísticas (Aba 3)
  getRemarketingStats: async (botId) => {
    try {
      const response = await api.get(`/api/admin/auto-remarketing/${botId}/stats`);
      return response.data;
    } catch (error) {
      return { sent: 0, conversions: 0, rate: 0 };
    }
  },

  // Ativa/Desativa o sistema
  toggle: async (botId) => {
    const response = await api.post(`/api/admin/auto-remarketing/${botId}/toggle`);
    return response.data;
  }
};

// ============================================================
// 👥 CRM / CONTATOS
// ============================================================
export const crmService = {
  getContacts: async (botId, filter = 'todos', page = 1, perPage = 50) => {
    const params = new URLSearchParams({
      status: filter,
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    if (botId) params.append('bot_id', botId);
    
    try {
      const response = await api.get(`/api/admin/contacts?${params.toString()}`);
      return response.data;
    } catch (error) {
      return { data: [], total: 0, page: 1, per_page: perPage, total_pages: 0 };
    }
  },
  
  getLeads: async (botId, page = 1, perPage = 50) => {
    const params = new URLSearchParams({ page: page.toString(), per_page: perPage.toString() });
    if (botId) params.append('bot_id', botId);
    
    try {
      return (await api.get(`/api/admin/leads?${params.toString()}`)).data;
    } catch (error) {
      return { data: [], total: 0, page: 1, per_page: perPage, total_pages: 0 };
    }
  },
  
  getFunnelStats: async (botId) => {
    try {
      const url = botId ? `/api/admin/contacts/funnel-stats?bot_id=${botId}` : '/api/admin/contacts/funnel-stats';
      return (await api.get(url)).data;
    } catch (error) {
      return { topo: 0, meio: 0, fundo: 0, expirados: 0, total: 0 };
    }
  },
  
  updateUser: async (userId, data) => (await api.put(`/api/admin/users/${userId}`, data)).data,
  resendAccess: async (userId) => (await api.post(`/api/admin/users/${userId}/resend-access`)).data
};

export const admin = crmService;
export const leadService = crmService;

export const adminService = {
    listAdmins: async (id) => { 
      try { return (await api.get(`/api/admin/bots/${id}/admins`)).data } catch { return [] } 
    },
    addAdmin: async (id, d) => (await api.post(`/api/admin/bots/${id}/admins`, d)).data,
    updateAdmin: async (botId, adminId, d) => (await api.put(`/api/admin/bots/${botId}/admins/${adminId}`, d)).data,
    removeAdmin: async (id, tId) => (await api.delete(`/api/admin/bots/${id}/admins/${tId}`)).data
};

export const dashboardService = { 
  getStats: async (id = null, startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (id) params.append('bot_id', id);
    if (startDate) params.append('start_date', startDate.toISOString());
    if (endDate) params.append('end_date', endDate.toISOString());
    
    const queryString = params.toString();
    const url = queryString ? `/api/admin/dashboard/stats?${queryString}` : '/api/admin/dashboard/stats';
    
    return (await api.get(url)).data;
  }
};

// ============================================================
// 🔗 SERVIÇO DE INTEGRAÇÕES
// ============================================================
export const integrationService = { 
  getConfig: async () => {
    try {
      const response = await api.get('/api/admin/config');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      return {};
    }
  },
  
  saveConfig: async (data) => {
    try {
      const response = await api.post('/api/admin/config', data);
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      throw error;
    }
  },
  
  getPushinStatus: async (botId) => {
    if (!botId) return { status: 'desconectado' };
    
    try {
      const response = await api.get(`/api/admin/integrations/pushinpay/${botId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar status Pushin Pay:", error);
      return { status: 'desconectado' };
    }
  },
  
  savePushinToken: async (botId, token) => {
    try {
      const response = await api.post(`/api/admin/integrations/pushinpay/${botId}`, { token });
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar token Pushin Pay:", error);
      throw error;
    }
  }
};

// ============================================================
// 👤 SERVIÇO DE PERFIL
// ============================================================
export const profileService = {
  get: async () => (await api.get('/api/admin/profile')).data,
  update: async (data) => (await api.post('/api/admin/profile', data)).data,
  getStats: async () => (await api.get('/api/profile/stats')).data
};

// ============================================================
// 📊 SERVIÇO DE TRACKING (RASTREAMENTO)
// ============================================================
export const trackingService = {
  listFolders: async () => {
    try {
      const response = await api.get('/api/admin/tracking/folders');
      return response.data;
    } catch (error) {
      console.error("Erro ao listar pastas de tracking:", error);
      throw error;
    }
  },
  
  createFolder: async (data) => {
    try {
      const response = await api.post('/api/admin/tracking/folders', data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar pasta de tracking:", error);
      throw error;
    }
  },
  
  deleteFolder: async (folderId) => {
    try {
      const response = await api.delete(`/api/admin/tracking/folders/${folderId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar pasta de tracking:", error);
      throw error;
    }
  },
  
  listLinks: async (folderId) => {
    try {
      const response = await api.get(`/api/admin/tracking/links/${folderId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao listar links de tracking:", error);
      throw error;
    }
  },
  
  createLink: async (data) => {
    try {
      const response = await api.post('/api/admin/tracking/links', data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar link de tracking:", error);
      throw error;
    }
  },
  
  deleteLink: async (linkId) => {
    try {
      const response = await api.delete(`/api/admin/tracking/links/${linkId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar link de tracking:", error);
      throw error;
    }
  }
};

// ============================================================
// 📂 SERVIÇO DE UPLOAD DE MÍDIA
// ============================================================
export const mediaService = {
  upload: async (file, type = 'flow') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/api/admin/media/upload', formData, {
      headers: {'Content-Type': 'multipart/form-data'}
    });
    
    return response.data;
  }
};

// ============================================================
// 📚 SERVIÇO DE TUTORIAIS (NOVO)
// ============================================================
export const tutorialService = {
  getTutorials: async () => {
    try {
      const response = await api.get('/api/admin/tutorials');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar tutoriais do backend:", error);
      // Retorno de fallback caso o backend falhe
      return [];
    }
  }
};

// ============================================================
// 💳 SERVIÇO DE PAGAMENTO
// ============================================================
export const paymentService = {
  createPix: async (data) => {
    const storedId = localStorage.getItem('telegram_user_id');
    const storedUser = localStorage.getItem('telegram_username');
    const storedName = localStorage.getItem('telegram_user_first_name');
    
    let finalId = "000000";
    if (storedId && /^\d+$/.test(storedId)) {
        finalId = storedId;
    } else if (data.telegram_id && /^\d+$/.test(data.telegram_id)) {
        finalId = data.telegram_id;
    }

    const payload = {
        ...data,
        telegram_id: String(finalId),
        username: data.username || storedUser || "site_user",
        first_name: data.first_name || storedName || "Visitante"
    };
    
    console.log("📤 API Enviando PIX para:", payload.telegram_id);
    const response = await api.post('/api/pagamento/pix', payload);
    return response.data;
  },
  
  checkStatus: async (txid) => {
    const response = await api.get(`/api/pagamento/status/${txid}`);
    return response.data;
  }
};

// ============================================================
// 📱 SERVIÇO DE MINI APP
// ============================================================
export const miniappService = {
  saveConfig: async (botId, data) => (await api.post(`/api/admin/bots/${botId}/miniapp/config`, data)).data,
  
  getConfig: async (botId) => (await api.get(`/api/miniapp/${botId}`)).data,
  
  listCategories: async (botId) => (await api.get(`/api/admin/bots/${botId}/miniapp/categories`)).data,
  createCategory: async (data) => (await api.post(`/api/admin/miniapp/categories`, data)).data,
  deleteCategory: async (catId) => (await api.delete(`/api/admin/miniapp/categories/${catId}`)).data,
  
  switchMode: async (botId, mode) => (await api.post(`/api/admin/bots/${botId}/mode`, { modo: mode })).data,
  
  getPublicData: async (botId) => (await api.get(`/api/miniapp/${botId}`)).data
};

// ============================================================
// 🔐 SERVIÇO DE AUTENTICAÇÃO (🔥 ATUALIZADO PARA TURNSTILE)
// ============================================================
export const authService = {
  // 🔥 ATUALIZADO: Recebe turnstileToken e envia no payload
  register: async (username, email, password, fullName, turnstileToken) => {
    const response = await api.post('/api/auth/register', {
      username,
      email,
      password,
      full_name: fullName,
      turnstile_token: turnstileToken // 🛡️ NOVO CAMPO
    });
    return response.data;
  },
  
  // 🔥 ATUALIZADO: Recebe turnstileToken e envia no payload
  login: async (username, password, turnstileToken) => {
    const response = await api.post('/api/auth/login', {
      username,
      password,
      turnstile_token: turnstileToken // 🛡️ NOVO CAMPO
    });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  }
};

// ============================================================
// 📋 SERVIÇO DE AUDIT LOGS
// ============================================================
export const auditService = {
  getLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.action) params.append('action', filters.action);
      if (filters.resource_type) params.append('resource_type', filters.resource_type);
      if (filters.success !== undefined) params.append('success', filters.success);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      params.append('page', filters.page || 1);
      params.append('per_page', filters.per_page || 50);
      
      const response = await api.get(`/api/admin/audit-logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar logs de auditoria:", error);
      return { data: [], total: 0, page: 1, per_page: 50, total_pages: 0 };
    }
  }
};

// ============================================================
// 🔔 SERVIÇO DE NOTIFICAÇÕES (NOVO - ATUALIZAÇÃO DO SITE)
// ============================================================
export const notificationService = {
  getAll: async (limit = 20) => {
    const response = await api.get(`/api/notifications?limit=${limit}`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  },

  markRead: async (notifId) => {
    const response = await api.put(`/api/notifications/${notifId}/read`);
    return response.data;
  }
};

// ============================================================
// 👑 SERVIÇO SUPER ADMIN
// ============================================================
export const superAdminService = {
  getStats: async () => {
    try {
      const response = await api.get('/api/superadmin/stats');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas super admin:", error);
      throw error;
    }
  },

  listUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      params.append('page', filters.page || 1);
      params.append('per_page', filters.per_page || 50);
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      
      const response = await api.get(`/api/superadmin/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return { data: [], total: 0, page: 1, per_page: 50, total_pages: 0 };
    }
  },

  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/api/superadmin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar detalhes do usuário:", error);
      throw error;
    }
  },

  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await api.put(`/api/superadmin/users/${userId}/status`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/superadmin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw error;
    }
  },

  promoteUser: async (userId, isSuperuser) => {
    try {
      const response = await api.put(`/api/superadmin/users/${userId}/promote`, {
        is_superuser: isSuperuser
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao promover/rebaixar usuário:", error);
      throw error;
    }
  },
  
  updateUser: async (userId, userData) => {
    try {
        const response = await api.put(`/api/superadmin/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        throw error;
    }
  },
};

export default api;