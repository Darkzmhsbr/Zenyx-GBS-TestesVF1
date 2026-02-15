import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, DollarSign, Users } from 'lucide-react';
import axios from 'axios';

// ============================================================
// ⚙️ CONFIGURAÇÃO DE AMBIENTE DA API
// ============================================================
const API_URL = import.meta.env.VITE_API_URL || 'https://zenyxvips.com/api';

export function CTASection() {
  // ============================================================
  // 📊 ESTADOS DO COMPONENTE
  // Mantemos o fallback visual seguro caso a API atrase
  // ============================================================
  const [stats, setStats] = useState({
    total_bots: 500,
    total_sales: 5000,
    total_revenue: 50000,
    active_users: 1200
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // ============================================================
  // 🔄 EFEITOS DE CICLO DE VIDA (LIFECYCLE)
  // ============================================================
  useEffect(() => {
    fetchStats();
  }, []);

  // Observador de intersecção para acionar a animação apenas quando 
  // o usuário rolar a tela até esta seção (Performance e Charme)
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

  // ============================================================
  // 🌐 FUNÇÕES DE COMUNICAÇÃO
  // ============================================================
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/stats`);
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas da Zenyx:', error);
      // O estado não é zerado em caso de falha de rede (Fallback elegante)
    }
  };

  // ============================================================
  // 🧮 FORMATADORES DE DADOS (CURRENCY E LOCALE)
  // ============================================================
  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  // ============================================================
  // 🎨 MAPA DE DADOS VISUAIS (COSMOS PURPLE EDITION)
  // Substituímos o roxo antigo pelo novo --neon-magenta
  // ============================================================
  const statsData = [
    { 
      icon: Bot, 
      value: `${formatNumber(stats.total_bots)}+`, 
      label: 'Bots Ativos', 
      color: 'var(--neon-green)' 
    },
    { 
      icon: DollarSign, 
      value: `${formatCurrency(stats.total_revenue)}+`, 
      label: 'Transacionados', 
      color: 'var(--neon-blue)' 
    },
    { 
      icon: Users, 
      value: `${formatNumber(stats.active_users)}+`, 
      label: 'Empreendedores', 
      color: 'var(--neon-magenta)' 
    },
  ];

  return (
    <section ref={sectionRef} className="section container">
      
      {/* A Classe 'cta-banner' é mapeada diretamente do nosso LandingPage.css
        e possui o gradiente, bordas e padding exatos da nova identidade! 
      */}
      <div className={`cta-banner ${isVisible ? 'active' : ''}`}>
        
        {/* ==========================================
            CABEÇALHO DA CHAMADA PARA AÇÃO
            ========================================== */}
        <h2 
          className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'} section-title`}
          style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            marginBottom: '1rem',
            lineHeight: 1.1
          }}
        >
          O último painel que <span className="text-gradient">você vai precisar.</span>
        </h2>
        
        <p 
          className={`${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'} section-desc`} 
          style={{ 
            marginBottom: '3.5rem', 
            maxWidth: '650px', 
            marginInline: 'auto' 
          }}
        >
          Junte-se à elite da automação financeira no Telegram. Automatize suas 
          vendas, recupere carrinhos e cresça seu negócio no piloto automático.
        </p>
        
        {/* ==========================================
            O BOTÃO DE CONVERSÃO PRINCIPAL
            ========================================== */}
        <div className={`${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button 
              className="btn-glow hero-btn" 
              style={{ 
                padding: '1.2rem 3rem', 
                fontSize: '1.15rem', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '4rem'
              }}
            >
              Criar Conta Gratuitamente
              <ArrowRight size={22} />
            </button>
          </Link>
        </div>
        
        {/* ==========================================
            DADOS DE PROVA SOCIAL (STATS GRID)
            Consumindo diretamente a API
            ========================================== */}
        <div 
          className={`stats-flex ${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '3rem'
          }}
        >
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="stat-box" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '2rem',
                  borderRadius: '20px',
                  border: '1px solid var(--border-subtle)',
                  minWidth: '240px',
                  boxShadow: `0 10px 30px rgba(0,0,0,0.3)`
                }}
              >
                {/* Ícone Iluminado */}
                <div 
                  style={{ 
                    marginBottom: '1rem', 
                    color: stat.color, 
                    filter: `drop-shadow(0 0 15px ${stat.color})`,
                    background: `${stat.color}15`,
                    padding: '1rem',
                    borderRadius: '50%'
                  }}
                >
                  <Icon size={36} strokeWidth={1.5} />
                </div>
                
                {/* Valor Formatado da API */}
                <h4 
                  style={{ 
                    fontFamily: 'var(--font-code)', 
                    fontSize: '2.5rem', 
                    color: 'var(--text-main)', 
                    textShadow: `0 0 20px ${stat.color}40`,
                    lineHeight: '1'
                  }}
                >
                  {stat.value}
                </h4>
                
                {/* Subtítulo Descritivo */}
                <p 
                  style={{ 
                    fontSize: '0.85rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '2px', 
                    color: 'var(--text-muted)', 
                    marginTop: '0.8rem',
                    fontWeight: 700
                  }}
                >
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