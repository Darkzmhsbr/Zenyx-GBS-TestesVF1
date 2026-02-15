import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-column">
            <h4>Produto</h4>
            <ul className="footer-links">
              <li><a onClick={() => scrollToSection('features')}>Recursos</a></li>
              <li><a onClick={() => scrollToSection('funcionalidades')}>Funcionalidades</a></li>
              <li><a onClick={() => scrollToSection('tutoriais')}>Tutoriais</a></li>
              <li><a onClick={() => scrollToSection('faq')}>FAQ</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><Link to="/termos">Termos de Uso</Link></li>
              <li><Link to="/privacidade">Política de Privacidade</Link></li>
              <li><Link to="/reembolso">Política de Reembolso</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Suporte</h4>
            <ul className="footer-links">
              <li><a href="#">Contato</a></li>
              <li><Link to="/register">Criar Conta</Link></li>
              <li><Link to="/login">Acessar Plataforma</Link></li>
              <li><a href="#">Documentação</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Redes Sociais</h4>
            <ul className="footer-links">
              <li><a href="#" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://t.me/zenyxvips" target="_blank" rel="noopener noreferrer">Telegram</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Twitter/X</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">© 2026 ZenyxGbot. Todos os direitos reservados.</p>
          <div className="footer-badges">
            <span className="footer-badge">🔒 Seguro</span>
            <span className="footer-badge">⚡ Suporte 24/7</span>
            <span className="footer-badge">🚀 Alta Performance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}