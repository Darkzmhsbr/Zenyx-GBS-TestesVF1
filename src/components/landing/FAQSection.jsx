import React from 'react';

export function FAQSection() {
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

  return (
    <section id="faq" className="section-container">
      <div className="section-header">
        <h2 className="section-title">Perguntas Frequentes</h2>
        <p className="section-subtitle">Tudo que você precisa saber sobre a ZenyxGbot</p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item fade-in">
            <h3 className="faq-question">{faq.question}</h3>
            <p className="faq-answer">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}