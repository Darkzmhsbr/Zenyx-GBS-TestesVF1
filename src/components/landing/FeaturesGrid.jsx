import React from 'react';

export function FeaturesGrid() {
  const features = [
    {
      icon: '🎨',
      title: 'Personalização Total',
      description: 'Customize mensagens, fluxos, planos e páginas de checkout. Crie uma experiência única para seus clientes.'
    },
    {
      icon: '💬',
      title: 'Suporte Integrado',
      description: 'CRM completo com gestão de leads, remarketing automático inteligente e acompanhamento de cada etapa do funil.'
    },
    {
      icon: '📊',
      title: 'Dashboard Completo',
      description: 'Controle total sobre vendas, usuários e receitas com estatísticas em tempo real e relatórios detalhados.'
    },
    {
      icon: '🔔',
      title: 'Notificações Instantâneas',
      description: 'Receba alertas de todas as vendas, webhook personalizado para integração e acompanhe tudo em tempo real.'
    },
    {
      icon: '⚡',
      title: 'Automação Inteligente',
      description: 'Aprovação automática de pagamentos, adição e remoção automática de membros e gestão de expiração.'
    },
    {
      icon: '📈',
      title: 'Rastreamento Avançado',
      description: 'Meta Pixel, UTMs e códigos de venda. Rastreie origem do tráfego e otimize suas campanhas.'
    },
    {
      icon: '💰',
      title: 'Múltiplos Gateways',
      description: 'Integração com Pushin Pay, split de pagamento automático e roteamento inteligente de transações.'
    },
    {
      icon: '🔐',
      title: 'Segurança Máxima',
      description: 'Sistema multi-tenant isolado, autenticação JWT e backup automático de dados.'
    }
  ];

  return (
    <section id="recursos" className="section-container">
      <div className="section-header">
        <h2 className="section-title">Tudo que você precisa para crescer</h2>
        <p className="section-subtitle">Solução completa para escalar suas vendas no Telegram</p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
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