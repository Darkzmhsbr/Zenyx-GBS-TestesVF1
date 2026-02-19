import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, Bot, CreditCard, Gem, MessageSquare, 
  CheckCircle2, Info, Zap, Settings, ShieldCheck,
  Rocket, ArrowRight, Star, Sparkles, CircleDot,
  AlertTriangle, ChevronRight, ExternalLink
} from 'lucide-react';
import { useBot } from '../context/BotContext';
import { useAuth } from '../context/AuthContext';

// =========================================================
// 🔥 IMPORTAÇÃO DOS COMPONENTES REAIS (SEM DUPLICAÇÃO)
// =========================================================
import { Integrations } from './Integrations';
import { Plans } from './Plans';

// =========================================================
// 📦 COMPONENTE: SetupWizard (Configuração Guiada)
// =========================================================
export function SetupWizard() {
  const navigate = useNavigate();
  const { selectedBot } = useBot();
  const { hasBot } = useAuth();

  const [openIndex, setOpenIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    setIsVisible(true);
    // Carrega progresso salvo do localStorage
    const saved = localStorage.getItem('zenyx_setup_progress');
    if (saved) {
      try { setCompletedSteps(JSON.parse(saved)); } catch(e) {}
    }
  }, []);

  const toggleStep = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const markComplete = (index) => {
    const updated = completedSteps.includes(index) 
      ? completedSteps.filter(i => i !== index)
      : [...completedSteps, index];
    setCompletedSteps(updated);
    localStorage.setItem('zenyx_setup_progress', JSON.stringify(updated));
  };

  // =========================================================
  // 📋 DEFINIÇÃO DAS ETAPAS
  // =========================================================
  const steps = [
    {
      icon: Bot,
      title: "Etapa 1 — Criar e Conectar seu Bot",
      description: "Conecte seu bot do Telegram à plataforma",
      color: '#8b5cf6',
      content: (
        <div className="sw-content-inner">
          <div className="sw-instruction-box">
            <div className="sw-instruction-icon">
              <Info size={20} />
            </div>
            <div>
              <h4>Como funciona?</h4>
              <p>Você precisa criar um bot no Telegram usando o @BotFather e depois conectá-lo aqui na plataforma com o token gerado.</p>
            </div>
          </div>

          <h4 className="sw-subtitle">Passo a passo</h4>
          <ol className="sw-numbered-list">
            <li className="sw-list-item">
              <span className="sw-step-number">1</span>
              <span>Abra o Telegram e busque por <strong>@BotFather</strong></span>
            </li>
            <li className="sw-list-item">
              <span className="sw-step-number">2</span>
              <span>Envie o comando <code>/newbot</code> e siga as instruções</span>
            </li>
            <li className="sw-list-item">
              <span className="sw-step-number">3</span>
              <span>Copie o <strong>Token</strong> gerado pelo BotFather</span>
            </li>
            <li className="sw-list-item">
              <span className="sw-step-number">4</span>
              <span>Crie um <strong>canal ou grupo privado</strong> no Telegram (será o seu VIP)</span>
            </li>
            <li className="sw-list-item">
              <span className="sw-step-number">5</span>
              <span>Adicione o bot como <strong>administrador</strong> do canal/grupo</span>
            </li>
            <li className="sw-list-item">
              <span className="sw-step-number">6</span>
              <span>Use o <strong>@userinfobot</strong> para descobrir o ID do canal (começa com -100)</span>
            </li>
          </ol>

          <div className="sw-highlight-box">
            <ShieldCheck size={20} />
            <p><strong>Permissões obrigatórias do bot no canal:</strong> Adicionar membros, Banir usuários, Convidar via link, Gerenciar convites.</p>
          </div>

          <div className="sw-action-row">
            {!hasBot ? (
              <button className="sw-btn sw-btn--primary" onClick={() => navigate('/bots/new')}>
                <Rocket size={18} />
                Criar Meu Primeiro Bot
                <ArrowRight size={16} />
              </button>
            ) : (
              <button className="sw-btn sw-btn--primary" onClick={() => navigate(`/bots/config/${selectedBot?.id}`)}>
                <Settings size={18} />
                Configurar Bot Existente
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )
    },
    {
      icon: CreditCard,
      title: "Etapa 2 — Gateway de Pagamento",
      description: "Configure como você vai receber seus pagamentos via PIX",
      color: '#10b981',
      content: (
        <div className="sw-content-inner">
          <div className="sw-instruction-box sw-instruction-box--green">
            <div className="sw-instruction-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Info size={20} />
            </div>
            <div>
              <h4>O que é uma Gateway?</h4>
              <p>É o serviço que processa os pagamentos PIX dos seus clientes. Você precisa ter conta em pelo menos uma gateway e colar o token aqui.</p>
            </div>
          </div>

          <div className="sw-tip-cards">
            <div className="sw-tip-card">
              <div className="sw-tip-card__icon" style={{ background: 'rgba(0, 230, 118, 0.1)' }}>
                <Star size={20} color="#00e676" />
              </div>
              <div>
                <h5>PushinPay</h5>
                <p>Taxa ~3% • Mais popular</p>
                <a href="https://pushinpay.com.br" target="_blank" rel="noopener noreferrer" className="sw-link">
                  Criar conta <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <div className="sw-tip-card">
              <div className="sw-tip-card__icon" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                <Star size={20} color="#a855f7" />
              </div>
              <div>
                <h5>WiinPay</h5>
                <p>Taxa ~4.5% • Alternativa</p>
                <a href="https://wiinpay.com.br" target="_blank" rel="noopener noreferrer" className="sw-link">
                  Criar conta <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* 🔥 COMPONENTE REAL: Integrations */}
          {selectedBot ? (
            <div className="sw-embedded-component">
              <div className="sw-embedded-label">
                <Zap size={14} />
                <span>Painel de configuração ao vivo</span>
              </div>
              <Integrations />
            </div>
          ) : (
            <div className="sw-warning-box">
              <AlertTriangle size={20} />
              <p>Você precisa criar um bot primeiro (Etapa 1) para configurar a gateway de pagamento.</p>
            </div>
          )}
        </div>
      )
    },
    {
      icon: Gem,
      title: "Etapa 3 — Planos de Acesso",
      description: "Crie os planos que seus clientes poderão comprar",
      color: '#f59e0b',
      content: (
        <div className="sw-content-inner">
          <div className="sw-instruction-box sw-instruction-box--amber">
            <div className="sw-instruction-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Info size={20} />
            </div>
            <div>
              <h4>Como funcionam os planos?</h4>
              <p>Cada plano define um preço e uma duração de acesso ao seu canal/grupo VIP. Quando o cliente paga, o bot libera o acesso automaticamente pelo tempo definido.</p>
            </div>
          </div>

          <div className="sw-examples-row">
            <div className="sw-example-pill">
              <span className="sw-example-pill__label">Mensal</span>
              <span className="sw-example-pill__price">R$ 29,90</span>
            </div>
            <div className="sw-example-pill sw-example-pill--featured">
              <span className="sw-example-pill__label">Trimestral</span>
              <span className="sw-example-pill__price">R$ 69,90</span>
            </div>
            <div className="sw-example-pill">
              <span className="sw-example-pill__label">Vitalício</span>
              <span className="sw-example-pill__price">R$ 149,90</span>
            </div>
          </div>

          <div className="sw-pro-tip">
            <Sparkles size={16} />
            <span><strong>Dica Pro:</strong> Crie pelo menos 3 planos com durações diferentes. O plano do meio costuma ser o mais vendido!</span>
          </div>

          {/* 🔥 COMPONENTE REAL: Plans */}
          {selectedBot ? (
            <div className="sw-embedded-component">
              <div className="sw-embedded-label">
                <Zap size={14} />
                <span>Gerencie seus planos aqui</span>
              </div>
              <Plans />
            </div>
          ) : (
            <div className="sw-warning-box">
              <AlertTriangle size={20} />
              <p>Você precisa criar um bot primeiro (Etapa 1) para gerenciar planos.</p>
            </div>
          )}
        </div>
      )
    },
    {
      icon: MessageSquare,
      title: "Etapa 4 — Mensagens do Bot",
      description: "Personalize as mensagens automáticas que o bot envia",
      color: '#3b82f6',
      content: (
        <div className="sw-content-inner">
          <div className="sw-instruction-box sw-instruction-box--blue">
            <div className="sw-instruction-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Info size={20} />
            </div>
            <div>
              <h4>Mensagens Automáticas</h4>
              <p>O bot envia mensagens automáticas em diferentes momentos: boas-vindas, pagamento aprovado, expiração, etc. Você pode personalizar cada uma delas.</p>
            </div>
          </div>

          <div className="sw-msg-types">
            <div className="sw-msg-type">
              <div className="sw-msg-type__dot" style={{ background: '#10b981' }}></div>
              <div>
                <h5>Mensagem de Boas-vindas</h5>
                <p>Enviada quando alguém inicia o bot pela primeira vez</p>
              </div>
            </div>
            <div className="sw-msg-type">
              <div className="sw-msg-type__dot" style={{ background: '#3b82f6' }}></div>
              <div>
                <h5>Pagamento Aprovado</h5>
                <p>Enviada após confirmação do pagamento PIX</p>
              </div>
            </div>
            <div className="sw-msg-type">
              <div className="sw-msg-type__dot" style={{ background: '#f59e0b' }}></div>
              <div>
                <h5>Lembrete de Expiração</h5>
                <p>Avisa o cliente que o acesso vai expirar em breve</p>
              </div>
            </div>
            <div className="sw-msg-type">
              <div className="sw-msg-type__dot" style={{ background: '#ef4444' }}></div>
              <div>
                <h5>Acesso Expirado</h5>
                <p>Informa que o acesso foi encerrado e oferece renovação</p>
              </div>
            </div>
          </div>

          <div className="sw-action-row">
            {selectedBot ? (
              <button className="sw-btn sw-btn--blue" onClick={() => navigate(`/bots/config/${selectedBot.id}`, { state: { initialTab: 'mensagens' } })}>
                <MessageSquare size={18} />
                Personalizar Mensagens
                <ArrowRight size={16} />
              </button>
            ) : (
              <div className="sw-warning-box">
                <AlertTriangle size={20} />
                <p>Crie um bot primeiro (Etapa 1) para personalizar as mensagens.</p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      icon: Settings,
      title: "Etapa 5 — Configurações Finais",
      description: "Ajustes finais e dicas para começar a vender",
      color: '#ec4899',
      content: (
        <div className="sw-content-inner">
          <div className="sw-checklist">
            <h4 className="sw-subtitle">Checklist de Lançamento</h4>
            
            <div className="sw-checklist-items">
              <div className="sw-checklist-item">
                <CircleDot size={18} color="#10b981" />
                <span>Bot criado e conectado à plataforma</span>
              </div>
              <div className="sw-checklist-item">
                <CircleDot size={18} color="#10b981" />
                <span>Canal/Grupo VIP criado e bot adicionado como admin</span>
              </div>
              <div className="sw-checklist-item">
                <CircleDot size={18} color="#10b981" />
                <span>Gateway de pagamento configurada e ativada</span>
              </div>
              <div className="sw-checklist-item">
                <CircleDot size={18} color="#10b981" />
                <span>Pelo menos 1 plano de acesso criado</span>
              </div>
              <div className="sw-checklist-item">
                <CircleDot size={18} color="#f59e0b" />
                <span>Mensagens do bot personalizadas (opcional)</span>
              </div>
              <div className="sw-checklist-item">
                <CircleDot size={18} color="#f59e0b" />
                <span>Mini App / Loja configurada (opcional)</span>
              </div>
            </div>
          </div>

          <div className="sw-final-tips">
            <div className="sw-final-tip">
              <div className="sw-final-tip__number">01</div>
              <div>
                <h5>Teste o pagamento</h5>
                <p>Faça uma compra teste com valor baixo (R$ 1,00) para garantir que tudo funciona.</p>
              </div>
            </div>
            <div className="sw-final-tip">
              <div className="sw-final-tip__number">02</div>
              <div>
                <h5>Configure o Remarketing</h5>
                <p>Na aba Remarketing, crie mensagens para recuperar clientes que não finalizaram a compra.</p>
              </div>
            </div>
            <div className="sw-final-tip">
              <div className="sw-final-tip__number">03</div>
              <div>
                <h5>Divulgue seu Bot</h5>
                <p>Compartilhe o link do seu bot (t.me/seubot) nas redes sociais para começar a receber clientes.</p>
              </div>
            </div>
          </div>

          <div className="sw-success-box">
            <CheckCircle2 size={24} />
            <div>
              <h4>Tudo pronto!</h4>
              <p>Seu bot está configurado e pronto para receber pagamentos. Agora é só divulgar e vender!</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  // =========================================================
  // 🎨 RENDER
  // =========================================================
  return (
    <div 
      className="setup-wizard-page"
      style={{
        marginLeft: 'var(--sidebar-width, 0px)',
        marginTop: '70px',
        padding: '60px 20px',
        backgroundColor: '#050507',
        minHeight: '100vh',
        color: '#ffffff'
      }}
    >
      <style>{`
        /* =========================================================
           🎨 SETUP WIZARD - ESTILOS COMPLETOS
           ========================================================= */
        .setup-wizard-page {
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* Animações */
        @keyframes sw-fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sw-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .sw-animate-in {
          animation: sw-fadeInUp 0.6s ease-out forwards;
        }

        /* === HEADER === */
        .sw-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 48px;
        }
        .sw-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2));
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 24px;
        }
        .sw-title {
          font-size: 3.5rem;
          font-weight: 900;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }
        .sw-title-gradient {
          background: linear-gradient(135deg, #10b981, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sw-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.5);
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* === PROGRESS BAR === */
        .sw-progress {
          max-width: 896px;
          margin: 0 auto 40px;
          padding: 0 4px;
        }
        .sw-progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .sw-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .sw-progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.4);
        }
        .sw-progress-text strong {
          color: #10b981;
        }

        /* === LISTA DE ETAPAS === */
        .sw-steps-list {
          max-width: 896px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* === ITEM DE ETAPA === */
        .sw-step-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .sw-step-item:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }
        .sw-step-item.active {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }
        .sw-step-item.completed {
          border-color: rgba(16, 185, 129, 0.3);
        }

        /* Header da etapa (clicável) */
        .sw-step-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px 28px;
          cursor: pointer;
          user-select: none;
          transition: background 0.2s;
        }
        .sw-step-header:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .sw-step-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s;
          position: relative;
        }
        .sw-step-icon-wrap svg {
          width: 26px;
          height: 26px;
          color: rgba(255, 255, 255, 0.9);
          transition: all 0.3s;
        }
        .sw-step-item.completed .sw-step-icon-wrap::after {
          content: '';
          position: absolute;
          top: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #050507;
        }

        .sw-step-text {
          flex: 1;
          min-width: 0;
        }
        .sw-step-title {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0 0 4px;
          color: rgba(255, 255, 255, 0.95);
          transition: color 0.3s;
        }
        .sw-step-item.active .sw-step-title {
          color: #fff;
        }
        .sw-step-desc {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.4);
          margin: 0;
        }

        .sw-step-chevron {
          color: rgba(255, 255, 255, 0.3);
          transition: transform 0.3s, color 0.3s;
          flex-shrink: 0;
        }
        .sw-step-item.active .sw-step-chevron {
          transform: rotate(180deg);
          color: rgba(255, 255, 255, 0.6);
        }

        .sw-step-check-btn {
          background: none;
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.3);
        }
        .sw-step-check-btn:hover {
          border-color: #10b981;
          color: #10b981;
        }
        .sw-step-check-btn.checked {
          background: #10b981;
          border-color: #10b981;
          color: #fff;
        }

        /* Conteúdo expandível */
        .sw-step-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
        }
        .sw-step-content.open {
          max-height: 5000px;
        }

        /* === ESTILOS INTERNOS DO CONTEÚDO === */
        .sw-content-inner {
          padding: 0 28px 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .sw-subtitle {
          font-size: 1rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }

        /* Instruction Box */
        .sw-instruction-box {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 14px;
        }
        .sw-instruction-box--green {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.2);
        }
        .sw-instruction-box--amber {
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.2);
        }
        .sw-instruction-box--blue {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.2);
        }
        .sw-instruction-icon {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 12px;
          background: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sw-instruction-box h4 {
          margin: 0 0 6px;
          font-size: 0.9375rem;
          font-weight: 700;
        }
        .sw-instruction-box p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
        }

        /* Numbered List */
        .sw-numbered-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sw-list-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.4;
        }
        .sw-list-item code {
          background: rgba(139, 92, 246, 0.2);
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.85rem;
          color: #c4b5fd;
        }
        .sw-step-number {
          width: 28px;
          height: 28px;
          min-width: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Highlight Box */
        .sw-highlight-box {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 14px;
        }
        .sw-highlight-box > svg {
          color: #f59e0b;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .sw-highlight-box p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        /* Warning Box */
        .sw-warning-box {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 14px;
        }
        .sw-warning-box > svg {
          color: #ef4444;
          flex-shrink: 0;
        }
        .sw-warning-box p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Success Box */
        .sw-success-box {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 16px;
        }
        .sw-success-box > svg {
          color: #10b981;
          flex-shrink: 0;
        }
        .sw-success-box h4 {
          margin: 0 0 4px;
          font-size: 1rem;
          font-weight: 700;
          color: #10b981;
        }
        .sw-success-box p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Action Row (Botões) */
        .sw-action-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .sw-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          color: #fff;
        }
        .sw-btn--primary {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
        }
        .sw-btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
        }
        .sw-btn--blue {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }
        .sw-btn--blue:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
        }

        /* Tip Cards */
        .sw-tip-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }
        .sw-tip-card {
          display: flex;
          gap: 14px;
          padding: 18px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
        }
        .sw-tip-card__icon {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sw-tip-card h5 {
          margin: 0 0 4px;
          font-size: 0.9375rem;
          font-weight: 700;
        }
        .sw-tip-card p {
          margin: 0 0 6px;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
        }
        .sw-link {
          font-size: 0.8125rem;
          color: #3b82f6;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }
        .sw-link:hover {
          color: #60a5fa;
        }

        /* Embedded Component */
        .sw-embedded-component {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.2);
        }
        .sw-embedded-component > div:last-child {
          /* Remove margin/padding extras dos componentes embarcados */
        }
        .sw-embedded-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(16, 185, 129, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.8125rem;
          font-weight: 600;
          color: #10b981;
        }

        /* Example Pills */
        .sw-examples-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .sw-example-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          flex: 1;
          min-width: 120px;
        }
        .sw-example-pill--featured {
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.3);
        }
        .sw-example-pill__label {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 6px;
        }
        .sw-example-pill__price {
          font-size: 1.25rem;
          font-weight: 800;
          color: #fff;
        }
        .sw-example-pill--featured .sw-example-pill__price {
          color: #f59e0b;
        }

        /* Pro Tip */
        .sw-pro-tip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 12px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }
        .sw-pro-tip svg {
          color: #a78bfa;
          flex-shrink: 0;
        }

        /* Message Types */
        .sw-msg-types {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sw-msg-type {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
        }
        .sw-msg-type__dot {
          width: 10px;
          height: 10px;
          min-width: 10px;
          border-radius: 50%;
        }
        .sw-msg-type h5 {
          margin: 0 0 2px;
          font-size: 0.9rem;
          font-weight: 700;
        }
        .sw-msg-type p {
          margin: 0;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.45);
        }

        /* Checklist */
        .sw-checklist-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sw-checklist-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.75);
        }
        .sw-checklist-item svg {
          flex-shrink: 0;
        }

        /* Final Tips */
        .sw-final-tips {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .sw-final-tip {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
        }
        .sw-final-tip__number {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 800;
          color: #ec4899;
        }
        .sw-final-tip h5 {
          margin: 0 0 4px;
          font-size: 0.9375rem;
          font-weight: 700;
        }
        .sw-final-tip p {
          margin: 0;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.5;
        }

        /* === RESPONSIVO === */
        @media (max-width: 768px) {
          .sw-title {
            font-size: 2.5rem;
          }
          .sw-step-header {
            padding: 18px 16px;
            gap: 12px;
          }
          .sw-step-icon-wrap {
            width: 48px;
            height: 48px;
          }
          .sw-step-title {
            font-size: 1rem;
          }
          .sw-content-inner {
            padding: 0 16px 24px;
            gap: 18px;
          }
          .sw-examples-row {
            flex-direction: column;
          }
        }
      `}</style>

      <div style={{ maxWidth: '896px', margin: '0 auto' }}>
        {/* Header */}
        <header className={`sw-header ${isVisible ? 'sw-animate-in' : ''}`} style={{ opacity: isVisible ? 1 : 0 }}>
          <div className="sw-badge">
            <Sparkles size={14} />
            <span>CONFIGURAÇÃO GUIADA</span>
          </div>
          <h1 className="sw-title">
            Setup <span className="sw-title-gradient">Inteligente</span>
          </h1>
          <p className="sw-description">
            Siga cada etapa para configurar sua operação do zero, mesmo sem experiência.
          </p>
        </header>

        {/* Barra de Progresso */}
        <div className="sw-progress">
          <div className="sw-progress-bar">
            <div 
              className="sw-progress-fill" 
              style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
            />
          </div>
          <div className="sw-progress-text">
            <span><strong>{completedSteps.length}</strong> de {steps.length} etapas concluídas</span>
            <span>{Math.round((completedSteps.length / steps.length) * 100)}%</span>
          </div>
        </div>

        {/* Lista de Etapas */}
        <div className="sw-steps-list">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isOpen = openIndex === index;
            const isCompleted = completedSteps.includes(index);

            return (
              <div 
                key={index} 
                className={`sw-step-item ${isOpen ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="sw-step-header" onClick={() => toggleStep(index)}>
                  <div 
                    className="sw-step-icon-wrap"
                    style={{ background: `${step.color}20` }}
                  >
                    <Icon style={{ color: step.color }} />
                  </div>
                  
                  <div className="sw-step-text">
                    <h3 className="sw-step-title">{step.title}</h3>
                    <p className="sw-step-desc">{step.description}</p>
                  </div>

                  <button 
                    className={`sw-step-check-btn ${isCompleted ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); markComplete(index); }}
                    title={isCompleted ? 'Marcar como pendente' : 'Marcar como concluído'}
                  >
                    <CheckCircle2 size={18} />
                  </button>

                  <ChevronDown size={22} className="sw-step-chevron" />
                </div>

                <div className={`sw-step-content ${isOpen ? 'open' : ''}`}>
                  {step.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SetupWizard;