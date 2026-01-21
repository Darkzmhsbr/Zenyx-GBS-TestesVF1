import axios from 'axios';

// 🔗 SEU DOMÍNIO DO RAILWAY
const API_URL = 'https://zenyx-gbs-testesv1-production.up.railway.app';

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
      // Só redireciona se NÃO estivermos já na tela de login ou registro
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register')) {
         console.log("🔄 Redirecionando para login...");
         window.location.href = '/login';
      } else {
         console.log("⚠️ Já estamos no login, ignorando redirect.");
      }
    }
    
    return Promise.reject(error);
  }
);

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
};

// ============================================================
// 💬 SERVIÇO DE FLUXO E MENSAGENS
// ============================================================
export const flowService = {
  getFlow: async (botId) => (await api.get(`/api/admin/bots/${botId}/flow`)).data,
  saveFlow: async (botId, flowData) => (await api.post(`/api/admin/bots/${botId}/flow`, flowData)).data,
  getSteps: async (botId) => (await api.get(`/api/admin/bots/${botId}/flow/steps`)).data,
  addStep: async (botId, stepData) => (await api.post(`/api/admin/bots/${botId}/flow/steps`, stepData)).data,
  updateStep: async (botId, stepId, stepData) => (await api.put(`/api/admin/bots/${botId}/flow/steps/${stepId}`, stepData)).data,
  deleteStep: async (botId, stepId) => (await api.delete(`/api/admin/bots/${botId}/flow/steps/${stepId}`)).data,
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
    return (await api.get(`/api/admin/dashboard/stats?${params.toString()}`)).data;
  }
};

export const profileService = {
  get: async () => (await api.get('/api/admin/profile')).data,
  update: async (data) => (await api.post('/api/admin/profile', data)).data
};

// ============================================================
// 🔗 SERVIÇO DE INTEGRAÇÕES E TRACKING
// ============================================================
export const integrationService = { 
    getConfig: async () => (await api.get('/api/admin/config')).data,
    saveConfig: async (d) => (await api.post('/api/admin/config', d)).data,
    
    getPushinStatus: async (botId) => {
        if (!botId) return { status: 'desconectado' };
        try { return (await api.get(`/api/admin/integrations/pushinpay/${botId}`)).data; } 
        catch { return { status: 'desconectado' }; }
    },
    
    savePushinToken: async (botId, token) => (await api.post(`/api/admin/integrations/pushinpay/${botId}`, { token })).data
};

export const trackingService = {
  listFolders: async () => (await api.get('/api/admin/tracking/folders')).data,
  createFolder: async (data) => (await api.post('/api/admin/tracking/folders', data)).data,
  deleteFolder: async (folderId) => (await api.delete(`/api/admin/tracking/folders/${folderId}`)).data,
  listLinks: async (folderId) => (await api.get(`/api/admin/tracking/links/${folderId}`)).data,
  createLink: async (data) => (await api.post('/api/admin/tracking/links', data)).data,
  deleteLink: async (linkId) => (await api.delete(`/api/admin/tracking/links/${linkId}`)).data
};

// ============================================================
// 💳 SERVIÇO DE PAGAMENTOS
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
// 🔐 SERVIÇO DE AUTENTICAÇÃO
// ============================================================
export const authService = {
  register: async (username, email, password, fullName) => {
    const response = await api.post('/api/auth/register', {
      username,
      email,
      password,
      full_name: fullName
    });
    return response.data;
  },
  
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', {
      username,
      password
    });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};

// ============================================================
// 📋 SERVIÇO DE AUDIT LOGS (FASE 3.3)
// ============================================================
export const auditService = {
  /**
   * Busca logs de auditoria com filtros opcionais
   */
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
// 👑 SERVIÇO SUPER ADMIN (🆕 FASE 3.4)
// ============================================================
export const superAdminService = {
  /**
   * Busca estatísticas globais do sistema (apenas super-admin)
   */
  getStats: async () => {
    try {
      const response = await api.get('/api/superadmin/stats');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas super admin:", error);
      throw error;
    }
  },

  /**
   * Lista todos os usuários do sistema (apenas super-admin)
   * 
   * @param {Object} filters - Filtros opcionais
   * @param {number} filters.page - Página (padrão: 1)
   * @param {number} filters.per_page - Usuários por página (padrão: 50)
   * @param {string} filters.search - Busca por username, email ou nome
   * @param {string} filters.status - "active" ou "inactive"
   */
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

  /**
   * Busca detalhes completos de um usuário específico (apenas super-admin)
   */
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/api/superadmin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar detalhes do usuário:", error);
      throw error;
    }
  },

  /**
   * Ativa ou desativa um usuário (apenas super-admin)
   */
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

  /**
   * Deleta um usuário e todos os seus dados (apenas super-admin)
   * ⚠️ ATENÇÃO: Ação irreversível!
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/superadmin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw error;
    }
  },

  /**
   * Promove ou rebaixa um usuário de/para super-admin (apenas super-admin)
   */
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
  }
};

export default api;