import React, { useState } from 'react';
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
  Crown // 👑 NOVO: Ícone importado para o Super Admin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';
import React from 'react';

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  
  // 👇 ALTERAÇÃO AQUI: Adicionado 'user' para verificar permissão
  const { user, logout } = useAuth();
  
  const currentPath = location.pathname;
  
  // Estados dos menus (Mantidos originais)
  const [isBotMenuOpen, setIsBotMenuOpen] = useState(true);
  const [isExtrasMenuOpen, setIsExtrasMenuOpen] = useState(false);
  const [isOffersMenuOpen, setIsOffersMenuOpen] = useState(false);

  const handleLogout = () => {
    if (onClose) onClose();
    logout();
    window.location.href = '/login';
  };

  // Função auxiliar para verificar se o link está ativo
  const isActive = (path) => {
    return currentPath === path ? 'active' : '';
  };

  return (
    <>
      {/* Overlay para fechar ao clicar fora (Mobile) */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          {/* Logo ou Título */}
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
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>Zenyx<span style={{color: '#c333ff'}}>GBOT</span></span>
          </div>

          <button className="close-sidebar-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          
          {/* 🔥 ÁREA MESTRA (SUPER ADMIN) 🔥 */}
          {/* 👇 AQUI ESTÁ A MUDANÇA MÁGICA 👇 */}
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

          {/* MENU GERAL (MANTIDO INTACTO) */}
          <Link to="/" className={`nav-item ${isActive('/')}`} onClick={onClose}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link to="/funil" className={`nav-item ${isActive('/funil')}`} onClick={onClose}>
            <TrendingUp size={20} />
            <span>Funil de Vendas</span>
          </Link>

          <Link to="/contatos" className={`nav-item ${isActive('/contatos')}`} onClick={onClose}>
            <Users size={20} />
            <span>Contatos (Leads)</span>
          </Link>

          {/* SUBMENU: MEUS BOTS */}
          <div className="nav-group">
            <div 
              className={`nav-item-header ${isBotMenuOpen ? 'open' : ''}`} 
              onClick={() => setIsBotMenuOpen(!isBotMenuOpen)}
            >
              <div className="nav-item-header-content">
                <Zap size={20} />
                <span>Meus Bots</span>
              </div>
              {isBotMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            {isBotMenuOpen && (
              <div className="nav-subitems">
                <Link to="/bots" className={`nav-item ${isActive('/bots')}`} onClick={onClose}>
                  <Zap size={18} /> <span>Gerenciar Bots</span>
                </Link>
                <Link to="/bots/new" className={`nav-item ${isActive('/bots/new')}`} onClick={onClose}>
                  <PlusCircle size={18} /> <span>Novo Bot</span>
                </Link>
              </div>
            )}
          </div>
          <Link to="/flow" className={`nav-item ${isActive('/flow')}`} onClick={onClose}>
            <Layers size={20} />
            <span>Flow Chat (Fluxo)</span>
          </Link>

          <Link to="/remarketing" className={`nav-item ${isActive('/remarketing')}`} onClick={onClose}>
            <Megaphone size={20} />
            <span>Remarketing</span>
          </Link>

          {/* SUBMENU: PLANOS E OFERTAS */}
          <div className="nav-group">
            <div 
              className={`nav-item-header ${isOffersMenuOpen ? 'open' : ''}`} 
              onClick={() => setIsOffersMenuOpen(!isOffersMenuOpen)}
            >
              <div className="nav-item-header-content">
                <CreditCard size={20} />
                <span>Planos e Ofertas</span>
              </div>
              {isOffersMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            {isOffersMenuOpen && (
              <div className="nav-subitems">
                <Link to="/planos" className={`nav-item ${isActive('/planos')}`} onClick={onClose}>
                  <Star size={18} /> <span>Planos de Acesso</span>
                </Link>
                <Link to="/ofertas/order-bump" className={`nav-item ${isActive('/ofertas/order-bump')}`} onClick={onClose}>
                  <ShoppingBag size={18} /> <span>Order Bump</span>
                </Link>
              </div>
            )}
          </div>

          {/* SUBMENU: EXTRAS */}
          <div className="nav-group">
            <div 
              className={`nav-item-header ${isExtrasMenuOpen ? 'open' : ''}`} 
              onClick={() => setIsExtrasMenuOpen(!isExtrasMenuOpen)}
            >
              <div className="nav-item-header-content">
                <BookOpen size={20} />
                <span>Extras</span>
              </div>
              {isExtrasMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            {isExtrasMenuOpen && (
              <div className="nav-subitems">
                <Link to="/funcoes/admins" className={`nav-item ${isActive('/funcoes/admins')}`} onClick={onClose}>
                  <ShieldCheck size={18} /> <span>Administradores</span>
                </Link>

                <Link to="/funcoes/grupos" className={`nav-item ${isActive('/funcoes/grupos')}`} onClick={onClose}>
                  <Layers size={18} /> <span>Grupos e Canais</span>
                </Link>

                <Link to="/funcoes/free" className={`nav-item ${isActive('/funcoes/free')}`} onClick={onClose}>
                  <Unlock size={18} /> <span>Canal Free</span>
                </Link>

                {/* RASTREAMENTO DENTRO DE EXTRAS */}
                <Link to="/rastreamento" className={`nav-item ${isActive('/rastreamento')}`} onClick={onClose}>
                  <Target size={18} /> <span>Rastreamento</span>
                </Link>
              </div>
            )}
          </div>
          
          <div className="divider"></div>

          <Link to="/integracoes" className={`nav-item ${isActive('/integracoes')}`} onClick={onClose}>
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