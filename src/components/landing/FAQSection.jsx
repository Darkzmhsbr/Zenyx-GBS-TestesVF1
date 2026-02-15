import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// 📚 BASE DE DADOS DO FAQ (FREQUENTLY ASKED QUESTIONS)
// Array 100% preservado com todas as respostas originais.
// Expandido em múltiplas linhas para melhor legibilidade e manutenção.
// ============================================================
const faqs = [
  { 
    q: '❓ Por onde recebo os pagamentos?', 
    a: 'Os pagamentos são processados via Pushin Pay e caem diretamente na sua conta bancária vinculada. Você tem controle total sobre seus recebimentos.' 
  },
  { 
    q: '❓ Qual é a taxa da plataforma?', 
    a: 'Apenas R$ 0,60 por venda — a menor taxa do mercado! Sem mensalidades, sem taxas escondidas. Você só paga quando vende.' 
  },
  { 
    q: '❓ Por que a taxa é tão baixa?', 
    a: 'Nosso modelo de negócio é baseado em volume, não em margens altas. Quanto mais você vende, mais nós crescemos juntos.' 
  },
  { 
    q: '❓ Como posso confiar em vocês?', 
    a: 'Sistema 100% transparente com dashboard completo, suporte dedicado e milhares de transações processadas com segurança.' 
  },
  { 
    q: '❓ Posso vender conteúdos adultos?', 
    a: 'Sim, nossa plataforma permite vendas de conteúdo +18 dentro da legalidade. Respeitamos a privacidade e liberdade dos criadores.' 
  },
  { 
    q: '❓ Como funciona o sistema de redirecionamento?', 
    a: 'Você cria pastas organizadas por plataforma e dentro delas cria links específicos. Cada link é rastreável e você acompanha cliques e vendas de cada fonte.' 
  },
  { 
    q: '❓ Preciso de conhecimento técnico?', 
    a: 'Não! Tudo é configurado via interface intuitiva com tutoriais completos. Se você sabe usar Telegram, consegue usar a Zenyx.' 
  },
  { 
    q: '❓ Posso gerenciar múltiplos bots?', 
    a: 'Sim! Você pode criar e gerenciar quantos bots precisar, cada um com suas próprias configurações e estatísticas independentes.' 
  },
  { 
    q: '❓ Tem período de teste grátis?', 
    a: 'Sim! Crie sua conta gratuitamente e só pague a taxa de R$ 0,60 quando realizar uma venda. Sem risco, sem compromisso.' 
  },
  { 
    q: '❓ Como funciona o suporte?', 
    a: 'Suporte via Telegram e e-mail com atendimento rápido. Nossa equipe está disponível para ajudar com qualquer dúvida técnica.' 
  },
];

export function FAQSection() {
  // ============================================================
  // ⚙️ ESTADOS E REFERÊNCIAS
  // ============================================================
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState(null); // Controla qual FAQ está expandido
  const sectionRef = useRef(null);

  // ============================================================
  // 👁️ OBSERVER PARA ANIMAÇÃO DE REVEAL (SCROLL)
  // Aciona a renderização dos elementos assim que entram na tela
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
  // 🔄 FUNÇÃO DE TOGGLE (ACORDEÃO COMPORTAMENTO EXCLUSIVO)
  // ============================================================
  const toggleFaq = (index) => {
    // Se clicar no que já está aberto, ele fecha. Se clicar em outro, ele abre o novo e fecha o anterior.
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      id="faq" 
      ref={sectionRef} 
      className="section container" 
      style={{ paddingTop: '8rem', paddingBottom: '8rem' }}
    >
      
      {/* ============================================================
          CABEÇALHO DA SEÇÃO (COM NOVA IDENTIDADE COSMOS PURPLE)
          ============================================================ */}
      <div className="section-header">
        
        {/* Nova Pílula de Destaque com Sparkle Neon */}
        <div 
          className={`pill ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} 
          style={{ marginBottom: '1.5rem' }}
        >
          <span 
            className="spark" 
            style={{ 
              background: 'var(--neon-purple)', 
              boxShadow: '0 0 10px var(--neon-purple)' 
            }}
          ></span>
          DÚVIDAS FREQUENTES
        </div>
        
        {/* Título com Texto Gradiente */}
        <h2 className={`section-title ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
          Perguntas <span className="text-gradient">Frequentes</span>
        </h2>
        
        {/* Subtítulo Clean */}
        <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          Encontre respostas rápidas para as dúvidas mais comuns sobre o ecossistema da plataforma.
        </p>
      </div>

      {/* ============================================================
          LISTA DE ACORDEÕES (FAQ GLOW ENGINE)
          Utiliza CSS Grid native do novo LandingPage.css para deslize
          ============================================================ */}
      <div className="faq-list">
        {faqs.map((faq, index) => {
          // Verifica se o item atual é o que está aberto no state
          const isOpen = openIndex === index;
          
          return (
            <div
              key={index}
              // A classe 'open' ativa o bordeamento Neon e a abertura do Grid no CSS Global
              className={`faq-item ${isOpen ? 'open' : ''} ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${(index * 0.05) + 0.2}s` }}
            >
              
              {/* Botão de Controle (Header do Acordeão) */}
              <button 
                className="faq-btn" 
                onClick={() => toggleFaq(index)}
              >
                {/* Remove o Emoji dinamicamente para manter o design focado e limpo */}
                <span>{faq.q.replace('❓ ', '')}</span>
                
                {/* Ícone de Expansão que rotaciona 45 graus (CSS) formando um 'X' vermelho */}
                <span className="faq-icon">+</span>
              </button>
              
              {/* O Corpo Oculto (Utiliza Grid template-rows 0fr -> 1fr) */}
              <div className="faq-body">
                <div className="faq-content">
                  <div className="faq-text">
                    {faq.a}
                  </div>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>

    </section>
  );
}