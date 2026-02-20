import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OneSignal from 'react-onesignal'; // 🔔 1. IMPORTAMOS O ONESIGNAL AQUI

// 👇 Importa componentes de estrutura
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ProgressWidget } from '../components/ProgressWidget';

export function MainLayout() {
  const { user } = useAuth();
  
  // Estado para controlar o Menu Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // =========================================================================
  // 🔔 2. INICIALIZAÇÃO MÁGICA DO ONESIGNAL
  // =========================================================================
  useEffect(() => {
    const runOneSignal = async () => {
      try {
        // Inicia o OneSignal com o seu App ID
        await OneSignal.init({
          appId: "a80e6196-67d7-4cd7-ab38-045790d8419c", // 🔑 SUA CHAVE AQUI
          allowLocalhostAsSecureOrigin: true, // Permite testar no seu PC (localhost)
          notifyButton: {
            enable: true, // Ativa aquele sininho flutuante no canto da tela (opcional)
          },
        });

        // 🎯 O PULO DO GATO: Amarramos o celular atual ao Username do usuário!
        // Assim, o Backend sabe pra quem mandar o "Plim!" da venda.
        if (user && user.username) {
          await OneSignal.login(String(user.username));
        }
      } catch (error) {
        console.error("Erro ao iniciar notificações Push:", error);
      }
    };

    runOneSignal();
  }, [user]); // Roda sempre que o usuário logar/recarregar
  // =========================================================================

  // 🔒 BLOQUEIO: Se não tiver usuário logado, chuta para o Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      {/* Sidebar recebe o estado e a função para fechar */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {/* Header recebe a função para abrir o menu */}
      <Header 
        onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
      
      {/* Fundo escuro (Overlay) no mobile ao abrir menu */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main>
        {/* Outlet é onde as páginas (Dashboard, Bots, etc) serão renderizadas */}
        <Outlet />
      </main>

      {/* 🚀 Widget de Progresso GLOBAL - persiste entre navegações de página */}
      <ProgressWidget />
    </div>
  );
}