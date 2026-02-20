import React, { useState, useEffect, useRef } from 'react';
import { publicService } from '../../services/api';

// ============================================================
// 🛡️ FILTRO AGRESSIVO DE NOMES DE PLANOS (+18 / ADULTO) 
// Mantido 100% intacto e inalterado para segurança da plataforma.
// Garante que nomes de planos inadequados não quebrem as políticas.
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
// 🏆 DADOS DAS PREMIAÇÕES DO HALL DA FAMA (COM IMAGENS DE PLACAS)
// ============================================================
const awardsData = [
  { id: '10k', label: '10K', color: '#10b981', image: '/placas/placa10k-conquistado.png' },
  { id: '50k', label: '50K', color: 'var(--neon-blue)', image: '/placas/placa50k-conquistado.png' },
  { id: '100k', label: '100K', color: 'var(--neon-purple)', image: '/placas/placa100k-conquistado.png' },
  { id: '500k', label: '500K', color: 'var(--neon-gold)', image: '/placas/placa500k-conquistado.png' },
  { id: '1M', label: '1 MILHÃO', color: '#ffffff', image: '/placas/placa1M-conquistado.png' },
  { id: '10M', label: '10 MILHÕES', color: '#c333ff', image: '/placas/placa10M-conquistado.png' }
];

