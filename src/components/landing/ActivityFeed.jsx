import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, UserMinus, TrendingUp } from 'lucide-react';
import { publicService } from '../../services/api';

/**
 * Filtro inteligente para nomes de planos agressivos/+18
 * Remove formatações Unicode (negrito, itálico, etc) antes de analisar
 * Detecta palavras-chave explícitas independente de formatação
 */
function isAggressivePlanName(planName) {
  if (!planName) return false;

  // 1. Normalizar: remover emojis, caracteres especiais Unicode e formatações (negrito matemático etc)
  let normalized = planName
    // Remove emojis comuns
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{200D}]/gu, '')
    // Remove variation selectors
    .replace(/[\u{E0020}-\u{E007F}]/gu, '');

  // 2. Converter caracteres Unicode estilizados (negrito, itálico, monospace etc) para ASCII
  // Faixa Mathematical Bold (𝐀-𝐙 = U+1D400-U+1D419, 𝐚-𝐳 = U+1D41A-U+1D433)
  // Faixa Mathematical Bold Sans (𝗔-𝗭 = U+1D5D4-U+1D5ED, 𝗮-𝘇 = U+1D5EE-U+1D607)
  // E muitas outras faixas Unicode para texto estilizado
  const unicodeToAsciiMap = [];
  
  // Mapear todas as faixas de letras estilizadas Unicode para ASCII
  const ranges = [
    // Bold
    { start: 0x1D400, baseUpper: 65, baseLower: null, count: 26 },
    { start: 0x1D41A, baseUpper: null, baseLower: 97, count: 26 },
    // Italic
    { start: 0x1D434, baseUpper: 65, baseLower: null, count: 26 },
    { start: 0x1D44E, baseUpper: null, baseLower: 97, count: 26 },
    // Bold Italic
    { start: 0x1D468, baseUpper: 65, baseLower: null, count: 26 },
    { start: 0x1D482, baseUpper: null, baseLower: 97, count: 26 },
    // Sans-Serif
    { start: 0x1D5A0, baseUpper: 65, baseLower: null, count: 26 },
    { start: 0x1D5BA, baseUpper: null, baseLower: 97, count: 26 },
    // Sans-Serif Bold
    { start: 0x1D5D4, baseUpper: 65, baseLower: null, count: 26 },
    { start: 0x1D5EE, baseUpper: null, baseLower: 97, count: 26 },
    // Sans-Serif Italic
    { start: 0x1D608, baseUpper: 65, baseLower: null, count: 26 },
    { start: 0x1D622, baseUpper: null, baseLower: 97, count: 26 },
    // Sans-Serif Bold Italic
    { start: 0x1D63C, baseUpper: 65, baseLower: null, count: 26 },
    { start: 0x1D656, baseUpper: null, baseLower: 97, count: 26 },
    // Monospace
    { start: 0x1D670, baseUpper: 65, baseLower: null, count: 26 },
    { start: 0x1D68A, baseUpper: null, baseLower: 97, count: 26 },
    // Bold digits
    { start: 0x1D7CE, baseUpper: 48, baseLower: null, count: 10 },
    // Sans-Serif Bold digits
    { start: 0x1D7EC, baseUpper: 48, baseLower: null, count: 10 },
  ];

  let result = '';
  for (const char of normalized) {
    const code = char.codePointAt(0);
    let mapped = false;
    
    for (const range of ranges) {
      const base = range.baseUpper || range.baseLower;
      if (code >= range.start && code < range.start + range.count) {
        result += String.fromCharCode(base + (code - range.start));
        mapped = true;
        break;
      }
    }
    
    if (!mapped) {
      result += char;
    }
  }

  // 3. Limpar e normalizar para lowercase
  const clean = result
    .toLowerCase()
    .replace(/[^a-záàâãéèêíïóôõöúüçñ0-9\s+]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 4. Lista de palavras/padrões agressivos (PT-BR focado no nicho)
  const aggressivePatterns = [
    // Termos explicitamente +18 / adult
    /\b(proibid[oa]|proibidao|proibidão)\b/i,
    /\b(adult[oa]?s?|xxx|porn[oô]?|sexy?|safad[oa]|puta|putaria)\b/i,
    /\b(ninfas?|ninfeta|gostosa|peladona|pelad[oa]|nudez|nude[s]?)\b/i,
    /\b(hot|onlyfans|privacy|privacity|priv)\b/i,
    /\b(pack|pacote\s*(hot|adult|sexy|18))\b/i,
    /\b(erotico|erótico|erotica|erótica|sensual)\b/i,
    /\b(fetiche|fetish|bdsm|swing|swinger)\b/i,
    /\b(oral|anal|transar|sexo|foder|foda)\b/i,
    /\b(cam\s*girl|web\s*cam|stripper|strip)\b/i,
    /\b(incesto|zoofilia|pedofilia)\b/i,
    /\b(piroca|rola|pau|cacete|pica)\b/i,
    /\b(buceta|xoxota|ppk|xereca|xana)\b/i,
    /\b(peituda|peitão|bunduda|bundão|rabuda|rabão)\b/i,
    /\b(gemid[oa]|gemendo|safadeza|putari[ae])\b/i,
    /\b(corno|corninho|chifrudo)\b/i,
    /\b(orgia|suruba|menage|menagem)\b/i,
    /\b(novinha|novinho|lolita|loli)\b/i,
    /\b(vazado|vazados|leaked|leak)\b/i,
    /\b(intimate|intimidade|intimo|íntimo)\b/i,
    /\b(massagem\s*(erotica|sensual|tantrica|tântrica))\b/i,
    /\b(acompanhante|escort|garota\s*de\s*programa|gp)\b/i,
    /\b(amante|sugar\s*(daddy|baby|mommy))\b/i,
    /\b(tesao|tesão|exitante|excitante)\b/i,

    // Marcador explícito +18 / 🔞
    /\+\s*18/,
    /18\s*\+/,
    /\bmeio\s*proibid/i,
    /\bmega\s*proibid/i,
    /\bsuper\s*proibid/i,
    /\bultra\s*proibid/i,
    /\bclubinho/i,
    /\bsigilo/i,
    /\bsigiloso/i,
  ];

  // Verificar também o texto original (antes da normalização) para pegar emojis como 🔞
  const hasAdultEmoji = /\u{1F51E}/u.test(planName); // 🔞

  if (hasAdultEmoji) return true;

  return aggressivePatterns.some(pattern => pattern.test(clean));
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

  // Animação rotativa local (a cada 3 segundos)
  useEffect(() => {
    if (activities.length > 0) {
      // Filtrar planos agressivos antes de exibir
      const safeActivities = activities.filter(a => !isAggressivePlanName(a.plan));
      
      if (safeActivities.length === 0) {
        // Se todos foram filtrados, usar nomes genéricos
        setDisplayedActivities(activities.slice(0, 5).map(a => ({
          ...a,
          plan: isAggressivePlanName(a.plan) ? '🥇 Plano VIP 🥇' : a.plan
        })));
        return;
      }

      setDisplayedActivities(safeActivities.slice(0, 5));
      
      let currentIndex = 0;
      const rotateInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % safeActivities.length;
        
        const newDisplay = [];
        for (let i = 0; i < Math.min(5, safeActivities.length); i++) {
          const idx = (currentIndex + i) % safeActivities.length;
          newDisplay.push(safeActivities[idx]);
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
              color: '#06b6d4',
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
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
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
                  background: 'rgba(34, 197, 94, 0.15)',
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
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserPlus size={24} style={{ color: '#06b6d4' }} />
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
                            background: isAdded ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
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
                              background: isAdded ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
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