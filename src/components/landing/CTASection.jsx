import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, DollarSign, Users } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://zenyxvips.com/api';

export function CTASection() {
  const [stats, setStats] = useState({
    total_bots: 500,
    total_sales: 5000,
    total_revenue: 50000,
    active_users: 1200
  });
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

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

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/stats`);
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const statsData = [
    { icon: Bot, value: `${formatNumber(stats.total_bots)}+`, label: 'Bots Criados' },
    { icon: DollarSign, value: `${formatCurrency(stats.total_revenue)}+`, label: 'em Vendas' },
    { icon: Users, value: `${formatNumber(stats.active_users)}+`, label: 'Usuários Ativos' },
  ];

  return (
    <section ref={sectionRef} className="section-container">
      <div className="cta-section" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 50%, rgba(6, 182, 212, 0.15) 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 8s ease infinite'
        }} />
        
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '16rem',
          height: '16rem',
          background: 'rgba(16, 185, 129, 0.12)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '12rem',
          height: '12rem',
          background: 'rgba(6, 182, 212, 0.12)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h2 className={`cta-title ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            Pronto para{' '}
            <span style={{
              background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }} className="neon-text">
              Escalar suas Vendas?
            </span>
          </h2>

          <p className={`cta-subtitle ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            Junte-se a centenas de empreendedores que já automatizaram suas vendas
            no Telegram e estão faturando mais com menos esforço.
          </p>

          {/* Stats */}
          <div className={`cta-stats ${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="cta-stat glass">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <Icon size={20} style={{ color: '#10b981' }} />
                  </div>
                  <p className="cta-stat-value">{stat.value}</p>
                  <p className="cta-stat-label">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className={`${isVisible ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1.75rem 2.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.125rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.35), 0 4px 20px rgba(0,0,0,0.3)',
                animation: 'glow-pulse 3s ease-in-out infinite',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Começar Agora Grátis
                <ArrowRight size={20} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}