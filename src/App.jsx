import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BotProvider } from './context/BotContext';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { MainLayout } from './layout/MainLayout';

// Autenticação e Landing
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { LandingPage } from './pages/LandingPage'; 

// Páginas Legais
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Refund } from './pages/Refund';

// Páginas Principais
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Funil } from './pages/Funil';
import { Plans } from './pages/Plans';
import { Bots } from './pages/Bots';
import { NewBot } from './pages/NewBot';
import { BotConfig } from './pages/BotConfig';
import { Integrations } from './pages/Integrations';
import { ChatFlow } from './pages/ChatFlow';
import { Remarketing } from './pages/Remarketing';
import { AdminManager } from './pages/AdminManager';
import { OrderBump } from './pages/OrderBump';
import { UpsellDownsell } from './pages/UpsellDownsell';
import { Profile } from './pages/Profile';
import { Tracking } from './pages/Tracking';
import { AuditLogs } from './pages/AuditLogs';
import { SuperAdmin } from './pages/SuperAdmin';
import { SuperAdminUsers } from './pages/SuperAdminUsers';
import { Tutorial } from './pages/Tutorial';

// 🆕 NOVA PÁGINA: Disparo Automático (Renomeada para evitar conflito)
import { AutoRemarketing } from './pages/AutoRemarketingPage';

// 🆕 NOVA PÁGINA: Canal Free
import { CanalFree } from './pages/CanalFree';

// Mini App (Loja)
import { MiniAppHome } from './pages/miniapp/MiniAppHome';
import { MiniAppCategory } from './pages/miniapp/MiniAppCategory';
import { MiniAppCheckout } from './pages/miniapp/MiniAppCheckout';
import { MiniAppPayment } from './pages/miniapp/MiniAppPayment';
import { MiniAppSuccess } from './pages/miniapp/MiniAppSuccess';

const Logout = () => {
  localStorage.removeItem('zenyx_admin_user');
  localStorage.removeItem('zenyx_token');
  window.location.href = '/login';
  return null;
};

const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '40px', marginTop: '70px', marginLeft: '260px' }}>
    <h1 style={{ color: 'var(--primary)' }}>{title}</h1>
    <p style={{ color: 'var(--muted-foreground)' }}>Esta página está em construção...</p>
  </div>
);

function App() {
  // Captura global de usuário Telegram
  useEffect(() => {
    if (!window.Telegram) {
        const script = document.createElement('script');
        script.src = "https://telegram.org/js/telegram-web-app.js";
        script.async = true;
        document.body.appendChild(script);
    }

    const checkTelegram = setInterval(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            
            try { tg.expand(); } catch (e) {}

            const user = tg.initDataUnsafe?.user;
            
            if (user) {
                console.log("✅ [App.js] Cliente Telegram Detectado:", user.first_name);
                
                localStorage.setItem('telegram_user_id', user.id);
                localStorage.setItem('telegram_user_first_name', user.first_name);
                
                if (user.username) {
                    localStorage.setItem('telegram_username', user.username);
                } else {
                    localStorage.removeItem('telegram_username');
                }
                
                try {
                    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
                    document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
                } catch (e) {}
                
                clearInterval(checkTelegram);
            }
        }
    }, 200);

    setTimeout(() => clearInterval(checkTelegram), 5000);

    return () => clearInterval(checkTelegram);
  }, []);

  return (
    <AuthProvider>
      <BotProvider>
        <ProgressProvider>
        <Router>
          <Routes>
            {/* Rota Pública: Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Documentos Legais */}
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/reembolso" element={<Refund />} />

            {/* Autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
            
            {/* Loja Pública (Mini App) */}
            <Route path="/loja/:botId" element={<MiniAppHome />} />
            <Route path="/loja/:botId/categoria/:slug" element={<MiniAppCategory />} />
            <Route path="/loja/:botId/checkout" element={<MiniAppCheckout />} />
            <Route path="/loja/:botId/pagamento" element={<MiniAppPayment />} />
            <Route path="/loja/:botId/obrigado" element={<MiniAppSuccess />} />
            
            {/* Rotas Protegidas (Painel Admin) */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bots" element={<Bots />} />
              <Route path="/bots/new" element={<NewBot />} />
              <Route path="/bots/config/:id" element={<BotConfig />} />
              
              <Route path="/funil" element={<Funil />} />
              <Route path="/contatos" element={<Contacts />} />
              <Route path="/planos" element={<Plans />} />
              <Route path="/flow" element={<ChatFlow />} />
              <Route path="/remarketing" element={<Remarketing />} />
              <Route path="/integracoes" element={<Integrations />} />
              
              <Route path="/ofertas/order-bump" element={<OrderBump />} />
              <Route path="/ofertas/upsell" element={<UpsellDownsell type="upsell" />} />
              <Route path="/ofertas/downsell" element={<UpsellDownsell type="downsell" />} />
              <Route path="/rastreamento" element={<Tracking />} />
              <Route path="/perfil" element={<Profile />} />
              
              {/* Audit Logs */}
              <Route path="/audit-logs" element={<AuditLogs />} />
              
              {/* Super Admin */}
              <Route path="/superadmin" element={<SuperAdmin />} />
              <Route path="/superadmin/users" element={<SuperAdminUsers />} />
              
              <Route path="/config" element={<PlaceholderPage title="Configurações Gerais" />} />
              
              {/* Tutoriais */}
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/tutoriais" element={<Tutorial />} />
              
              {/* Funções Extras */}
              <Route path="/funcoes" element={<PlaceholderPage title="Funções Extras" />} />
              <Route path="/funcoes/admins" element={<AdminManager />} />
              <Route path="/funcoes/grupos" element={<PlaceholderPage title="Grupos e Canais" />} />
              <Route path="/funcoes/free" element={<CanalFree />} />
              
              {/* 🆕 NOVA ROTA: DISPARO AUTOMÁTICO */}
              <Route path="/extras/auto-remarketing" element={<AutoRemarketing />} />
            </Route>

            {/* Rota não encontrada */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Router>
        </ProgressProvider>
      </BotProvider>
    </AuthProvider>
  );
}

export default App;