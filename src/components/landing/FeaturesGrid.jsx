import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Headphones,
  LayoutDashboard,
  Bell,
  Bot,
  MapPin,
  CreditCard,
  Shield,
} from 'lucide-react';

const features = [
  {
    icon: Palette,
    title: 'Personalização Total',
    description: 'Customize seu bot com sua marca, cores e mensagens personalizadas.',
  },
  {
    icon: Headphones,
    title: 'Suporte Integrado',
    description: 'Sistema de tickets e atendimento direto pelo Telegram.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Completo',
    description: 'Visualize métricas, vendas e performance em tempo real.',
  },
  {
    icon: Bell,
    title: 'Notificações Instantâneas',
    description: 'Receba alertas de vendas, pagamentos e ações importantes.',
  },
  {
    icon: Bot,
    title: 'Automação Inteligente',
    description: 'Fluxos automatizados para entrega, cobrança e remarketing.',
  },
  {
    icon: MapPin,
    title: 'Rastreamento Avançado',
    description: 'Acompanhe cada cliente no funil de vendas em detalhes.',
  },
  {
    icon: CreditCard,
    title: 'Múltiplos Gateways',
    description: 'Integração com Pushin Pay, Mercado Pago e mais.',
  },
  {
    icon: Shield,
    title: 'Segurança Máxima',
    description: 'Criptografia de ponta e proteção total dos seus dados.',
  },
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
    <section id="features" ref={sectionRef} className="section-container" style={{ position: 'relative' }}>
      {/* Background accents */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '24rem',
          height: '24rem',
          background: 'rgba(16, 185, 129, 0.06)',
          borderRadius: '50%',
          filter: 'blur(150px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '20rem',
          height: '20rem',
          background: 'rgba(6, 182, 212, 0.06)',
          borderRadius: '50%',
          filter: 'blur(120px)'
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <div className={`section-header ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <span style={{
            display: 'inline-block',
            color: '#10b981',
            fontWeight: 600,
            fontSize: '0.875rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            Recursos Poderosos
          </span>
          <h2 className="section-title">
            Tudo que você precisa para{' '}
            <span style={{
              background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              vender mais
            </span>
          </h2>
          <p className="section-subtitle">
            Uma plataforma completa com todas as ferramentas necessárias para
            automatizar e escalar suas vendas no Telegram.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={feature.title}
                className={`feature-card ${isVisible ? (isEven ? 'animate-slide-in-left' : 'animate-slide-in-right') : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease'
                  }}>
                    <Icon size={28} style={{ color: '#10b981' }} />
                  </div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}