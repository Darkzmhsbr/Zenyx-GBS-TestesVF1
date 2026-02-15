import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Efeito de Glassmorphism ao rolar a página
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navegação suave ancorada
  const handleNavigation = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        
        {/* LOGO ZENYX VIPS */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="navbar-logo"
        >
          <div className="navbar-logo-icon">
            <Zap size={20} strokeWidth={2.5} />
          </div>
          Zenyx<span className="grad-text">VIPs</span>
        </Link>

        {/* DESKTOP MENU - CORRIGIDO PARA UL/LI E CLASSE NAVBAR-MENU */}
        <ul className="navbar-menu">
          {/* As âncoras mantêm os IDs originais para a lógica do React funcionar */}
          <li><a onClick={() => handleNavigation('features')}>Ecossistema</a></li>
          <li><a onClick={() => handleNavigation('funcionalidades')}>A Jornada</a></li>
          <li><a onClick={() => handleNavigation('tutoriais')}>Tutoriais</a></li>
          <li><a onClick={() => handleNavigation('faq')}>FAQ</a></li>
        </ul>

        {/* ÁREA DIREITA: CTA & MENU MOBILE TOGGLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Oculto no mobile apenas via CSS nativo, mas se houver espaço, ele brilha! */}
          <Link 
            to="/login" 
            className="hero-btn-primary btn-glow" 
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
          >
            Acessar Painel
          </Link>

          {/* MOBILE TOGGLE (HAMBURGER) */}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div className={`navbar-menu-mobile ${mobileMenuOpen ? 'active' : ''}`}>
        <a onClick={() => handleNavigation('features')}>Ecossistema</a>
        <a onClick={() => handleNavigation('funcionalidades')}>A Jornada</a>
        <a onClick={() => handleNavigation('tutoriais')}>Tutoriais</a>
        <a onClick={() => handleNavigation('faq')}>FAQ</a>
        
        <Link
          to="/login"
          className="hero-btn-primary btn-glow"
          style={{ 
            textAlign: 'center', 
            marginTop: '1rem', 
            display: 'flex', 
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          Acessar Painel
        </Link>
      </div>
    </nav>
  );
}