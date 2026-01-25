import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Bot, 
  ShieldCheck, 
  Fingerprint, 
  Rocket, 
  Settings, 
  Gem, 
  MessageSquare, 
  CreditCard,
  Zap,
  HelpCircle
} from 'lucide-react';

// ✅ Caminho corrigido para o seu CSS premium
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
    { icon: <Bot />, title: "CRIAR BOT", content: "Acesse o @BotFather no Telegram, use /newbot e siga as instruções para obter seu Token API." },
    { icon: <ShieldCheck />, title: "CONFIGURAR CANAL VIP", content: "Crie um canal privado e adicione seu bot como administrador com todas as permissões." },
    { icon: <Fingerprint />, title: "OBTER IDS", content: "Use o @ScanIDBot para capturar o ID do seu canal (começa com -100)." },
    { icon: <Rocket />, title: "VINCULAR PLATAFORMA", content: "Em 'Meus Bots' > 'Novo Bot', insira o Token e o ID do Canal." },
    { icon: <Settings />, title: "AJUSTES GERAIS", content: "Defina seu ID de Admin e o suporte para atendimento ao cliente." },
    { icon: <Gem />, title: "PLANOS E PREÇOS", content: "Crie as ofertas (ex: Mensal, Vitalício) com os valores desejados." },
    { icon: <MessageSquare />, title: "FLOW CHAT", content: "Configure o funil automático de mensagens. Use Botão OU Delay." },
    { icon: <CreditCard />, title: "ATIVAR VENDAS", content: "Marque 'Mostrar planos' na última mensagem para liberar o checkout." }
  ];

  return (
    <div className="landing-page" style={{ 
      marginTop: '70px', 
      marginLeft: 'var(--sidebar-width)', 
      padding: '60px 20px',
      background: '#050507',
      minHeight: 'calc(100vh - 70px)'
    }}>
      <div className="max-w-4xl mx-auto">
        
        {/* Header Premium */}
        <div className={`section-header text-center mb-12 ${isVisible ? 'animate-fade-in-up' : ''}`}>
          <span className="section-badge" style={{ marginBottom: '20px' }}>
            <Zap size={14} style={{ color: 'var(--neon-purple)' }} /> 
            CENTRAL DE AJUDA
          </span>
          <h2 className="section-title" style={{ fontSize: '3rem', color: '#fff' }}>
            Tutoriais <span className="text-gradient">Zenyx</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '1.1rem', opacity: 0.7 }}>
            Domine a plataforma e coloque sua operação para rodar no automático.
          </p>
        </div>

        {/* Lista de Seletores (Estilo Landing Page) */}
        <div className="tutorials-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`tutorial-item ${isVisible ? 'animate-fade-in-up' : ''}`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                background: 'var(--glass-bg)',
                border: openIndex === index ? '1px solid var(--neon-purple)' : '1px solid var(--glass-border)',
                borderRadius: '20px',
                backdropFilter: 'blur(var(--glass-blur))',
                transition: 'all 0.3s ease',
                boxShadow: openIndex === index ? '0 0 30px rgba(168, 85, 247, 0.15)' : 'none'
              }}
            >
              <div 
                className="tutorial-header" 
                onClick={() => toggleTutorial(index)}
                style={{
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: openIndex === index ? 'var(--neon-purple)' : 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: openIndex === index ? '#fff' : 'var(--neon-purple)',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(168, 85, 247, 0.3)'
                }}>
                  {React.cloneElement(step.icon, { size: 24 })}
                </div>
                
                <h3 style={{ 
                  flex: 1, 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  color: '#fff',
                  letterSpacing: '1px'
                }}>
                  {step.title}
                </h3>

                <ChevronDown 
                  size={24} 
                  style={{
                    color: openIndex === index ? 'var(--neon-purple)' : 'rgba(255,255,255,0.3)',
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>

              <div style={{
                maxHeight: openIndex === index ? '200px' : '0',
                opacity: openIndex === index ? '1' : '0',
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div style={{ 
                  padding: '0 24px 30px 94px', 
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: '1.8',
                  fontSize: '1rem'
                }}>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '20px' }} />
                  {step.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suporte Card */}
        <div className={`mt-16 p-8 rounded-3xl text-center ${isVisible ? 'animate-fade-in-up' : ''}`} 
             style={{ 
               background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(56, 189, 248, 0.1) 100%)',
               border: '1px solid var(--glass-border)'
             }}>
          <HelpCircle size={48} style={{ color: 'var(--neon-blue)', margin: '0 auto 20px' }} />
          <h4 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800' }}>Ainda com dúvidas?</h4>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '25px' }}>Nosso suporte mestre está pronto para te atender.</p>
          <button className="btn-primary" style={{ padding: '15px 40px', fontSize: '1rem' }}>
            CHAMAR NO WHATSAPP
          </button>
        </div>

      </div>
    </div>
  );
}