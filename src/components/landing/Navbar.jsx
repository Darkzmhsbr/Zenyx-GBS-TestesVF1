import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        {/* Logo */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="navbar-logo"
        >
          <div className="navbar-logo-icon">
            <Zap size={18} />
          </div>
          <span className="navbar-logo-text">
            Zenyx<span>GBOT</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <ul className="navbar-menu">
          <li><a onClick={() => handleNavigation('features')}>Recursos</a></li>
          <li><a onClick={() => handleNavigation('funcionalidades')}>Funcionalidades</a></li>
          <li><a onClick={() => handleNavigation('tutoriais')}>Tutoriais</a></li>
          <li><a onClick={() => handleNavigation('faq')}>FAQ</a></li>
          <li>
            <Link to="/login" className="navbar-cta">
              Acessar Plataforma
            </Link>
          </li>
        </ul>

        {/* Mobile Toggle */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-menu-mobile ${mobileMenuOpen ? 'active' : ''}`}>
        <a onClick={() => handleNavigation('features')}>Recursos</a>
        <a onClick={() => handleNavigation('funcionalidades')}>Funcionalidades</a>
        <a onClick={() => handleNavigation('tutoriais')}>Tutoriais</a>
        <a onClick={() => handleNavigation('faq')}>FAQ</a>
        <Link
          to="/login"
          className="navbar-cta"
          style={{ textAlign: 'center', marginTop: '0.5rem', display: 'block' }}
        >
          Acessar Plataforma
        </Link>
      </div>
    </nav>
  );
}