import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// 🗂️ BASE DE DADOS: A JORNADA (CIRCUITO PULSANTE)
// Funcionalidades explicadas como uma linha do tempo (timeline).
// O copywriting foi ajustado para refletir a nova versão 6.0.
// ============================================================
const moreFeatures = [
  { 
    icon: '⚡', 
    title: 'Setup em 5 Minutos', 
    description: 'Configuração rápida e fácil com tutoriais passo a passo. Integração facilitada com o Telegram para você não perder tempo.',
    color: 'var(--neon-purple)'
  },
  { 
    icon: '📊', 
    title: 'Upsell & Order Bump', 
    description: 'Ofereça produtos adicionais no checkout de forma nativa e aumente o seu Ticket Médio sem esforço.',
    color: 'var(--neon-blue)'
  },
  { 
    icon: '✅', 
    title: 'Aprovação Automática', 
    description: 'A latência não existe. O cliente efetua o PIX e nosso sistema aciona os servidores para liberar o acesso ao grupo no mesmo segundo.',
    color: 'var(--neon-magenta)'
  },
  { 
    icon: '🔗', 
    title: 'Sistema de Redirecionamento', 
    description: 'Crie pastas organizadas por plataforma (Instagram, Facebook, TikTok). Rastreie cliques e saiba de onde vem cada venda.',
    color: 'var(--neon-purple)'
  },
  { 
    icon: '📈', 
    title: 'Funil de Vendas Implacável', 
    description: 'Acompanhe a jornada do cliente: Lead Frio (topo), Lead Quente (meio) e Cliente VIP (fundo) com métricas financeiras.',
    color: 'var(--neon-blue)'
  },
  { 
    icon: '🔄', 
    title: 'Remarketing Inteligente', 
    description: 'Se o lead gerou o PIX e não pagou, a Zenyx cobra ele automaticamente no privado do Telegram 30 minutos depois.',
    color: 'var(--neon-magenta)'
  },
];

export function MoreFeatures() {
  // ============================================================
  // ⚙️ ESTADOS E REFERÊNCIAS
  // ============================================================
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // ============================================================
  // 👁️ OBSERVER PARA ANIMAÇÃO DE REVEAL (SCROLL)
  // Só aciona as animações de entrada quando a seção entra na tela
  // ============================================================
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
    <section 
      id="jornada" 
      ref={sectionRef} 
      className="section container"
    >
      
      {/* ============================================================
          CABEÇALHO DA SEÇÃO
          ============================================================ */}
      <div className="section-header">
        
        {/* Pílula de Destaque Neon Cosmos */}
        <div className={`pill ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <span 
            className="spark" 
            style={{ 
              background: 'var(--neon-blue)', 
              boxShadow: '0 0 10px var(--neon-blue)' 
            }}
          ></span>
          FUNCIONALIDADES AVANÇADAS
        </div>
        
        <h2 className={`section-title ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
          A Jornada do <span className="text-gradient">Lead</span>
        </h2>
        
        <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          Veja como a plataforma transforma curiosos em compradores leais, 
          automatizando desde o clique no link até a entrega do acesso.
        </p>
      </div>

      {/* ============================================================
          CIRCUITO PULSANTE (A LINHA DO TEMPO MÁGICA)
          O CSS Global controla o flex-direction: row-reverse dos 
          itens pares, e as posições mobile.
          ============================================================ */}
      <div className="circuit-wrapper">
        
        {/* A Linha e a Luz que corre dentro dela */}
        <div className="circuit-line"></div>
        <div className="circuit-glow"></div>

        {/* Mapeamento dos Módulos */}
        {moreFeatures.map((feature, index) => {
          
          // Animação Alternada: Ímpares vêm da esquerda, Pares da direita
          const animationClass = isVisible 
            ? (index % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right') 
            : 'opacity-0';

          return (
            <div
              key={index}
              className={`circuit-step ${animationClass}`}
              style={{ animationDelay: `${(index * 0.1) + 0.3}s` }}
            >
              
              {/* O NODO CENTRAL (Ícone Flutuante na Linha) */}
              <div 
                className="t-node" 
                style={{
                  border: `2px solid ${feature.color}`, 
                  boxShadow: `0 0 15px ${feature.color}60`
                }}
              >
                {feature.icon}
              </div>

              {/* O CARD DE CONTEÚDO (Borda Glassmorphism) */}
              <div className="c-content">
                
                {/* Indicador de Módulo (Ex: MOD // 01) */}
                <div 
                  className="c-num" 
                  style={{ 
                    color: feature.color,
                    fontFamily: 'var(--font-code)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    letterSpacing: '2px',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase'
                  }}
                >
                  MOD // 0{index + 1}
                </div>
                
                {/* Título do Card */}
                <h3 
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text-main)',
                    fontSize: '1.4rem',
                    marginBottom: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  {feature.title}
                </h3>
                
                {/* Descrição do Card */}
                <p 
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6
                  }}
                >
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