import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react'; 

// Array 100% preservado com todas as informações originais
const tutorials = [
  { icon: '🤖', title: 'Como Criar Bot no Telegram e Adicionar na Zenyx VIPs', content: 'Abra o Telegram e procure por @BotFather. Envie o comando /newbot e siga as instruções. Após criar, copie o token fornecido e cole na área de "Novo Bot" no painel Zenyx VIPs.' },
  { icon: '🆔', title: 'Como Obter ID de um Canal ou Grupo do Telegram', content: 'Adicione o bot @userinfobot ao seu grupo ou canal. Ele enviará automaticamente o ID. Você também pode usar @RawDataBot para obter informações detalhadas.' },
  { icon: '💳', title: 'Como Vincular a Pushin Pay na Zenyx VIPs', content: 'Acesse sua conta Pushin Pay e copie sua chave de API. No painel Zenyx VIPs, vá em Integrações > Pushin Pay e cole sua chave. Ative a integração e configure o split de pagamento.' },
  { icon: '🔗', title: 'Como Criar Sistema de Redirecionamento', content: 'Acesse Rastreamento > Redirecionamento. Crie uma pasta com nome da plataforma (ex: Instagram). Dentro da pasta, crie links específicos (Stories, Feed, Bio). O sistema gerará links rastreáveis como t.me/SeuBot?start=codigo.' },
  { icon: '📊', title: 'Como Acompanhar o Funil de Vendas', content: 'No menu Funil, você verá 3 estágios: Topo (Lead Frio — apenas deu start), Meio (Lead Quente — gerou PIX mas não pagou), Fundo (Cliente — assinantes ativos). Monitore a conversão entre cada etapa.' },
  { icon: '♻️', title: 'Como Configurar Remarketing', content: 'Em Remarketing, crie campanhas segmentadas por estágio do funil. Envie mensagens automáticas para leads quentes que não converteram. Configure ofertas especiais e acompanhe os resultados.' },
  { icon: '🔔', title: 'Como Configurar Notificações no Dispositivo', content: 'Ative as notificações do navegador quando solicitado. Para notificações no Telegram, configure um webhook em Integrações > Webhooks e vincule ao seu bot pessoal.' },
];

export function TutorialsSection() {
  const [openIndex, setOpenIndex] = useState(0); 
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
    <section id="tutoriais" ref={sectionRef} className="section-container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
      
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
            boxShadow: 'inset 0 0 10px rgba(56, 189, 248, 0.15)'
          }}
        >
          Central de Ajuda
        </div>
        
        <h2 className={`section-title ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
          Command <span className="grad-text">Center</span>
        </h2>
        
        <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          Aprenda a pilotar todos os recursos da plataforma. Nossa interface é tão intuitiva que você se sentirá no comando de uma nave.
        </p>
      </div>

      {/* O NOVO SISTEMA HUD (HEADS UP DISPLAY) CORRIGIDO */}
      <div className={`hud-container ${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
        
        {/* MENU LATERAL DOS TUTORIAIS - Estilos inline removidos para respeitar o CSS global */}
        <div className="hud-sidebar">
          {tutorials.map((tutorial, index) => (
            <button
              key={index}
              className={`hud-tab ${openIndex === index ? 'active' : ''}`}
              onClick={() => setOpenIndex(index)}
            >
              <span className="hud-tab-icon">{tutorial.icon}</span> 
              <span className="hud-tab-text">{tutorial.title}</span>
            </button>
          ))}
        </div>

        {/* CONTEÚDO FIXO (A TELA DA NAVE) */}
        <div className="hud-content">
          {tutorials.map((tutorial, index) => (
            <div 
              key={index} 
              className={`hud-panel ${openIndex === index ? 'active' : ''}`}
            >
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {tutorial.icon} {tutorial.title}
              </h4>
              
              <p>{tutorial.content}</p>

              {index === 0 && (
                <div className="hud-code" style={{ marginTop: '1.5rem' }}>
                  {'>'} TOKEN: 123456789:AAH_XYZ...
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}