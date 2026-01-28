import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, Bot, ShieldCheck, Fingerprint, Rocket, 
  Settings, Gem, MessageSquare, CreditCard, Zap, 
  CheckCircle2, AlertTriangle, Terminal, Info, 
  ArrowRight, ShieldAlert, Cpu, Share2, Target, 
  MousePointer2, Clock, Trash2, Smartphone, 
  PlusCircle, UserCheck, HelpCircle, ShoppingBag
} from 'lucide-react';

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
      icon: Bot,
      title: "Etapa 1 – Criação do Bot",
      content: (
        <div className="tut-content-inner">
          <h4 className="tut-subtitle">Passo a passo</h4>
          <ol className="tut-numbered-list">
            <li className="tut-list-item">
              <span className="tut-step-number">1</span>
              <span>Acesse o Telegram e busque por <strong>@BotFather</strong></span>
            </li>
            <li className="tut-list-item">
              <span className="tut-step-number">2</span>
              <span>Envie o comando <code>/newbot</code></span>
            </li>
            <li className="tut-list-item">
              <span className="tut-step-number">3</span>
              <span>Escolha um nome para o seu bot (ex: Meu Bot VIP)</span>
            </li>
            <li className="tut-list-item">
              <span className="tut-step-number">4</span>
              <span>Escolha um username único terminando em "bot" (ex: meubotvip_bot)</span>
            </li>
          </ol>
          
          <div className="tut-info-box">
            <Info className="tut-info-icon" size={20} />
            <p>O BotFather enviará uma mensagem com o Token do seu bot. Guarde-o com segurança!</p>
          </div>
          
          <div className="tut-box-purple">
            <CheckCircle2 size={20} />
            <span>Confirmação: Você receberá o token no formato abaixo</span>
          </div>
          
          <div className="tut-token-display">
            <Terminal size={18} />
            <code>1234567890:ABCDefGHIjklMNOpqrsTUVwxyz123456789</code>
          </div>
          
          <div className="tut-highlight-box">
            <ShieldAlert size={20} />
            <p><strong>Importante:</strong> Nunca compartilhe seu token com terceiros. Ele dá acesso total ao seu bot.</p>
          </div>
          
          <div className="tut-box-error">
            <AlertTriangle size={20} />
            <span>Se perder o token, use /token no BotFather para gerar um novo (isso invalida o anterior)</span>
          </div>
        </div>
      )
    },
    {
      icon: ShieldCheck,
      title: "Etapa 2 – Canal/Grupo VIP",
      content: (
        <div className="tut-content-inner">
          <div className="tut-badge-strategy">
            <Target size={16} />
            <span>ESTRATÉGIA RECOMENDADA</span>
          </div>
          
          <h4 className="tut-subtitle">Configurando seu espaço VIP</h4>
          
          <div className="tut-steps-grid">
            <div className="tut-step-card">
              <span className="tut-step-badge">01</span>
              <h5>Criar Canal/Grupo</h5>
              <p>Crie um canal ou grupo privado no Telegram para seus membros VIP</p>
            </div>
            <div className="tut-step-card">
              <span className="tut-step-badge">02</span>
              <h5>Adicionar Bot</h5>
              <p>Adicione seu bot como administrador do canal/grupo</p>
            </div>
            <div className="tut-step-card">
              <span className="tut-step-badge">03</span>
              <h5>Configurar Permissões</h5>
              <p>Defina as permissões corretas para o bot gerenciar membros</p>
            </div>
          </div>
          
          <div className="tut-dark-box">
            <h5><ShieldCheck size={18} /> Permissões Obrigatórias</h5>
            <ul className="tut-permissions-list">
              <li><CheckCircle2 size={16} /> Adicionar membros</li>
              <li><CheckCircle2 size={16} /> Banir usuários</li>
              <li><CheckCircle2 size={16} /> Convidar via link</li>
              <li><CheckCircle2 size={16} /> Gerenciar convites</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      icon: Fingerprint,
      title: "Etapa 3 – ID do VIP",
      content: (
        <div className="tut-content-inner">
          <h4 className="tut-subtitle">Obtendo o ID do Canal/Grupo</h4>
          
          <ol className="tut-numbered-list">
            <li className="tut-list-item">
              <span className="tut-step-number">1</span>
              <span>Adicione o bot <strong>@userinfobot</strong> ao seu canal/grupo</span>
            </li>
            <li className="tut-list-item">
              <span className="tut-step-number">2</span>
              <span>Encaminhe qualquer mensagem do canal para o bot</span>
            </li>
            <li className="tut-list-item">
              <span className="tut-step-number">3</span>
              <span>O bot retornará o ID do canal/grupo</span>
            </li>
          </ol>
          
          <div className="tut-info-box tut-info-blue">
            <Info size={20} />
            <p>O ID de canais/grupos privados começa com <strong>-100</strong></p>
          </div>
          
          <div className="tut-id-display">
            <span className="tut-id-label">ID do Canal</span>
            <code className="tut-id-value">-1001234567890</code>
          </div>
          
          <div className="tut-highlight-box">
            <Cpu size={20} />
            <p>Guarde este ID. Você precisará dele para configurar o bot na plataforma.</p>
          </div>
        </div>
      )
    },
    {
      icon: Rocket,
      title: "Etapa 4 – Criar Bot na Plataforma",
      content: (
        <div className="tut-content-inner">
          <div className="tut-path-display">
            <span>Dashboard</span>
            <ArrowRight size={14} />
            <span>Bots</span>
            <ArrowRight size={14} />
            <span>Novo Bot</span>
          </div>
          
          <h4 className="tut-subtitle">Escolha o tipo de bot</h4>
          
          <div className="tut-bot-type-card tut-bot-featured">
            <div className="tut-bot-type-card">
              <div className="tut-featured-badge">RECOMENDADO</div>
              <div className="tut-bot-type-icon">
                <Smartphone size={32} />
              </div>
              <h5>Bot Tradicional</h5>
              <p>Interação via comandos e botões inline no chat do Telegram</p>
              <ul className="tut-feature-list">
                <li><CheckCircle2 size={14} /> Comandos personalizados</li>
                <li><CheckCircle2 size={14} /> Botões interativos</li>
                <li><CheckCircle2 size={14} /> Mensagens automáticas</li>
              </ul>
            </div>
            
            <div className="tut-bot-type-card tut-bot-featured">
              <div className="tut-featured-badge">EM BREVE</div>  
              <div className="tut-bot-type-icon">
                <Smartphone size={32} />
              </div>
              <h5>Bot Personalizado (Mini App)</h5>
              <p>Interface visual moderna dentro do Telegram com experiência de app</p>
              <ul className="tut-feature-list">
                <li><CheckCircle2 size={14} /> Interface visual completa</li>
                <li><CheckCircle2 size={14} /> Experiência de aplicativo</li>
                <li><CheckCircle2 size={14} /> Checkout integrado</li>
              </ul>
            </div>
          </div>
          
          <div className="tut-data-box">
            <h5><Settings size={18} /> Dados necessários</h5>
            <div className="tut-data-grid">
              <div className="tut-data-item">
                <span className="tut-data-label">Token do Bot</span>
                <span className="tut-data-desc">Obtido no BotFather</span>
              </div>
              <div className="tut-data-item">
                <span className="tut-data-label">ID do VIP</span>
                <span className="tut-data-desc">Canal ou grupo privado</span>
              </div>
              <div className="tut-data-item">
                <span className="tut-data-label">Nome do Bot</span>
                <span className="tut-data-desc">Nome de exibição</span>
              </div>
            </div>
          </div>
          
          <div className="tut-fake-button">
            <PlusCircle size={18} />
            <span>Criar Novo Bot</span>
          </div>
        </div>
      )
    },
    {
      icon: Settings,
      title: "Etapa 5 – Configurações",
      content: (
        <div className="tut-content-inner">
          <h4 className="tut-subtitle">Configurações essenciais</h4>
          
          <div className="tut-config-grid">
            <div className="tut-config-card">
              <div className="tut-config-header">
                <UserCheck size={24} />
                <h5>ID Admin Principal</h5>
              </div>
              <p>Seu ID pessoal do Telegram para receber notificações e ter controle total</p>
              <div className="tut-input-fake">
                <span>Seu ID</span>
                <code>123456789</code>
              </div>
              <div className="tut-config-tip">
                <HelpCircle size={14} />
                <span>Envie /start para @userinfobot para descobrir seu ID</span>
              </div>
            </div>
            
            <div className="tut-config-card">
              <div className="tut-config-header">
                <MessageSquare size={24} />
                <h5>Username Suporte</h5>
              </div>
              <p>Username que aparecerá como contato de suporte para seus clientes</p>
              <div className="tut-input-fake">
                <span>Username</span>
                <code>@seusuporte</code>
              </div>
              <div className="tut-config-tip">
                <HelpCircle size={14} />
                <span>Pode ser seu username pessoal ou de outro atendente</span>
              </div>
            </div>
          </div>
          
          <div className="tut-fake-button tut-button-success">
            <CheckCircle2 size={18} />
            <span>Salvar e Avançar</span>
          </div>
        </div>
      )
    },
    {
      icon: Gem,
      title: "Etapa 6 – Planos",
      content: (
        <div className="tut-content-inner">
          <h4 className="tut-subtitle">Configure seus planos de assinatura</h4>
          
          <div className="tut-plans-grid">
            <div className="tut-plan-pill">
              <Clock size={16} />
              <span>Mensal</span>
            </div>
            <div className="tut-plan-pill tut-plan-featured">
              <Gem size={16} />
              <span>Trimestral</span>
            </div>
            <div className="tut-plan-pill">
              <Rocket size={16} />
              <span>Anual</span>
            </div>
            <div className="tut-plan-pill">
              <Zap size={16} />
              <span>Vitalício</span>
            </div>
          </div>
          
          <div className="tut-plans-cards">
            <div className="tut-plan-card">
              <h5>Plano Mensal</h5>
              <div className="tut-plan-price">
                <span className="tut-currency">R$</span>
                <span className="tut-amount">49</span>
                <span className="tut-period">/mês</span>
              </div>
              <ul className="tut-plan-features">
                <li><CheckCircle2 size={14} /> Acesso completo ao VIP</li>
                <li><CheckCircle2 size={14} /> Suporte prioritário</li>
                <li><CheckCircle2 size={14} /> Renovação automática</li>
              </ul>
            </div>
            
            <div className="tut-plan-card tut-plan-card-featured">
              <div className="tut-plan-badge">MAIS VENDIDO</div>
              <h5>Plano Trimestral</h5>
              <div className="tut-plan-price">
                <span className="tut-currency">R$</span>
                <span className="tut-amount">129</span>
                <span className="tut-period">/3 meses</span>
              </div>
              <ul className="tut-plan-features">
                <li><CheckCircle2 size={14} /> Tudo do mensal</li>
                <li><CheckCircle2 size={14} /> Economia de 12%</li>
                <li><CheckCircle2 size={14} /> Bônus exclusivos</li>
              </ul>
            </div>
            
            <div className="tut-plan-card">
              <h5>Plano Anual</h5>
              <div className="tut-plan-price">
                <span className="tut-currency">R$</span>
                <span className="tut-amount">399</span>
                <span className="tut-period">/ano</span>
              </div>
              <ul className="tut-plan-features">
                <li><CheckCircle2 size={14} /> Tudo do trimestral</li>
                <li><CheckCircle2 size={14} /> Economia de 32%</li>
                <li><CheckCircle2 size={14} /> Acesso antecipado</li>
              </ul>
            </div>
          </div>
          
          <div className="tut-action-box">
            <Share2 size={20} />
            <p>Após criar os planos, eles aparecerão automaticamente no seu bot para os clientes.</p>
          </div>
        </div>
      )
    },
    {
      icon: MessageSquare,
      title: "Etapa 7 – Flow Chat",
      content: (
        <div className="tut-content-inner">
          <h4 className="tut-subtitle">Configure o fluxo de conversação</h4>
          
          <div className="tut-flow-types-grid">
            <div className="tut-flow-type">
              <MousePointer2 size={24} />
              <h5>Fluxo Manual</h5>
              <p>Crie mensagens e botões personalizados para cada etapa</p>
            </div>
            <div className="tut-flow-type tut-flow-active">
              <Zap size={24} />
              <h5>Fluxo Automático</h5>
              <p>Use o fluxo padrão otimizado para conversões</p>
            </div>
          </div>
          
          <div className="tut-flow-section">
            <h5><Cpu size={18} /> Fluxo Padrão Recomendado</h5>
            <div className="tut-flow-options">
              <div className="tut-flow-option">
                <CheckCircle2 size={16} />
                <span>Mensagem de boas-vindas</span>
              </div>
              <div className="tut-flow-option">
                <CheckCircle2 size={16} />
                <span>Apresentação da oferta</span>
              </div>
              <div className="tut-flow-option">
                <CheckCircle2 size={16} />
                <span>Botão de compra</span>
              </div>
              <div className="tut-flow-option">
                <CheckCircle2 size={16} />
                <span>Checkout integrado</span>
              </div>
            </div>
          </div>
          
          <div className="tut-rule-card">
            <AlertTriangle size={20} />
            <div>
              <h5>Regra Crítica</h5>
              <p>O fluxo deve sempre terminar com uma chamada para ação clara. Nunca deixe o usuário sem próximo passo.</p>
            </div>
          </div>
          
          <div className="tut-checkout-box">
            <ShoppingBag size={20} />
            <div>
              <h5>Lógica de Checkout</h5>
              <p>Quando o usuário clicar em comprar, ele será redirecionado automaticamente para o checkout com PIX ou cartão.</p>
            </div>
          </div>
          
          <div className="tut-flow-diagram">
            <div className="tut-flow-step">
              <span>Início</span>
            </div>
            <ArrowRight size={16} className="tut-flow-arrow" />
            <div className="tut-flow-step">
              <span>Boas-vindas</span>
            </div>
            <ArrowRight size={16} className="tut-flow-arrow" />
            <div className="tut-flow-step">
              <span>Oferta</span>
            </div>
            <ArrowRight size={16} className="tut-flow-arrow" />
            <div className="tut-flow-step">
              <span>Pagamento</span>
            </div>
            <ArrowRight size={16} className="tut-flow-arrow" />
            <div className="tut-flow-step tut-flow-final">
              <span>VIP</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div 
      className="landing-page"
      style={{
        marginLeft: 'var(--sidebar-width, 0px)',
        marginTop: '70px',
        padding: '60px 20px',
        backgroundColor: '#050507',
        minHeight: '100vh',
        color: '#ffffff'
      }}
    >
      <style jsx>{`
        .landing-page {
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        /* Header */
        .tut-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 48px;
        }
        
        .tut-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 24px;
        }
        
        .tut-title {
          font-size: 3.5rem;
          font-weight: 900;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .tut-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          line-height: 1.6;
        }
        
        /* Tutorial List */
        .tutorials-list {
          max-width: 896px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .tutorial-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .tutorial-item.active {
          border: 2px solid rgba(139, 92, 246, 0.6);
          box-shadow: 0 0 40px rgba(139, 92, 246, 0.15);
        }
        
        .tutorial-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .tutorial-header:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        
        .tutorial-icon-wrapper {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        
        .tutorial-icon-wrapper.active {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
        }
        
        .tutorial-icon {
          width: 32px;
          height: 32px;
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
        }
        
        .tutorial-icon.active {
          color: #ffffff;
        }
        
        .tutorial-title {
          flex: 1;
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: -0.01em;
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
          margin: 0;
        }
        
        .tutorial-title.active {
          color: #ffffff;
        }
        
        .tutorial-chevron {
          color: rgba(255, 255, 255, 0.4);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        
        .tutorial-chevron.active {
          color: #8b5cf6;
          transform: rotate(180deg);
        }
        
        /* Tutorial Content */
        .tutorial-content {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.7s ease;
        }
        
        .tutorial-content.open {
          max-height: 3500px;
          opacity: 1;
        }
        
        .tut-content-inner {
          padding: 0 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        /* Subtitle */
        .tut-subtitle {
          font-size: 1rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Numbered List */
        .tut-numbered-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .tut-list-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .tut-step-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }
        
        .tut-list-item code {
          background: rgba(139, 92, 246, 0.2);
          padding: 2px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.875rem;
        }
        
        /* Info Box */
        .tut-info-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
        }
        
        .tut-info-box.tut-info-blue {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
        }
        
        .tut-info-icon {
          color: #3b82f6;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .tut-info-box p {
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
        }
        
        /* Purple Box */
        .tut-box-purple {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .tut-box-purple svg {
          color: #8b5cf6;
          flex-shrink: 0;
        }
        
        /* Token Display */
        .tut-token-display {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }
        
        .tut-token-display svg {
          color: #8b5cf6;
          flex-shrink: 0;
        }
        
        .tut-token-display code {
          font-family: monospace;
          font-size: 0.875rem;
          color: #8b5cf6;
          word-break: break-all;
        }
        
        /* Highlight Box */
        .tut-highlight-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
        }
        
        .tut-highlight-box svg {
          color: #8b5cf6;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .tut-highlight-box p {
          margin: 0;
          line-height: 1.5;
        }
        
        /* Error Box */
        .tut-box-error {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .tut-box-error svg {
          color: #ef4444;
          flex-shrink: 0;
        }
        
        /* Strategy Badge */
        .tut-badge-strategy {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(251, 191, 36, 0.2));
          border: 1px solid rgba(234, 179, 8, 0.3);
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #fbbf24;
          width: fit-content;
        }
        
        /* Steps Grid */
        .tut-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        
        @media (max-width: 768px) {
          .tut-steps-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .tut-step-card {
          padding: 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        
        .tut-step-card:hover {
          border-color: rgba(139, 92, 246, 0.3);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .tut-step-badge {
          display: inline-block;
          padding: 4px 10px;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        
        .tut-step-card h5 {
          margin: 0 0 8px;
          font-size: 1rem;
          font-weight: 700;
        }
        
        .tut-step-card p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
        }
        
        /* Dark Box */
        .tut-dark-box {
          padding: 24px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }
        
        .tut-dark-box h5 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 16px;
          font-size: 1rem;
          font-weight: 700;
        }
        
        .tut-dark-box h5 svg {
          color: #8b5cf6;
        }
        
        .tut-permissions-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        @media (max-width: 640px) {
          .tut-permissions-list {
            grid-template-columns: 1fr;
          }
        }
        
        .tut-permissions-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .tut-permissions-list svg {
          color: #22c55e;
          flex-shrink: 0;
        }
        
        /* ID Display */
        .tut-id-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }
        
        .tut-id-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .tut-id-value {
          font-family: monospace;
          font-size: 1.125rem;
          color: #8b5cf6;
          font-weight: 600;
        }
        
        /* Path Display */
        .tut-path-display {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          width: fit-content;
        }
        
        .tut-path-display span:last-of-type {
          color: #8b5cf6;
          font-weight: 600;
        }
        
        .tut-path-display svg {
          color: rgba(255, 255, 255, 0.3);
        }
        
        /* Bot Types Grid */
        .tut-bot-types-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        @media (max-width: 768px) {
          .tut-bot-types-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .tut-bot-type-card {
          padding: 28px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .tut-bot-type-card:hover {
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-2px);
        }
        
        .tut-bot-type-card.tut-bot-featured {
          border-color: rgba(139, 92, 246, 0.4);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
        }
        
        .tut-featured-badge {
          position: absolute;
          top: -10px;
          right: 20px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .tut-bot-type-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(139, 92, 246, 0.15);
          border-radius: 16px;
          margin-bottom: 20px;
        }
        
        .tut-bot-type-icon svg {
          color: #8b5cf6;
        }
        
        .tut-bot-type-card h5 {
          margin: 0 0 8px;
          font-size: 1.125rem;
          font-weight: 700;
        }
        
        .tut-bot-type-card > p {
          margin: 0 0 20px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
        }
        
        .tut-feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .tut-feature-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .tut-feature-list svg {
          color: #22c55e;
          flex-shrink: 0;
        }
        
        /* Data Box */
        .tut-data-box {
          padding: 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }
        
        .tut-data-box h5 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 20px;
          font-size: 1rem;
          font-weight: 700;
        }
        
        .tut-data-box h5 svg {
          color: #8b5cf6;
        }
        
        .tut-data-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        
        @media (max-width: 768px) {
          .tut-data-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .tut-data-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .tut-data-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
        }
        
        .tut-data-desc {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        /* Fake Button */
        .tut-fake-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          width: fit-content;
        }
        
        .tut-fake-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }
        
        .tut-fake-button.tut-button-success {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }
        
        .tut-fake-button.tut-button-success:hover {
          box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
        }
        
        /* Config Grid */
        .tut-config-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        @media (max-width: 768px) {
          .tut-config-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .tut-config-card {
          padding: 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }
        
        .tut-config-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .tut-config-header svg {
          color: #8b5cf6;
        }
        
        .tut-config-header h5 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
        }
        
        .tut-config-card > p {
          margin: 0 0 16px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
        }
        
        .tut-input-fake {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          margin-bottom: 12px;
        }
        
        .tut-input-fake span {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .tut-input-fake code {
          font-family: monospace;
          color: #8b5cf6;
        }
        
        .tut-config-tip {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .tut-config-tip svg {
          color: rgba(255, 255, 255, 0.4);
          flex-shrink: 0;
        }
        
        /* Plans */
        .tut-plans-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .tut-plan-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .tut-plan-pill:hover {
          border-color: rgba(139, 92, 246, 0.3);
          color: #ffffff;
        }
        
        .tut-plan-pill.tut-plan-featured {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
          border-color: rgba(139, 92, 246, 0.4);
          color: #ffffff;
        }
        
        .tut-plan-pill svg {
          width: 16px;
          height: 16px;
        }
        
        .tut-plans-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        @media (max-width: 768px) {
          .tut-plans-cards {
            grid-template-columns: 1fr;
          }
        }
        
        .tut-plan-card {
          padding: 28px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .tut-plan-card:hover {
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-4px);
        }
        
        .tut-plan-card.tut-plan-card-featured {
          border-color: rgba(139, 92, 246, 0.4);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05));
        }
        
        .tut-plan-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 14px;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        
        .tut-plan-card h5 {
          margin: 0 0 16px;
          font-size: 1.125rem;
          font-weight: 700;
        }
        
        .tut-plan-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 20px;
        }
        
        .tut-currency {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .tut-amount {
          font-size: 2.5rem;
          font-weight: 900;
          color: #ffffff;
        }
        
        .tut-period {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .tut-plan-features {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .tut-plan-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .tut-plan-features svg {
          color: #22c55e;
          flex-shrink: 0;
        }
        
        /* Action Box */
        .tut-action-box {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 14px;
        }
        
        .tut-action-box svg {
          color: #8b5cf6;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .tut-action-box p {
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
        }
        
        /* Flow Types */
        .tut-flow-types-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        
        @media (max-width: 640px) {
          .tut-flow-types-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .tut-flow-type {
          padding: 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .tut-flow-type:hover {
          border-color: rgba(139, 92, 246, 0.3);
        }
        
        .tut-flow-type.tut-flow-active {
          border-color: rgba(139, 92, 246, 0.5);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1));
        }
        
        .tut-flow-type svg {
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 12px;
        }
        
        .tut-flow-type.tut-flow-active svg {
          color: #8b5cf6;
        }
        
        .tut-flow-type h5 {
          margin: 0 0 8px;
          font-size: 1rem;
          font-weight: 700;
        }
        
        .tut-flow-type p {
          margin: 0;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.4;
        }
        
        /* Flow Section */
        .tut-flow-section {
          padding: 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }
        
        .tut-flow-section h5 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 20px;
          font-size: 1rem;
          font-weight: 700;
        }
        
        .tut-flow-section h5 svg {
          color: #8b5cf6;
        }
        
        .tut-flow-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        @media (max-width: 640px) {
          .tut-flow-options {
            grid-template-columns: 1fr;
          }
        }
        
        .tut-flow-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          font-size: 0.875rem;
        }
        
        .tut-flow-option svg {
          color: #22c55e;
          flex-shrink: 0;
        }
        
        /* Rule Card */
        .tut-rule-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px;
          background: rgba(234, 179, 8, 0.1);
          border: 1px solid rgba(234, 179, 8, 0.2);
          border-radius: 14px;
        }
        
        .tut-rule-card > svg {
          color: #eab308;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .tut-rule-card h5 {
          margin: 0 0 6px;
          font-size: 0.9375rem;
          font-weight: 700;
          color: #fbbf24;
        }
        
        .tut-rule-card p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }
        
        /* Checkout Box */
        .tut-checkout-box {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 14px;
        }
        
        .tut-checkout-box > svg {
          color: #3b82f6;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .tut-checkout-box h5 {
          margin: 0 0 6px;
          font-size: 0.9375rem;
          font-weight: 700;
        }
        
        .tut-checkout-box p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }
        
        /* Flow Diagram */
        .tut-flow-diagram {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 24px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          flex-wrap: wrap;
        }
        
        .tut-flow-step {
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .tut-flow-step.tut-flow-final {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          border-color: transparent;
        }
        
        .tut-flow-arrow {
          color: rgba(255, 255, 255, 0.3);
          flex-shrink: 0;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .tut-title {
            font-size: 2.5rem;
          }
          
          .tutorial-header {
            padding: 20px;
            gap: 16px;
          }
          
          .tutorial-icon-wrapper {
            width: 56px;
            height: 56px;
          }
          
          .tutorial-icon {
            width: 26px;
            height: 26px;
          }
          
          .tutorial-title {
            font-size: 1.0625rem;
          }
          
          .tut-content-inner {
            padding: 0 20px 28px;
            gap: 20px;
          }
        }
      `}</style>
      
      <div className="tut-container" style={{ maxWidth: '896px', margin: '0 auto' }}>
        {/* Header */}
        <header className={`tut-header ${isVisible ? 'animate-fade-in-up' : ''}`} style={{ opacity: isVisible ? 1 : 0 }}>
          <div className="tut-badge">
            <Zap size={14} />
            <span>MANUAL COMPLETO 2026</span>
          </div>
          <h1 className="tut-title">
            Guia <span className="text-gradient">Definitivo</span>
          </h1>
          <p className="tut-description">
            Tudo o que você precisa para configurar sua estrutura profissional.
          </p>
        </header>
        
        {/* Tutorial List */}
        <div className="tutorials-list">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index} 
                className={`tutorial-item ${isOpen ? 'active' : ''}`}
              >
                <div 
                  className="tutorial-header"
                  onClick={() => toggleTutorial(index)}
                >
                  <div className={`tutorial-icon-wrapper ${isOpen ? 'active' : ''}`}>
                    <Icon className={`tutorial-icon ${isOpen ? 'active' : ''}`} />
                  </div>
                  <h3 className={`tutorial-title ${isOpen ? 'active' : ''}`}>
                    {step.title}
                  </h3>
                  <ChevronDown 
                    size={24} 
                    className={`tutorial-chevron ${isOpen ? 'active' : ''}`}
                  />
                </div>
                <div className={`tutorial-content ${isOpen ? 'open' : ''}`}>
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

export default Tutorial;
