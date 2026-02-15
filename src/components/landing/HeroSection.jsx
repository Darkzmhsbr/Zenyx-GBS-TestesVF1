import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// ============================================================
// 📊 DADOS DO MONITOR DE VENDAS AO VIVO (FAKE SALES)
// Simulador de prova social em tempo real com a estética Cosmos Purple
// ============================================================
const fakeSales = [
  { 
    name: "Bruno Nunes", 
    plan: "ACESSO VITALÍCIO VIP", 
    val: "+ R$ 197,00", 
    time: "Agora mesmo", 
    icon: "💳", 
    bg: "rgba(163, 230, 53, 0.1)", 
    col: "var(--neon-green)" 
  },
  { 
    name: "Amanda Silva", 
    plan: "RENOVAÇÃO MENSAL", 
    val: "+ R$ 29,90", 
    time: "Há 2 min", 
    icon: "🔄", 
    bg: "rgba(56, 189, 248, 0.1)", 
    col: "var(--neon-blue)" 
  },
  { 
    name: "Diego Torres", 
    plan: "CANCELAMENTO", 
    val: "- R$ 49,90", 
    time: "Há 15 min", 
    icon: "⚠️", 
    bg: "rgba(251, 113, 133, 0.1)", 
    col: "var(--neon-red)" 
  },
  { 
    name: "Carlos Marques", 
    plan: "ACESSO MENSAL", 
    val: "+ R$ 19,90", 
    time: "Há 22 min", 
    icon: "🚀", 
    bg: "rgba(217, 70, 239, 0.1)", 
    col: "var(--neon-magenta)" 
  }
];

