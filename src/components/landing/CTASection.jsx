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
        {/* Background */}
        <div className="cta-bg" />
        
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '16rem',
          height: '16rem',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '12rem',
          height: '12rem',
          background: 'rgba(6, 182, 212, 0.1)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h2 className={`cta-title ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            Pronto para{' '}
            <span className="grad-text neon-text">
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
                <div key={index} className="cta-stat">
                  <div className="cta-stat-icon">
                    <Icon size={20} />
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
              <button className="hero-btn-primary btn-glow" style={{
                padding: '1.15rem 2.5rem',
                fontSize: '1.05rem'
              }}>
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