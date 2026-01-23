import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBot } from '../context/BotContext';
import { notificationService } from '../services/api'; // 🔥 VAMOS CRIAR ISSO DEPOIS
import { Bot, ChevronDown, Check, Bell, Moon, Sun, Menu, User, Settings, LogOut, X } from 'lucide-react'; 
import './Header.css'; 

export function Header({ onToggleMenu }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { bots, selectedBot, changeBot } = useBot();
  
  const [isBotMenuOpen, setIsBotMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 🔔 ESTADOS PARA NOTIFICAÇÕES
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // ============================================================
  // INICIALIZA TEMA AO CARREGAR
  // ============================================================
  useEffect(() => {
    const savedTheme = localStorage.getItem('zenyx_theme') || 'dark';
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    applyTheme(isDark);
  }, []);

  // ============================================================
  // BUSCAR NOTIFICAÇÕES REAIS
  // ============================================================
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      // Nota: Se der erro aqui é porque ainda não atualizamos o api.js, 
      // mas o código já está pronto para quando atualizarmos!
      if (notificationService) {
        const data = await notificationService.getAll();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações", error);
    }
  };

  // Carrega ao iniciar e a cada 60 segundos
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // ============================================================
  // MARCAR COMO LIDA
  // ============================================================
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markRead(id);
      // Atualiza localmente para parecer instantâneo
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erro ao marcar como lida", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas", error);
    }
  };

  // ============================================================
  // FUNÇÃO: APLICAR TEMA
  // ============================================================
  const applyTheme = (isDark) => {
    const root = document.documentElement;
    
    if (isDark) {
      root.style.setProperty('--background', '#0f0c29');
      root.style.setProperty('--card-bg', '#1b1730'); // Roxo escuro original
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#a0a0b0');
      root.style.setProperty('--border-color', '#302b63');
    } else {
      root.style.setProperty('--background', '#f4f6f9');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--text-primary', '#1a1a2e');
      root.style.setProperty('--text-secondary', '#666666');
      root.style.setProperty('--border-color', '#e1e4e8');
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

  // Formata data amigável (Ex: "Há 5 min")
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // segundos

    if (diff < 60) return 'Agora';
    if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Há ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString('pt-BR');
  };

  // Cores por tipo
  const getTypeColor = (type) => {
    switch(type) {
      case 'success': return '#00d26a'; // Verde
      case 'warning': return '#fcd535'; // Amarelo
      case 'error': return '#f8312f';   // Vermelho
      default: return '#c333ff';        // Roxo (Info)
    }
  };

  return (
    <header className="app-header">
      {/* Lado Esquerdo: Botão Menu Mobile + Seletor de Bots */}
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={onToggleMenu}>
          <Menu size={24} />
        </button>

        <div className="bot-selector-container">
          <button 
            className="bot-selector-btn"
            onClick={() => setIsBotMenuOpen(!isBotMenuOpen)}
          >
            <div className="bot-icon-wrapper">
              <Bot size={20} />
            </div>
            <span className="bot-name">
              {selectedBot ? selectedBot.nome : 'Selecionar Bot'}
            </span>
            <ChevronDown size={16} className={`chevron ${isBotMenuOpen ? 'rotate' : ''}`} />
          </button>

          {isBotMenuOpen && (
            <div className="bot-dropdown">
              <div className="bot-dropdown-header">Seus Bots</div>
              
              {bots.length === 0 ? (
                <div className="bot-dropdown-empty">Nenhum bot encontrado</div>
              ) : (
                bots.map(bot => (
                  <div 
                    key={bot.id} 
                    className={`bot-dropdown-item ${selectedBot?.id === bot.id ? 'active' : ''}`}
                    onClick={() => {
                      changeBot(bot);
                      setIsBotMenuOpen(false);
                    }}
                  >
                    <span>{bot.nome}</span>
                    {selectedBot?.id === bot.id && <Check size={16} className="check-icon" />}
                  </div>
                ))
              )}
              
              <div className="bot-dropdown-divider"></div>
              <div 
                className="bot-dropdown-action"
                onClick={() => {
                   navigate('/bots/new');
                   setIsBotMenuOpen(false);
                }}
              >
                + Criar Novo Bot
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lado Direito: Ações e Perfil */}
      <div className="header-right">
        
        {/* TEMA DARK/LIGHT */}
        <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Alternar Tema">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* NOTIFICAÇÕES */}
        <div className="notification-wrapper">
          <button 
            className="icon-btn"
            onClick={() => {
               setIsNotificationOpen(!isNotificationOpen);
               setIsProfileMenuOpen(false);
               if(!isNotificationOpen) fetchNotifications(); // Atualiza ao abrir
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {isNotificationOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <span>Notificações</span>
                {unreadCount > 0 && (
                  <button className="mark-read-btn" onClick={handleMarkAllRead}>
                    Ler todas
                  </button>
                )}
              </div>
              
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <p>Tudo limpo por aqui! ✨</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                    >
                      <div className="notif-indicator" style={{ backgroundColor: getTypeColor(notif.type) }}></div>
                      <div className="notif-content">
                        <div className="notif-title">{notif.title}</div>
                        <div className="notif-message">{notif.message}</div>
                        <div className="notif-time">{formatTime(notif.created_at)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* PERFIL */}
        <div className="profile-wrapper">
          <button 
            className="profile-btn"
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsNotificationOpen(false);
            }}
          >
            <div className="avatar-placeholder">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="profile-info-desk">
               <span className="profile-name-text">{user?.name || 'Admin'}</span>
               <ChevronDown size={14} />
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="avatar-large">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
                </div>
                <div>
                  <div className="profile-name">{user?.name || 'Admin'}</div>
                  <div className="profile-email">{user?.username || 'admin@zenyx.com'}</div>
                </div>
              </div>

              <div className="profile-dropdown-divider"></div>

              <div 
                className="profile-dropdown-item"
                onClick={() => {
                  navigate('/perfil');
                  setIsProfileMenuOpen(false);
                }}
              >
                <User size={16} />
                <span>Meu Perfil</span>
              </div>

              <div 
                className="profile-dropdown-item"
                onClick={() => {
                  navigate('/config');
                  setIsProfileMenuOpen(false);
                }}
              >
                <Settings size={16} />
                <span>Configurações</span>
              </div>

              <div className="profile-dropdown-divider"></div>

              {/* BOTÃO SAIR */}
              <div 
                className="profile-dropdown-item danger"
                onClick={handleLogout}
                style={{ cursor: 'pointer' }}
              >
                <LogOut size={16} />
                <span>Sair</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}