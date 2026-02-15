import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  // ============================================================
  // 🧭 NAVEGAÇÃO SUAVE ÂNCORA (SMOOTH SCROLL)
  // Garante que os links do rodapé deslizem até a seção 
  // sem recarregar a página bruscamente.
  // ============================================================
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    // Utilizamos a classe .footer do nosso novo ecossistema Cosmos Purple
    <footer className="footer">
      <div className="container">
        
        {/* ============================================================
            🚀 GRID PRINCIPAL DO RODAPÉ (4 COLUNAS RESPONSIVAS)
            O CSS auto-fit garante que as colunas se empilhem 
            perfeitamente no celular.
            ============================================================ */}
        <div className="footer-grid">
          
          {/* ----------------------------------------------------
              COLUNA 1: MARCA & IDENTIDADE VISUAL
              ---------------------------------------------------- */}
          <div className="f-col">
            <Link 
              to="/" 
              className="logo" 
              style={{ marginBottom: '1.2rem', display: 'flex' }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div 
                className="logo-icon" 
                style={{ 
                  width: '30px', 
                  height: '30px', 
                  fontSize: '1rem',
                  marginRight: '10px'
                }}
              >
                ⚡
              </div>
              Zenyx<span style={{ color: 'var(--neon-magenta)' }}>VIPs</span>
            </Link>
            
            <p style={{ 
              fontSize: '0.95rem', 
              color: 'var(--text-muted)', 
              lineHeight: '1.6',
              maxWidth: '280px'
            }}>
              A infraestrutura definitiva para escalar vendas no Telegram de forma autônoma, rápida e implacavelmente segura.
            </p>
          </div>

          {/* ----------------------------------------------------
              COLUNA 2: MAPA DO PRODUTO (LINKS INTERNOS)
              ---------------------------------------------------- */}
          <div className="f-col">
            <h4>Produto</h4>
            <ul>
              <li>
                <a onClick={() => scrollToSection('recursos')}>Ecossistema</a>
              </li>
              <li>
                <a onClick={() => scrollToSection('vitrine')}>Vitrine Mini-App</a>
              </li>
              <li>
                <a onClick={() => scrollToSection('precos')}>A Vantagem Desleal</a>
              </li>
              <li>
                <a onClick={() => scrollToSection('hall')}>Hall da Fama</a>
              </li>
              <li>
                <a onClick={() => scrollToSection('tutoriais')}>Central de Comando</a>
              </li>
              <li>
                <a onClick={() => scrollToSection('faq')}>FAQ Transparente</a>
              </li>
            </ul>
          </div>

          {/* ----------------------------------------------------
              COLUNA 3: LEGAL & JURÍDICO (LINKS DE ROTA)
              ---------------------------------------------------- */}
          <div className="f-col">
            <h4>Legal</h4>
            <ul>
              <li>
                <Link to="/termos">Termos de Uso</Link>
              </li>
              <li>
                <Link to="/privacidade">Política de Privacidade</Link>
              </li>
              <li>
                <Link to="/reembolso">Política de Reembolso</Link>
              </li>
              <li>
                <a href="#">Contratos e Licenças</a>
              </li>
            </ul>
          </div>

          {/* ----------------------------------------------------
              COLUNA 4: SUPORTE & COMUNIDADE
              ---------------------------------------------------- */}
          <div className="f-col">
            <h4>Suporte</h4>
            <ul>
              <li>
                <a href="https://t.me/suportezenyx" target="_blank" rel="noopener noreferrer">
                  Suporte via Telegram
                </a>
              </li>
              <li>
                <a href="https://instagram.com/zenyxvips" target="_blank" rel="noopener noreferrer">
                  Instagram Oficial
                </a>
              </li>
              <li>
                <a href="mailto:contato@zenyxvips.com">E-mail Comercial</a>
              </li>
              <li style={{ marginTop: '0.5rem' }}>
                <Link 
                  to="/login" 
                  style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}
                >
                  ➔ Acessar Painel
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ============================================================
            🔒 BARRA INFERIOR (COPYRIGHT & BADGES DE CONFIANÇA)
            ============================================================ */}
        <div className="footer-bottom">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Zenyx VIPs. Todos os direitos reservados.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--neon-gold)' }}>🔒</span> Criptografia SSL
            </span>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--neon-blue)' }}>⚡</span> Alta Performance
            </span>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--neon-green)' }}>🟢</span> Servidores Online
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}