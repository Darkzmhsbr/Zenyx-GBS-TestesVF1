import React, { useState, useEffect, useRef } from 'react';
import { publicService } from '../../services/api';

// ============================================================
// FILTRO AGRESSIVO DE NOMES DE PLANOS (+18 / ADULTO) - MANTIDO INTACTO
// ============================================================
function isAggressivePlanName(planName) {
  if (!planName) return false;
  
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
  
  if (/\u{1F51E}/u.test(planName)) return true;
  return patterns.some(p => p.test(clean));
}

// ============================================================
// DADOS DAS PREMIAÇÕES (GAMIFICAÇÃO)
// ============================================================
const awardsData = [
  { id: '10k', label: '10K', color: '#94a3b8' },
  { id: '50k', label: '50K', color: 'var(--neon-blue)' },
  { id: '100k', label: '100K', color: 'var(--neon-purple)' },
  { id: '250k', label: '250K', color: 'var(--neon-green)' },
  { id: '500k', label: '500K', color: 'var(--neon-gold)' },
  { id: '1M', label: '1 MILHÃO', color: '#ffffff' }
];

export function ActivityFeed() {
  // Mantemos os states originais para buscar dados reais
  const [activities, setActivities] = useState([]);
  const [displayedActivities, setDisplayedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // States exclusivos da nova versão (Placas 3D)
  const [activeAward, setActiveAward] = useState(awardsData[0]);
  const [isFlipped, setIsFlipped] = useState(false);

  // Intersection Observer
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

  // Buscar atividades originais do backend
  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  // Lógica rotativa original preservada
  useEffect(() => {
    if (activities.length > 0) {
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
      setActivities([
        { name: "João P.", plan: "Premium", action: "ADICIONADO", price: 97.00 },
        { name: "Maria S.", plan: "Básico", action: "ADICIONADO", price: 47.00 }
      ]);
      setLoading(false);
    }
  };

  // Handler do Efeito 3D Flip da Placa de Premiação
  const handleAwardClick = (award) => {
    if (award.id === activeAward.id) return;
    setActiveAward(award);
    setIsFlipped(!isFlipped);
  };

  return (
    <div ref={sectionRef}>
      
      {/* ============================================================
          SECTION: TAXAS (TICKET HOLOGRÁFICO VS CONCORRÊNCIA)
          ============================================================ */}
      <section id="pricing" className="section container">
        <div className="section-header" style={{ border: 'none' }}>
          <h2 className={`section-title ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ border: 'none' }}>
            A Vantagem <span className="grad-text">Desleal</span>
          </h2>
          <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`} style={{ border: 'none' }}>
            Nós não somos seus sócios. O dinheiro do seu suor deve ficar no seu bolso.
          </p>
        </div>

        <div className={`vs-container ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          {/* O Passado (Concorrência) */}
          <div className="vs-side">
            <h4>Plataformas Comuns</h4>
            {/* BLINDAGEM INLINE DE LIST STYLE (Remove as bolinhas) */}
            <ul className="vs-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ listStyle: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: 'var(--neon-red)', fontWeight: 800 }}>✕</span> Cobram até R$ 1,49 fixo</li>
              <li style={{ listStyle: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: 'var(--neon-red)', fontWeight: 800 }}>✕</span> Comem de 5% a 10% da venda</li>
              <li style={{ listStyle: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: 'var(--neon-red)', fontWeight: 800 }}>✕</span> Taxas variáveis ocultas</li>
              <li style={{ listStyle: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: 'var(--neon-red)', fontWeight: 800 }}>✕</span> Cobram mensalidade cara</li>
            </ul>
          </div>

          {/* O Presente (Zenyx Ticket) */}
          <div className="vs-center">
            <div className="ticket-badge">NA ZENYX VIPS VOCÊ PAGA</div>
            <div className="ticket-price">R$ 0,60</div>
            <div className="ticket-sub">TAXA FIXA POR VENDA</div>
            {/* BLINDAGEM INLINE DE LIST STYLE (Remove as bolinhas) */}
            <ul className="vs-list" style={{ listStyle: 'none', padding: 0, margin: '0 auto', textAlign: 'left', opacity: 0.9, width: 'max-content' }}>
              <li style={{ listStyle: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>✓</span> Zero porcentagem na venda</li>
              <li style={{ listStyle: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>✓</span> Mensalidade Zero</li>
              <li style={{ listStyle: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>✓</span> Margem intacta</li>
            </ul>
          </div>

          {/* O Futuro (Sua Escala) */}
          <div className="vs-side" style={{ filter: 'none', opacity: 1, borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.02)' }}>
            <h4 style={{ color: 'var(--neon-green)' }}>Seu Crescimento</h4>
            {/* BLINDAGEM INLINE DE LIST STYLE (Remove as bolinhas) */}
            <ul className="vs-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ listStyle: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>Vendeu 10 Reais? Paga R$ 0,60</li>
              <li style={{ listStyle: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>Vendeu 10 Mil? Paga R$ 0,60</li>
              <li style={{ listStyle: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>Previsibilidade absoluta</li>
              <li style={{ listStyle: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>Escala sem medo das taxas</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION: HALL DA FAMA (CARTAS COLECIONÁVEIS 3D)
          ============================================================ */}
      <section id="awards" className="section container">
        <div className="section-header" style={{ border: 'none' }}>
          <h2 className={`section-title ${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`} style={{ border: 'none' }}>
            Hall da <span className="grad-text">Fama</span>
          </h2>
          <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-400' : 'opacity-0'}`} style={{ border: 'none' }}>
            Acompanhe sua evolução e celebre cada marco alcançado. Um símbolo real das suas conquistas digitais.
          </p>
        </div>

        <div className={`awards-area ${isVisible ? 'animate-fade-in-up delay-500' : 'opacity-0'}`}>
          <div className="awards-tabs">
            {awardsData.map((award) => (
              <button 
                key={award.id}
                onClick={() => handleAwardClick(award)}
                className={`award-tab ${activeAward.id === award.id ? 'active' : ''}`}
                style={
                  activeAward.id === award.id 
                    ? { borderColor: award.color, color: award.id === '1M' ? '#000' : award.color } 
                    : {}
                }
              >
                {award.label}
              </button>
            ))}
          </div>

          {/* O Palco da Carta 3D */}
          <div className={`award-stage ${isFlipped ? 'flip' : ''}`}>
            <div className="award-card-container">
              
              {/* Face Frontal */}
              <div 
                className="award-card" 
                style={{ 
                  borderColor: activeAward.color, 
                  boxShadow: `0 30px 60px rgba(0,0,0,0.9), 0 0 50px ${activeAward.color}40`,
                  background: activeAward.id === '1M' ? 'linear-gradient(135deg, #111, #333)' : 'linear-gradient(135deg, #1a1a24, #050507)'
                }}
              >
                <div 
                  className="award-inner" 
                  style={{ 
                    color: activeAward.color, 
                    borderColor: `${activeAward.color}40`,
                    textShadow: activeAward.id === '1M' ? '0 0 20px #fff' : 'none'
                  }}
                >
                  <div className="a-logo" style={{ filter: `drop-shadow(0 0 15px ${activeAward.color})` }}>⚡</div>
                  <div className="a-value">{activeAward.label}</div>
                  <div className="a-label">{activeAward.id === '1M' ? 'Clube do Milhão' : 'Faturamento'}</div>
                </div>
              </div>

              {/* Verso (Usado para o efeito 3D sem quebrar) */}
              <div 
                className="award-card" 
                style={{ 
                  transform: 'rotateY(180deg)',
                  borderColor: activeAward.color, 
                  boxShadow: `0 30px 60px rgba(0,0,0,0.9), 0 0 50px ${activeAward.color}40`,
                  background: activeAward.id === '1M' ? 'linear-gradient(135deg, #111, #333)' : 'linear-gradient(135deg, #1a1a24, #050507)'
                }}
              >
                <div 
                  className="award-inner" 
                  style={{ 
                    color: activeAward.color, 
                    borderColor: `${activeAward.color}40`,
                    textShadow: activeAward.id === '1M' ? '0 0 20px #fff' : 'none'
                  }}
                >
                  <div className="a-logo" style={{ filter: `drop-shadow(0 0 15px ${activeAward.color})` }}>⚡</div>
                  <div className="a-value">{activeAward.label}</div>
                  <div className="a-label">{activeAward.id === '1M' ? 'Clube do Milhão' : 'Faturamento'}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}