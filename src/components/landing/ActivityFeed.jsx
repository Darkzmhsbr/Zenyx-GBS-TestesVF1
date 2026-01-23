import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, UserMinus, TrendingUp } from 'lucide-react';
import { publicService } from '../../services/api';

export function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [displayedActivities, setDisplayedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Intersection Observer para animações
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

  // Buscar atividades do backend
  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  // Animação rotativa local (a cada 3 segundos)
  useEffect(() => {
    if (activities.length > 0) {
      setDisplayedActivities(activities.slice(0, 5));
      
      let currentIndex = 0;
      const rotateInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % activities.length;
        
        const newDisplay = [];
        for (let i = 0; i < 5; i++) {
          const idx = (currentIndex + i) % activities.length;
          newDisplay.push(activities[idx]);
        }
        
        setDisplayedActivities(newDisplay);
      }, 3000);
      
      return () => clearInterval(rotateInterval);
    }
  }, [activities]);

  const fetchActivities = async () => {
    try {
      const data = await publicService.getActivityFeed();
      if (data && data.activities) {
        setActivities(data.activities);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      // Dados mock em caso de erro
      setActivities([
        { name: "João P.", plan: "Premium", action: "ADICIONADO", price: 97.00, icon: "✅" },
        { name: "Maria S.", plan: "Básico", action: "ADICIONADO", price: 47.00, icon: "✅" },
        { name: "Pedro C.", plan: "Pro", action: "ADICIONADO", price: 197.00, icon: "✅" },
        { name: "Ana O.", plan: "Premium", action: "REMOVIDO", price: 97.00, icon: "❌" },
        { name: "Lucas M.", plan: "Básico", action: "ADICIONADO", price: 47.00, icon: "✅" },
      ]);
      setLoading(false);
    }
  };

  return (
    <section ref={sectionRef} id="automacao" style={{ padding: '6rem 1.5rem', position: 'relative' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '3rem',
          alignItems: 'center'
        }}>
          
          {/* LEFT CONTENT */}
          <div className={`${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`} style={{
            gridColumn: '1',
            transition: 'all 0.7s'
          }}>
            <span style={{
              display: 'inline-block',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              Tempo Real
            </span>
            
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              color: 'var(--foreground)',
              marginBottom: '1.5rem',
              lineHeight: 1.2
            }}>
              Acompanhe{' '}
              <span style={{
                background: 'linear-gradient(90deg, var(--primary) 0%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                cada venda
              </span>{' '}
              em tempo real
            </h2>
            
            <p style={{
              color: 'var(--muted-foreground)',
              fontSize: '1.125rem',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              Visualize todas as atividades do seu bot em tempo real. Novos clientes,
              renovações, cancelamentos e mais - tudo em um único painel.
            </p>

            {/* Stats Cards */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="glass" style={{
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUp size={24} style={{ color: 'var(--success)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>+23%</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }}>Crescimento</p>
                </div>
              </div>

              <div className="glass" style={{
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserPlus size={24} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>1.2k+</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }}>Usuários</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Activity Feed */}
          <div className={`${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`} style={{
            gridColumn: '1',
            transition: 'all 0.7s',
            transitionDelay: '0.3s'
          }}>
            <div className="glass neon-border" style={{
              borderRadius: '16px',
              padding: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'var(--foreground)',
                  margin: 0
                }}>
                  Atividade Recente
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--success)',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Ao vivo</span>
                </div>
              </div>

              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                paddingRight: '0.5rem'
              }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
                    Carregando atividades...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {displayedActivities.map((activity, index) => {
                      const isAdded = activity.action === "ADICIONADO";
                      
                      return (
                        <div key={`${activity.name}-${index}`} className="glass glass-hover" style={{
                          borderRadius: '12px',
                          padding: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          animation: `fade-in-up 0.5s ease-out forwards`,
                          animationDelay: `${index * 0.1}s`
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: isAdded ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: isAdded ? 'var(--success)' : 'var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isAdded ? <UserPlus size={20} /> : <UserMinus size={20} />}
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              color: 'var(--foreground)',
                              fontWeight: 600,
                              margin: '0 0 0.25rem 0',
                              fontSize: '0.95rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {activity.name}
                            </p>
                            <p style={{
                              fontSize: '0.85rem',
                              color: 'var(--muted-foreground)',
                              margin: 0
                            }}>
                              {activity.plan}
                            </p>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '50px',
                              background: isAdded ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: isAdded ? 'var(--success)' : 'var(--danger)',
                              display: 'inline-block',
                              marginBottom: '0.25rem'
                            }}>
                              {activity.action}
                            </span>
                            <p style={{
                              color: 'var(--foreground)',
                              fontWeight: 700,
                              margin: 0,
                              fontSize: '0.95rem'
                            }}>
                              R$ {activity.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Accents */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '24rem',
          height: '24rem',
          background: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '50%',
          filter: 'blur(150px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '20rem',
          height: '20rem',
          background: 'rgba(56, 189, 248, 0.1)',
          borderRadius: '50%',
          filter: 'blur(120px)'
        }} />
      </div>
    </section>
  );
}