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
        
        {/* Usamos a classe footer-grid que já está configurada no CSS para ser responsiva */}
        <div className="footer-grid" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr' }}>
          
          {/* Coluna 1: Marca + Produto */}
          <div className="footer-column">
            {/* Nova Identidade Visual Injetada no Rodapé */}
            <Link to="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              textDecoration: 'none', 
              marginBottom: '2rem' 
            }}>
              <div className="logo-icon" style={{
                width: '35px',
                height: '35px',
                borderRadius: '10px',
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid var(--neon-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 15px rgba(168, 85, 247, 0.3)',
                color: 'var(--neon-purple)',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>⚡</div>
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '1.6rem', 
                fontWeight: 800, 
                color: 'var(--text-main)',
                letterSpacing: '-0.5px'
              }}>
                Zenyx<span className="grad-text">VIPs</span>
              </span>
            </Link>

            <h4>Produto</h4>
            <ul className="footer-links">
              <li><a onClick={() => scrollToSection('features')}>Recursos</a></li>
              <li><a onClick={() => scrollToSection('funcionalidades')}>Funcionalidades</a></li>
              <li><a onClick={() => scrollToSection('tutoriais')}>Tutoriais</a></li>
              <li><a onClick={() => scrollToSection('faq')}>FAQ</a></li>
            </ul>
          </div>

          {/* Coluna 2: Legal */}
          <div className="footer-column">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><Link to="/termos">Termos de Uso</Link></li>
              <li><Link to="/privacidade">Política de Privacidade</Link></li>
              <li><Link to="/reembolso">Política de Reembolso</Link></li>
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

        {/* Bottom Bar: Copyright e Badges preservados */}
        <div className="footer-bottom">
          <p className="footer-copyright">© 2026 Zenyx VIPs. Todos os direitos reservados.</p>
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