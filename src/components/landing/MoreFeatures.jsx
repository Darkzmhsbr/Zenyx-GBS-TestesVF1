import React, { useState, useEffect, useRef } from 'react';

const moreFeatures = [
  { icon: '⚡', title: 'Setup em 5 Minutos', description: 'Configuração rápida e fácil com tutoriais passo a passo. Integração facilitada com Telegram.' },
  { icon: '📊', title: 'Upsell, Downsell & Order Bump', description: 'Maximize sua receita com ofertas automáticas. Aumente o ticket médio em até 40%.' },
  { icon: '✅', title: 'Aprovação Automática', description: 'Aprove membros e envie boas-vindas personalizadas. Gestão de múltiplos grupos e canais.' },
  { icon: '🔗', title: 'Sistema de Redirecionamento', description: 'Crie pastas organizadas por plataforma (Instagram, Facebook, TikTok, etc). Rastreie cliques e vendas de cada link.' },
  { icon: '📈', title: 'Funil de Vendas Completo', description: 'Acompanhe a jornada do cliente: Lead Frio (topo), Lead Quente (meio) e Cliente (fundo) com métricas detalhadas.' },
  { icon: '🔄', title: 'Remarketing Inteligente', description: 'Recupere vendas perdidas com campanhas automáticas segmentadas por etapa do funil.' },
];

export function MoreFeatures() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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
    <section id="funcionalidades" ref={sectionRef} className="section-container" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
      
      {/* ============================================================
          CABEÇALHO DA SEÇÃO
          ============================================================ */}
      <div className="section-header">
        <div 
          className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} 
          style={{ 
            color: 'var(--neon-blue)', 
            fontFamily: 'var(--font-code)', 
            fontSize: '0.85rem', 
            marginBottom: '1rem', 
            border: '1px solid var(--neon-blue)', 
            padding: '4px 14px', 
            borderRadius: '100px', 
            display: 'inline-block',
            boxShadow: 'inset 0 0 10px rgba(56, 189, 248, 0.15)'
          }}
        >
          Funcionalidades Avançadas
        </div>
        
        <h2 className={`section-title ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
          Recursos que fazem a <span className="grad-text">diferença</span>
        </h2>
        
        <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          Funcionalidades pensadas para maximizar suas vendas e automatizar todo o processo de venda e entrega.
        </p>
      </div>

      {/* ============================================================
          CIRCUITO PULSANTE (A MÁGICA ACONTECE AQUI)
          ============================================================ */}
      <div className="circuit-wrapper">
        {/* As linhas brilhantes do centro */}
        <div className="circuit-line"></div>
        <div className="circuit-glow"></div>

        {moreFeatures.map((feature, index) => {
          // Mantive a sua lógica alternada de animação de entrada (Direita / Esquerda)
          const animationClass = isVisible 
            ? (index % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right') 
            : 'opacity-0';
          
          // Alternar cores neon para dar um aspecto Sci-Fi
          const neonColor = index % 2 === 0 ? 'var(--neon-purple)' : 'var(--neon-blue)';

          return (
            <div
              key={index}
              className={`circuit-step ${animationClass}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* O NODO CENTRAL (Com o ícone do recurso) */}
              <div 
                className="t-node" 
                style={{
                  position: 'absolute', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  width: '48px', 
                  height: '48px', 
                  background: '#000', 
                  border: `2px solid ${neonColor}`, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  zIndex: 10, 
                  color: '#fff',
                  fontSize: '1.4rem',
                  boxShadow: `0 0 15px ${neonColor}60`
                }}
              >
                {feature.icon}
              </div>

              {/* O CARD DE CONTEÚDO */}
              <div className="c-content">
                {/* Numeração Cyberpunk */}
                <div 
                  className="c-num" 
                  style={{ 
                    color: neonColor,
                    fontFamily: 'var(--font-code)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    letterSpacing: '2px',
                    marginBottom: '0.5rem'
                  }}
                >
                  MOD // 0{index + 1}
                </div>
                
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-main)',
                  fontSize: '1.4rem',
                  marginBottom: '0.8rem'
                }}>
                  {feature.title}
                </h3>
                
                <p style={{
                  fontSize: '1rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6
                }}>
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}