export function HeroSection() {
  // ============================================================
  // ⚙️ ESTADOS E REFERÊNCIAS
  // ============================================================
  const [isVisible, setIsVisible] = useState(false);
  const [activeSales, setActiveSales] = useState([]);
  
  // Refs para manipular a matemática do Efeito 3D Holográfico
  const visualRef = useRef(null);
  const monitorRef = useRef(null);
  const glareRef = useRef(null);
  
  // Ref para controlar o índice infinito das vendas simuladas
  const saleCounter = useRef(0);

  // ============================================================
  // 👁️ OBSERVER: GATILHO DE ANIMAÇÃO DE ENTRADA (FADE-IN)
  // ============================================================
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ============================================================
  // 🔄 MOTOR DE INJEÇÃO CONTÍNUA (MONITOR AO VIVO)
  // ============================================================
  useEffect(() => {
    const spawnSale = () => {
      const data = fakeSales[saleCounter.current % fakeSales.length];
      
      // Cria um item único para o React não se perder na renderização da lista
      const newSale = { ...data, id: saleCounter.current };
      saleCounter.current += 1;

      setActiveSales((prev) => {
        // Insere a nova venda no topo
        const newArray = [newSale, ...prev];
        // Mantém estritamente apenas as 3 últimas vendas visíveis
        if (newArray.length > 3) newArray.pop();
        return newArray;
      });
    };

    // Primeira venda entra rápido
    const initialTimeout = setTimeout(spawnSale, 500);
    // Próximas entram a cada 3.5 segundos
    const interval = setInterval(spawnSale, 3500);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  // ============================================================
  // 📐 MATEMÁTICA DO TILT 3D E DO GLARE (BRILHO FÍSICO)
  // Reage tanto ao mouse no desktop quanto ao toque no celular
  // ============================================================
  const update3DEffect = (clientX, clientY) => {
    if (!visualRef.current || !monitorRef.current || !glareRef.current) return;
    
    // Obtém as coordenadas da área invisível que captura o evento
    const rect = visualRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calcula os eixos de rotação limitando a torção máxima a 15 graus
    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;

    // Aplica o Transform 3D no Monitor
    monitorRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    
    // Aplica o gradiente radial simulando o reflexo da luz (Glare)
    glareRef.current.style.opacity = '1';
    glareRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.12), transparent 60%)`;
  };

  // Eventos de Mouse
  const handleMouseMove = (e) => {
    update3DEffect(e.clientX, e.clientY);
  };

  // Eventos de Toque (Mobile Touch)
  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 0) {
      update3DEffect(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Reseta o 3D para a posição inicial atraente quando tira o mouse/dedo
  const handleMouseLeave = () => {
    if (!monitorRef.current || !glareRef.current) return;
    monitorRef.current.style.transform = "rotateY(-10deg) rotateX(5deg)";
    glareRef.current.style.opacity = '0';
  };

  // Inicia o componente já levemente torcido para induzir a interação 3D
  useEffect(() => {
    if (monitorRef.current) {
      monitorRef.current.style.transform = "rotateY(-10deg) rotateX(5deg)";
    }
  }, []);

  return (
    <section className="hero section container" style={{ position: 'relative' }}>
      
      {/* ============================================================
          GRID PRINCIPAL: STACKED NO MOBILE, LADO A LADO NO DESKTOP
          ============================================================ */}
      <div className="hero-grid">
        
        {/* ============================================================
            LADO ESQUERDO: TEXTOS E CTA (HERO TEXT)
            ============================================================ */}
        <div className={`hero-text ${isVisible ? 'active' : ''}`}>
          
          {/* Pílula de Destaque */}
          <div className={`pill reveal ${isVisible ? 'active' : ''}`}>
            <span className="spark"></span> MENOR TAXA DO MERCADO (R$ 0,60)
          </div>
          
          {/* Título Monumental */}
          <h1 className={`reveal ${isVisible ? 'active delay-100' : ''}`}>
            O Futuro das Vendas no <span className="text-gradient">Telegram</span> Chegou
          </h1>
          
          {/* Subtítulo Base */}
          <p className={`reveal ${isVisible ? 'active delay-200' : ''}`}>
            Automatize suas vendas, gerencie seus clientes e escale seu negócio 
            com a plataforma mais completa e indestrutível de bots para Telegram.
          </p>
          
          {/* Ações (CTA Principal Isolado para Conversão Máxima) */}
          <div className={`hero-ctas reveal ${isVisible ? 'active delay-300' : ''}`}>
            <Link to="/register" style={{ textDecoration: 'none', width: '100%' }}>
              <button className="btn-glow hero-btn" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                Criar Conta Grátis
                <ArrowRight size={20} />
              </button>
            </Link>
          </div>

          {/* Badges de Prova Social e Confiança */}
          <div className={`trust-badges reveal ${isVisible ? 'active delay-400' : ''}`}>
            <div className="t-badge">
              <div className="dot" style={{ background: 'var(--neon-green)', boxShadow: '0 0 10px var(--neon-green)' }}></div> 
              500+ Bots Ativos
            </div>
            <div className="t-badge">
              <div className="dot" style={{ background: 'var(--neon-magenta)', boxShadow: '0 0 10px var(--neon-magenta)' }}></div> 
              R$ 50.000+ em Vendas
            </div>
            <div className="t-badge">
              <div className="dot" style={{ background: 'var(--neon-blue)', boxShadow: '0 0 10px var(--neon-blue)' }}></div> 
              1.200+ Usuários
            </div>
          </div>
          
        </div>

        {/* ============================================================
            LADO DIREITO: O MONITOR DE VENDAS 3D AO VIVO
            O Scaler resolve o problema de esmagamento no celular
            ============================================================ */}
        <div 
          className={`hero-visual reveal ${isVisible ? 'active delay-300' : ''}`}
          ref={visualRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseLeave}
        >
          {/* Isolamento de escala para responsividade sem quebrar os eixos 3D */}
          <div className="monitor-scaler">
            
            {/* O Invólucro que gira matematicamente (Tilt Engine) */}
            <div className="monitor-wrapper" id="liveCard" ref={monitorRef}>
              
              {/* Camada Física do Brilho Holográfico que segue o mouse */}
              <div className="monitor-glare" id="glare" ref={glareRef}></div>
              
              {/* O Vidro Principal (Placa Glassmorphism Premium) */}
              <div className="monitor-glass">
                
                {/* Header do Monitor: Título e Status Online Piscante */}
                <div className="monitor-header">
                  <h3>Monitor de Vendas Ao Vivo</h3>
                  <div className="online-badge">
                    <span className="dot"></span> ONLINE
                  </div>
                </div>
                
                {/* O Corpo onde as Transações Falsas (Fake Sales) pulam na tela */}
                <div className="monitor-body" id="monitorList">
                  
                  {activeSales.map((sale) => {
                    // Preço negativo fica em vermelho, positivo herda a cor do ícone
                    const valColor = sale.val.includes('-') ? 'var(--neon-red)' : sale.col;

                    return (
                      <div key={sale.id} className="transaction-item">
                        
                        {/* Lado Esquerdo da Transação (Ícone, Nome e Plano) */}
                        <div className="t-left">
                          <div 
                            className="t-icon" 
                            style={{ background: sale.bg, color: sale.col }}
                          >
                            {sale.icon}
                          </div>
                          <div>
                            <div className="t-name">{sale.name}</div>
                            <div className="t-plan">{sale.plan}</div>
                          </div>
                        </div>
                        
                        {/* Lado Direito da Transação (Valor em Moeda e Tempo) */}
                        <div className="t-right">
                          <div className="t-val" style={{ color: valColor }}>
                            {sale.val}
                          </div>
                          <div className="t-time">{sale.time}</div>
                        </div>
                        
                      </div>
                    );
                  })}

                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ============================================================
          SCROLL INDICATOR (OPCIONAL: MANTIDO E REVISADO)
          ============================================================ */}
      <div 
        className={`reveal ${isVisible ? 'active delay-500' : ''}`} 
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'bounceDown 2.5s infinite ease-in-out'
        }}
      >
        <div style={{
          width: '2px',
          height: '40px',
          background: 'linear-gradient(to bottom, var(--neon-magenta), transparent)',
          borderRadius: '2px'
        }} />
        <span style={{
          fontFamily: 'var(--font-code)',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.2em'
        }}>
          Scroll
        </span>
      </div>

    </section>
  );
}