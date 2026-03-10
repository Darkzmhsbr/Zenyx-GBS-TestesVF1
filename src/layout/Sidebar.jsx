import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ChevronDown, 
  ChevronRight, 
  PlusCircle, 
  Settings, 
  BookOpen, 
  Zap, 
  LogOut,
  CreditCard,
  Megaphone,
  Users,
  Star,
  ShieldCheck,
  Layers,
  Unlock,
  X,
  TrendingUp, 
  ShoppingBag,
  User, 
  Target,
  Crown,
  Send,
  Rocket,
  ArrowDownCircle,
  Trophy,
  BarChart3,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService, rankingService } from '../services/api';
import './Sidebar.css';

// =========================================================
// 🏆 NÍVEIS DE GAMIFICAÇÃO (Mesma lógica do Profile.jsx)
// =========================================================
const LEVELS = [
  { name: 'Iniciante', target: 1000000, color: '#10b981' },
  { name: 'Barão', target: 5000000, color: '#f59e0b' },
  { name: 'Prodígio', target: 10000000, color: '#3b82f6' },
  { name: 'Empreendedor', target: 50000000, color: '#8b5cf6' },
  { name: 'Milionário', target: 100000000, color: '#ef4444' },
  { name: 'Magnata', target: 1000000000, color: '#c333ff' }
];

function getGamificationData(totalRevenue) {
  const sorted = [...LEVELS].sort((a, b) => a.target - b.target);
  let currentLevel = sorted[0];
  let nextLevel = sorted[1] || null;

  for (let i = 0; i < sorted.length; i++) {
    if (totalRevenue >= sorted[i].target) {
      currentLevel = sorted[i];
      nextLevel = sorted[i + 1] || null;
    }
  }

  let progress = 100;
  if (nextLevel) {
    const currentMin = currentLevel.target;
    const nextTarget = nextLevel.target;
    progress = ((totalRevenue - currentMin) / (nextTarget - currentMin)) * 100;
    progress = Math.min(Math.max(progress, 0), 100);
  }

  // CORREÇÃO: Trata usuários que ainda não bateram a primeira meta de 10K
  if (totalRevenue < sorted[0].target) {
    currentLevel = { name: 'Sem nível', target: 0, color: '#555' };
    nextLevel = sorted[0];
    progress = (totalRevenue / sorted[0].target) * 100;
    progress = Math.min(Math.max(progress, 0), 100);
  }

  return { currentLevel, nextLevel, progress };
}

