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

  // Mapeamento dos dados com os ícones originais do Lucide
  const statsData = [
    { icon: Bot, value: `${formatNumber(stats.total_bots)}+`, label: 'Bots Criados', color: 'var(--neon-green)' },
    { icon: DollarSign, value: `${formatCurrency(stats.total_revenue)}+`, label: 'em Vendas', color: 'var(--neon-blue)' },
    { icon: Users, value: `${formatNumber(stats.active_users)}+`, label: 'Usuários Ativos', color: 'var(--neon-purple)' },
  ];

  return (
    <section ref={sectionRef} className="section container">
      <div className="cta-big">
        
        {/* Título */}
        <h2 
          className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} 
          style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            fontWeight: 800, 
            color: 'var(--text-main)', 
            marginBottom: '1rem',
            letterSpacing: '-1px'
          }}
        >
          Pronto para <span className="grad-text">Escalar suas Vendas?</span>
        </h2>
        
        {/* Subtítulo */}
        <p 
          className={`${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`} 
          style={{ 
            fontSize: '1.2rem', 
            color: 'var(--text-muted)', 
            marginBottom: '3rem', 
            maxWidth: '650px', 
            marginInline: 'auto' 
          }}
        >
          Junte-se a centenas de empreendedores que já automatizaram suas vendas no Telegram e estão faturando mais com menos esforço.
        </p>
        
        {/* Botão de Ação */}
        <div className={`${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="btn-glow" style={{ 
              padding: '1.2rem 3.5rem', 
              fontSize: '1.15rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '12px' 
            }}>
              Começar Agora Grátis
              <ArrowRight size={22} />
            </button>
          </Link>
        </div>
        
        {/* Grid de Estatísticas consumindo a API */}
        <div className={`stats-flex ${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat-box" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}>
                <div style={{ 
                  marginBottom: '1rem', 
                  color: stat.color, 
                  filter: `drop-shadow(0 0 10px ${stat.color})` 
                }}>
                  <Icon size={40} strokeWidth={1.5} />
                </div>
                <h4 style={{ 
                  fontFamily: 'var(--font-code)', 
                  fontSize: '2.5rem', 
                  color: 'var(--text-main)', 
                  textShadow: '0 0 20px rgba(255,255,255,0.2)',
                  lineHeight: '1'
                }}>
                  {stat.value}
                </h4>
                <p style={{ 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '2px', 
                  color: 'var(--text-muted)', 
                  marginTop: '0.5rem' 
                }}>
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}