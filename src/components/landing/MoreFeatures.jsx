import React from 'react';

export function MoreFeatures() {
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

  return (
    <section id="funcionalidades" className="section-container">
      <div className="section-header">
        <h2 className="section-title">Mais Funcionalidades</h2>
        <p className="section-subtitle">Ferramentas poderosas para acelerar seu crescimento</p>
      </div>

      <div className="more-features-grid">
        {moreFeatures.map((feature, index) => (
          <div key={index} className="feature-card fade-in">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}