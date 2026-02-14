import React, { useState, useEffect, useRef } from 'react';

export function MoreFeatures() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const moreFeatures = [
    {
      icon: '⚡',
      title: 'Setup em 5 Minutos',
      description: 'Configuração rápida e fácil com tutoriais passo a passo. Integração facilitada com Telegram.'
    },
    {
      icon: '📊',
      title: 'Upsell, Downsell & Order Bump',
      description: 'Maximize sua receita com ofertas automáticas. Aumente o ticket médio em até 40%.'
    },
    {
      icon: '✅',
      title: 'Aprovação Automática',
      description: 'Aprove membros e envie boas-vindas personalizadas. Gestão de múltiplos grupos e canais.'
    },
    {
      icon: '🔗',
      title: 'Sistema de Redirecionamento',
      description: 'Crie pastas organizadas por plataforma (Instagram, Facebook, TikTok, etc). Rastreie cliques e vendas de cada link.'
    },
    {
      icon: '📈',
      title: 'Funil de Vendas Completo',
      description: 'Acompanhe a jornada do cliente: Lead Frio (topo), Lead Quente (meio) e Cliente (fundo) com métricas detalhadas.'
    },
    {
      icon: '🔄',
      title: 'Remarketing Inteligente',
      description: 'Recupere vendas perdidas com campanhas automáticas segmentadas por etapa do funil.'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="funcionalidades" ref={sectionRef} className="section-container">
      <div className={`section-header ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <span style={{
          display: 'inline-block',
          color: '#06b6d4',
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          Funcionalidades Avançadas
        </span>
        <h2 className="section-title">
          Recursos que fazem a{' '}
          <span style={{
            background: 'linear-gradient(90deg, #06b6d4 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            diferença
          </span>
        </h2>
        <p className="section-subtitle">
          Funcionalidades pensadas para maximizar suas vendas e automatizar
          todo o processo de venda e entrega.
        </p>
      </div>

      <div className="more-features-grid">
        {moreFeatures.map((feature, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <div
              key={index}
              className={`feature-card ${isVisible ? (isEven ? 'animate-slide-in-left' : 'animate-slide-in-right') : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}