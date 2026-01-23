import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          ZenyxGBOT
        </div>

        {/* Desktop Menu */}
        <ul className="navbar-menu">
          <li><a onClick={() => scrollToSection('recursos')}>Recursos</a></li>
          <li><a onClick={() => scrollToSection('funcionalidades')}>Funcionalidades</a></li>
          <li><a onClick={() => scrollToSection('tutoriais')}>Tutoriais</a></li>
          <li><a onClick={() => scrollToSection('faq')}>FAQ</a></li>
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
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-menu-mobile ${mobileMenuOpen ? 'active' : ''}`}>
        <a onClick={() => scrollToSection('recursos')}>Recursos</a>
        <a onClick={() => scrollToSection('funcionalidades')}>Funcionalidades</a>
        <a onClick={() => scrollToSection('tutoriais')}>Tutoriais</a>
        <a onClick={() => scrollToSection('faq')}>FAQ</a>
        <Link to="/login" className="navbar-cta" style={{ textAlign: 'center', marginTop: '10px' }}>
          Acessar Plataforma
        </Link>
      </div>
    </nav>
  );
}