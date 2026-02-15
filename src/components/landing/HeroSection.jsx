import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Dados simulados para as notificações do Celular 3D (Zenyx VIPs)
const notificationsData = [
  { name: "Bruno N.", plan: "ACESSO MENSAL", val: "+ R$ 17,90", icon: "💳", color: "var(--neon-green)" },
  { name: "Fernanda R.", plan: "VITALÍCIO VIP", val: "+ R$ 97,00", icon: "💎", color: "var(--neon-blue)" },
  { name: "Carlos M.", plan: "RENOVAÇÃO", val: "+ R$ 29,90", icon: "🚀", color: "var(--neon-purple)" },
  { name: "Diego T.", plan: "CANCELADO", val: "- R$ 14,90", icon: "⚠️", color: "var(--neon-red)" }
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeNotifs, setActiveNotifs] = useState([]);
  
  // Refs para o efeito 3D do Celular
  const visualRef = useRef(null);
  const phoneRef = useRef(null);
  const glareRef = useRef(null);
  
  // Ref para controlar o ciclo das notificações
  const notifCounter = useRef(0);

  // Efeito de entrada inicial
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Lógica das notificações pulando na tela do celular
  useEffect(() => {
    const spawnNotification = () => {
      const data = notificationsData[notifCounter.current % notificationsData.length];
      
      // Cria um novo item com ID único para animação perfeita no React
      const newNotif = { ...data, id: notifCounter.current };
      notifCounter.current += 1;

      setActiveNotifs((prev) => {
        const newArray = [newNotif, ...prev];
        // Mantém apenas as 3 últimas notificações na tela para não estourar
        if (newArray.length > 3) newArray.pop();
        return newArray;
      });
    };

    // Inicia rápido e depois a cada 3 segundos
    const initialTimeout = setTimeout(spawnNotification, 500);
    const interval = setInterval(spawnNotification, 3000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  // Lógica Unificada do Efeito 3D Holográfico (Para Mouse e Touch/Mobile)
  const update3DEffect = (clientX, clientY) => {
    if (!visualRef.current || !phoneRef.current || !glareRef.current) return;
    
    const rect = visualRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;

    phoneRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    glareRef.current.style.background = `linear-gradient(${135 + (rotateX * 2)}deg, rgba(255,255,255,0.2) 0%, transparent 50%)`;
  };

  const handleMouseMove = (e) => {
    update3DEffect(e.clientX, e.clientY);
  };

  // Suporte a toque na tela para girar o celular no mobile
  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 0) {
      update3DEffect(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMouseLeave = () => {
    if (!phoneRef.current || !glareRef.current) return;
    phoneRef.current.style.transform = "rotateY(-15deg) rotateX(10deg)";
    glareRef.current.style.background = "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%)";
  };

  // Setup inicial do 3D
  useEffect(() => {
    if (phoneRef.current) {
      phoneRef.current.style.transform = "rotateY(-15deg) rotateX(10deg)";
    }
  }, []);

  return (
    <section className="hero section-container" style={{ position: 'relative' }}>
      <div className="hero-grid">
        
        {/* ============================================================
            LADO ESQUERDO: CONTEÚDO E TEXTOS
            ============================================================ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Badge */}
          <div className={`hero-badge ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <span className="dot"></span> A menor taxa do mercado (R$ 0,60)
          </div>
          
          {/* Título Principal */}
          <h1 className={`${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            A Automação de Elite<br/>para <span className="grad-text">Telegram</span>
          </h1>
          
          {/* Subtítulo */}
          <p className={`${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            Processe pagamentos, adicione membros automaticamente e escale seu grupo VIP com a infraestrutura mais robusta e segura do mercado.
          </p>
          
          {/* CTA Principal (Isolado e sem o "Ver Demo") */}
          <div className={`${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginTop: '0.25rem'
          }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="hero-btn-primary btn-glow" style={{ padding: '1.1rem 2.2rem', fontSize: '1.05rem', display: 'flex', gap: '8px' }}>
                Criar Automação Grátis
                <ArrowRight size={20} />
              </button>
            </Link>
          </div>

          {/* Indicadores de Confiança */}
          <div className={`${isVisible ? 'animate-fade-in-up delay-400' : 'opacity-0'}`} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.75rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--glass-border)',
            marginTop: '1rem'
          }}>
            {[
              { label: '500+ Bots Ativos', color: 'var(--neon-green)' },
              { label: 'R$ 50.000+ em Vendas', color: 'var(--neon-blue)' },
              { label: '1.200+ Usuários', color: 'var(--neon-purple)' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 10px ${item.color}`,
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: '-3px',
                    borderRadius: '50%',
                    border: `1px solid ${item.color}`,
                    opacity: 0.4,
                    animation: 'pulseRing 2.5s infinite'
                  }} />
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

        </div>

        {/* ============================================================
            LADO DIREITO: SMARTPHONE 3D HOLOGRÁFICO
            ============================================================ */}
        <div 
          className={`hero-visual ${isVisible ? 'animate-scale-in delay-300' : 'opacity-0'}`}
          ref={visualRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove} /* Evento Adicionado para o Celular */
          onTouchEnd={handleMouseLeave}  /* Reseta ao soltar o dedo */
        >
          <div className="phone-wrapper" ref={phoneRef}>
            <div className="phone-glare" ref={glareRef}></div>
            <div className="phone-frame">
              <div className="phone-notch"></div>
              
              {/* Tela do Celular com Dark Mode Premium */}
              <div className="phone-screen">
                {/* Marca D'água */}
                <div className="phone-watermark">⚡</div>
                
                {/* Loop das Notificações Push */}
                {activeNotifs.map((notif) => (
                  <div key={notif.id} className="push-notif">
                    
                    {/* Alinhamento forçado e blindado contra quebra de texto */}
                    <div className="pn-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <div className="pn-icon" style={{ 
                        background: `${notif.color}20`, 
                        color: notif.color, 
                        border: `1px solid ${notif.color}40`,
                        flexShrink: 0 
                      }}>
                        {notif.icon}
                      </div>
                      <div className="pn-text-area" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div className="pn-app" style={{ whiteSpace: 'nowrap' }}>Zenyx VIPs</div>
                        <div className="pn-msg" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {notif.name} pagou
                        </div>
                      </div>
                    </div>

                    <div className="pn-val" style={{ color: notif.color, flexShrink: 0, whiteSpace: 'nowrap', paddingLeft: '8px' }}>
                      {notif.val}
                    </div>

                  </div>
                ))}

              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================
          SCROLL INDICATOR
          ============================================================ */}
      <div className={`${isVisible ? 'animate-fade-in-up delay-500' : 'opacity-0'}`} style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        animation: 'bounceDown 2.5s infinite ease-in-out'
      }}>
        <div style={{
          width: '2px',
          height: '40px',
          background: 'linear-gradient(to bottom, var(--neon-purple), transparent)',
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