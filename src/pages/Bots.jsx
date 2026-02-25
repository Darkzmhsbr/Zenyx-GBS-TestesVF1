import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Send, Settings, Power, MoreVertical, RefreshCcw, Trash2, Copy, X, ArrowRight, ArrowLeft, Check, AlertTriangle, Eye, TrendingUp, Users, DollarSign, ShoppingCart, Calendar, Zap, BarChart3 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService } from '../services/api';
import { useBot } from '../context/BotContext';
import Swal from 'sweetalert2';
import './Bots.css';

export function Bots() {
  const navigate = useNavigate();
  const { refreshBots } = useBot();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  // 🆕 Estado do limite de bots
  const [botLimit, setBotLimit] = useState(null);

  // 🆕 MODAL VISÃO GERAL (POR BOT)
  const [overviewModal, setOverviewModal] = useState(false);
  const [overviewData, setOverviewData] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // 🆕 MODAL VISÃO GERAL GLOBAL (TODOS OS BOTS)
  const [globalOverviewModal, setGlobalOverviewModal] = useState(false);
  const [globalOverviewData, setGlobalOverviewData] = useState(null);
  const [globalOverviewLoading, setGlobalOverviewLoading] = useState(false);

  // 🔁 CLONE MODAL STATE
  const [cloneModal, setCloneModal] = useState(false);
  const [cloneStep, setCloneStep] = useState(1); // 1=info, 2=form, 3=confirm
  const [cloneSource, setCloneSource] = useState(null);
  const [cloneData, setCloneData] = useState({ nome: '', token: '', id_canal_vip: '' });
  const [cloneLoading, setCloneLoading] = useState(false);

  useEffect(() => {
    carregarBots();
    botService.getBotLimit().then(setBotLimit).catch(() => {});
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const carregarBots = async () => {
    try {
      setLoading(true);
      const dados = await botService.listBots();
      setBots(dados);
    } catch (error) {
      console.error("Erro ao buscar bots:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBotStatus = async (e, id) => {
    e.stopPropagation();
    try {
      const updatedBot = await botService.toggleBot(id);
      
      setBots(bots.map(bot => {
        if (bot.id === id) {
          return { ...bot, status: updatedBot.status };
        }
        return bot;
      }));
      
      const isAtivo = updatedBot.status === 'ativo';
      
      const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        background: '#151515', color: '#fff'
      });
      Toast.fire({
        icon: isAtivo ? 'success' : 'warning',
        title: isAtivo ? 'Bot Ativado!' : 'Bot Pausado'
      });

    } catch (error) {
      Swal.fire('Erro', 'Falha ao alterar status.', 'error');
    }
  };

  const handleDeleteBot = async (e, bot) => {
      e.stopPropagation();
      const result = await Swal.fire({
          title: `Excluir ${bot.nome}?`,
          text: "Isso apagará todo o histórico e configurações. Confirmar?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sim, excluir',
          background: '#151515', color: '#fff'
      });

      if (result.isConfirmed) {
          try {
              await botService.deleteBot(bot.id);
              await refreshBots();
              setBots(bots.filter(b => b.id !== bot.id));
              Swal.fire({title: 'Excluído!', icon: 'success', background: '#151515', color: '#fff'});
          } catch (error) {
              Swal.fire('Erro', 'Falha ao excluir bot.', 'error');
          }
      }
  };

  // 🔁 CLONE HANDLERS
  const openCloneModal = (bot) => {
    setCloneSource(bot);
    setCloneData({ nome: `${bot.nome} - CÓPIA`, token: '', id_canal_vip: '' });
    setCloneStep(1);
    setCloneModal(true);
    setActiveMenu(null);
  };

  // 🆕 VISÃO GERAL - Abrir modal com métricas avançadas
  const openOverviewModal = async (bot) => {
    setActiveMenu(null);
    setOverviewModal(true);
    setOverviewLoading(true);
    setOverviewData(null);
    
    try {
      const data = await botService.getBotOverview(bot.id);
      setOverviewData(data);
    } catch (error) {
      console.error('Erro ao buscar overview:', error);
      Swal.fire('Erro', 'Não foi possível carregar os dados do bot.', 'error');
      setOverviewModal(false);
    } finally {
      setOverviewLoading(false);
    }
  };

  const closeOverviewModal = () => {
    setOverviewModal(false);
    setOverviewData(null);
  };

  // 🆕 VISÃO GERAL GLOBAL - Todos os bots somados
  const openGlobalOverview = async () => {
    setGlobalOverviewModal(true);
    setGlobalOverviewLoading(true);
    setGlobalOverviewData(null);
    
    try {
      const data = await botService.getAllBotsOverview();
      setGlobalOverviewData(data);
    } catch (error) {
      console.error('Erro ao buscar overview global:', error);
      Swal.fire('Erro', 'Não foi possível carregar os dados.', 'error');
      setGlobalOverviewModal(false);
    } finally {
      setGlobalOverviewLoading(false);
    }
  };

  const closeGlobalOverview = () => {
    setGlobalOverviewModal(false);
    setGlobalOverviewData(null);
  };

  // 🆕 Formatadores
  const formatMoney = (centavos) => {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const closeCloneModal = () => {
    setCloneModal(false);
    setCloneSource(null);
    setCloneData({ nome: '', token: '', id_canal_vip: '' });
    setCloneStep(1);
  };

  const handleClone = async () => {
    if (!cloneData.token.trim() || !cloneData.id_canal_vip.trim()) {
      Swal.fire('Atenção', 'Preencha o Token e o ID do Canal VIP!', 'warning');
      return;
    }
    
    setCloneLoading(true);
    try {
      const result = await botService.cloneBot(cloneSource.id, {
        nome: cloneData.nome || `${cloneSource.nome} - CÓPIA`,
        token: cloneData.token.trim(),
        id_canal_vip: cloneData.id_canal_vip.trim()
      });
      
      await refreshBots();
      await carregarBots();
      closeCloneModal();
      
      Swal.fire({
        title: '🔁 Bot Clonado!',
        html: `
          <div style="text-align:left; font-size:0.9rem; color:#ccc;">
            <p><b>${result.msg}</b></p>
            ${result.erros && result.erros.length > 0 
              ? `<p style="color:#f59e0b; margin-top:10px;">⚠️ ${result.erros.length} aviso(s): ${result.erros.join(', ')}</p>` 
              : '<p style="color:#10b981; margin-top:10px;">✅ Todas as configurações copiadas sem erros!</p>'
            }
          </div>
        `,
        icon: 'success',
        background: '#151515',
        color: '#fff',
        confirmButtonText: 'Configurar Bot',
        showCancelButton: true,
        cancelButtonText: 'Fechar'
      }).then((r) => {
        if (r.isConfirmed && result.novo_bot_id) {
          navigate(`/bots/config/${result.novo_bot_id}`);
        }
      });
      
    } catch (error) {
      const msg = error?.response?.data?.detail || 'Falha ao clonar bot.';
      Swal.fire('Erro', msg, 'error');
    } finally {
      setCloneLoading(false);
    }
  };

  return (
    <div className="bots-container">
      
      <div className="bots-header">
        <div>
            <h1>Meus Bots</h1>
            <p style={{color: 'var(--muted-foreground)'}}>
              Gerencie seus assistentes de venda.
              {botLimit && (
                <span style={{
                  marginLeft: '12px',
                  background: botLimit.can_create ? 'rgba(195, 51, 255, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${botLimit.can_create ? 'rgba(195, 51, 255, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: botLimit.can_create ? '#c333ff' : '#ef4444'
                }}>
                  {botLimit.current}/{botLimit.max} bots
                </span>
              )}
            </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button variant="outline" onClick={openGlobalOverview} style={{ borderColor: '#c333ff', color: '#c333ff' }}>
            <BarChart3 size={18} /> Visão Geral
          </Button>
          <Button onClick={() => {
          if (botLimit && !botLimit.can_create) {
            Swal.fire({
              title: 'Limite Atingido',
              html: `Você atingiu o limite de <b>${botLimit.max}</b> bots do plano <b>${botLimit.plano.toUpperCase()}</b>.<br><br>Exclua bots inativos para liberar espaço.`,
              icon: 'warning',
              background: '#151515', color: '#fff', confirmButtonColor: '#c333ff'
            });
            return;
          }
          navigate('/bots/new');
        }}>
          <Plus size={20} /> Criar Novo Bot
        </Button>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '50px', color: '#666'}}>
            <RefreshCcw className="spin" /> Carregando bots...
        </div>
      ) : bots.length === 0 ? (
        <div className="empty-state" style={{textAlign:'center', marginTop:'50px', color:'#555'}}>
            <h2>Você ainda não tem bots.</h2>
            <p>Clique em "Criar Novo Bot" para começar.</p>
        </div>
      ) : (
        <div className="bots-grid">
          {bots.map((bot) => (
            <Card key={bot.id} className="bot-card">
              <CardContent>
                
                <div className="bot-header-row">
                  <div className="bot-identity">
                  <div className="bot-icon">
                    <span role="img" aria-label="bot">🤖</span>
                  </div>
                  <div>
                    <h3>{bot.nome}</h3>
                    <span className="bot-username">@{bot.username || 'sem_user'}</span>
                  </div>
                </div>
                    
                    <div style={{position: 'relative'}} onClick={(e) => e.stopPropagation()}>
                        <button className="icon-btn" onClick={() => setActiveMenu(activeMenu === bot.id ? null : bot.id)}>
                            <MoreVertical size={20} color="#888" />
                        </button>
                        {activeMenu === bot.id && (
                            <div className="dropdown-menu glass-menu">
                                <div className="menu-item" onClick={() => openOverviewModal(bot)}>
                                    <Eye size={14}/> Visão Geral
                                </div>
                                <div className="menu-item" onClick={() => navigate(`/bots/config/${bot.id}`)}>
                                    <Settings size={14}/> Configurar
                                </div>
                                <div className="menu-item" onClick={() => openCloneModal(bot)}>
                                    <Copy size={14}/> Clonar Bot
                                </div>
                                <div className="menu-item danger" onClick={(e) => handleDeleteBot(e, bot)}>
                                    <Trash2 size={14}/> Excluir
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bot-stats">
                  <div className="stat-item">
                    <span className="stat-label">Leads Total</span>
                    <span className="stat-value">{bot.leads || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Receita Total</span>
                    <span className="stat-value highlight">
                        R$ {typeof bot.revenue === 'number' 
                            ? (bot.revenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) 
                            : '0,00'}
                    </span>
                  </div>
                </div>

                <div className="bot-footer">
                  <div className={`status-indicator ${bot.status === 'ativo' ? 'online' : 'offline'}`}>
                    <span className="dot"></span>
                    {bot.status === 'ativo' ? 'Online' : 'Parado'}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => toggleBotStatus(e, bot.id)}
                      style={{
                        borderColor: bot.status === 'ativo' ? '#ef4444' : '#10b981',
                        color: bot.status === 'ativo' ? '#ef4444' : '#10b981'
                      }}
                      title={bot.status === 'ativo' ? "Pausar Bot" : "Ativar Bot"}
                    >
                      <Power size={16} />
                    </Button>
                    
                    <Button variant="primary" size="sm" onClick={() => navigate(`/bots/config/${bot.id}`)}>
                      <Settings size={16} /> Configurar
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* 🔁 MODAL DE CLONAGEM (3 ETAPAS) */}
      {/* ============================================================ */}
      {cloneModal && cloneSource && (
        <div className="clone-overlay" onClick={closeCloneModal}>
          <div className="clone-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* HEADER */}
            <div className="clone-modal-header">
              <div style={{display:'flex', alignItems:'center', gap: 10}}>
                <Copy size={22} color="#10b981"/>
                <h2>Clonar Bot</h2>
              </div>
              <button className="clone-close-btn" onClick={closeCloneModal}><X size={20}/></button>
            </div>

            {/* STEPPER */}
            <div className="clone-stepper">
              {[1,2,3].map(s => (
                <div key={s} className={`clone-step-dot ${cloneStep >= s ? 'active' : ''} ${cloneStep === s ? 'current' : ''}`}>
                  {cloneStep > s ? <Check size={14}/> : s}
                </div>
              ))}
            </div>

            {/* ETAPA 1: INFORMAÇÕES */}
            {cloneStep === 1 && (
              <div className="clone-body">
                <div className="clone-info-box">
                  <h3>📋 O que será copiado:</h3>
                  <div className="clone-info-grid">
                    <span>✅ Fluxo de mensagens</span>
                    <span>✅ Planos e preços</span>
                    <span>✅ Order Bump</span>
                    <span>✅ Upsell / Downsell</span>
                    <span>✅ Mini App (loja)</span>
                    <span>✅ Categorias da loja</span>
                    <span>✅ Remarketing automático</span>
                    <span>✅ Msgs alternantes</span>
                    <span>✅ Canal Free</span>
                    <span>✅ Grupos/Canais extras</span>
                    <span>✅ Proteção de conteúdo</span>
                    <span>✅ Gateways de pagamento</span>
                  </div>
                </div>
                <div className="clone-info-box warn">
                  <h3>⚠️ O que NÃO será copiado:</h3>
                  <div className="clone-info-grid">
                    <span>❌ Leads e contatos</span>
                    <span>❌ Pedidos e vendas</span>
                    <span>❌ Links de tracking</span>
                    <span>❌ Histórico de campanhas</span>
                  </div>
                  <p style={{marginTop: 10, fontSize: '0.8rem', color: '#f59e0b'}}>
                    O novo bot começa zerado — você define um novo token e canal VIP.
                  </p>
                </div>
                <div className="clone-footer">
                  <Button variant="outline" onClick={closeCloneModal}>Cancelar</Button>
                  <Button variant="primary" onClick={() => setCloneStep(2)}>
                    Continuar <ArrowRight size={16}/>
                  </Button>
                </div>
              </div>
            )}

            {/* ETAPA 2: FORMULÁRIO */}
            {cloneStep === 2 && (
              <div className="clone-body">
                <div className="clone-form-group">
                  <label>Nome do novo bot</label>
                  <input 
                    className="clone-input"
                    value={cloneData.nome}
                    onChange={(e) => setCloneData({...cloneData, nome: e.target.value})}
                    placeholder="Ex: Meu Bot V2"
                  />
                </div>
                <div className="clone-form-group">
                  <label>Token do Bot (BotFather) <span style={{color:'#ef4444'}}>*</span></label>
                  <input 
                    className="clone-input"
                    value={cloneData.token}
                    onChange={(e) => setCloneData({...cloneData, token: e.target.value})}
                    placeholder="Ex: 123456789:AAH..."
                  />
                  <small>Crie um novo bot no @BotFather e cole o token aqui.</small>
                </div>
                <div className="clone-form-group">
                  <label>ID do Canal VIP <span style={{color:'#ef4444'}}>*</span></label>
                  <input 
                    className="clone-input"
                    value={cloneData.id_canal_vip}
                    onChange={(e) => setCloneData({...cloneData, id_canal_vip: e.target.value})}
                    placeholder="Ex: -1001234567890"
                  />
                  <small>O novo bot precisa ser ADMIN deste canal.</small>
                </div>
                <div className="clone-footer">
                  <Button variant="outline" onClick={() => setCloneStep(1)}>
                    <ArrowLeft size={16}/> Voltar
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => setCloneStep(3)}
                    disabled={!cloneData.token.trim() || !cloneData.id_canal_vip.trim()}
                  >
                    Revisar <ArrowRight size={16}/>
                  </Button>
                </div>
              </div>
            )}

            {/* ETAPA 3: CONFIRMAÇÃO */}
            {cloneStep === 3 && (
              <div className="clone-body">
                <div className="clone-confirm-box">
                  <div className="clone-confirm-row">
                    <span className="clone-confirm-label">Bot original:</span>
                    <span className="clone-confirm-value">{cloneSource.nome}</span>
                  </div>
                  <div className="clone-confirm-divider"/>
                  <div className="clone-confirm-row">
                    <span className="clone-confirm-label">Novo nome:</span>
                    <span className="clone-confirm-value">{cloneData.nome}</span>
                  </div>
                  <div className="clone-confirm-row">
                    <span className="clone-confirm-label">Token:</span>
                    <span className="clone-confirm-value" style={{fontSize:'0.8rem'}}>
                      {cloneData.token.substring(0, 15)}...
                    </span>
                  </div>
                  <div className="clone-confirm-row">
                    <span className="clone-confirm-label">Canal VIP:</span>
                    <span className="clone-confirm-value">{cloneData.id_canal_vip}</span>
                  </div>
                </div>
                <div className="clone-footer">
                  <Button variant="outline" onClick={() => setCloneStep(2)}>
                    <ArrowLeft size={16}/> Voltar
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleClone}
                    disabled={cloneLoading}
                    style={{background: '#10b981', borderColor: '#10b981'}}
                  >
                    {cloneLoading ? '⏳ Clonando...' : <><Copy size={16}/> Confirmar Clonagem</>}
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 🆕 MODAL DE VISÃO GERAL (MÉTRICAS AVANÇADAS) */}
      {/* ============================================================ */}
      {overviewModal && (
        <div className="clone-overlay" onClick={closeOverviewModal}>
          <div className="clone-modal overview-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            
            {/* HEADER */}
            <div className="clone-modal-header">
              <div style={{display:'flex', alignItems:'center', gap: 10}}>
                <BarChart3 size={22} color="#c333ff"/>
                <h2>Visão Geral</h2>
              </div>
              <button className="clone-close-btn" onClick={closeOverviewModal}><X size={20}/></button>
            </div>

            {overviewLoading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                <RefreshCcw className="spin" size={30} style={{ marginBottom: '15px', opacity: 0.4 }} />
                <p>Carregando métricas...</p>
              </div>
            ) : overviewData && (
              <div className="clone-body" style={{ padding: '20px' }}>
                
                {/* IDENTIDADE DO BOT */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '15px',
                  padding: '15px', background: 'rgba(195, 51, 255, 0.05)',
                  borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(195, 51, 255, 0.15)'
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #c333ff, #7b1fa2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '1.2rem', fontWeight: 700
                  }}>
                    {overviewData.bot_nome?.charAt(0) || 'B'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{overviewData.bot_nome}</h3>
                    <span style={{ color: '#888', fontSize: '0.85rem' }}>@{overviewData.bot_username || 'sem_user'}</span>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '12px',
                      padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
                      background: overviewData.status === 'ativo' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: overviewData.status === 'ativo' ? '#10b981' : '#ef4444'
                    }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: overviewData.status === 'ativo' ? '#10b981' : '#ef4444'
                      }}/>
                      {overviewData.status === 'ativo' ? 'Online' : 'Parado'}
                    </div>
                  </div>
                </div>

                {/* GRID DE MÉTRICAS PRINCIPAIS */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px', marginBottom: '20px'
                }}>
                  {/* Faturamento Total */}
                  <div className="overview-metric-card highlight-purple">
                    <div className="overview-metric-icon"><DollarSign size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Faturamento Total</span>
                      <span className="overview-metric-value">{formatMoney(overviewData.faturamento_total)}</span>
                    </div>
                  </div>

                  {/* Faturamento 30 dias */}
                  <div className="overview-metric-card">
                    <div className="overview-metric-icon green"><TrendingUp size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Últimos 30 dias</span>
                      <span className="overview-metric-value">{formatMoney(overviewData.faturamento_30d)}</span>
                    </div>
                  </div>

                  {/* Leads */}
                  <div className="overview-metric-card">
                    <div className="overview-metric-icon blue"><Users size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Leads Totais</span>
                      <span className="overview-metric-value">{overviewData.leads_totais?.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Assinantes Ativos */}
                  <div className="overview-metric-card">
                    <div className="overview-metric-icon cyan"><Zap size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Assinantes Ativos</span>
                      <span className="overview-metric-value">{overviewData.assinantes_ativos}</span>
                    </div>
                  </div>

                  {/* Total Vendas */}
                  <div className="overview-metric-card">
                    <div className="overview-metric-icon orange"><ShoppingCart size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Vendas Realizadas</span>
                      <span className="overview-metric-value">{overviewData.total_vendas}</span>
                    </div>
                  </div>

                  {/* Ticket Médio */}
                  <div className="overview-metric-card">
                    <div className="overview-metric-icon"><DollarSign size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Ticket Médio</span>
                      <span className="overview-metric-value">{formatMoney(overviewData.ticket_medio)}</span>
                    </div>
                  </div>

                  {/* Conversão */}
                  <div className="overview-metric-card">
                    <div className="overview-metric-icon green"><TrendingUp size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Taxa de Conversão</span>
                      <span className="overview-metric-value">{overviewData.taxa_conversao}%</span>
                    </div>
                  </div>

                  {/* Vendas Hoje */}
                  <div className="overview-metric-card">
                    <div className="overview-metric-icon orange"><Calendar size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Vendas Hoje</span>
                      <span className="overview-metric-value">{overviewData.vendas_hoje}</span>
                    </div>
                  </div>
                </div>

                {/* PLANO MAIS VENDIDO + DATA CRIAÇÃO */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '12px', marginBottom: '15px'
                }}>
                  <div style={{ background: '#111', padding: '14px', borderRadius: '10px', border: '1px solid #222' }}>
                    <span style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>Plano Mais Vendido</span>
                    {overviewData.plano_mais_vendido ? (
                      <div>
                        <strong style={{ color: '#c333ff', fontSize: '0.95rem' }}>{overviewData.plano_mais_vendido.nome}</strong>
                        <span style={{ color: '#666', fontSize: '0.78rem', marginLeft: '8px' }}>({overviewData.plano_mais_vendido.vendas} vendas)</span>
                      </div>
                    ) : (
                      <strong style={{ color: '#555' }}>Nenhum</strong>
                    )}
                  </div>
                  <div style={{ background: '#111', padding: '14px', borderRadius: '10px', border: '1px solid #222' }}>
                    <span style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>Criado em</span>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{formatDate(overviewData.created_at)}</strong>
                  </div>
                </div>

                {/* GATEWAYS */}
                {overviewData.vendas_por_gateway && Object.keys(overviewData.vendas_por_gateway).length > 0 && (
                  <div style={{ background: '#111', padding: '14px', borderRadius: '10px', border: '1px solid #222' }}>
                    <span style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: '10px' }}>Vendas por Gateway</span>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {Object.entries(overviewData.vendas_por_gateway).map(([gw, count]) => (
                        <div key={gw} style={{
                          background: '#1a1a2e', padding: '6px 12px', borderRadius: '8px',
                          fontSize: '0.8rem', color: '#ccc'
                        }}>
                          <strong style={{ color: '#c333ff' }}>{count}</strong> via {gw}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FOOTER */}
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <Button variant="outline" onClick={closeOverviewModal}>Fechar</Button>
                  <Button variant="primary" onClick={() => { closeOverviewModal(); navigate(`/bots/config/${overviewData.bot_id}`); }}>
                    <Settings size={16}/> Configurar Bot
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 🆕 MODAL VISÃO GERAL GLOBAL (TODOS OS BOTS) */}
      {/* ============================================================ */}
      {globalOverviewModal && (
        <div className="clone-overlay" onClick={closeGlobalOverview}>
          <div className="clone-modal overview-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            
            {/* HEADER */}
            <div className="clone-modal-header">
              <div style={{display:'flex', alignItems:'center', gap: 10}}>
                <BarChart3 size={22} color="#c333ff"/>
                <h2>Visão Geral — Todos os Bots</h2>
              </div>
              <button className="clone-close-btn" onClick={closeGlobalOverview}><X size={20}/></button>
            </div>

            {globalOverviewLoading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                <RefreshCcw className="spin" size={30} style={{ marginBottom: '15px', opacity: 0.4 }} />
                <p>Carregando métricas globais...</p>
              </div>
            ) : globalOverviewData && (
              <div className="clone-body" style={{ padding: '20px' }}>
                
                {/* RESUMO DE BOTS */}
                <div style={{
                  display: 'flex', gap: '10px', marginBottom: '20px',
                  padding: '15px', background: 'rgba(195,51,255,0.05)',
                  borderRadius: '12px', border: '1px solid rgba(195,51,255,0.15)',
                  justifyContent: 'space-around', textAlign: 'center'
                }}>
                  <div>
                    <span style={{ color: '#888', fontSize: '0.75rem', display: 'block' }}>Total de Bots</span>
                    <strong style={{ color: '#fff', fontSize: '1.4rem' }}>{globalOverviewData.total_bots}</strong>
                  </div>
                  <div style={{ borderLeft: '1px solid #333', paddingLeft: '15px' }}>
                    <span style={{ color: '#888', fontSize: '0.75rem', display: 'block' }}>Online</span>
                    <strong style={{ color: '#10b981', fontSize: '1.4rem' }}>{globalOverviewData.bots_ativos}</strong>
                  </div>
                  <div style={{ borderLeft: '1px solid #333', paddingLeft: '15px' }}>
                    <span style={{ color: '#888', fontSize: '0.75rem', display: 'block' }}>Parados</span>
                    <strong style={{ color: '#ef4444', fontSize: '1.4rem' }}>{globalOverviewData.bots_pausados}</strong>
                  </div>
                </div>

                {/* GRID DE MÉTRICAS */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px', marginBottom: '20px'
                }}>
                  <div className="overview-metric-card highlight-purple">
                    <div className="overview-metric-icon"><DollarSign size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Faturamento Total</span>
                      <span className="overview-metric-value">{formatMoney(globalOverviewData.faturamento_total)}</span>
                    </div>
                  </div>

                  <div className="overview-metric-card">
                    <div className="overview-metric-icon green"><TrendingUp size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Últimos 30 dias</span>
                      <span className="overview-metric-value">{formatMoney(globalOverviewData.faturamento_30d)}</span>
                    </div>
                  </div>

                  <div className="overview-metric-card">
                    <div className="overview-metric-icon blue"><Users size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Leads Totais</span>
                      <span className="overview-metric-value">{globalOverviewData.leads_totais?.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="overview-metric-card">
                    <div className="overview-metric-icon cyan"><Zap size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Assinantes Ativos</span>
                      <span className="overview-metric-value">{globalOverviewData.assinantes_ativos}</span>
                    </div>
                  </div>

                  <div className="overview-metric-card">
                    <div className="overview-metric-icon orange"><ShoppingCart size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Vendas Realizadas</span>
                      <span className="overview-metric-value">{globalOverviewData.total_vendas}</span>
                    </div>
                  </div>

                  <div className="overview-metric-card">
                    <div className="overview-metric-icon"><DollarSign size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Ticket Médio</span>
                      <span className="overview-metric-value">{formatMoney(globalOverviewData.ticket_medio)}</span>
                    </div>
                  </div>

                  <div className="overview-metric-card">
                    <div className="overview-metric-icon green"><TrendingUp size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Taxa de Conversão</span>
                      <span className="overview-metric-value">{globalOverviewData.taxa_conversao}%</span>
                    </div>
                  </div>

                  <div className="overview-metric-card">
                    <div className="overview-metric-icon orange"><Calendar size={18}/></div>
                    <div>
                      <span className="overview-metric-label">Vendas Hoje</span>
                      <span className="overview-metric-value">{globalOverviewData.vendas_hoje}</span>
                    </div>
                  </div>
                </div>

                {/* PLANO MAIS VENDIDO + TOP BOT */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '12px', marginBottom: '15px'
                }}>
                  <div style={{ background: '#111', padding: '14px', borderRadius: '10px', border: '1px solid #222' }}>
                    <span style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>Plano Mais Vendido</span>
                    {globalOverviewData.plano_mais_vendido ? (
                      <div>
                        <strong style={{ color: '#c333ff', fontSize: '0.95rem' }}>{globalOverviewData.plano_mais_vendido.nome}</strong>
                        <span style={{ color: '#666', fontSize: '0.78rem', marginLeft: '8px' }}>({globalOverviewData.plano_mais_vendido.vendas} vendas)</span>
                      </div>
                    ) : (
                      <strong style={{ color: '#555' }}>Nenhum</strong>
                    )}
                  </div>
                  <div style={{ background: '#111', padding: '14px', borderRadius: '10px', border: '1px solid #222' }}>
                    <span style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>Bot Top Faturamento</span>
                    {globalOverviewData.top_bot ? (
                      <div>
                        <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>{globalOverviewData.top_bot.nome}</strong>
                        <span style={{ color: '#666', fontSize: '0.78rem', marginLeft: '8px' }}>{formatMoney(globalOverviewData.top_bot.faturamento)}</span>
                      </div>
                    ) : (
                      <strong style={{ color: '#555' }}>—</strong>
                    )}
                  </div>
                </div>

                {/* RANKING DOS BOTS */}
                {globalOverviewData.bots_ranking && globalOverviewData.bots_ranking.length > 0 && (
                  <div style={{ background: '#111', padding: '14px', borderRadius: '10px', border: '1px solid #222', marginBottom: '15px' }}>
                    <span style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: '12px' }}>Ranking dos Bots por Faturamento</span>
                    {globalOverviewData.bots_ranking.map((bot, idx) => (
                      <div key={bot.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: idx < globalOverviewData.bots_ranking.length - 1 ? '1px solid #1a1a2e' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            width: '22px', height: '22px', borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
                            fontWeight: 700, flexShrink: 0,
                            background: idx === 0 ? 'rgba(195,51,255,0.2)' : idx === 1 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                            color: idx === 0 ? '#c333ff' : idx === 1 ? '#10b981' : '#666'
                          }}>
                            {idx + 1}
                          </span>
                          <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{bot.nome}</span>
                          <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: bot.status === 'ativo' ? '#10b981' : '#555'
                          }} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ color: '#c333ff', fontSize: '0.85rem' }}>{formatMoney(bot.faturamento)}</strong>
                          <span style={{ color: '#666', fontSize: '0.72rem', marginLeft: '8px' }}>{bot.vendas} vendas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* GATEWAYS */}
                {globalOverviewData.vendas_por_gateway && Object.keys(globalOverviewData.vendas_por_gateway).length > 0 && (
                  <div style={{ background: '#111', padding: '14px', borderRadius: '10px', border: '1px solid #222' }}>
                    <span style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: '10px' }}>Vendas por Gateway</span>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {Object.entries(globalOverviewData.vendas_por_gateway).map(([gw, count]) => (
                        <div key={gw} style={{
                          background: '#1a1a2e', padding: '6px 12px', borderRadius: '8px',
                          fontSize: '0.8rem', color: '#ccc'
                        }}>
                          <strong style={{ color: '#c333ff' }}>{count}</strong> via {gw}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FOOTER */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="outline" onClick={closeGlobalOverview}>Fechar</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}