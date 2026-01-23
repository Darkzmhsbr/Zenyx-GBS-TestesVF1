import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function TutorialsSection() {
  const [openIndex, setOpenIndex] = useState(null);

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
      icon: '🏷️',
      title: 'Como Configurar Código de Venda',
      content: 'No painel, vá em Rastreamento > Códigos de Venda. Crie um novo código personalizado para cada campanha. Use-o nos links de checkout para rastrear origem das vendas.'
    },
    {
      icon: '📊',
      title: 'Como Configurar Tracking Meta Pixel',
      content: 'Copie seu Pixel ID do Facebook Ads Manager. Cole em Rastreamento > Meta Pixel. Ative os eventos de Purchase, InitiateCheckout e AddToCart para rastreamento completo.'
    },
    {
      icon: '🔗',
      title: 'Como Configurar Tracking UTMify',
      content: 'Em Rastreamento > UTMs, crie parâmetros personalizados (utm_source, utm_medium, utm_campaign). Use esses parâmetros nos seus links de divulgação para identificar melhor suas fontes de tráfego.'
    },
    {
      icon: '🔔',
      title: 'Como Configurar Notificações em seu Dispositivo',
      content: 'Ative as notificações do navegador quando solicitado. Para notificações no Telegram, configure um webhook em Integrações > Webhooks e vincule ao seu bot pessoal.'
    }
  ];

  const toggleTutorial = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="tutoriais" className="section-container">
      <div className="section-header">
        <h2 className="section-title">Tutoriais Passo a Passo</h2>
        <p className="section-subtitle">Guias completos para configurar sua plataforma em minutos</p>
      </div>

      <div className="tutorials-list">
        {tutorials.map((tutorial, index) => (
          <div key={index} className="tutorial-item">
            <div 
              className="tutorial-header"
              onClick={() => toggleTutorial(index)}
            >
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