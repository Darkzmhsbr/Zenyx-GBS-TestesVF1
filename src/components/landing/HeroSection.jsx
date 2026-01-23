import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

export function HeroSection() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-background"></div>
      <div className="hero-container">
        {/* Logo acima do badge */}
        <img 
          src="/favicon.png" 
          alt="Zenyx Logo" 
          style={{ 
            width: '100px', 
            height: '100px', 
            marginBottom: '20px',
            filter: 'drop-shadow(0 0 20px rgba(195, 51, 255, 0.5))'
          }} 
        />

        <div className="hero-badge">
          ✨ MENOR TAXA DO MERCADO
        </div>

        <h1 className="hero-title">
          Automatize seu Telegram e<br />
          Escale suas Vendas com IA
        </h1>

        <p className="hero-subtitle">
          Gerencie assinaturas, pagamentos e automações para seus grupos e canais VIPs 
          com a <span className="hero-highlight">menor taxa do mercado: apenas R$ 0,60 por venda!</span>
        </p>

        <div className="hero-cta-group">
          <Link to="/register" className="hero-btn-primary">
            Começar Agora Grátis
            <ArrowRight size={20} />
          </Link>
          <button 
            className="hero-btn-secondary"
            onClick={() => scrollToSection('automacao')}
          >
            <Play size={18} style={{ marginRight: '8px' }} />
            Ver Demonstração
          </button>
        </div>
      </div>
    </section>
  );
}