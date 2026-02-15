import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// 🌟 COMPONENTE: VITRINE ZENYX (O MINI-APP NATIVO DO TELEGRAM)
// Exibe os super poderes do bot rodando dentro do chat
// ============================================================
export function VitrineSection() {
  // Estados de Animação de Entrada
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Referências para o Efeito 3D Holográfico do Celular
  const visualRef = useRef(null);
  const phoneRef = useRef(null);
  const glareRef = useRef(null);

  // ============================================================
  // 👁️ OBSERVER: GATILHO DE ANIMAÇÃO DE ENTRADA
  // ============================================================
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

  // ============================================================
  // 📐 MATEMÁTICA DO TILT 3D E GLARE (INTERAÇÃO COM O MOUSE/DEDO)
  // ============================================================
  const update3DEffect = (clientX, clientY) => {
    if (!visualRef.current || !phoneRef.current) return;
    
    const rect = visualRef.current.getBoundingClientRect();
    const x = clientX - rect.left; 
    const y = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;

    // Aplica o 3D somando com a inclinação base (-15deg Y e 5deg X)
    phoneRef.current.style.transform = `rotateX(${5 + rotateX}deg) rotateY(${-15 + rotateY}deg)`;

    // Move o reflexo de luz
    if (glareRef.current) {
      glareRef.current.style.opacity = '1';
      glareRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.12), transparent 60%)`;
    }
  };

  const handleMouseMove = (e) => update3DEffect(e.clientX, e.clientY);
  
  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 0) {
      update3DEffect(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMouseLeave = () => {
    if (!phoneRef.current) return;
    // Retorna para a posição estilosa inicial
    phoneRef.current.style.transform = "rotateY(-15deg) rotateX(5deg)";
    if (glareRef.current) glareRef.current.style.opacity = '0';
  };

  // Setup inicial da inclinação
  useEffect(() => {
    if (phoneRef.current) {
      phoneRef.current.style.transform = "rotateY(-15deg) rotateX(5deg)";
    }
  }, []);

  return (
    <section id="vitrine" ref={sectionRef} className="vitrine-section">
      <div className="container vitrine-grid">
        
        {/* ============================================================
            LADO ESQUERDO: TEXTOS E BENEFÍCIOS
            ============================================================ */}
        <div className={`reveal ${isVisible ? 'active' : ''}`}>
          
          <div 
            style={{ 
              color: 'var(--neon-magenta)', 
              fontFamily: 'var(--font-code)', 
              fontSize: '0.85rem', 
              marginBottom: '1rem', 
              border: '1px solid var(--neon-magenta)', 
              padding: '4px 14px', 
              borderRadius: '100px', 
              display: 'inline-block' 
            }}
          >
            Tecnologia Exclusiva
          </div>
          
          <h2 className="section-title">Vitrine <span className="text-gradient">Zenyx</span></h2>
          
          <p className="section-desc" style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
            Sua própria loja virtual operando 100% dentro do Telegram como um Mini-App. 
            Seus clientes navegam, assistem vídeos e pagam sem abrir navegador.
          </p>
          
          <div className="v-feat">
            <div className="v-feat-icon">📱</div>
            <div>
              <h4 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '4px' }}>
                Home com Banners e Cores
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Interface que puxa a cor tema do seu negócio automaticamente. Adicione banners e vídeos de capa.
              </p>
            </div>
          </div>

          <div className="v-feat">
            <div className="v-feat-icon">🎬</div>
            <div>
              <h4 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '4px' }}>
                Categorias com Prévia em Vídeo
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Agrupe seus canais. O cliente assiste a um teaser (trailer) do que ele vai receber antes de comprar.
              </p>
            </div>
          </div>

          <div className="v-feat">
            <div className="v-feat-icon">💳</div>
            <div>
              <h4 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '4px' }}>
                Checkout Integrado
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Geração de PIX Copia e Cola instantâneo com timer. Ofereça um produto extra com um clique (Order Bump).
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================
            LADO DIREITO: CELULAR 3D DO MINI-APP
            ============================================================ */}
        <div 
          className={`mini-app-visual reveal ${isVisible ? 'active delay-200' : ''}`}
          ref={visualRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseLeave}
        >
          <div className="monitor-scaler" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div className="mini-app-mockup" ref={phoneRef}>
              <div className="mini-app-screen">
                
                {/* Cabeçalho do App Falso */}
                <div className="ma-header">
                  <h3 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>
                    Sua Marca VIP
                  </h3>
                </div>
                
                {/* Vídeo / Capa */}
                <div className="ma-hero-video"></div>
                
                {/* Conteúdo */}
                <div className="ma-body">
                  <div className="ma-cat-title">Acesso Premium - Tudo Liberado</div>
                  <div className="ma-desc">Tenha acesso a todos os nossos conteúdos exclusivos e grupos secretos de network.</div>
                  
                  {/* Caixa de Checkout Simulada */}
                  <div className="ma-checkout-box">
                    <div style={{ color: 'var(--neon-green)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      R$ 49,90 <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#888' }}>via PIX</span>
                    </div>
                    
                    <div className="ma-bump">
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--neon-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>✓</div>
                      <div>
                        <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>OFERTA ÚNICA 🔥</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Leve o Pack Bônus por R$ 9,90</div>
                      </div>
                    </div>

                    <button className="ma-btn">GERAR PIX ➔</button>
                  </div>
                </div>
              </div>

              {/* Camada Física do Brilho Holográfico */}
              <div className="monitor-glare" ref={glareRef}></div>
            </div>
            
            {/* O Brilho da Base do Celular */}
            <div className="mini-app-glow-base"></div>

          </div>
        </div>

      </div>
    </section>
  );
}