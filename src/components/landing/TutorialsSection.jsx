import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export function TutorialsSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const tutorials = [
    {
      icon: '🤖',
      title: 'Como Criar Bot no Telegram e Adicionar na ZenyxGbot',
      content: 'Abra o Telegram e procure por @BotFather. Envie o comando /newbot e siga as instruções. Após criar, copie o token fornecido e cole na área de "Novo Bot" no painel ZenyxGbot.'
    },
    {
      icon: '🆔',
      title: 'Como Obter ID de um Canal ou Grupo do Telegram',
      content: 'Adicione o bot @userinfobot ao seu grupo ou canal. Ele enviará automaticamente o ID. Você também pode usar @RawDataBot para obter informações detalhadas.'
    },
    {
      icon: '💳',
      title: 'Como Vincular a Pushin Pay na ZenyxGbot',
      content: 'Acesse sua conta Pushin Pay e copie sua chave de API. No painel ZenyxGbot, vá em Integrações > Pushin Pay e cole sua chave. Ative a integração e configure o split de pagamento.'
    },
    {
      icon: '🔗',
      title: 'Como Criar Sistema de Redirecionamento',
      content: 'Acesse Rastreamento > Redirecionamento. Crie uma pasta com nome da plataforma (ex: Instagram). Dentro da pasta, crie links específicos (Stories, Feed, Bio). O sistema gerará links rastreáveis como t.me/SeuBot?start=codigo.'
    },
    {
      icon: '📊',
      title: 'Como Acompanhar o Funil de Vendas',
      content: 'No menu Funil, você verá 3 estágios: Topo (Lead Frio - apenas deu start), Meio (Lead Quente - gerou PIX mas não pagou), Fundo (Cliente - assinantes ativos). Monitore a conversão entre cada etapa.'
    },
    {
      icon: '♻️',
      title: 'Como Configurar Remarketing',
      content: 'Em Remarketing, crie campanhas segmentadas por estágio do funil. Envie mensagens automáticas para leads quentes que não converteram. Configure ofertas especiais e acompanhe os resultados.'
    },
    {
      icon: '🔔',
      title: 'Como Configurar Notificações em seu Dispositivo',
      content: 'Ative as notificações do navegador quando solicitado. Para notificações no Telegram, configure um webhook em Integrações > Webhooks e vincule ao seu bot pessoal.'
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

  const toggleTutorial = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="tutoriais" ref={sectionRef} className="section-container">
      <div className={`section-header ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <span style={{
          display: 'inline-block',
          color: 'var(--primary)',
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          Central de Ajuda
        </span>
        <h2 className="section-title">
          Tutoriais{' '}
          <span style={{
            background: 'linear-gradient(90deg, var(--primary) 0%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Passo a Passo
          </span>
        </h2>
        <p className="section-subtitle">
          Aprenda a usar todos os recursos da plataforma com nossos tutoriais detalhados.
        </p>
      </div>

      <div className="tutorials-list">
        {tutorials.map((tutorial, index) => (
          <div key={index} className={`tutorial-item ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="tutorial-header" onClick={() => toggleTutorial(index)}>
              <div className="tutorial-icon">{tutorial.icon}</div>
              <h3 className="tutorial-title">{tutorial.title}</h3>
              <ChevronDown 
                size={24} 
                className={`tutorial-toggle ${openIndex === index ? 'active' : ''}`}
              />
            </div>
            <div className={`tutorial-content ${openIndex === index ? 'active' : ''}`}>
              <div className="tutorial-content-inner">
                {tutorial.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
