import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Coluna 1: Produto */}
          <div className="footer-column">
            <h4>Produto</h4>
            <ul className="footer-links">
              <li><a onClick={() => scrollToSection('recursos')}>Recursos</a></li>
              <li><a onClick={() => scrollToSection('funcionalidades')}>Funcionalidades</a></li>
              <li><a onClick={() => scrollToSection('tutoriais')}>Tutoriais</a></li>
              <li><a onClick={() => scrollToSection('faq')}>FAQ</a></li>
            </ul>
          </div>

          {/* Coluna 2: Legal */}
          <div className="footer-column">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><a href="#">Termos de Uso</a></li>
              <li><a href="#">Política de Privacidade</a></li>
              <li><a href="#">Política de Reembolso</a></li>
            </ul>
          </div>

          {/* Coluna 3: Suporte */}
          <div className="footer-column">
            <h4>Suporte</h4>
            <ul className="footer-links">
              <li><a href="#">Contato</a></li>
              <li><Link to="/register">Criar Conta</Link></li>
              <li><Link to="/login">Acessar Plataforma</Link></li>
              <li><a href="#">Documentação</a></li>
            </ul>
          </div>

          {/* Coluna 4: Redes Sociais */}
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

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 ZenyxGbot. Todos os direitos reservados.
          </p>
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