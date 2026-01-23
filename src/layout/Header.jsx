import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBot } from '../context/BotContext';
import { notificationService } from '../services/api';
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

  // Estados de Notificação
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Inicializa tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('zenyx_theme') || 'dark';
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    applyTheme(isDark);
  }, []);

  // Busca notificações
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
      root.style.setProperty('--card-bg', '#1b1730');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#a0a0b0');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Agora';
    if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Há ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString('pt-BR');
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'success': return '#00d26a';
      case 'warning': return '#fcd535';
      case 'error': return '#f8312f';
      default: return '#c333ff';
    }
  };

  return (
    <header className="app-header">
      {/* ESQUERDA: Menu Mobile e Bot Selector */}
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
              <div className="profile-dropdown-header" style={{ fontWeight: 'bold' }}>Seus Bots</div>
              {bots.length === 0 ? (
                <div className="empty-state">Nenhum bot encontrado</div>
              ) : (
                bots.map(bot => (
                  <div 
                    key={bot.id} 
                    className="profile-dropdown-item"
                    onClick={() => {
                      changeBot(bot);
                      setIsBotMenuOpen(false);
                    }}
                  >
                    <span>{bot.nome}</span>
                    {selectedBot?.id === bot.id && <Check size={16} style={{ marginLeft: 'auto', color: '#00d26a' }} />}
                  </div>
                ))
              )}
              <div className="profile-dropdown-divider"></div>
              <div 
                className="profile-dropdown-item"
                onClick={() => { navigate('/bots/new'); setIsBotMenuOpen(false); }}
                style={{ color: '#c333ff', fontWeight: 'bold' }}
              >
                + Criar Novo Bot
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

        <div className="notification-wrapper" style={{ position: 'relative' }}>
          <button 
            className="icon-btn"
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
            <div className="notification-dropdown">
              <div className="notification-header">
                <span>Notificações</span>
                {unreadCount > 0 && (
                  <button className="mark-read-btn" onClick={handleMarkAllRead}>Ler todas</button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="empty-state">Nenhuma notificação nova</div>
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

        <div className="profile-wrapper" style={{ position: 'relative' }}>
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
                  <div className="profile-email">{user?.username}</div>
                </div>
              </div>
              <div className="profile-dropdown-divider"></div>
              <div className="profile-dropdown-item" onClick={() => navigate('/perfil')}>
                <User size={16} /> <span>Meu Perfil</span>
              </div>
              <div className="profile-dropdown-item" onClick={() => navigate('/config')}>
                <Settings size={16} /> <span>Configurações</span>
              </div>
              <div className="profile-dropdown-divider"></div>
              <div className="profile-dropdown-item danger" onClick={handleLogout}>
                <LogOut size={16} /> <span>Sair</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}