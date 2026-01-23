import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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

  const navLinks = [
    { name: 'Recursos', href: 'features' },
    { name: 'Funcionalidades', href: 'funcionalidades' },
    { name: 'Tutoriais', href: 'tutoriais' },
    { name: 'FAQ', href: 'faq' },
  ];

  return (
    <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <a onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="navbar-logo" style={{ cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'glow-pulse 2s ease-in-out infinite'
            }}>
              <Zap size={20} color="white" />
            </div>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)' }}>
            Zenyx<span className="neon-text" style={{ color: 'var(--primary)' }}>GBOT</span>
          </span>
        </a>

        {/* Desktop Menu */}
        <ul className="navbar-menu">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a onClick={() => scrollToSection(link.href)}>
                {link.name}
              </a>
            </li>
          ))}
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
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-menu-mobile ${mobileMenuOpen ? 'active' : ''}`}>
        {navLinks.map((link) => (
          <a key={link.name} onClick={() => scrollToSection(link.href)}>
            {link.name}
          </a>
        ))}
        <Link to="/login" className="navbar-cta" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          Acessar Plataforma
        </Link>
      </div>
    </nav>
  );
}