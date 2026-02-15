import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react'; 

// ============================================================
// 📚 BASE DE DADOS: CENTRAL DE COMANDO (TUTORIAIS)
// Array reconstruído EXATAMENTE como no original, 
// mantendo os textos e a formatação com as cores de Neon.
// ============================================================
const tutorials = [
  { 
    icon: '🤖', 
    tabTitle: 'Criar Bot no Telegram', 
    title: 'Como Criar Bot e Adicionar na Zenyx', 
    content: (
      <>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          Abra o Telegram e procure por <strong>@BotFather</strong>. Envie o comando <code style={{ color: 'var(--neon-magenta)', background: 'rgba(217, 70, 239, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>/newbot</code>, escolha um nome e um username para o seu bot. Após finalizar, o BotFather enviará um Token de API.
        </p>
        <div className="hud-code" style={{ marginBottom: '1.5rem' }}>
          {'>'} TOKEN: 123456789:AAH_XYZ...
        </div>
        <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
          Copie este token, vá até o painel da Zenyx VIPs em "Novo Bot", cole e clique em conectar. Pronto! Sua automação já está viva.
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
          Copie esse ID (geralmente começa com um sinal de menos, ex: <code style={{ color: 'var(--neon-blue)', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>-100123456</code>) e insira nas configurações do seu produto na plataforma Zenyx para liberação automática.
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
          No painel Zenyx VIPs, vá em <strong>Integrações &gt; Pushin Pay</strong> e cole sua chave. Ative a integração e o sistema já estará apto para gerar PIX copia e cola dinâmicos instantaneamente.
        </p>
      </>
    ) 
  },
  { 
    icon: '🔗', 
    tabTitle: 'Sistema de Redirecionamento', 
    title: 'Redirecionamento Inteligente', 
    content: (
      <>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          Acesse <strong>Rastreamento &gt; Redirecionamento</strong>. Crie uma pasta com o nome da plataforma (ex: Instagram). Dentro da pasta, crie links específicos (Stories, Feed, Bio).
        </p>
        <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
          O sistema gerará links rastreáveis do tipo <code style={{ color: 'var(--neon-magenta)', background: 'rgba(217, 70, 239, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>t.me/SeuBot?start=codigo</code> para você espalhar nas redes e saber exatamente de onde vem cada cliente.
        </p>
      </>
    ) 
  },
  { 
    icon: '📊', 
    tabTitle: 'Acompanhar o Funil de Vendas', 
    title: 'Monitoramento de Funil', 
    content: (
      <>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          No menu Funil do seu dashboard, você verá 3 estágios de clientes: Topo (apenas curiosos), Meio (geraram boleto/pix) e Fundo (compradores VIP).
        </p>
        <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
          Você pode usar esses filtros para disparar mensagens em massa no Telegram (Broadcasting) apenas para os curiosos oferecendo um desconto, aumentando a sua taxa de conversão absurdamente.
        </p>
      </>
    ) 
  }
];

export function TutorialsSection() {
  // ============================================================
  // ⚙️ ESTADOS E REFERÊNCIAS
  // ============================================================
  const [openIndex, setOpenIndex] = useState(0); 
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // ============================================================
  // 👁️ OBSERVER PARA ANIMAÇÃO DE REVEAL (SCROLL)
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
  // 🔄 LÓGICA DO ACORDEÃO PREMIUM
  // ============================================================
  const handleToggle = (index) => {
    // Se clicar na aba já aberta, ela fecha. Senão, abre a nova.
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      id="tutoriais" 
      ref={sectionRef} 
      className="section container" 
      style={{ paddingTop: '8rem', paddingBottom: '8rem' }}
    >
      
      {/* ============================================================
          CABEÇALHO DA SEÇÃO
          ============================================================ */}
      <div className="section-header">
        
        {/* Pílula de Destaque Neon Cosmos (Magenta) */}
        <div 
          className={`pill ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} 
          style={{ marginBottom: '1.5rem' }}
        >
          <span className="spark"></span> CENTRAL DE AJUDA RÁPIDA
        </div>
        
        {/* Título Principal */}
        <h2 className={`section-title ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
          Command <span className="text-gradient">Center</span>
        </h2>
        
        {/* Subtítulo */}
        <p className={`section-desc ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          Simples, rápido e indestrutível. Veja como é estúpido de fácil operar a Zenyx.
        </p>
      </div>

      {/* ============================================================
          O NOVO SISTEMA ACORDEÃO (COMMAND CENTER SLEEK)
          Classes perfeitamente linkadas com LandingPage.css
          ============================================================ */}
      <div className={`cc-wrapper ${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
        
        {tutorials.map((tutorial, index) => {
          const isOpen = openIndex === index;
          
          return (
            <div 
              key={index} 
              className={`cc-item ${isOpen ? 'active' : ''}`}
            >
              
              {/* Botão de Controle da Aba (Header) */}
              <button 
                className="cc-btn" 
                onClick={() => handleToggle(index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span className="cc-icon">{tutorial.icon}</span>
                  <span className="cc-tab-text">{tutorial.tabTitle}</span>
                </div>
                {/* Ícone da Setinha animado no CSS quando a classe 'active' está presente */}
                <ChevronDown className="cc-chevron" size={24} />
              </button>

              {/* Conteúdo Expansível Animado via CSS Grid */}
              <div className="cc-content">
                <div className="cc-content-inner">
                  <div className="cc-content-padding">
                    <h4 className="cc-title-inside">{tutorial.title}</h4>
                    <div>{tutorial.content}</div>
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