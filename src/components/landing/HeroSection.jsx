import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';

// Componente de Partícula Flutuante
function Particle({ delay, left, top }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: '3px',
        height: '3px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.3)',
        left,
        top,
        animation: `particle-float 5s ease-in-out infinite`,
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
      overflow: 'hidden',
      padding: '6rem 0 4rem'
    }}>
      
      {/* 🌌 BACKGROUND ANIMADO */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* Orbs de gradiente flutuantes */}
        <div style={{
          position: 'absolute',
          top: '8%',
          right: '12%',
          width: '550px',
          height: '550px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '50%',
          filter: 'blur(120px)',
          animation: 'floatSlow 12s ease-in-out infinite'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          width: '450px',
          height: '450px',
          background: 'rgba(6, 182, 212, 0.07)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          animation: 'floatSlow 12s ease-in-out infinite',
          animationDelay: '4s'
        }} />
        
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '40%',
          width: '600px',
          height: '600px',
          background: 'rgba(5, 150, 105, 0.05)',
          borderRadius: '50%',
          filter: 'blur(150px)',
          animation: 'floatSlow 14s ease-in-out infinite',
          animationDelay: '2s'
        }} />
        
        {/* Partículas */}
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}

        {/* Grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.018,
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.6) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 0.6) 1px, transparent 1px)`,
          backgroundSize: '70px 70px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 70%)'
        }} />
      </div>

      {/* 📦 CONTEÚDO PRINCIPAL — Split Layout */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'grid',
        gridTemplateColumns: '1.15fr 0.85fr',
        gap: '5rem',
        alignItems: 'center'
      }}>
        
        {/* LEFT — Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Badge */}
          <div className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.12)',
            borderRadius: '100px',
            padding: '0.4rem 1.1rem',
            width: 'fit-content'
          }}>
            <div style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--emerald-400)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                inset: '-3px',
                borderRadius: '50%',
                border: '1px solid var(--emerald-400)',
                animation: 'pulseRing 2s infinite'
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--emerald-400)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              MENOR TAXA DO MERCADO (R$ 0,60)
            </span>
          </div>

          {/* Título Principal */}
          <h1 className={`${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`} style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
            fontWeight: 700,
            color: 'var(--text-100)',
            lineHeight: 1.06,
            letterSpacing: '-0.035em'
          }}>
            O Futuro das Vendas no{' '}
            <span className="grad-text neon-text">
              Telegram
            </span>{' '}
            Chegou
          </h1>

          {/* Subtítulo */}
          <p className={`${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`} style={{
            fontSize: '1.15rem',
            color: 'var(--text-400)',
            maxWidth: '540px',
            lineHeight: 1.75
          }}>
            Automatize suas vendas, gerencie seus clientes e escale seu negócio com a plataforma
            mais completa de bots para Telegram. Simples, rápido e poderoso.
          </p>

          {/* CTAs */}
          <div className={`${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.85rem',
            marginTop: '0.25rem'
          }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="hero-btn-primary btn-glow">
                Criar Conta Grátis
                <ArrowRight size={20} />
              </button>
            </Link>
            
            <button className="hero-btn-secondary">
              <PlayCircle size={20} style={{ color: 'var(--emerald-500)' }} />
              Ver Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className={`${isVisible ? 'animate-fade-in-up delay-400' : 'opacity-0'}`} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.75rem',
            paddingTop: '1.75rem',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '0.5rem'
          }}>
            {[
              { label: '500+ Bots Ativos', color: '#22c55e' },
              { label: 'R$ 50.000+ em Vendas', color: '#10b981' },
              { label: '1.200+ Usuários', color: '#06b6d4' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.82rem',
                color: 'var(--text-500)'
              }}>
                <div style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 8px ${item.color}80`,
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: '-3px',
                    borderRadius: '50%',
                    border: `1px solid ${item.color}40`,
                    animation: 'pulseRing 2.5s infinite'
                  }} />
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Preview Card */}
        <div className={`${isVisible ? 'animate-scale-in delay-300' : 'opacity-0'}`} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="holo-border" style={{
            width: '100%',
            maxWidth: '430px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'var(--text-100)'
              }}>
                Vendas em Tempo Real
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.78rem',
                color: 'var(--text-500)'
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  display: 'inline-block',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    inset: '-3px',
                    borderRadius: '50%',
                    border: '1px solid rgba(34,197,94,0.4)',
                    animation: 'pulseRing 2s infinite'
                  }} />
                </span>
                <span>Ao vivo</span>
              </div>
            </div>

            {/* Feed Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { name: 'Bruno N.', plan: '🥇 ACESSO MENSAL 🥇', price: 'R$ 17.90', added: true },
                { name: 'Fernanda R.', plan: '🥇 VITALICIO+BONUS 🥇', price: 'R$ 21.00', added: true },
                { name: 'Diego T.', plan: '🥇 ACESSO SEMANAL 🥇', price: 'R$ 29.00', added: true },
                { name: 'Amanda B.', plan: '🥇 ACESSO SEMANAL 🥇', price: 'R$ 14.90', added: false },
              ].map((item, i) => (
                <div key={i} className="glass-hover" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '0.7rem 0.75rem',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid transparent',
                  animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both`
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: item.added ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: item.added ? '#22c55e' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}>
                    {item.added ? '↑' : '↓'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: 'var(--text-100)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>{item.name}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-500)' }}>{item.plan}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '100px',
                      background: item.added ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: item.added ? '#22c55e' : '#ef4444',
                      display: 'inline-block',
                      marginBottom: '0.2rem',
                      letterSpacing: '0.04em'
                    }}>
                      {item.added ? 'ADICIONADO' : 'REMOVIDO'}
                    </span>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--text-100)'
                    }}>{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '2.5rem',
        left: '50%',
        animation: 'bounceDown 2.5s infinite',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.4rem'
      }}>
        <div style={{
          width: '1px',
          height: '36px',
          background: 'linear-gradient(to bottom, var(--emerald-500), transparent)'
        }} />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: 'var(--text-600)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em'
        }}>scroll</span>
      </div>
    </section>
  );
}