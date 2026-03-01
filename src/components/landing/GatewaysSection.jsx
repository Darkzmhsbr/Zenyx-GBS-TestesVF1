import React, { useState, useEffect, useRef } from 'react';

const gateways = [
  {
    name: 'PushinPay',
    logo: '/gateways/pushinpay-logo-3d.png',
    available: true,
    color: '#7c3aed',
  },
  {
    name: 'SyncPay',
    logo: '/gateways/syncpay-logo-3d.png',
    available: true,
    color: '#06b6d4',
  },
  {
    name: 'WiinPay',
    logo: '/gateways/wiinpay-logo-3d.png',
    available: true,
    color: '#10b981',
  },
  {
    name: 'Mercado Pago',
    logo: '/gateways/mercadopago-logo.png',
    available: false,
    color: '#3b82f6',
  },
];

export function GatewaysSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>

      <div className="section-header">
        <div className={`pill ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ marginBottom: '1.5rem' }}>
          <span className="spark"></span> INTEGRAÇÕES DE PAGAMENTO
        </div>
        <h2 className={`section-title ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
          Gateways <span className="text-gradient">Disponíveis</span>
        </h2>
        <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          Conecte-se às melhores plataformas de pagamento PIX do mercado
        </p>
      </div>

      <div className={`gw-grid ${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
        {gateways.map((gw, i) => (
          <div
            key={gw.name}
            className={`gw-card ${!gw.available ? 'gw-coming' : ''}`}
            style={{
              '--gw-color': gw.color,
              animationDelay: `${0.3 + i * 0.1}s`,
            }}
          >
            {/* Glow ring */}
            <div className="gw-glow" />
            
            {/* Logo */}
            <div className="gw-logo-wrap">
              <img src={gw.logo} alt={gw.name} className="gw-logo-img" loading="lazy" />
            </div>

            {/* Name */}
            <span className="gw-name">{gw.name}</span>

            {/* Status badge */}
            <span className={`gw-status ${gw.available ? 'gw-active' : 'gw-soon'}`}>
              {gw.available ? '● Disponível' : '● Em breve'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}