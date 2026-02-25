import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBot } from '../context/BotContext';
import { notificationService, botService } from '../services/api';
import { 
  Bot, ChevronDown, Check, Bell, Moon, Sun, Menu, User, Settings, LogOut, 
  Info, AlertTriangle, XCircle, CheckCircle, LayoutGrid
} from 'lucide-react'; 
import { BotSidebar } from './BotSidebar';
import './Header.css'; 

export function Header({ onToggleMenu }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // 🔥 CORREÇÃO: Extraindo o refreshBots do useBot
  const { bots, selectedBot, changeBot, refreshBots } = useBot();
  
  const [isBotMenuOpen, setIsBotMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 🆕 Estado da Sidebar de Bots
  const [isBotSidebarOpen, setIsBotSidebarOpen] = useState(false);

  // 🆕 Estado do Limite de Bots
  const [botLimit, setBotLimit] = useState(null);

  // Estados de Notificação
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 🔥 Refs para fechar ao clicar fora
  const notifRef = useRef(null);
  const botRef = useRef(null);
  const profileRef = useRef(null);

  // 🔥 CLICK OUTSIDE: Fecha TODOS os dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (botRef.current && !botRef.current.contains(e.target)) {
        setIsBotMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('zenyx_theme') || 'dark';
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    applyTheme(isDark);
  }, []);

  // 🆕 Buscar limite de bots
  useEffect(() => {
    if (user) {
      botService.getBotLimit().then(setBotLimit).catch(() => {});
    }
  }, [user, bots]);

  // Busca notificações reais
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      if (notificationService) {
        const data = await notificationService.getAll();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) { console.error(error); }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) { console.error(error); }
  };

  const applyTheme = (isDark) => {
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--background', '#0f0c29');
      root.style.setProperty('--card', '#1b1730');
      root.style.setProperty('--card-border', '#302b63');
      root.style.setProperty('--foreground', '#ffffff');
      root.style.setProperty('--muted-foreground', '#a0a0b0');
      root.style.setProperty('--muted', 'rgba(255,255,255,0.1)');
    } else {
      root.style.setProperty('--background', '#f4f6f9');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-border', '#e1e4e8');
      root.style.setProperty('--foreground', '#1a1a2e');
      root.style.setProperty('--muted-foreground', '#666666');
      root.style.setProperty('--muted', '#f1f1f1');
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('zenyx_theme', newTheme ? 'dark' : 'light');
    applyTheme(newTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 🆕 Handler para criar novo bot (com validação de limite)
  const handleCreateBot = () => {
    setIsBotMenuOpen(false);
    if (botLimit && !botLimit.can_create) {
      import('sweetalert2').then(({ default: Swal }) => {
        Swal.fire({
          title: 'Limite Atingido',
          html: `Você atingiu o limite de <b>${botLimit.max}</b> bots do plano <b>${botLimit.plano.toUpperCase()}</b>.<br><br>Exclua bots inativos para liberar espaço.`,
          icon: 'warning',
          background: '#151515',
          color: '#fff',
          confirmButtonColor: '#c333ff'
        });
      });
      return;
    }
    navigate('/bots/new');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Agora';
    if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Há ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString('pt-BR');
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={18} />;
      case 'warning': return <AlertTriangle size={18} />;
      case 'error': return <XCircle size={18} />;
      default: return <Info size={18} />;
    }
  };

  // 🆕 Bots visíveis no dropdown (máximo 7)
  const MAX_DROPDOWN_BOTS = 7;
  const visibleBots = bots.slice(0, MAX_DROPDOWN_BOTS);
  const hasMoreBots = bots.length > MAX_DROPDOWN_BOTS;

  return (
    <header className="header">
      {/* ESQUERDA: Menu Mobile e Bot Selector */}
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleMenu}>
          <Menu size={24} />
        </button>

        {/* --- SELETOR DE BOTS (COM LIMITE DE 7) --- */}
        <div className="bot-selector-wrapper" ref={botRef}>
          <button 
            className={`bot-selector-btn ${isBotMenuOpen ? 'active' : ''}`}
            onClick={() => setIsBotMenuOpen(!isBotMenuOpen)}
          >
            <div className="bot-icon-circle">
              <Bot size={18} />
            </div>
            <span className="bot-name">
              {selectedBot ? selectedBot.nome : 'Selecionar Bot'}
            </span>
            <ChevronDown size={14} className="chevron-icon" />
          </button>

          {isBotMenuOpen && (
            <div className="bot-dropdown-menu">
              <div className="dropdown-header">
                <span>SEUS BOTS</span>
                {botLimit && (
                  <span className="bot-count-badge">
                    {botLimit.current}/{botLimit.max}
                  </span>
                )}
              </div>
              
              {bots.length === 0 ? (
                <div style={{padding: '20px', textAlign: 'center', color: '#888'}}>Nenhum bot</div>
              ) : (
                <>
                  {visibleBots.map(bot => (
                    <div 
                      key={bot.id} 
                      className={`dropdown-item ${selectedBot?.id === bot.id ? 'selected' : ''}`}
                      onClick={() => {
                        changeBot(bot);
                        setIsBotMenuOpen(false);
                      }}
                    >
                      <div className="bot-mini-icon">
                        <Bot size={14} />
                      </div>
                      <span>{bot.nome}</span>
                      {selectedBot?.id === bot.id && <Check size={14} className="check-icon" />}
                    </div>
                  ))}

                  {hasMoreBots && (
                    <div 
                      className="dropdown-item view-all-item"
                      onClick={() => {
                        setIsBotMenuOpen(false);
                        setIsBotSidebarOpen(true);
                      }}
                    >
                      <div className="bot-mini-icon view-all-icon">
                        <LayoutGrid size={14} />
                      </div>
                      <span>Ver todos os bots ({bots.length})</span>
                    </div>
                  )}
                </>
              )}
              
              <div 
                className="dropdown-footer"
                onClick={handleCreateBot}
              >
                + CRIAR NOVO BOT
                {botLimit && !botLimit.can_create && (
                  <span style={{ fontSize: '0.7rem', color: '#ef4444', marginLeft: '8px' }}>LIMITE</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DIREITA: Tema, Notificações, Perfil */}
      <div className="header-right">
        <button className="icon-btn" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="notification-dropdown-wrapper" ref={notifRef}>
          <button 
            className={`icon-btn ${isNotificationOpen ? 'active' : ''}`}
            onClick={() => {
               setIsNotificationOpen(!isNotificationOpen);
               setIsProfileMenuOpen(false);
               if(!isNotificationOpen) fetchNotifications();
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {isNotificationOpen && (
            <div className="notification-dropdown-menu">
              <div className="notification-header">
                <h4>Notificações</h4>
                {unreadCount > 0 && (
                  <button className="mark-all-read" onClick={handleMarkAllRead}>
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <Bell size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                    <p>Você não tem novas notificações.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                    >
                      <div className={`notification-icon ${notif.type}`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="notification-content">
                        <h5 className="notification-title">{notif.title}</h5>
                        <p className="notification-text">{notif.message}</p>
                        <span className="notification-time">{formatTime(notif.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-dropdown-wrapper" ref={profileRef}>
          <div 
            className="user-avatar"
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsNotificationOpen(false);
            }}
          >
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
          </div>

          {isProfileMenuOpen && (
            <div className="profile-dropdown-menu">
              <div className="profile-dropdown-header">
                <div className="profile-avatar-large">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
                </div>
                <div className="profile-name">{user?.name || 'Administrador'}</div>
                <div className="profile-email">{user?.username}</div>
              </div>
              
              <div className="profile-dropdown-item" onClick={() => { navigate('/perfil'); setIsProfileMenuOpen(false); }}>
                <User size={16} /> <span>Meu Perfil</span>
              </div>
              {user?.is_superuser ? (
                <div className="profile-dropdown-item" onClick={() => { navigate('/superadmin'); setIsProfileMenuOpen(false); }}>
                  <Settings size={16} /> <span>Super Admin</span>
                </div>
              ) : (
                <div className="profile-dropdown-item" onClick={() => { navigate('/perfil'); setIsProfileMenuOpen(false); }}>
                  <Settings size={16} /> <span>Configurações</span>
                </div>
              )}
              <div className="profile-dropdown-item danger" onClick={handleLogout}>
                <LogOut size={16} /> <span>Sair do Sistema</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🆕 SIDEBAR DE BOTS */}
      <BotSidebar 
        isOpen={isBotSidebarOpen}
        onClose={() => setIsBotSidebarOpen(false)}
        bots={bots}
        selectedBot={selectedBot}
        changeBot={changeBot}
        botLimit={botLimit}
        onCreateBot={handleCreateBot}
        refreshBots={refreshBots} /* 🔥 CORREÇÃO: Propagando a função para o BotSidebar */
      />
    </header>
  );
}