// ============================================================
// COMPONENTE PRINCIPAL (ACTIVITY FEED / TAXAS E HALL DA FAMA)
// ============================================================
export function ActivityFeed() {
  // Mantemos os states originais do Feed de Vendas no background para uso futuro da plataforma
  const [activities, setActivities] = useState([]);
  const [displayedActivities, setDisplayedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // States exclusivos da Carta 3D Giratória
  const [activeAward, setActiveAward] = useState(awardsData[1]); // Inicia no 50K
  const [isFlipped, setIsFlipped] = useState(false);

  // Intersection Observer para disparar animações
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

  // Fetch das atividades de vendas via API (Mantido para integridade arquitetural)
  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // Handler que aciona a rotação 3D da carta e atualiza as cores Neon
  const handleAwardClick = (award) => {
    if (award.id === activeAward.id) return; // Se já tá no mesmo, ignora
    setActiveAward(award);
    setIsFlipped(!isFlipped); // Inverte a carta para o efeito 3D (flip)
  };

  return (
    <div ref={sectionRef}>
      
      {/* ============================================================
          SECTION 1: TAXAS (A VANTAGEM DESLEAL - HOLOGRAM TICKET)
          ============================================================ */}
      <section id="pricing" className="section container">
        <div className="section-header">
          <h2 className={`section-title ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            A Vantagem <span className="text-gradient">Desleal</span>
          </h2>
          <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            Nós não somos seus sócios. Fique com a margem de lucro que você suou para conquistar.
          </p>
        </div>

        <div className={`vs-container ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          
          {/* Lado Esquerdo: Concorrência */}
          <div className="vs-side">
            <h4 style={{ color: 'var(--neon-red)', fontFamily: 'var(--font-display)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Concorrência
            </h4>
            <ul className="vs-list">
              <li><span style={{ color: 'var(--neon-red)', fontWeight: 800 }}>✕</span> Cobram até R$ 1,49 fixo</li>
              <li><span style={{ color: 'var(--neon-red)', fontWeight: 800 }}>✕</span> Comem 10% da sua venda</li>
              <li><span style={{ color: 'var(--neon-red)', fontWeight: 800 }}>✕</span> Mensalidades abusivas</li>
            </ul>
          </div>

          {/* O Centro: Ticket Zenyx VIPs */}
          <div className="vs-center">
            <div className="ticket-badge">NA ZENYX VIPS VOCÊ PAGA</div>
            <div className="ticket-price">R$ 0,60</div>
            <div className="ticket-sub">TAXA FIXA POR VENDA APROVADA</div>
            <ul className="vs-list" style={{ opacity: 0.9 }}>
              <li><span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>✓</span> Zero porcentagem na venda</li>
              <li><span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>✓</span> Mensalidade Zero</li>
              <li><span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>✓</span> Margem 100% intacta</li>
            </ul>
          </div>

          {/* Lado Direito: A Escala */}
          <div className="vs-side" style={{ opacity: 1, borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.02)' }}>
            <h4 style={{ color: 'var(--neon-green)', fontFamily: 'var(--font-display)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Seu Crescimento
            </h4>
            <ul className="vs-list">
              <li><span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>✓</span> Vendeu R$ 10? Paga R$ 0,60</li>
              <li><span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>✓</span> Vendeu R$ 1 Mil? Paga R$ 0,60</li>
              <li><span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>✓</span> Escala livre de amarras</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: HALL DA FAMA (CARTA 3D GIRATÓRIA ORIGINAL)
          ============================================================ */}
      <section id="hall" className="section container">
        <div className="section-header">
          <h2 className={`section-title ${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
            Hall da <span className="text-gradient">Fama</span>
          </h2>
          <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
            Acompanhe sua evolução e celebre cada marco alcançado. Um símbolo real das suas conquistas digitais.
          </p>
        </div>

        <div className={`awards-area ${isVisible ? 'animate-fade-in-up delay-500' : 'opacity-0'}`}>
          
          {/* Abas Superiores de Seleção de Marco */}
          <div className="awards-tabs">
            {awardsData.map((award) => (
              <button 
                key={award.id}
                onClick={() => handleAwardClick(award)}
                className={`award-tab ${activeAward.id === award.id ? 'active' : ''}`}
                style={
                  activeAward.id === award.id 
                    ? { 
                        borderColor: award.color, 
                        color: 'var(--text-main)',
                        background: 'rgba(255,255,255,0.05)',
                        boxShadow: `0 0 20px ${award.color}40`
                      } 
                    : {}
                }
              >
                {award.label}
              </button>
            ))}
          </div>

          {/* O Palco da Carta 3D - Flips ao clicar na aba */}
          <div 
            className={`award-stage ${isFlipped ? 'flip' : ''}`} 
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="award-card-container">
              
              {/* FACE FRONTAL DA CARTA */}
              <div 
                className="award-card" 
                style={{ 
                  borderColor: activeAward.color, 
                  boxShadow: `0 30px 60px rgba(0,0,0,0.9), 0 0 50px ${activeAward.color}40`,
                  background: 'linear-gradient(135deg, var(--bg-panel), var(--bg-base))'
                }}
              >
                <div 
                  className="award-inner" 
                  style={{ 
                    color: activeAward.color, 
                    borderColor: `${activeAward.color}40`
                  }}
                >
                  {activeAward.image ? (
                    <img 
                      src={activeAward.image} 
                      alt={`Placa ${activeAward.label}`} 
                      className="award-placa-img"
                    />
                  ) : (
                    <>
                      <div className="a-logo" style={{ boxShadow: `inset 0 0 15px ${activeAward.color}30`, background: `${activeAward.color}10` }}>⚡</div>
                      <div className="a-value" style={{ textShadow: `0 0 20px ${activeAward.color}50` }}>{activeAward.label}</div>
                      <div className="a-label">Faturamento</div>
                    </>
                  )}
                </div>
              </div>

              {/* VERSO DA CARTA */}
              <div 
                className="award-card back" 
                style={{ 
                  transform: 'rotateY(180deg)',
                  borderColor: activeAward.color, 
                  boxShadow: `0 30px 60px rgba(0,0,0,0.9), 0 0 50px ${activeAward.color}40`,
                  background: 'linear-gradient(135deg, var(--bg-panel), var(--bg-base))'
                }}
              >
                <div 
                  className="award-inner" 
                  style={{ 
                    color: activeAward.color, 
                    borderColor: `${activeAward.color}40`
                  }}
                >
                  {activeAward.image ? (
                    <img 
                      src={activeAward.image} 
                      alt={`Placa ${activeAward.label}`} 
                      className="award-placa-img"
                    />
                  ) : (
                    <>
                      <div className="a-logo" style={{ boxShadow: `inset 0 0 15px ${activeAward.color}30`, background: `${activeAward.color}10` }}>⚡</div>
                      <div className="a-value" style={{ textShadow: `0 0 20px ${activeAward.color}50` }}>{activeAward.label}</div>
                      <div className="a-label">Faturamento</div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </section>

    </div>
  );
}