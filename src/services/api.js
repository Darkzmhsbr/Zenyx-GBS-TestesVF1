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
// 🔐 FLAG GLOBAL: Evita múltiplos redirects simultâneos (401)
// Quando o token expira, várias chamadas API retornam 401 ao
// mesmo tempo. Sem essa flag, cada uma tenta limpar o storage
// e redirecionar, causando o "painel fantasma".
// ============================================================
let _isLoggingOut = false;

/** Retorna true se estamos em processo de logout por token expirado */
export function isSessionExpired() {
  return _isLoggingOut;
}

/** Reseta a flag — chamar após login com sucesso */
export function resetSessionState() {
  _isLoggingOut = false;
}

// ============================================================
// 🔐 INTERCEPTOR: ADICIONA TOKEN JWT EM TODAS AS REQUISIÇÕES
// ============================================================
api.interceptors.request.use(
  (config) => {
    // 🔥 Se estamos em logout, aborta requisições pendentes silenciosamente
    if (_isLoggingOut) {
      const controller = new AbortController();
      controller.abort();
      config.signal = controller.signal;
      return config;
    }

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
      
      // 🔥 CORREÇÃO: Só processa o PRIMEIRO 401, ignora os demais
      if (_isLoggingOut) {
        return Promise.reject(error);
      }
      
      console.warn("⚠ Token inválido ou expirado.");
      
      // 🔥 Marca ANTES de limpar — impede que BotContext/outros
      // componentes reajam ao estado vazio (painel fantasma)
      _isLoggingOut = true;
      
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
         // 🔥 setTimeout garante que o redirect acontece DEPOIS de todas
         // as promises rejeitadas serem tratadas, evitando renders intermediários
         setTimeout(() => {
           window.location.href = '/login';
         }, 100);
      } else {
         console.log("⚠️ Já estamos no login/home, ignorando redirect.");
         _isLoggingOut = false;
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
  
  // 🔥 NOVA FUNÇÃO: TESTAR CANAL
  testChannel: async (token, channelId) => {
    try {
      const response = await api.post('/api/admin/utils/test-channel', { token, channel_id: channelId });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // 🔁 NOVA FUNÇÃO: CLONAR BOT
  cloneBot: async (botId, dados) => {
    const response = await api.post(`/api/admin/bots/${botId}/clone`, dados);
    return response.data;
  },

  // 🆕 LIMITE DE BOTS
  getBotLimit: async () => (await api.get('/api/admin/bot-limit')).data,

  // 🆕 ORDEM DO SELETOR
  updateSelectorOrder: async (order) => (await api.put('/api/admin/bot-selector-order', { order })).data,

  // 🆕 MÉTRICAS AVANÇADAS POR BOT (Visão Geral)
  getBotOverview: async (botId) => (await api.get(`/api/admin/bots/${botId}/overview`)).data,

  // 🆕 MÉTRICAS GLOBAIS (Visão Geral de todos os bots)
  getAllBotsOverview: async () => (await api.get('/api/admin/bots-overview')).data
};

// ============================================================
// 💬 SERVIÇO DE FLUXO E MENSAGENS
// ============================================================
export const flowService = {
  getFlow: async (botId) => (await api.get(`/api/admin/bots/${botId}/flow`)).data,
  
  saveFlow: async (botId, flowData) => {
    const payload = {
      msg_boas_vindas: flowData.msg_boas_vindas,
      media_url: flowData.media_url,
      btn_text_1: flowData.btn_text_1,
      autodestruir_1: flowData.autodestruir_1,
      msg_2_texto: flowData.msg_2_texto,
      msg_2_media: flowData.msg_2_media,
      mostrar_planos_2: flowData.mostrar_planos_2,
      mostrar_planos_1: flowData.mostrar_planos_1,
      start_mode: flowData.start_mode,
      miniapp_url: flowData.miniapp_url,
      miniapp_btn_text: flowData.miniapp_btn_text,
      msg_pix: flowData.msg_pix,
      
      // 🔥 NOVOS CAMPOS
      button_mode: flowData.button_mode || 'next_step',
      buttons_config: flowData.buttons_config || [],
      buttons_config_2: flowData.buttons_config_2 || [],
      
      steps: flowData.steps || []
    };
    
    const response = await api.post(`/api/admin/bots/${botId}/flow`, payload);
    return response.data;
  },
  
  // 🔥 ESSENCIAL: Salvar o Layout
  saveLayout: async (botId, layoutData) => {
    const response = await api.put(`/api/admin/bots/${botId}/flow/layout`, layoutData);
    return response.data;
  },

  getSteps: async (botId) => (await api.get(`/api/admin/bots/${botId}/flow/steps`)).data,
  
  addStep: async (botId, stepData) => (await api.post(`/api/admin/bots/${botId}/flow/steps`, stepData)).data,
  
  createStep: async (botId, stepData) => {
    const response = await api.post(`/api/admin/bots/${botId}/flow/steps`, stepData);
    return response.data;
  },

  updateStep: async (botId, stepId, stepData) => (await api.put(`/api/admin/bots/${botId}/flow/steps/${stepId}`, stepData)).data,
  
  deleteStep: async (botId, stepId) => (await api.delete(`/api/admin/bots/${botId}/flow/steps/${stepId}`)).data,
  
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
// 🚀 SERVIÇO DE UPSELL
// ============================================================
export const upsellService = {
  get: async (botId) => (await api.get(`/api/admin/bots/${botId}/upsell`)).data,
  save: async (botId, data) => (await api.post(`/api/admin/bots/${botId}/upsell`, data)).data
};

// ============================================================
// 📉 SERVIÇO DE DOWNSELL
// ============================================================
export const downsellService = {
  get: async (botId) => (await api.get(`/api/admin/bots/${botId}/downsell`)).data,
  save: async (botId, data) => (await api.post(`/api/admin/bots/${botId}/downsell`, data)).data
};

// ============================================================
// 📢 SERVIÇO DE REMARKETING
// ============================================================
export const remarketingService = {
  send: async (botId, data, isTest = false, specificUserId = null) => {
    // 🔥 CORREÇÃO: Normaliza custom_price (vírgula → ponto, 2 casas decimais)
    let normalizedCustomPrice = null;
    if (data.price_mode === 'custom' && data.custom_price !== '' && data.custom_price !== null && data.custom_price !== undefined) {
      const cleaned = String(data.custom_price).replace(',', '.');
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed) && parsed > 0) {
        normalizedCustomPrice = Math.round(parsed * 100) / 100; // Garante 2 casas decimais
      }
    }

    const payload = {
      bot_id: botId,
      target: data.target || 'todos',
      mensagem: data.mensagem,
      media_url: data.media_url,
      incluir_oferta: data.incluir_oferta,
      plano_oferta_id: data.plano_oferta_id,
      price_mode: data.price_mode || 'original',
      custom_price: normalizedCustomPrice, // 🔥 Valor já normalizado (ou null se original)
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
  },

// 🔥 NOVO: Buscar progresso de campanha em tempo real
  getProgress: async (campaignId) => {
    return (await api.get(`/api/admin/remarketing/progress/${campaignId}`)).data;
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
  resendAccess: async (userId, planoId = null) => {
    const params = planoId ? `?plano_id=${planoId}` : '';
    return (await api.post(`/api/admin/users/${userId}/resend-access${params}`)).data;
  },
  removeFromVip: async (userId) => (await api.post(`/api/admin/users/${userId}/remove-vip`)).data,
  getPlanosCanais: async (botId) => (await api.get(`/api/admin/bots/${botId}/planos-canais`)).data
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
  
  // =========================================================
  // 💳 PUSHINPAY
  // =========================================================
  getPushinStatus: async (botId) => {
    if (!botId) return { status: 'desconectado' };
    try {
      const response = await api.get(`/api/admin/integrations/pushinpay/${botId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar status PushinPay:", error);
      return { status: 'desconectado' };
    }
  },
  
  savePushinToken: async (botId, token) => {
    try {
      const response = await api.post(`/api/admin/integrations/pushinpay/${botId}`, { token });
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar token PushinPay:", error);
      throw error;
    }
  },

  updatePushinToken: async (botId, token) => {
    try {
      const response = await api.put(`/api/admin/integrations/pushinpay/${botId}`, { token });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar token PushinPay:", error);
      throw error;
    }
  },

  // =========================================================
  // 💰 WIINPAY
  // =========================================================
  getWiinpayStatus: async (botId) => {
    if (!botId) return { status: 'desconectado' };
    try {
      const response = await api.get(`/api/admin/integrations/wiinpay/${botId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar status WiinPay:", error);
      return { status: 'desconectado' };
    }
  },

  saveWiinpayToken: async (botId, token) => {
    try {
      const response = await api.post(`/api/admin/integrations/wiinpay/${botId}`, { token });
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar API Key WiinPay:", error);
      throw error;
    }
  },

  updateWiinpayToken: async (botId, token) => {
    try {
      const response = await api.put(`/api/admin/integrations/wiinpay/${botId}`, { token });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar API Key WiinPay:", error);
      throw error;
    }
  },

  // =========================================================
  // 🔄 SYNC PAY (NOVO)
  // =========================================================
  getSyncPayStatus: async (botId) => {
    if (!botId) return { status: 'desconectado' };
    try {
      const response = await api.get(`/api/admin/integrations/syncpay/${botId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar status Sync Pay:", error);
      return { status: 'desconectado' };
    }
  },

  saveSyncPayToken: async (botId, clientId, clientSecret) => {
    try {
      const response = await api.post(`/api/admin/integrations/syncpay/${botId}`, { 
        client_id: clientId, 
        client_secret: clientSecret 
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar credenciais Sync Pay:", error);
      throw error;
    }
  },

  updateSyncPayToken: async (botId, clientId, clientSecret) => {
    try {
      const response = await api.put(`/api/admin/integrations/syncpay/${botId}`, { 
        client_id: clientId, 
        client_secret: clientSecret 
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar credenciais Sync Pay:", error);
      throw error;
    }
  },

  // =========================================================
  // 🔄 MULTI-GATEWAY CONFIG (CONTINGÊNCIA)
  // =========================================================
  getGatewayConfig: async (botId) => {
    if (!botId) return null;
    try {
      const response = await api.get(`/api/admin/integrations/gateway-config/${botId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar config de gateways:", error);
      return null;
    }
  },

  updateGatewayConfig: async (botId, data) => {
    try {
      const response = await api.put(`/api/admin/integrations/gateway-config/${botId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar config de gateways:", error);
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
  getStats: async () => (await api.get('/api/profile/stats')).data,
  // 🆕 Alterar senha
  changePassword: async (data) => (await api.post('/api/admin/profile/change-password', data)).data,
  // 🆕 Alterar username
  changeUsername: async (data) => (await api.post('/api/admin/profile/change-username', data)).data
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
  },

  // 📊 NOVAS ROTAS DE MÉTRICAS AVANÇADAS
  getLinkMetrics: async (linkId) => {
    try {
      const response = await api.get(`/api/admin/tracking/link/${linkId}/metrics`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar métricas do link:", error);
      throw error;
    }
  },

  getChart: async (days = 7) => {
    try {
      const response = await api.get(`/api/admin/tracking/chart?days=${days}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dados do gráfico:", error);
      throw error;
    }
  },

  getRanking: async (limit = 10) => {
    try {
      const response = await api.get(`/api/admin/tracking/ranking?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar ranking:", error);
      throw error;
    }
  }
};

// ============================================================
// 📂 SERVIÇO DE UPLOAD DE MÍDIA (ATUALIZADO PARA BACKBLAZE)
// ============================================================
export const mediaService = {
  upload: async (file, type = 'media') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await api.post('/api/admin/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("❌ Erro ao fazer upload de mídia:", error.response?.data || error.message);
      // Retorna o erro bonitinho para o SweetAlert tratar na tela
      throw error.response?.data?.detail || "Erro inesperado ao enviar arquivo.";
    }
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
// 🔐 SERVIÇO DE AUTENTICAÇÃO
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
    // 🔥 Reseta flag de sessão expirada antes do login
    resetSessionState();
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

  // 🕵️ Login Impersonado (Entrar na conta do cliente)
  impersonateUser: async (userId) => {
    try {
      const response = await api.post(`/api/superadmin/impersonate/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao realizar login impersonado:", error);
      throw error;
    }
  },

  // 📢 Enviar Broadcast (Notificação em massa)
  sendBroadcast: async (broadcastData) => {
    try {
      const response = await api.post('/api/admin/broadcast', broadcastData);
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar broadcast:", error);
      throw error;
    }
  },

  // 🤖 Listar Todos os Bots do Sistema
  getAllBots: async (page = 1, limit = 50, search = '', status = '') => {
    try {
      const params = new URLSearchParams({ page, per_page: limit });
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      
      const response = await api.get(`/api/superadmin/bots?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao listar bots do sistema:", error);
      throw error;
    }
  },

  // 🗑️ Deletar Bot Forçado
  deleteBotForce: async (botId) => {
    try {
      const response = await api.delete(`/api/superadmin/bots/${botId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar bot forçado:", error);
      throw error;
    }
  }
};
// ============================================================
// 🆓 CANAL FREE SERVICE
// ============================================================
export const canalFreeService = {
  // Buscar configuração do Canal Free
  getConfig: async (botId) => {
    try {
      const response = await api.get(`/api/admin/canal-free/${botId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar config Canal Free:', error);
      throw error;
    }
  },

  // Salvar configuração do Canal Free
  saveConfig: async (botId, config) => {
    try {
      const response = await api.post(`/api/admin/canal-free/${botId}`, config);
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar config Canal Free:', error);
      throw error;
    }
  },

  // Buscar canais disponíveis (onde o bot é admin)
  getCanaisDisponiveis: async (botId) => {
    try {
      const response = await api.get(`/api/admin/canal-free/${botId}/canais-disponiveis`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar canais disponíveis:', error);
      return { canais: [], instructions: [] };
    }
  }
};

// ============================================================
// 📦 GRUPOS E CANAIS (ESTEIRA DE PRODUTOS)
// ============================================================
export const groupService = {
  // Listar todos os grupos/canais do bot
  list: async (botId) => {
    try {
      const response = await api.get(`/api/admin/bots/${botId}/groups`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar grupos:', error);
      return { groups: [], total: 0 };
    }
  },

  // Buscar detalhes de um grupo específico
  get: async (botId, groupId) => {
    try {
      const response = await api.get(`/api/admin/bots/${botId}/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      throw error;
    }
  },

  // Criar novo grupo/canal
  create: async (botId, data) => {
    try {
      const response = await api.post(`/api/admin/bots/${botId}/groups`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      throw error;
    }
  },

  // Atualizar grupo/canal existente
  update: async (botId, groupId, data) => {
    try {
      const response = await api.put(`/api/admin/bots/${botId}/groups/${groupId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      throw error;
    }
  },

  // Deletar grupo/canal
  delete: async (botId, groupId) => {
    try {
      const response = await api.delete(`/api/admin/bots/${botId}/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
      throw error;
    }
  }
};

// ============================================================
// 📊 SERVIÇO DE ESTATÍSTICAS AVANÇADAS
// ============================================================
export const statisticsService = {
  getStats: async (botId = null, period = '30d') => {
    try {
      const params = new URLSearchParams();
      if (botId) params.append('bot_id', botId);
      if (period) params.append('period', period);
      
      const queryString = params.toString();
      const url = queryString ? `/api/admin/statistics?${queryString}` : '/api/admin/statistics';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        metricas: {
          receita_total: 0, ticket_medio: 0, total_usuarios: 0,
          ltv_medio: 0, total_vendas: 0, total_pendentes: 0,
          receita_pendentes: 0, total_geradas: 0, taxa_conversao: 0, total_leads: 0
        },
        chart_receita: [], top_planos: [], top_horas: [], top_dias: [],
        donut_conversao: { convertidas: 0, pendentes: 0, perdidas: 0 },
        periodo: { inicio: '', fim: '', label: '30d' }
      };
    }
  }
};

// ============================================================
// 🏆 NOVO SERVIÇO: RANKING
// ============================================================
export const rankingService = {
  getTopVendedores: async (mes, ano) => {
    try {
      const response = await api.get(`/api/ranking?mes=${mes}&ano=${ano}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      throw error;
    }
  }
};

// ============================================================
// ✨ SERVIÇO: EMOJIS PREMIUM DO TELEGRAM
// ============================================================
export const premiumEmojiService = {
  
  // ===================== CATÁLOGO PÚBLICO (PARA O EMOJI PICKER) =====================
  
  /** Retorna catálogo completo organizado por pacotes (para o Emoji Picker dos usuários) */
  getCatalog: async () => {
    try {
      const response = await api.get('/api/premium-emojis/catalog');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar catálogo de emojis premium:', error);
      return { total_packs: 0, total_emojis: 0, packs: [] };
    }
  },

  /** Busca emojis por nome, shortcode ou fallback */
  search: async (query) => {
    try {
      const response = await api.get(`/api/premium-emojis/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar emojis premium:', error);
      return { emojis: [] };
    }
  },

  // ===================== SUPER ADMIN - PACOTES =====================

  /** Lista todos os pacotes (Super Admin) */
  listPacks: async () => {
    try {
      const response = await api.get('/api/superadmin/premium-emojis/packs');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar pacotes de emojis:', error);
      throw error;
    }
  },

  /** Cria um novo pacote (Super Admin) */
  createPack: async (packData) => {
    try {
      const response = await api.post('/api/superadmin/premium-emojis/packs', packData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pacote:', error);
      throw error;
    }
  },

  /** Atualiza um pacote (Super Admin) */
  updatePack: async (packId, packData) => {
    try {
      const response = await api.put(`/api/superadmin/premium-emojis/packs/${packId}`, packData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar pacote:', error);
      throw error;
    }
  },

  /** Deleta um pacote e todos seus emojis (Super Admin) */
  deletePack: async (packId) => {
    try {
      const response = await api.delete(`/api/superadmin/premium-emojis/packs/${packId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar pacote:', error);
      throw error;
    }
  },

  // ===================== SUPER ADMIN - EMOJIS =====================

  /** Lista emojis com filtros (Super Admin) */
  listEmojis: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.pack_id) params.append('pack_id', filters.pack_id);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.per_page) params.append('per_page', filters.per_page);
      
      const response = await api.get(`/api/superadmin/premium-emojis?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar emojis premium:', error);
      throw error;
    }
  },

  /** Cadastra um emoji premium (Super Admin) */
  createEmoji: async (emojiData) => {
    try {
      const response = await api.post('/api/superadmin/premium-emojis', emojiData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar emoji premium:', error);
      throw error;
    }
  },

  /** Cadastra vários emojis de uma vez (Super Admin) */
  bulkCreateEmojis: async (emojisArray) => {
    try {
      const response = await api.post('/api/superadmin/premium-emojis/bulk', { emojis: emojisArray });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar emojis em massa:', error);
      throw error;
    }
  },

  /** Atualiza um emoji premium (Super Admin) */
  updateEmoji: async (emojiId, emojiData) => {
    try {
      const response = await api.put(`/api/superadmin/premium-emojis/${emojiId}`, emojiData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar emoji premium:', error);
      throw error;
    }
  },

  /** Remove um emoji premium (Super Admin) */
  deleteEmoji: async (emojiId) => {
    try {
      const response = await api.delete(`/api/superadmin/premium-emojis/${emojiId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar emoji premium:', error);
      throw error;
    }
  },

  /** 📦 Importa um pack completo de emojis premium do Telegram (Super Admin) */
  importPack: async (data) => {
    try {
      const response = await api.post('/api/superadmin/premium-emojis/import-pack', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao importar pack:', error);
      throw error;
    }
  }
};

// =========================================================
// 🧪 SERVIÇO: ENVIO DE TESTE GENÉRICO
// =========================================================
export const testSendService = {
  /**
   * Envia uma mensagem de teste para o admin principal do bot.
   * @param {number} botId - ID do bot
   * @param {object} data - { message, media_url, media_type, source, buttons }
   */
  send: async (botId, data) => {
    const response = await api.post(`/api/admin/bots/${botId}/send-test-message`, data);
    return response.data;
  }
};

export default api;