import React, { useState, useEffect, useRef } from 'react';

// Array reconstruído EXATAMENTE como no index5.html 
// Títulos curtos (tabTitle) para o menu lateral e explicações ricas em detalhes.
const tutorials = [
  { 
    icon: '🤖', 
    tabTitle: 'Criar Bot no Telegram', 
    title: 'Como Criar Bot e Adicionar na Zenyx', 
    content: (
      <>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          Abra o Telegram e procure por <strong>@BotFather</strong>. Envie o comando <code style={{ color: 'var(--neon-blue)', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>/newbot</code>, escolha um nome e um username para o seu bot. Após finalizar, o BotFather enviará um Token de API.
        </p>
        <div style={{ marginBottom: '1.5rem', background: '#0a0a0c', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', color: 'var(--neon-green)', fontFamily: 'var(--font-code)' }}>
          Token: 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
        </div>
        <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
          Copie este token, vá até o painel da Zenyx VIPs em "Novo Bot", cole e clique em conectar. Pronto!
        </p>
      </>
    ) 
  },
  { 
    icon: '🆔', 
    tabTitle: 'Obter ID de Grupo/Canal', 
    title: 'Como Obter ID do Canal', 
    content: (
      <>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          Adicione o bot <strong>@userinfobot</strong> ao seu grupo ou canal privado. Ele enviará automaticamente uma mensagem contendo o ID numérico exato do seu grupo.
        </p>
        <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
          Copie esse ID (geralmente começa com um sinal de menos, ex: -100123456) e insira nas configurações do seu produto na plataforma Zenyx para liberação automática.
        </p>
      </>
    ) 
  },
  { 
    icon: '💳', 
    tabTitle: 'Vincular Pushin Pay', 
    title: 'Vincular a Pushin Pay', 
    content: (
      <>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          Acesse sua conta Pushin Pay e copie sua chave de API secreta na área de integrações.
        </p>
        <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
          No painel Zenyx VIPs, vá em <strong>Integrações &gt; Pushin Pay</strong> e cole sua chave. Ative a integração e o sistema já estará apto para gerar PIX copia e cola dinâmicos.
        </p>
      </>
    ) 
  },
  { 
    icon: '🔗', 
    tabTitle: 'Redirecionamento', 
    title: 'Sistema de Redirecionamento', 
    content: (
      <>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          Acesse <strong>Rastreamento &gt; Redirecionamento</strong>. Crie uma pasta com nome da plataforma (ex: Instagram). Dentro da pasta, crie links específicos (Stories, Feed, Bio).
        </p>
        <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
          O sistema gerará links rastreáveis do tipo <code style={{ color: 'var(--neon-blue)', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>t.me/SeuBot?start=codigo</code> para você espalhar nas redes.
        </p>
      </>
    ) 
  },
  { 
    icon: '📊', 
    tabTitle: 'Funil de Vendas', 
    title: 'Acompanhar o Funil', 
    content: (
      <>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          No menu Funil do seu dashboard, você verá 3 estágios de clientes: Topo (apenas curiosos), Meio (geraram boleto/pix) e Fundo (compradores).
        </p>
        <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
          Você pode usar esses filtros para disparar mensagens em massa no Telegram (Broadcasting) apenas para os curiosos oferecendo um desconto, por exemplo.
        </p>
      </>
    ) 
  }
];

export function TutorialsSection() {
  // Abre automaticamente a primeira aba
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
        <h2 className={`section-title ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          Central de <span className="grad-text">Comando</span>
        </h2>
        
        <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
          Simples, rápido e indestrutível. Veja como é fácil operar a Zenyx.
        </p>
      </div>

      <div className={`hud-container ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
        
        {/* MENU LATERAL DOS TUTORIAIS */}
        <div className="hud-sidebar">
          {tutorials.map((tutorial, index) => (
            <button
              key={index}
              className={`hud-tab ${openIndex === index ? 'active' : ''}`}
              onClick={() => setOpenIndex(index)}
            >
              <span className="hud-tab-icon">{tutorial.icon}</span> 
              {/* O texto agora usa a versão curta (tabTitle) para não quebrar no mobile! */}
              <span className="hud-tab-text">{tutorial.tabTitle}</span>
            </button>
          ))}
        </div>

        {/* CONTEÚDO FIXO DO LADO DIREITO */}
        <div className="hud-content">
          {tutorials.map((tutorial, index) => (
            <div 
              key={index} 
              className={`hud-panel ${openIndex === index ? 'active' : ''}`}
            >
              {/* O Título principal fica dentro do painel */}
              <h4 style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '1.6rem', 
                color: 'var(--text-main)', 
                marginBottom: '1.5rem', 
                fontWeight: '700' 
              }}>
                {tutorial.title}
              </h4>
              
              <div>{tutorial.content}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}