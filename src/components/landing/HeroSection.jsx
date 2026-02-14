import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';

// Componente de Partícula Flutuante
function Particle({ delay, left, top }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.35)',
        left,
        top,
        animation: `particle-float 4s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Gerar 20 partículas aleatórias
  const particles = Array.from({ length: 20 }, (_, i) => ({
    delay: i * 0.3,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
  }));

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      paddingTop: '5rem'
    }}>
      
      {/* 🌌 BACKGROUND ANIMADO */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* Orbs de gradiente flutuantes */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '24rem',
          height: '24rem',
          background: 'rgba(16, 185, 129, 0.12)',
          borderRadius: '50%',
          filter: 'blur(130px)',
          animation: 'float 4s ease-in-out infinite'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '25%',
          right: '25%',
          width: '20rem',
          height: '20rem',
          background: 'rgba(6, 182, 212, 0.1)',
          borderRadius: '50%',
          filter: 'blur(110px)',
          animation: 'float 4s ease-in-out infinite',
          animationDelay: '1.5s'
        }} />
        
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '37.5rem',
          height: '37.5rem',
          background: 'rgba(5, 150, 105, 0.06)',
          borderRadius: '50%',
          filter: 'blur(160px)'
        }} />
        
        {/* Partículas */}
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}

        {/* Grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.025,
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* 📦 CONTEÚDO PRINCIPAL */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '72rem',
        margin: '0 auto',
        padding: '0 1.5rem',
        textAlign: 'center'
      }}>
        
        {/* Badge */}
        <div className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(8, 15, 12, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          borderRadius: '50px',
          padding: '0.5rem 1rem',
          marginBottom: '2rem',
          transition: 'all 0.7s'
        }}>
          <Sparkles size={16} style={{ color: '#10b981' }} />
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#34d399'
          }}>
            MENOR TAXA DO MERCADO (R$ 0,60)
          </span>
        </div>

        {/* Título Principal */}
        <h1 className={`${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`} style={{
          fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
          fontWeight: 800,
          color: 'var(--foreground)',
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          transition: 'all 0.7s'
        }}>
          O Futuro das Vendas no{' '}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{
              position: 'relative',
              zIndex: 10,
              background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 60%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }} className="neon-text">
              Telegram
            </span>
            <span style={{
              position: 'absolute',
              inset: '-0.25rem',
              background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
              filter: 'blur(18px)',
              borderRadius: '8px',
              zIndex: 0
            }} />
          </span>{' '}
          Chegou
        </h1>

        {/* Subtítulo */}
        <p className={`${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`} style={{
          fontSize: '1.25rem',
          color: 'var(--muted-foreground)',
          maxWidth: '48rem',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6,
          transition: 'all 0.7s'
        }}>
          Automatize suas vendas, gerencie seus clientes e escale seu negócio com a plataforma
          mais completa de bots para Telegram. Simples, rápido e poderoso.
        </p>

        {/* CTAs */}
        <div className={`${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`} style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          transition: 'all 0.7s'
        }}>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1.5rem 2rem',
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
              Criar Conta Grátis
              <ArrowRight size={20} />
            </button>
          </Link>
          
          <button className="glass" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1.5rem 2rem',
            background: 'rgba(16, 185, 129, 0.06)',
            color: 'var(--foreground)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '12px',
            fontSize: '1.125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.06)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.15)';
          }}
          >
            <PlayCircle size={20} style={{ color: '#10b981' }} />
            Ver Demo
          </button>
        </div>

        {/* Trust Indicators */}
        <div className={`${isVisible ? 'animate-fade-in-up delay-400' : 'opacity-0'}`} style={{
          marginTop: '4rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          color: 'var(--muted-foreground)',
          transition: 'all 0.7s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--success)',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '0.875rem' }}>500+ Bots Ativos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '0.875rem' }}>R$ 50.000+ em Vendas</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#06b6d4',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '0.875rem' }}>1.200+ Usuários</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        animation: 'bounce 2s infinite'
      }}>
        <div style={{
          width: '1.5rem',
          height: '2.5rem',
          borderRadius: '50px',
          border: '2px solid rgba(161, 161, 170, 0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '0.5rem'
        }}>
          <div style={{
            width: '4px',
            height: '8px',
            borderRadius: '2px',
            background: '#10b981',
            animation: 'pulse 2s infinite'
          }} />
        </div>
      </div>
    </section>
  );
}