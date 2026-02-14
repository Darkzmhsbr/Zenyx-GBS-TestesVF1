import React, { useState, useEffect, useRef } from 'react';

export function FAQSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const faqs = [
    {
      question: '❓ Por onde recebo os pagamentos?',
      answer: 'Os pagamentos são processados via Pushin Pay e caem diretamente na sua conta bancária vinculada. Você tem controle total sobre seus recebimentos.'
    },
    {
      question: '❓ Qual é a taxa da plataforma?',
      answer: 'Apenas R$ 0,60 por venda - a menor taxa do mercado! Sem mensalidades, sem taxas escondidas. Você só paga quando vende.'
    },
    {
      question: '❓ Por que a taxa é tão baixa?',
      answer: 'Nosso modelo de negócio é baseado em volume, não em margens altas. Quanto mais você vende, mais nós crescemos juntos.'
    },
    {
      question: '❓ Como posso confiar em vocês?',
      answer: 'Sistema 100% transparente com dashboard completo, suporte dedicado e milhares de transações processadas. Seus dados são protegidos com criptografia de ponta.'
    },
    {
      question: '❓ Posso vender conteúdos adultos?',
      answer: 'Sim, nossa plataforma permite vendas de conteúdo +18 dentro da legalidade. Respeitamos a privacidade e liberdade dos criadores.'
    },
    {
      question: '❓ Como funciona o sistema de redirecionamento?',
      answer: 'Você cria pastas organizadas por plataforma (Instagram, Facebook, TikTok, etc) e dentro delas cria links específicos (Stories, Feed, Bio). Cada link é rastreável e você acompanha cliques e vendas.'
    },
    {
      question: '❓ Preciso de conhecimento técnico?',
      answer: 'Não! Tudo é configurado via interface intuitiva com tutoriais completos. Se você sabe usar Telegram, consegue usar o Zenyx.'
    },
    {
      question: '❓ Posso gerenciar múltiplos bots?',
      answer: 'Sim! Você pode criar e gerenciar quantos bots precisar, cada um com suas próprias configurações e estatísticas.'
    },
    {
      question: '❓ Tem período de teste grátis?',
      answer: 'Sim! Crie sua conta gratuitamente e só pague a taxa de R$ 0,60 quando realizar uma venda. Sem risco, sem compromisso.'
    },
    {
      question: '❓ Como funciona o suporte?',
      answer: 'Suporte via Telegram e e-mail com atendimento rápido. Nossa equipe está disponível para ajudar com qualquer dúvida.'
    }
  ];

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
    <section id="faq" ref={sectionRef} className="section-container">
      <div className={`section-header ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <span style={{
          display: 'inline-block',
          color: '#10b981',
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          Dúvidas Frequentes
        </span>
        <h2 className="section-title">
          Perguntas{' '}
          <span style={{
            background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Frequentes
          </span>
        </h2>
        <p className="section-subtitle">
          Encontre respostas para as dúvidas mais comuns sobre a plataforma.
        </p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <div
              key={index}
              className={`faq-item ${isVisible ? (isEven ? 'animate-slide-in-left' : 'animate-slide-in-right') : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="faq-question">{faq.question}</h3>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}