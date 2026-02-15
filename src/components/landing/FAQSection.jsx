import React, { useState, useEffect, useRef } from 'react';

// O seu array original foi mantido 100% intacto
const faqs = [
  { q: '❓ Por onde recebo os pagamentos?', a: 'Os pagamentos são processados via Pushin Pay e caem diretamente na sua conta bancária vinculada. Você tem controle total sobre seus recebimentos.' },
  { q: '❓ Qual é a taxa da plataforma?', a: 'Apenas R$ 0,60 por venda — a menor taxa do mercado! Sem mensalidades, sem taxas escondidas. Você só paga quando vende.' },
  { q: '❓ Por que a taxa é tão baixa?', a: 'Nosso modelo de negócio é baseado em volume, não em margens altas. Quanto mais você vende, mais nós crescemos juntos.' },
  { q: '❓ Como posso confiar em vocês?', a: 'Sistema 100% transparente com dashboard completo, suporte dedicado e milhares de transações processadas com segurança.' },
  { q: '❓ Posso vender conteúdos adultos?', a: 'Sim, nossa plataforma permite vendas de conteúdo +18 dentro da legalidade. Respeitamos a privacidade e liberdade dos criadores.' },
  { q: '❓ Como funciona o sistema de redirecionamento?', a: 'Você cria pastas organizadas por plataforma e dentro delas cria links específicos. Cada link é rastreável e você acompanha cliques e vendas de cada fonte.' },
  { q: '❓ Preciso de conhecimento técnico?', a: 'Não! Tudo é configurado via interface intuitiva com tutoriais completos. Se você sabe usar Telegram, consegue usar o Zenyx.' },
  { q: '❓ Posso gerenciar múltiplos bots?', a: 'Sim! Você pode criar e gerenciar quantos bots precisar, cada um com suas próprias configurações e estatísticas independentes.' },
  { q: '❓ Tem período de teste grátis?', a: 'Sim! Crie sua conta gratuitamente e só pague a taxa de R$ 0,60 quando realizar uma venda. Sem risco, sem compromisso.' },
  { q: '❓ Como funciona o suporte?', a: 'Suporte via Telegram e e-mail com atendimento rápido. Nossa equipe está disponível para ajudar com qualquer dúvida técnica.' },
];

export function FAQSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState(null); // Controla qual FAQ está aberto
  const sectionRef = useRef(null);

  // Intersection Observer para disparar a animação ao scrollar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting) setIsVisible(true); 
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Lógica do Acordeão (Fecha o atual se clicar de novo, ou abre o novo)
  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" ref={sectionRef} className="section-container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
      <div className="section-header">
        
        {/* Badge Elite */}
        <div 
          className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} 
          style={{ 
            color: 'var(--neon-blue)', 
            fontFamily: 'var(--font-code)', 
            fontSize: '0.85rem', 
            marginBottom: '1rem', 
            border: '1px solid var(--neon-blue)', 
            padding: '4px 14px', 
            borderRadius: '100px', 
            display: 'inline-block',
            boxShadow: 'inset 0 0 10px rgba(56, 189, 248, 0.1)'
          }}
        >
          Dúvidas Frequentes
        </div>
        
        <h2 className={`section-title ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
          Perguntas <span className="grad-text">Frequentes</span>
        </h2>
        
        <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          Encontre respostas para as dúvidas mais comuns sobre a plataforma.
        </p>
      </div>

      <div className="faq-wrapper">
        {faqs.map((faq, index) => (
          <div
            key={index}
            // Adiciona a classe 'open' se for o index ativo, acendendo o Neon Roxo do CSS
            className={`faq-item ${openIndex === index ? 'open' : ''} ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: `${(index * 0.05) + 0.3}s` }}
          >
            <button 
              className="faq-btn" 
              onClick={() => toggleFaq(index)}
            >
              {/* Ocultamos o emoji ❓ dinamicamente para o design ficar mais Cyber/Clean */}
              {faq.q.replace('❓ ', '')} 
              <span className="faq-icon">+</span>
            </button>
            
            {/* O corpo do FAQ que usa CSS Grid para deslizar suavemente */}
            <div className="faq-body">
              <div className="faq-content">
                <div className="faq-text">
                  {faq.a}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}