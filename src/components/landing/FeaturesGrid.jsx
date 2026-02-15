import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// 🗂️ BASE DE DADOS: ENGENHARIA DE CONVERSÃO
// Matriz de funcionalidades mapeada para o novo "Bento Grid".
// A alternância entre 'b-large' (ocupa 2 colunas) e 'normal' 
// cria o layout assimétrico e moderno do Cosmos Purple.
// ============================================================
const featuresData = [
  {
    id: 'feat-1',
    icon: '⚡',
    title: 'Aprovação em Milissegundos',
    description: 'A latência não existe. O cliente efetua o PIX e nosso sistema aciona os servidores do Telegram instantaneamente para liberar o acesso ao grupo. Sem esperas, sem suporte lotado.',
    size: 'b-large',
    delay: '0.1s',
    bgGradient: 'none'
  },
  {
    id: 'feat-2',
    icon: '📊',
    title: 'Upsell & Bump',
    description: 'Aumente seu Ticket Médio oferecendo produtos adicionais na página de checkout de forma perfeitamente integrada.',
    size: 'normal',
    delay: '0.2s',
    bgGradient: 'none'
  },
  {
    id: 'feat-3',
    icon: '🔗',
    title: 'Smart Tracking',
    description: 'Crie links únicos para Instagram, Facebook e TikTok. Saiba exatamente qual rede social te dá mais retorno financeiro.',
    size: 'normal',
    delay: '0.3s',
    bgGradient: 'none'
  },
  {
    id: 'feat-4',
    icon: '🤖',
    title: 'Remarketing Implacável',
    description: 'Se o lead gerou o PIX e não pagou, a Zenyx cobra ele automaticamente no privado do Telegram 30 minutos depois. É dinheiro que estava perdido voltando pra sua conta.',
    size: 'b-large',
    delay: '0.4s',
    bgGradient: 'linear-gradient(135deg, rgba(217, 70, 239, 0.08), transparent)'
  },
  {
    id: 'feat-5',
    icon: '🎨',
    title: 'Personalização Extrema',
    description: 'Deixe o bot com a sua cara. Adicione suas cores, logotipos, banners e defina o tom de voz perfeito para se comunicar com o seu público-alvo.',
    size: 'b-large',
    delay: '0.5s',
    bgGradient: 'none'
  },
  {
    id: 'feat-6',
    icon: '💳',
    title: 'Gateways Nativos',
    description: 'Conecte sua conta da Pushin Pay ou Mercado Pago em segundos e comece a transacionar sem depender de intermediários.',
    size: 'normal',
    delay: '0.6s',
    bgGradient: 'none'
  },
  {
    id: 'feat-7',
    icon: '🛡️',
    title: 'Criptografia Militar',
    description: 'Seus dados financeiros e as informações dos seus leads são protegidos com criptografia de ponta a ponta em nossos servidores.',
    size: 'normal',
    delay: '0.7s',
    bgGradient: 'none'
  },
  {
    id: 'feat-8',
    icon: '🎧',
    title: 'Suporte Inbox',
    description: 'Responda dúvidas e recupere objeções de vendas conversando diretamente com os leads através de um painel de tickets embutido no Telegram.',
    size: 'b-large',
    delay: '0.8s',
    bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), transparent)'
  }
];

export function FeaturesGrid() {
  // ============================================================
  // ⚙️ ESTADOS E REFERÊNCIAS
  // ============================================================
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // ============================================================
  // 👁️ OBSERVER PARA ANIMAÇÃO DE REVEAL (SCROLL)
  // Só aciona as animações de entrada quando a seção entra na tela
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

  return (
    <section 
      id="recursos" 
      ref={sectionRef} 
      className="section container"
    >
      
      {/* ============================================================
          CABEÇALHO DA SEÇÃO
          ============================================================ */}
      <div className="section-header">
        
        {/* Nova Pílula Neon Cosmos */}
        <div className={`pill ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <span className="spark"></span> INFRAESTRUTURA SÓLIDA
        </div>
        
        <h2 className={`section-title ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
          Engenharia de <span className="text-gradient">Conversão</span>
        </h2>
        
        <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          Esqueça os padrões antigos. Criamos ferramentas e sistemas arquitetados exclusivamente 
          para injetar lucro no seu bolso de forma autônoma.
        </p>
      </div>

      {/* ============================================================
          BENTO GRID (O NOVO PADRÃO DE DESIGN)
          Classes controladas pelo nosso novo LandingPage.css
          ============================================================ */}
      <div className="bento-grid">
        {featuresData.map((feature) => {
          // Determina a classe de tamanho (Se for b-large, ocupa duas colunas)
          const sizeClass = feature.size === 'b-large' ? 'b-large' : '';
          
          return (
            <div
              key={feature.id}
              className={`bento-item ${sizeClass} ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ 
                animationDelay: feature.delay,
                // Aplica um leve gradiente especial em cards de destaque
                background: feature.bgGradient !== 'none' ? feature.bgGradient : ''
              }}
            >
              {/* O Ícone Premium com borda e sombra Glow */}
              <div className="b-icon">
                {feature.icon}
              </div>
              
              <h3 className="b-title">
                {feature.title}
              </h3>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {feature.description}
              </p>
              
            </div>
          );
        })}
      </div>
      
    </section>
  );
}