function formatMoney(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// =========================================================
// 📦 COMPONENTE SIDEBAR
// =========================================================
export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout, hasBot } = useAuth();
  
  const currentPath = location.pathname;
  
  // Estados dos menus
  const [isBotMenuOpen, setIsBotMenuOpen] = useState(true);
  const [isExtrasMenuOpen, setIsExtrasMenuOpen] = useState(false);
  const [isOffersMenuOpen, setIsOffersMenuOpen] = useState(false);

  // 🆕 Estado do widget de faturamento
  const [revenueData, setRevenueData] = useState(null);

  // 🔒 Estado visibilidade do ranking
  const [rankingVisivel, setRankingVisivel] = useState(true);

  // 🆕 Carrega stats do perfil
  useEffect(() => {
    if (hasBot) {
      loadRevenueData();
    }
    // 🔒 Carrega visibilidade do ranking
    checkRankingVisibility();
  }, [hasBot]);

  const checkRankingVisibility = async () => {
    try {
      const res = await rankingService.checkVisibilidade();
      setRankingVisivel(res.visivel);
    } catch (e) {
      setRankingVisivel(true);
    }
  };

  const loadRevenueData = async () => {
    try {
      const stats = await profileService.getStats();
      if (stats) {
        setRevenueData({
          totalRevenue: stats.total_revenue || 0
        });
      }
    } catch (e) {
      console.error('Sidebar: erro ao carregar stats', e);
    }
  };

  const handleLogout = () => {
    if (onClose) onClose();
    logout();
    window.location.href = '/login';
  };

  const isActive = (path) => {
    return currentPath === path ? 'active' : '';
  };

  // 🆕 Calcula gamificação
  const gamification = revenueData 
    ? getGamificationData(revenueData.totalRevenue) 
    : null;

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-area" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #c333ff, #7b1fa2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              Z
            </div>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
              Zenyx<span style={{color: '#c333ff'}}>VIPs</span>
            </span>
          </div>

          <button className="close-sidebar-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          
          {/* 🔥 ÁREA MESTRA (SUPER ADMIN) 🔥 */}
          {(user?.is_superuser || user?.username === 'AdminZenyx') && (
            <div className="admin-section">
              <div className="admin-section-title">
                ÁREA MESTRA
              </div>
              <Link 
                to="/superadmin" 
                className={`nav-item super-admin ${isActive('/superadmin')}`}
                onClick={onClose}
              >
                <Crown size={20} />
                <span>Super Admin</span>
              </Link>
            </div>
          )}

          {/* MENU GERAL */}
          <Link 
            to={hasBot ? "/dashboard" : "#"} 
            className={`nav-item ${isActive('/dashboard')} ${!hasBot ? 'locked-nav' : ''}`} 
            onClick={(e) => !hasBot ? e.preventDefault() : onClose()}
            style={!hasBot ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          {/* 📊 ESTATÍSTICAS */}
          <Link 
            to={hasBot ? "/estatisticas" : "#"} 
            className={`nav-item ${isActive('/estatisticas')} ${!hasBot ? 'locked-nav' : ''}`} 
            onClick={(e) => !hasBot ? e.preventDefault() : onClose()}
            style={!hasBot ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <BarChart3 size={20} />
            <span>Estatísticas</span>
          </Link>

          <Link 
            to={hasBot ? "/funil" : "#"} 
            className={`nav-item ${isActive('/funil')} ${!hasBot ? 'locked-nav' : ''}`} 
            onClick={(e) => !hasBot ? e.preventDefault() : onClose()}
            style={!hasBot ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <TrendingUp size={20} />
            <span>Funil de Vendas</span>
          </Link>

          <Link 
            to={hasBot ? "/contatos" : "#"} 
            className={`nav-item ${isActive('/contatos')} ${!hasBot ? 'locked-nav' : ''}`} 
            onClick={(e) => !hasBot ? e.preventDefault() : onClose()}
            style={!hasBot ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <Users size={20} />
            <span>Contatos (Leads)</span>
          </Link>

          {/* === GRUPO: MEUS BOTS === */}
          <div className="nav-group">
            <div 
              className={`nav-item group-header ${isBotMenuOpen ? 'open' : ''}`}
              onClick={() => setIsBotMenuOpen(!isBotMenuOpen)}
            >
              <div className="group-label">
                <MessageSquare size={20} />
                <span>Meus Bots</span>
              </div>
              {isBotMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            
            {isBotMenuOpen && (
              <div className="nav-subitems">
                <Link 
                  to={hasBot ? "/bots" : "#"} 
                  className={`nav-item ${isActive('/bots')} ${!hasBot ? 'locked-nav' : ''}`} 
                  onClick={(e) => !hasBot ? e.preventDefault() : onClose()}
                  style={!hasBot ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <Zap size={18} /> <span>Gerenciar Bots</span>
                </Link>
                <Link to="/bots/new" className={`nav-item ${isActive('/bots/new')}`} onClick={onClose}>
                  <PlusCircle size={18} /> <span>Novo Bot</span>
                </Link>
              </div>
            )}
          </div>

          <Link 
            to={hasBot ? "/flow" : "#"} 
            className={`nav-item ${isActive('/flow')} ${!hasBot ? 'locked-nav' : ''}`} 
            onClick={(e) => !hasBot ? e.preventDefault() : onClose()}
            style={!hasBot ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <Layers size={20} />
            <span>Flow Chat (Fluxo)</span>
          </Link>

          <Link 
            to={hasBot ? "/remarketing" : "#"} 
            className={`nav-item ${isActive('/remarketing')} ${!hasBot ? 'locked-nav' : ''}`} 
            onClick={(e) => !hasBot ? e.preventDefault() : onClose()}
            style={!hasBot ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <Megaphone size={20} />
            <span>Remarketing</span>
          </Link>

          {/* SUBMENU: PLANOS E OFERTAS */}
          <div className="nav-group" style={!hasBot ? { opacity: 0.5 } : {}}>
            <div 
              className={`nav-item-header ${isOffersMenuOpen ? 'open' : ''}`} 
              onClick={() => hasBot && setIsOffersMenuOpen(!isOffersMenuOpen)}
            >
              <div className="nav-item-header-content">
                <CreditCard size={20} />
                <span>Planos e Ofertas</span>
              </div>
              {isOffersMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            {hasBot && isOffersMenuOpen && (
              <div className="nav-subitems">
                <Link to="/planos" className={`nav-item ${isActive('/planos')}`} onClick={onClose}>
                  <Star size={18} /> <span>Planos de Acesso</span>
                </Link>
                <Link to="/ofertas/order-bump" className={`nav-item ${isActive('/ofertas/order-bump')}`} onClick={onClose}>
                  <ShoppingBag size={18} /> <span>Order Bump</span>
                </Link>
                <Link to="/ofertas/upsell" className={`nav-item ${isActive('/ofertas/upsell')}`} onClick={onClose}>
                  <Rocket size={18} /> <span>Upsell</span>
                </Link>
                <Link to="/ofertas/downsell" className={`nav-item ${isActive('/ofertas/downsell')}`} onClick={onClose}>
                  <ArrowDownCircle size={18} /> <span>Downsell</span>
                </Link>
              </div>
            )}
          </div>

          {/* SUBMENU: EXTRAS */}
          <div className="nav-group" style={!hasBot ? { opacity: 0.5 } : {}}>
            <div 
              className={`nav-item-header ${isExtrasMenuOpen ? 'open' : ''}`} 
              onClick={() => hasBot && setIsExtrasMenuOpen(!isExtrasMenuOpen)}
            >
              <div className="nav-item-header-content">
                <BookOpen size={20} />
                <span>Extras</span>
              </div>
              {isExtrasMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            {hasBot && isExtrasMenuOpen && (
              <div className="nav-subitems">
                {/* 🆕 CONFIGURAÇÃO GUIADA */}
                <Link to="/setup" className={`nav-item ${isActive('/setup')}`} onClick={onClose}>
                  <Compass size={18} /> <span>Configuração Guiada</span>
                </Link>

                <Link to="/tutorial" className={`nav-item ${isActive('/tutorial')}`} onClick={onClose}>
                  <BookOpen size={18} /> <span>Tutoriais</span>
                </Link>

                <Link to="/funcoes/admins" className={`nav-item ${isActive('/funcoes/admins')}`} onClick={onClose}>
                  <ShieldCheck size={18} /> <span>Administradores</span>
                </Link>

                <Link to="/funcoes/grupos" className={`nav-item ${isActive('/funcoes/grupos')}`} onClick={onClose}>
                  <Layers size={18} /> <span>Grupos e Canais</span>
                </Link>

                <Link to="/funcoes/free" className={`nav-item ${isActive('/funcoes/free')}`} onClick={onClose}>
                  <Unlock size={18} /> <span>Canal Free</span>
                </Link>

                <Link to="/rastreamento" className={`nav-item ${isActive('/rastreamento')}`} onClick={onClose}>
                  <Target size={18} /> <span>Rastreamento</span>
                </Link>

                {/* 🆕 DISPARO AUTOMÁTICO */}
                <Link 
                  to="/extras/auto-remarketing" 
                  className={`nav-item ${isActive('/extras/auto-remarketing')}`} 
                  onClick={onClose}
                >
                  <Send size={18} /> <span>Disparo Automático</span>
                </Link>
              </div>
            )}
          </div>
          
          {/* 🏆 RANKING (Oculto se admin desativou) */}
          {rankingVisivel && (
          <Link 
            to={hasBot ? "/ranking" : "#"} 
            className={`nav-item ranking-item ${isActive('/ranking')} ${!hasBot ? 'locked-nav' : ''}`} 
            onClick={(e) => !hasBot ? e.preventDefault() : onClose()}
            style={!hasBot ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <Trophy size={20} />
            <span>Ranking de Vendas</span>
          </Link>
          )}

          {/* 🏆 RECURSOS PRIME */}
          <Link 
            to={hasBot ? "/recursos-prime" : "#"} 
            className={`nav-item prime-item ${isActive('/recursos-prime')} ${!hasBot ? 'locked-nav' : ''}`} 
            onClick={(e) => !hasBot ? e.preventDefault() : onClose()}
            style={!hasBot ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <Crown size={20} />
            <span>Recursos Prime</span>
          </Link>

          {/* =========================================================
              💰 WIDGET DE FATURAMENTO / NÍVEL (ENTRE RANKING E INTEGRAÇÕES)
              ========================================================= */}
          {hasBot && gamification && (
            <Link to="/perfil" className="sidebar-revenue-widget" onClick={onClose}>
              <div className="srw-header">
                <div className="srw-icon" style={{ background: `${gamification.currentLevel.color}18`, color: gamification.currentLevel.color }}>
                  <Trophy size={16} />
                </div>
                <div className="srw-info">
                  <span className="srw-label">Faturamento</span>
                  <span className="srw-value">{formatMoney(revenueData.totalRevenue)}</span>
                </div>
              </div>
              <div className="srw-progress-track">
                <div 
                  className="srw-progress-fill" 
                  style={{ 
                    width: `${gamification.progress}%`,
                    background: `linear-gradient(90deg, ${gamification.currentLevel.color}, ${gamification.nextLevel?.color || gamification.currentLevel.color})`
                  }}
                />
              </div>
              <div className="srw-footer">
                <span className="srw-percentage">{gamification.progress.toFixed(1)}%</span>
                <span className="srw-next">
                  PRÓXIMO: <strong>{gamification.nextLevel?.name || 'MAX'}</strong>
                </span>
              </div>
            </Link>
          )}

          <div className="divider"></div>

          <Link 
            to={hasBot ? "/integracoes" : "#"} 
            className={`nav-item ${isActive('/integracoes')} ${!hasBot ? 'locked-nav' : ''}`} 
            onClick={(e) => !hasBot ? e.preventDefault() : onClose()}
            style={!hasBot ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <Settings size={20} />
            <span>Integrações</span>
          </Link>

          <Link to="/perfil" className={`nav-item ${isActive('/perfil')}`} onClick={onClose}>
            <User size={20} />
            <span>Meu Perfil</span>
          </Link>

          <div className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sair</span>
          </div>

        </nav>
      </div>
    </>
  );
}