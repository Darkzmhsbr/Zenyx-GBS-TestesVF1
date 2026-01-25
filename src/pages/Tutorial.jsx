import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, Bot, ShieldCheck, Fingerprint, Rocket, 
  Settings, Gem, MessageSquare, CreditCard, Zap, 
  HelpCircle, CheckCircle2, AlertTriangle, Terminal
} from 'lucide-react';

import '../styles/LandingPage.css';

export function Tutorial() {
  const [openIndex, setOpenIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleTutorial = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const steps = [
    {
      icon: <Bot />,
      title: "ETAPA 1 - CRIANDO O BOT NO TELEGRAM",
      content: (
        <div className="tutorial-rich-content">
          <p className="mb-4">O primeiro passo é criar a identidade do seu robô através do <strong>@BotFather</strong>, o bot oficial do Telegram para criadores.</p>
          <div className="step-guide">
            <div className="step-item"><span className="n-badge">1</span> Pesquise por <strong>@BotFather</strong> e clique em <strong>Iniciar</strong>.</div>
            <div className="step-item"><span className="n-badge">2</span> Envie o comando <code>/newbot</code>.</div>
            <div className="step-item"><span className="n-badge">3</span> <strong>Nome do Bot:</strong> Como ele aparecerá para os clientes (Ex: <em>Zenyx VIP</em>).</div>
            <div className="step-item"><span className="n-badge">4</span> <strong>Username:</strong> O @ único dele. Deve terminar em <strong>bot</strong> (Ex: <em>zenyxvipsbot</em>).</div>
          </div>
          <div className="token-alert mt-4">
            <Terminal size={18} className="text-primary" />
            <p><strong>TOKEN API:</strong> Você receberá uma mensagem com o token (ex: <code>8578926133:AABxF...</code>). <strong>Copie e não compartilhe com ninguém!</strong></p>
          </div>
        </div>
      )
    },
    {
      icon: <ShieldCheck />,
      title: "ETAPA 2 - CANAL OU GRUPO VIP",
      content: (
        <div className="tutorial-rich-content">
          <p className="mb-4">Este é o seu produto. O bot automatizado funcionará como o porteiro do seu conteúdo exclusivo.</p>
          <div className="instruction-grid">
            <div className="ins-card">
              <CheckCircle2 size={18} className="text-primary" />
              <span>Crie um canal/grupo e mude a privacidade para <strong>PRIVADO</strong>.</span>
            </div>
            <div className="ins-card">
              <CheckCircle2 size={18} className="text-primary" />
              <span>Adicione seu bot como <strong>Administrador</strong>.</span>
            </div>
            <div className="ins-card">
              <CheckCircle2 size={18} className="text-primary" />
              <span>Ative as permissões de <strong>Convidar Usuários</strong> e <strong>Apagar Mensagens</strong>.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: <Fingerprint />,
      title: "ETAPA 3 - OBTENDO OS IDS (BOT + CANAL)",
      content: (
        <div className="tutorial-rich-content">
          <p className="mb-4">Para que a Zenyx saiba onde liberar o acesso, precisamos do ID numérico do seu canal.</p>
          <div className="code-block">
            <p>1. Acesse o bot <strong>@ScanIDBot</strong> ou <strong>@RawDataBot</strong>.</p>
            <p>2. Encaminhe qualquer mensagem do seu Canal VIP para ele.</p>
            <p>3. Ele responderá com o ID (Ex: <code>-100234567890</code>). Salve este número.</p>
          </div>
        </div>
      )
    },
    {
      icon: <Rocket />,
      title: "ETAPA 4 - VINCULAR NA PLATAFORMA",
      content: (
        <div className="tutorial-rich-content">
          <p className="mb-4">Agora vamos integrar o robô ao seu painel administrativo.</p>
          <div className="path-box">
            Menu Lateral <ChevronDown size={14} /> <strong>Meus Bots</strong> <ChevronDown size={14} /> <strong>Novo Bot</strong>
          </div>
          <p className="mt-3 text-sm opacity-70">Cole o <strong>Token API</strong> e o <strong>ID do Canal</strong> nos campos indicados e clique em salvar.</p>
        </div>
      )
    },
    {
      icon: <Settings />,
      title: "ETAPA 5 - CONFIGURAÇÃO DE SUPORTE",
      content: (
        <div className="tutorial-rich-content">
          <p className="mb-4">Configure como seus clientes falarão com você e onde você receberá seus avisos de PIX.</p>
          <ul className="custom-list">
            <li><strong>ID Admin:</strong> Use o @userinfobot para pegar seu ID pessoal e receber alertas de vendas.</li>
            <li><strong>Username Suporte:</strong> Seu @ para atendimento manual caso o cliente precise.</li>
          </ul>
        </div>
      )
    },
    {
      icon: <Gem />,
      title: "ETAPA 6 - CRIAR PLANOS DE ACESSO",
      content: (
        <div className="tutorial-rich-content">
          <p className="mb-4">Determine quanto tempo o usuário terá de acesso por cada valor pago.</p>
          <div className="warning-box">
            <AlertTriangle size={18} />
            <span>O sistema remove automaticamente quem não renovar o plano!</span>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="example-tag">Mensal: R$ 97,00 (30 dias)</div>
            <div className="example-tag">Vitalício: R$ 497,00 (9999 dias)</div>
          </div>
        </div>
      )
    },
    {
      icon: <MessageSquare />,
      title: "ETAPA 7 - FLOW CHAT (FUNIL)",
      content: (
        <div className="tutorial-rich-content">
          <p className="mb-4">O Flow Chat é o coração da venda. Ele é o vendedor 24h que convence o seu lead.</p>
          <div className="golden-rule">
            <strong>REGRA DE OURO (Pág 7 do PDF):</strong>
            <p>Cada mensagem só pode ter <strong>UM</strong>: ou um Botão Embutido <strong>OU</strong> um Atraso de Tempo (Delay). Não misture os dois no mesmo passo.</p>
          </div>
        </div>
      )
    },
    {
      icon: <CreditCard />,
      title: "ETAPA 8 - ATIVAR OFERTA E CHECKOUT",
      content: (
        <div className="tutorial-rich-content">
          <p className="mb-4">Transforme seu bot em uma máquina de vendas ativando o checkout automático.</p>
          <div className="final-step-box">
            <p>Na sua última mensagem do funil, ative a chave:</p>
            <div className="toggle-preview">
               <div className="toggle-circle"></div>
               <span>Mostrar planos junto com essa mensagem</span>
            </div>
            <p className="mt-3 text-sm text-primary">Isso ativa o Checkout, Pagamento e Liberação Automática no VIP.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="landing-page" style={{ 
      marginTop: '70px', marginLeft: 'var(--sidebar-width)', padding: '60px 20px',
      background: '#050507', minHeight: 'calc(100vh - 70px)', color: '#fff' 
    }}>
      <style>{`
        .tutorial-rich-content { padding-left: 10px; border-left: 1px solid rgba(255,255,255,0.05); }
        .step-guide { display: flex; flex-direction: column; gap: 12px; }
        .step-item { display: flex; align-items: flex-start; gap: 12px; color: rgba(255,255,255,0.8); line-height: 1.5; }
        .n-badge { background: var(--neon-purple); color: #fff; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 11px; font-weight: 900; flex-shrink: 0; margin-top: 2px; }
        .token-alert { display: flex; gap: 12px; padding: 15px; background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 12px; font-size: 0.9rem; }
        .instruction-grid { display: grid; gap: 10px; }
        .ins-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 10px; font-size: 0.9rem; }
        .code-block { background: #000; padding: 15px; border-radius: 10px; border: 1px solid #222; font-family: 'Courier New', monospace; font-size: 0.85rem; color: #38bdf8; }
        .path-box { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.1); }
        .custom-list { list-style: none; padding: 0; display: grid; gap: 10px; }
        .custom-list li::before { content: "→"; color: var(--neon-purple); margin-right: 10px; font-weight: bold; }
        .warning-box { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; color: #fbbf24; font-size: 0.9rem; }
        .example-tag { background: rgba(168, 85, 247, 0.1); border: 1px dashed var(--neon-purple); padding: 10px; border-radius: 8px; text-align: center; font-size: 0.85rem; font-weight: 600; }
        .golden-rule { border: 1px solid var(--neon-purple); background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, transparent 100%); padding: 20px; border-radius: 15px; }
        .golden-rule strong { color: var(--neon-purple); display: block; margin-bottom: 8px; font-size: 1.1rem; }
        .final-step-box { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 15px; text-align: center; }
        .toggle-preview { display: inline-flex; align-items: center; gap: 12px; background: #111; padding: 10px 20px; border-radius: 50px; border: 1px solid var(--neon-purple); margin: 15px 0; font-weight: bold; }
        .toggle-circle { width: 34px; height: 18px; background: var(--neon-purple); border-radius: 20px; position: relative; }
        .toggle-circle::after { content: ""; position: absolute; right: 2px; top: 2px; width: 14px; height: 14px; background: #fff; border-radius: 50%; }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <div className={`section-header text-center mb-16 ${isVisible ? 'animate-fade-in-up' : ''}`}>
          <span className="section-badge"><Zap size={14} /> ONBOARDING 2026</span>
          <h2 className="section-title" style={{ fontSize: '3.5rem' }}>Central <span className="text-gradient">Tutorial</span></h2>
          <p className="section-subtitle">O guia mestre para faturar alto com a ZenyxGbot.</p>
        </div>

        <div className="tutorials-list flex flex-col gap-5">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`tutorial-item ${isVisible ? 'animate-fade-in-up' : ''}`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                background: 'var(--glass-bg)',
                border: openIndex === index ? '1px solid var(--neon-purple)' : '1px solid var(--glass-border)',
                borderRadius: '24px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: openIndex === index ? '0 0 40px rgba(168, 85, 247, 0.1)' : 'none'
              }}
            >
              <div 
                className="tutorial-header p-7 flex items-center gap-6 cursor-pointer" 
                onClick={() => toggleTutorial(index)}
              >
                <div style={{
                  width: '56px', height: '56px',
                  background: openIndex === index ? 'var(--neon-purple)' : 'rgba(255,255,255,0.03)',
                  borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: openIndex === index ? '#fff' : 'var(--neon-purple)',
                  border: openIndex === index ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.3s ease'
                }}>
                  {React.cloneElement(step.icon, { size: 28 })}
                </div>
                
                <h3 style={{ 
                  flex: 1, fontSize: '1.25rem', fontWeight: '800', 
                  color: openIndex === index ? '#fff' : 'rgba(255,255,255,0.7)',
                  transition: 'color 0.3s ease'
                }}>
                  {step.title}
                </h3>

                <ChevronDown 
                  size={24} 
                  style={{
                    color: openIndex === index ? 'var(--neon-purple)' : 'rgba(255,255,255,0.2)',
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.5s ease'
                  }}
                />
              </div>

              <div style={{
                maxHeight: openIndex === index ? '1200px' : '0',
                opacity: openIndex === index ? '1' : '0',
                overflow: 'hidden',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div className="px-8 pb-10 ml-[80px] pr-12">
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '25px' }} />
                  {step.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}