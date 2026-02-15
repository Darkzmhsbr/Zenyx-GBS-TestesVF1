import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, UserMinus, TrendingUp } from 'lucide-react';
import { publicService } from '../../services/api';

// ============================================================
// FILTRO AGRESSIVO DE NOMES DE PLANOS (+18 / ADULTO)
// ============================================================
function isAggressivePlanName(planName) {
  if (!planName) return false;
  
  // Normalizar Unicode (mathematical bold, italic, sans-serif, monospace)
  let normalized = planName
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{200D}]/gu, '');
  
  const ranges = [
    { start: 0x1D400, base: 65, count: 26 }, { start: 0x1D41A, base: 97, count: 26 },
    { start: 0x1D5D4, base: 65, count: 26 }, { start: 0x1D5EE, base: 97, count: 26 },
    { start: 0x1D5A0, base: 65, count: 26 }, { start: 0x1D5BA, base: 97, count: 26 },
    { start: 0x1D670, base: 65, count: 26 }, { start: 0x1D68A, base: 97, count: 26 },
    { start: 0x1D434, base: 65, count: 26 }, { start: 0x1D44E, base: 97, count: 26 },
    { start: 0x1D468, base: 65, count: 26 }, { start: 0x1D482, base: 97, count: 26 },
    { start: 0x1D608, base: 65, count: 26 }, { start: 0x1D622, base: 97, count: 26 },
    { start: 0x1D63C, base: 65, count: 26 }, { start: 0x1D656, base: 97, count: 26 },
    { start: 0x1D7CE, base: 48, count: 10 }, { start: 0x1D7EC, base: 48, count: 10 },
  ];
  
  let result = '';
  for (const char of normalized) {
    const code = char.codePointAt(0);
    let mapped = false;
    for (const r of ranges) {
      if (code >= r.start && code < r.start + r.count) {
        result += String.fromCharCode(r.base + (code - r.start));
        mapped = true;
        break;
      }
    }
    if (!mapped) result += char;
  }
  
  const clean = result
    .toLowerCase()
    .replace(/[^a-záàâãéèêíïóôõöúüçñ0-9\s+]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const patterns = [
    /\b(proibid[oa]|proibidao|proibidão)\b/i,
    /\b(adult[oa]?s?|xxx|porn[oô]?|sexy?|safad[oa]|puta|putaria)\b/i,
    /\b(ninfas?|ninfeta|gostosa|peladona|pelad[oa]|nudez|nude[s]?)\b/i,
    /\b(hot|onlyfans|privacy|privacity|priv)\b/i,
    /\b(erotico|erótico|erotica|erótica|sensual)\b/i,
    /\b(fetiche|fetish|bdsm|swing)\b/i,
    /\b(oral|anal|transar|sexo|foder|foda)\b/i,
    /\b(cam\s*girl|web\s*cam|stripper|strip)\b/i,
    /\b(piroca|rola|pau|cacete|pica)\b/i,
    /\b(buceta|xoxota|ppk|xereca)\b/i,
    /\b(gemid[oa]|safadeza|putari[ae])\b/i,
    /\b(orgia|suruba|menage)\b/i,
    /\b(novinha|novinho|lolita|loli)\b/i,
    /\b(vazado|vazados|leaked|leak)\b/i,
    /\b(acompanhante|escort|garota\s*de\s*programa|gp)\b/i,
    /\b(tesao|tesão)\b/i,
    /\+\s*18/, /18\s*\+/,
    /\bmega\s*proibid/i,
    /\bclubinho/i,
    /\bsigilo/i,
  ];
  
  // Detecta emoji 🔞 diretamente
  if (/\u{1F51E}/u.test(planName)) return true;
  
  return patterns.some(p => p.test(clean));
}

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

  // Animação rotativa local com filtro agressivo
  useEffect(() => {
    if (activities.length > 0) {
      // Filtrar planos adultos
      const safe = activities.filter(a => !isAggressivePlanName(a.plan));
      const source = safe.length > 0
        ? safe
        : activities.map(a => ({
            ...a,
            plan: isAggressivePlanName(a.plan) ? '🥇 Plano VIP 🥇' : a.plan
          }));
      
      setDisplayedActivities(source.slice(0, 5));
      
      let currentIndex = 0;
      const rotateInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % source.length;
        
        const newDisplay = [];
        for (let i = 0; i < Math.min(5, source.length); i++) {
          newDisplay.push(source[(currentIndex + i) % source.length]);
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
        { name: "João P.", plan: "Premium", action: "ADICIONADO", price: 97.00 },
        { name: "Maria S.", plan: "Básico", action: "ADICIONADO", price: 47.00 },
        { name: "Pedro C.", plan: "Pro", action: "ADICIONADO", price: 197.00 },
        { name: "Ana O.", plan: "Premium", action: "REMOVIDO", price: 97.00 },
        { name: "Lucas M.", plan: "Básico", action: "ADICIONADO", price: 47.00 },
      ]);
      setLoading(false);
    }
  };

  return (
    <section ref={sectionRef} id="automacao" className="activity-section">
      <div className="activity-content">
        
        {/* LEFT CONTENT */}
        <div className={`${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
          <div className="section-label" style={{ color: 'var(--cyan-400)', justifyContent: 'flex-start' }}>
            Tempo Real
          </div>
          
          <h2 className="section-title" style={{ textAlign: 'left' }}>
            Acompanhe{' '}
            <span className="grad-text">cada venda</span>{' '}
            em tempo real
          </h2>
          
          <p style={{
            color: 'var(--text-400)',
            fontSize: '1.05rem',
            marginBottom: '0',
            lineHeight: 1.7,
            maxWidth: '580px'
          }}>
            Visualize todas as atividades do seu bot em tempo real. Novos clientes,
            renovações, cancelamentos e mais - tudo em um único painel.
          </p>

          {/* Stats Cards */}
          <div className="activity-highlights">
            <div className="highlight-item">
              <div className="highlight-icon" style={{ background: 'rgba(34, 197, 94, 0.08)' }}>
                <TrendingUp size={22} style={{ color: '#22c55e' }} />
              </div>
              <div>
                <p className="highlight-title">+23%</p>
                <p className="highlight-description">Crescimento mensal</p>
              </div>
            </div>

            <div className="highlight-item">
              <div className="highlight-icon" style={{ background: 'rgba(6, 182, 212, 0.08)' }}>
                <UserPlus size={22} style={{ color: 'var(--cyan-500)' }} />
              </div>
              <div>
                <p className="highlight-title">1.2k+</p>
                <p className="highlight-description">Usuários ativos</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Activity Feed */}
        <div className={`${isVisible ? 'animate-slide-in-right delay-200' : 'opacity-0'}`}>
          <div className="activity-feed-container">
            <div className="activity-feed-header">
              <span className="activity-feed-title">Atividade Recente</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
                <span style={{ fontSize: '0.78rem', color: 'var(--text-500)' }}>Ao vivo</span>
              </div>
            </div>

            <div className="activity-feed-items">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-500)' }}>
                  Carregando atividades...
                </div>
              ) : (
                displayedActivities.map((activity, index) => {
                  const isAdded = activity.action === "ADICIONADO";
                  
                  return (
                    <div
                      key={`${activity.name}-${index}`}
                      className="activity-item"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.08}s both`
                      }}
                    >
                      <div className={`activity-icon ${isAdded ? 'added' : 'removed'}`}>
                        {isAdded ? <UserPlus size={18} /> : <UserMinus size={18} />}
                      </div>
                      
                      <div className="activity-details">
                        <p className="activity-name">{activity.name}</p>
                        <p className="activity-plan">{activity.plan}</p>
                      </div>

                      <div className="activity-right">
                        <span className={`activity-badge ${isAdded ? 'added' : 'removed'}`}>
                          {activity.action}
                        </span>
                        <p className="activity-price">R$ {activity.price.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })
              )}
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
    </section>
  );
}