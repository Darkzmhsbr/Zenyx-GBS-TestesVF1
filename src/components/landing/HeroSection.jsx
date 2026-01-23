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
        background: 'rgba(168, 85, 247, 0.4)',
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
          background: 'rgba(168, 85, 247, 0.2)',
          borderRadius: '50%',
          filter: 'blur(120px)',
          animation: 'float 3s ease-in-out infinite'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '25%',
          right: '25%',
          width: '20rem',
          height: '20rem',
          background: 'rgba(56, 189, 248, 0.2)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          animation: 'float 3s ease-in-out infinite',
          animationDelay: '1s'
        }} />
        
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '37.5rem',
          height: '37.5rem',
          background: 'rgba(147, 51, 234, 0.1)',
          borderRadius: '50%',
          filter: 'blur(150px)'
        }} />
        
        {/* Partículas */}
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}

        {/* Grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.02,
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(168, 85, 247, 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
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
          background: 'rgba(15, 15, 25, 0.55)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '50px',
          padding: '0.5rem 1rem',
          marginBottom: '2rem',
          transition: 'all 0.7s'
        }}>
          <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--primary)'
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
              background: 'linear-gradient(90deg, var(--primary) 0%, #9333ea 50%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }} className="neon-text">
              Telegram
            </span>
            <span style={{
              position: 'absolute',
              inset: '-0.25rem',
              background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.2) 50%, rgba(56, 189, 248, 0.2) 100%)',
              filter: 'blur(16px)',
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
              background: 'linear-gradient(90deg, var(--primary) 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
              animation: 'glow-pulse 2s ease-in-out infinite',
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
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--foreground)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '1.125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
          >
            <PlayCircle size={20} style={{ color: 'var(--primary)' }} />
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
              background: 'var(--primary)',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '0.875rem' }}>R$ 50.000+ em Vendas</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#38bdf8',
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
            background: 'var(--primary)',
            animation: 'pulse 2s infinite'
          }} />
        </div>
      </div>
    </section>
  );
}