import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, Bot, CreditCard, Gem, MessageSquare, 
  CheckCircle2, Info, Zap, Settings, ShieldCheck,
  Star, Sparkles, CircleDot, AlertTriangle, ExternalLink,
  Wrench
} from 'lucide-react';
import { useBot } from '../context/BotContext';
import { useAuth } from '../context/AuthContext';
import { integrationService, planService, flowService } from '../services/api';
import './SetupWizard.css';

// =========================================================
// 🔥 IMPORTAÇÃO DOS COMPONENTES REAIS
// =========================================================
import { NewBot } from './NewBot';
import { BotConfig } from './BotConfig';
import { Integrations } from './Integrations';
import { Plans } from './Plans';
import { ChatFlow } from './ChatFlow';

// =========================================================
// 📦 COMPONENTE: SetupWizard (Configuração Guiada)
// =========================================================
export function SetupWizard() {
  const navigate = useNavigate();
  const { selectedBot, bots } = useBot();
  const { hasBot } = useAuth();

  const [openIndex, setOpenIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  // 🆕 Estado para o bot recém-criado (mostra BotConfig embarcado)
  const [newlyCreatedBotId, setNewlyCreatedBotId] = useState(null);

  // =========================================================
  // 🔍 AUTO-DETECÇÃO DE ETAPAS CONCLUÍDAS
  // =========================================================
  const detectCompletedSteps = useCallback(async () => {
    if (!selectedBot) return;

    const detected = [];

    try {
      // Etapa 0 (Criar Bot): Se tem bot, está concluída
      if (hasBot && bots.length > 0) {
        detected.push(0);
      }

      // Etapa 1 (BotConfig): Se o bot tem admin_principal_id ou suporte configurado
      // Consideramos concluída se o bot existe (configuração básica já foi feita na criação)
      if (hasBot && selectedBot) {
        detected.push(1);
      }

      // Etapa 2 (Gateway): Verifica se tem gateway configurada e ativa
      try {
        const gwConfig = await integrationService.getGatewayConfig(selectedBot.id);
        const temGatewayAtiva = gwConfig?.pushinpay?.ativo || gwConfig?.wiinpay?.ativo;
        if (temGatewayAtiva) {
          detected.push(2);
        }
      } catch (e) { /* Gateway não configurada */ }

      // Etapa 3 (Planos): Verifica se tem pelo menos 1 plano criado
      try {
        const plans = await planService.listPlans(selectedBot.id);
        if (plans && plans.length > 0) {
          detected.push(3);
        }
      } catch (e) { /* Sem planos */ }

      // Etapa 4 (Flow Chat): Verifica se tem fluxo configurado
      try {
        const flow = await flowService.getFlow(selectedBot.id);
        if (flow && flow.msg_boas_vindas && flow.msg_boas_vindas.trim().length > 0) {
          detected.push(4);
        }
      } catch (e) { /* Sem flow */ }

      // Etapa 5 (Final): Se todas as anteriores (0-4) estão completas
      if (detected.includes(0) && detected.includes(2) && detected.includes(3)) {
        detected.push(5);
      }

    } catch (e) {
      console.error("Erro na auto-detecção:", e);
    }

    // Merge: mantém as marcações manuais + adiciona as automáticas
    const botKey = `zenyx_setup_progress_${selectedBot.id}`;
    setCompletedSteps(prev => {
      const merged = [...new Set([...prev, ...detected])];
      localStorage.setItem(botKey, JSON.stringify(merged));
      return merged;
    });

    // Auto-abre a primeira etapa não concluída
    const firstIncomplete = [0, 1, 2, 3, 4, 5].find(i => !detected.includes(i));
    if (firstIncomplete !== undefined) {
      setOpenIndex(firstIncomplete);
    } else {
      setOpenIndex(null); // Tudo concluído
    }

  }, [selectedBot, hasBot, bots]);

  // Helper: chave de storage por bot
  const storageKey = selectedBot 
    ? `zenyx_setup_progress_${selectedBot.id}` 
    : 'zenyx_setup_progress_global';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Quando trocar de bot: reseta estado e re-detecta
  useEffect(() => {
    if (selectedBot) {
      // Reseta para o progresso salvo DESTE bot específico
      const saved = localStorage.getItem(`zenyx_setup_progress_${selectedBot.id}`);
      if (saved) {
        try { setCompletedSteps(JSON.parse(saved)); } catch(e) { setCompletedSteps([]); }
      } else {
        setCompletedSteps([]);
      }
      setOpenIndex(null);
      // Re-detecta status real via API
      detectCompletedSteps();
    } else {
      setCompletedSteps([]);
      setOpenIndex(0);
    }
  }, [selectedBot]);

  const toggleStep = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const markComplete = (index) => {
    const updated = completedSteps.includes(index) 
      ? completedSteps.filter(i => i !== index)
      : [...completedSteps, index];
    setCompletedSteps(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // 🆕 Auto-avança para a próxima etapa
  const autoAdvance = (currentIndex) => {
    // Marca atual como concluída
    if (!completedSteps.includes(currentIndex)) {
      const updated = [...completedSteps, currentIndex];
      setCompletedSteps(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
    // Abre a próxima
    const nextIndex = currentIndex + 1;
    if (nextIndex <= 5) {
      setTimeout(() => {
        setOpenIndex(nextIndex);
        // Scroll suave para a próxima etapa
        const el = document.getElementById(`sw-step-${nextIndex}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  };

  // 🆕 Callback quando o bot é criado pelo NewBot embarcado
  const handleBotCreated = (botId) => {
    setNewlyCreatedBotId(botId);
    autoAdvance(0);
  };

  // =========================================================
  // 📋 DEFINIÇÃO DAS ETAPAS (6 ETAPAS)
  // =========================================================
  const steps = [
    // =====================================================
    // ETAPA 1 — CRIAR BOT
    // =====================================================
    {
      icon: Bot,
      title: "Etapa 1 — Criar e Conectar seu Bot",
      description: "Crie seu bot no Telegram e conecte à plataforma",
      color: '#8b5cf6',
      content: (
        <div className="sw-content-inner">
          <div className="sw-instruction-box">
            <div className="sw-instruction-icon">
              <Info size={20} />
            </div>
            <div>
              <h4>Antes de começar</h4>
              <p>Você precisa ter um bot criado no Telegram usando o @BotFather e um canal/grupo privado (VIP). Siga os passos abaixo e depois preencha o formulário.</p>
            </div>
          </div>

          <h4 className="sw-subtitle">Passo a passo rápido</h4>
          <ol className="sw-numbered-list">
            <li className="sw-list-item">
              <span className="sw-step-number">1</span>
              <span>Abra o Telegram → busque <strong>@BotFather</strong> → envie <code>/newbot</code></span>
            </li>
            <li className="sw-list-item">
              <span className="sw-step-number">2</span>
              <span>Copie o <strong>Token</strong> gerado</span>
            </li>
            <li className="sw-list-item">
              <span className="sw-step-number">3</span>
              <span>Crie um <strong>canal/grupo privado</strong> e adicione o bot como <strong>admin</strong></span>
            </li>
            <li className="sw-list-item">
              <span className="sw-step-number">4</span>
              <span>Use o <strong>@userinfobot</strong> para pegar o ID do canal (começa com <code>-100</code>)</span>
            </li>
          </ol>

          <div className="sw-highlight-box">
            <ShieldCheck size={20} />
            <p><strong>Permissões obrigatórias:</strong> O bot precisa ser admin com permissão de adicionar membros, banir usuários e gerenciar convites.</p>
          </div>

          {/* 🔥 COMPONENTE REAL: NewBot com callback */}
          <div className="sw-embedded-component">
            <div className="sw-embedded-label">
              <Zap size={14} />
              <span>{hasBot ? 'Criar outro bot' : 'Crie seu primeiro bot agora'}</span>
            </div>
            <NewBot onBotCreated={handleBotCreated} />
          </div>
        </div>
      )
    },

    // =====================================================
    // ETAPA 2 — CONFIGURAÇÕES DO BOT (BotConfig)
    // =====================================================
    {
      icon: Wrench,
      title: "Etapa 2 — Configurações do Bot",
      description: "Ajuste credenciais, IDs, suporte e proteção de conteúdo",
      color: '#f97316',
      content: (
        <div className="sw-content-inner">
          <div className="sw-instruction-box sw-instruction-box--amber">
            <div className="sw-instruction-icon" style={{ background: 'rgba(249, 115, 22, 0.12)', color: '#f97316' }}>
              <Info size={20} />
            </div>
            <div>
              <h4>Configurações Gerais do Bot</h4>
              <p>Configure o ID do admin principal, username de suporte, canal de notificações e proteção de conteúdo. Essas configurações definem como o bot se comporta.</p>
            </div>
          </div>

          {(selectedBot || newlyCreatedBotId) ? (
            <div className="sw-embedded-component">
              <div className="sw-embedded-label">
                <Zap size={14} />
                <span>Painel de configuração do bot</span>
              </div>
              <BotConfig />
            </div>
          ) : (
            <div className="sw-warning-box">
              <AlertTriangle size={20} />
              <p>Crie um bot primeiro (Etapa 1) para acessar as configurações.</p>
            </div>
          )}
        </div>
      )
    },

    // =====================================================
    // ETAPA 3 — GATEWAY DE PAGAMENTO
    // =====================================================
    {
      icon: CreditCard,
      title: "Etapa 3 — Gateway de Pagamento",
      description: "Configure como você vai receber seus pagamentos via PIX",
      color: '#10b981',
      content: (
        <div className="sw-content-inner">
          <div className="sw-instruction-box sw-instruction-box--green">
            <div className="sw-instruction-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Info size={20} />
            </div>
            <div>
              <h4>O que é uma Gateway?</h4>
              <p>É o serviço que processa os pagamentos PIX dos seus clientes. Você precisa ter conta em pelo menos uma gateway e colar o token de API aqui.</p>
            </div>
          </div>

          <div className="sw-tip-cards">
            <div className="sw-tip-card">
              <div className="sw-tip-card__icon" style={{ background: 'rgba(0, 230, 118, 0.08)' }}>
                <Star size={20} color="#00e676" />
              </div>
              <div>
                <h5>PushinPay</h5>
                <p>Taxa ~3% · Mais popular</p>
                <a href="https://pushinpay.com.br" target="_blank" rel="noopener noreferrer" className="sw-link">
                  Criar conta <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <div className="sw-tip-card">
              <div className="sw-tip-card__icon" style={{ background: 'rgba(168, 85, 247, 0.08)' }}>
                <Star size={20} color="#a855f7" />
              </div>
              <div>
                <h5>WiinPay</h5>
                <p>Taxa ~4.5% · Alternativa</p>
                <a href="https://wiinpay.com.br" target="_blank" rel="noopener noreferrer" className="sw-link">
                  Criar conta <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

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
              <p>Você precisa criar um bot primeiro (Etapa 1) para configurar a gateway.</p>
            </div>
          )}
        </div>
      )
    },

    // =====================================================
    // ETAPA 4 — PLANOS DE ACESSO
    // =====================================================
    {
      icon: Gem,
      title: "Etapa 4 — Planos de Acesso",
      description: "Crie os planos que seus clientes poderão comprar",
      color: '#f59e0b',
      content: (
        <div className="sw-content-inner">
          <div className="sw-instruction-box sw-instruction-box--amber">
            <div className="sw-instruction-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <Info size={20} />
            </div>
            <div>
              <h4>Como funcionam os planos?</h4>
              <p>Cada plano define um preço e uma duração de acesso ao seu canal/grupo VIP. Quando o cliente paga, o bot libera o acesso automaticamente.</p>
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
              <p>Crie um bot primeiro (Etapa 1) para gerenciar planos.</p>
            </div>
          )}
        </div>
      )
    },

    // =====================================================
    // ETAPA 5 — FLOW CHAT / MENSAGENS
    // =====================================================
    {
      icon: MessageSquare,
      title: "Etapa 5 — Mensagens do Bot (Flow Chat)",
      description: "Configure o fluxo de conversa e mensagens automáticas",
      color: '#3b82f6',
      content: (
        <div className="sw-content-inner">
          <div className="sw-instruction-box sw-instruction-box--blue">
            <div className="sw-instruction-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
              <Info size={20} />
            </div>
            <div>
              <h4>Flow Chat — Fluxo de Mensagens</h4>
              <p>Configure as mensagens que o bot envia automaticamente: boas-vindas, oferta, pagamento PIX e mais. Personalize textos, mídias e botões.</p>
            </div>
          </div>

          <div className="sw-msg-types">
            <div className="sw-msg-type">
              <div className="sw-msg-type__dot" style={{ background: '#10b981' }}></div>
              <div>
                <h5>Mensagem de Boas-vindas</h5>
                <p>Primeira mensagem ao iniciar o bot</p>
              </div>
            </div>
            <div className="sw-msg-type">
              <div className="sw-msg-type__dot" style={{ background: '#3b82f6' }}></div>
              <div>
                <h5>Mensagem com Oferta</h5>
                <p>Apresentação dos planos e botão de compra</p>
              </div>
            </div>
            <div className="sw-msg-type">
              <div className="sw-msg-type__dot" style={{ background: '#f59e0b' }}></div>
              <div>
                <h5>Mensagem do PIX</h5>
                <p>Template exibido quando o pagamento é gerado</p>
              </div>
            </div>
            <div className="sw-msg-type">
              <div className="sw-msg-type__dot" style={{ background: '#a855f7' }}></div>
              <div>
                <h5>Passos Extras (Opcional)</h5>
                <p>Mensagens intermediárias personalizadas</p>
              </div>
            </div>
          </div>

          {selectedBot ? (
            <div className="sw-embedded-component">
              <div className="sw-embedded-label">
                <Zap size={14} />
                <span>Configure o fluxo completo aqui</span>
              </div>
              <ChatFlow />
            </div>
          ) : (
            <div className="sw-warning-box">
              <AlertTriangle size={20} />
              <p>Crie um bot primeiro (Etapa 1) para configurar as mensagens.</p>
            </div>
          )}
        </div>
      )
    },

    // =====================================================
    // ETAPA 6 — CONFIGURAÇÕES FINAIS
    // =====================================================
    {
      icon: Settings,
      title: "Etapa 6 — Configurações Finais",
      description: "Checklist e dicas para começar a vender",
      color: '#ec4899',
      content: (
        <div className="sw-content-inner">
          <div className="sw-checklist">
            <h4 className="sw-subtitle">Checklist de Lançamento</h4>
            
            <div className="sw-checklist-items">
              <div className="sw-checklist-item">
                <CircleDot size={18} color={completedSteps.includes(0) ? '#10b981' : '#555'} />
                <span style={{ textDecoration: completedSteps.includes(0) ? 'line-through' : 'none', opacity: completedSteps.includes(0) ? 0.6 : 1 }}>
                  Bot criado e conectado à plataforma
                </span>
                {completedSteps.includes(0) && <CheckCircle2 size={16} color="#10b981" style={{ marginLeft: 'auto' }} />}
              </div>
              <div className="sw-checklist-item">
                <CircleDot size={18} color={completedSteps.includes(1) ? '#10b981' : '#555'} />
                <span style={{ textDecoration: completedSteps.includes(1) ? 'line-through' : 'none', opacity: completedSteps.includes(1) ? 0.6 : 1 }}>
                  Configurações do bot ajustadas
                </span>
                {completedSteps.includes(1) && <CheckCircle2 size={16} color="#10b981" style={{ marginLeft: 'auto' }} />}
              </div>
              <div className="sw-checklist-item">
                <CircleDot size={18} color={completedSteps.includes(2) ? '#10b981' : '#555'} />
                <span style={{ textDecoration: completedSteps.includes(2) ? 'line-through' : 'none', opacity: completedSteps.includes(2) ? 0.6 : 1 }}>
                  Gateway de pagamento configurada e ativada
                </span>
                {completedSteps.includes(2) && <CheckCircle2 size={16} color="#10b981" style={{ marginLeft: 'auto' }} />}
              </div>
              <div className="sw-checklist-item">
                <CircleDot size={18} color={completedSteps.includes(3) ? '#10b981' : '#555'} />
                <span style={{ textDecoration: completedSteps.includes(3) ? 'line-through' : 'none', opacity: completedSteps.includes(3) ? 0.6 : 1 }}>
                  Pelo menos 1 plano de acesso criado
                </span>
                {completedSteps.includes(3) && <CheckCircle2 size={16} color="#10b981" style={{ marginLeft: 'auto' }} />}
              </div>
              <div className="sw-checklist-item">
                <CircleDot size={18} color={completedSteps.includes(4) ? '#10b981' : '#f59e0b'} />
                <span style={{ opacity: completedSteps.includes(4) ? 0.6 : 1 }}>
                  Flow Chat personalizado (opcional)
                </span>
                {completedSteps.includes(4) && <CheckCircle2 size={16} color="#10b981" style={{ marginLeft: 'auto' }} />}
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
                <p>Crie mensagens para recuperar clientes que não finalizaram a compra.</p>
              </div>
            </div>
            <div className="sw-final-tip">
              <div className="sw-final-tip__number">03</div>
              <div>
                <h5>Divulgue seu Bot</h5>
                <p>Compartilhe o link do seu bot (t.me/seubot) nas redes sociais.</p>
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
    <div className="setup-wizard-page">
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
                id={`sw-step-${index}`}
                className={`sw-step-item ${isOpen ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="sw-step-header" onClick={() => toggleStep(index)}>
                  <div 
                    className="sw-step-icon-wrap"
                    style={{ background: `${step.color}18` }}
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