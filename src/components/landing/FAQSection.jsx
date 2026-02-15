import React, { useState, useEffect, useRef } from 'react';

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
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="faq" ref={sectionRef} className="section-container">
      <div className="section-header">
        <div className={`section-label ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          Dúvidas Frequentes
        </div>
        <h2 className={`section-title ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
          Perguntas <span className="grad-text">Frequentes</span>
        </h2>
        <p className={`section-subtitle ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          Encontre respostas para as dúvidas mais comuns sobre a plataforma.
        </p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${isVisible ? (index % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right') : 'opacity-0'}`}
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <h3 className="faq-question">{faq.q}</h3>
            <p className="faq-answer">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}