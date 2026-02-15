import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';

export function Navbar() {
  // ============================================================
  // ⚙️ ESTADOS E HOOKS DE ROTEAMENTO
  // ============================================================
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ============================================================
  // 👁️ OBSERVER: GLASSMORPHISM ON SCROLL
  // Aciona a classe 'scrolled' que injeta o desfoque de vidro
  // ============================================================
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ============================================================
  // 🧭 NAVEGAÇÃO SUAVE ANCORADA (CROSS-ROUTE)
  // Resolve o problema de clicar no link estando em outra página (ex: /login)
  // ============================================================
  const handleNavigation = (sectionId) => {
    setMobileMenuOpen(false); // Fecha o menu mobile automaticamente
    
    if (location.pathname === '/') {
      // Já está na Home: Apenas rola até a âncora
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Está em outra página: Redireciona pra Home e depois rola
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      
      {/* ============================================================
          CONTAINER BLINDADO (FLEX-BETWEEN & NO-SHRINK)
          ============================================================ */}
      <div 
        className="nav-inner container" 
        style={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}
      >
        
        {/* ==========================================
            LOGO ZENYX VIPS (COSMOS PURPLE)
            ========================================== */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="logo"
          style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          <div className="logo-icon">
            <Zap size={20} strokeWidth={2.5} />
          </div>
          Zenyx<span style={{ color: 'var(--neon-magenta)' }}>VIPs</span>
        </Link>

        {/* ==========================================
            MENU DESKTOP (SOME NO MOBILE VIA CSS)
            ========================================== */}
        <ul className="nav-links">
          <li><a onClick={() => handleNavigation('recursos')}>Ecossistema</a></li>
          <li><a onClick={() => handleNavigation('vitrine')}>Vitrine Mini-App</a></li>
          <li><a onClick={() => handleNavigation('precos')}>A Vantagem Desleal</a></li>
          <li><a onClick={() => handleNavigation('tutoriais')}>Tutoriais</a></li>
        </ul>

        {/* ==========================================
            ÁREA DIREITA: CTA (DESKTOP) E TOGGLE MOBILE
            ========================================== */}
        <div className="nav-actions">
          
          {/* Botão Acessar Painel - Oculto no Mobile pela classe 'desktop-only' */}
          <Link 
            to="/login" 
            className="btn-glow desktop-only" 
            style={{ 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.9rem',
              whiteSpace: 'nowrap' 
            }}
          >
            Acessar Painel
          </Link>

          {/* Botão Menu Hamburguer - Exclusivo Mobile */}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

      </div>

      {/* ============================================================
          MENU MOBILE (DROPDOWN GLASSMORPHISM)
          ============================================================ */}
      <div className={`navbar-menu-mobile ${mobileMenuOpen ? 'active' : ''}`}>
        <a onClick={() => handleNavigation('recursos')}>Ecossistema</a>
        <a onClick={() => handleNavigation('vitrine')}>Vitrine Mini-App</a>
        <a onClick={() => handleNavigation('precos')}>A Vantagem Desleal</a>
        <a onClick={() => handleNavigation('hall')}>Hall da Fama</a>
        <a onClick={() => handleNavigation('tutoriais')}>Tutoriais</a>
        <a onClick={() => handleNavigation('faq')}>FAQ</a>
        
        {/* O Botão de Login desce pro menu no Mobile */}
        <Link
          to="/login"
          className="btn-glow"
          style={{ 
            textAlign: 'center', 
            marginTop: '1rem', 
            display: 'flex', 
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          Acessar Painel ➔
        </Link>
      </div>
      
    </nav>
  );
}