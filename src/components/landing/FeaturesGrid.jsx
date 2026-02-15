import React, { useState, useEffect, useRef } from 'react';

const features = [
  { icon: '🎨', title: 'Personalização Total', description: 'Customize seu bot com sua marca, cores e mensagens personalizadas para cada público-alvo.' },
  { icon: '🎧', title: 'Suporte Integrado', description: 'Sistema de tickets e atendimento direto pelo Telegram em tempo real com seu cliente.' },
  { icon: '📊', title: 'Dashboard Completo', description: 'Visualize métricas, vendas e performance em tempo real com gráficos detalhados.' },
  { icon: '🔔', title: 'Notificações Instantâneas', description: 'Receba alertas de vendas, pagamentos e ações importantes no seu dispositivo.' },
  { icon: '🤖', title: 'Automação Inteligente', description: 'Fluxos automatizados para entrega, cobrança e remarketing avançado de forma automática.' },
  { icon: '📍', title: 'Rastreamento Avançado', description: 'Acompanhe cada cliente no funil de vendas com detalhes completos de conversão.' },
  { icon: '💳', title: 'Múltiplos Gateways', description: 'Integração com Pushin Pay, Mercado Pago e mais gateways de pagamento disponíveis.' },
  { icon: '🛡️', title: 'Segurança Máxima', description: 'Criptografia de ponta a ponta e proteção total dos seus dados sensíveis e dos clientes.' },
];

export function FeaturesGrid() {
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
    <section id="features" ref={sectionRef} className="section-container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
      
      {/* Section Header */}
      <div className="section-header">
        
        {/* Novo Badge Neon Elite */}
        <div 
          className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} 
          style={{ 
            color: 'var(--neon-purple)', 
            fontFamily: 'var(--font-code)', 
            fontSize: '0.85rem', 
            marginBottom: '1rem', 
            border: '1px solid var(--neon-purple)', 
            padding: '4px 14px', 
            borderRadius: '100px', 
            display: 'inline-block',
            boxShadow: 'inset 0 0 10px rgba(168, 85, 247, 0.15)'
          }}
        >
          Infraestrutura Sólida
        </div>
        
        <h2 className={`section-title ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
          Tudo que você precisa para{' '}
          <span className="grad-text">vender mais</span>
        </h2>
        
        <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          Uma plataforma completa com todas as ferramentas necessárias para automatizar 
          e escalar suas vendas no Telegram de forma autônoma.
        </p>
      </div>

      {/* Grid Simétrico Perfeito */}
      <div className="features-grid">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`feature-card ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: `${(index + 1) * 0.06}s` }}
          >
            {/* O ícone foi ajustado para herdar a escala hover animada do nosso novo CSS */}
            <div className="feature-icon">
              {feature.icon}
            </div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}