import React, { useState, useEffect, useMemo } from 'react';
import { 
  Crown, Lock, TrendingUp, Copy, Repeat, Brain, Search, Zap, Shield,
  ChevronRight, Star, Trophy, Sparkles, CheckCircle, X, AlertTriangle,
  ArrowRight, BarChart3, Target, Clock, MessageSquare, Send, Play
} from 'lucide-react';
import { recursosPrimeService, botService, dashboardService } from '../services/api';
import { useBot } from '../context/BotContext';
import './RecursosPrime.css';

const ICON_MAP = { TrendingUp, Copy, Repeat, Brain, Search, Zap, Shield, MessageSquare };

// ═══════════════════════════════════════════════
// 📈 MODAL: PROJEÇÃO DE RECEITA
// ═══════════════════════════════════════════════
function ProjecaoReceita({ onClose, faturamentoTotal }) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [diasProjecao, setDiasProjecao] = useState(30);
  const [aumento, setAumento] = useState(0); // % de aumento simulado
  const { selectedBot } = useBot();

  useEffect(() => {
    loadData();
  }, [selectedBot]);

  const loadData = async () => {
    try {
      setLoading(true);
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 60);
      const botId = selectedBot?.id || null;
      const data = await dashboardService.getStats(botId, start, end);
      setChartData(data.chart_data || []);
    } catch (e) {
      console.error('Erro:', e);
    } finally {
      setLoading(false);
    }
  };

  const projecao = useMemo(() => {
    if (!chartData.length) return null;
    const values = chartData.map(d => d.value || 0).filter(v => v > 0);
    if (values.length === 0) return { media: 0, otimista: 0, realista: 0, conservador: 0 };
    
    const media = values.reduce((a, b) => a + b, 0) / values.length;
    const mediaAjustada = media * (1 + aumento / 100);
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return {
      media: media,
      mediaAjustada: mediaAjustada,
      otimista: Math.round(((max + media) / 2) * (1 + aumento / 100) * diasProjecao * 100) / 100,
      realista: Math.round(mediaAjustada * diasProjecao * 100) / 100,
      conservador: Math.round(((min + media) / 2) * (1 + aumento / 100) * diasProjecao * 100) / 100,
      diasComVenda: values.length,
      diasTotal: chartData.length,
      taxaAtividade: Math.round((values.length / chartData.length) * 100),
    };
  }, [chartData, diasProjecao, aumento]);

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  return (
    <div className="rp-modal-overlay" onClick={onClose}>
      <div className="rp-modal" onClick={e => e.stopPropagation()}>
        <div className="rp-modal-header">
          <div className="rp-modal-header-left">
            <div className="rp-modal-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h2>Projeção de Receita</h2>
              <p>Baseado nos seus dados reais dos últimos 60 dias</p>
            </div>
          </div>
          <button className="rp-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="rp-modal-body">
          {loading ? (
            <div className="rp-modal-loading"><div className="rp-spinner" /><p>Analisando dados...</p></div>
          ) : !projecao ? (
            <div className="rp-modal-empty"><AlertTriangle size={40} /><p>Sem dados suficientes para projeção.</p></div>
          ) : (
            <>
              {/* Controles */}
              <div className="proj-controls">
                <div className="proj-control-group">
                  <label>Projetar para</label>
                  <div className="proj-pills">
                    {[30, 60, 90, 180].map(d => (
                      <button key={d} className={`proj-pill ${diasProjecao === d ? 'active' : ''}`} onClick={() => setDiasProjecao(d)}>
                        {d} dias
                      </button>
                    ))}
                  </div>
                </div>
                <div className="proj-control-group">
                  <label>Simulação de crescimento</label>
                  <div className="proj-pills">
                    {[0, 10, 20, 50].map(p => (
                      <button key={p} className={`proj-pill ${aumento === p ? 'active' : ''}`} onClick={() => setAumento(p)}>
                        {p === 0 ? 'Sem aumento' : `+${p}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cards de Cenários */}
              <div className="proj-scenarios">
                <div className="proj-scenario optimistic">
                  <div className="proj-scenario-label">
                    <TrendingUp size={16} /> Otimista
                  </div>
                  <div className="proj-scenario-value">{fmt(projecao.otimista)}</div>
                  <div className="proj-scenario-desc">em {diasProjecao} dias</div>
                </div>
                <div className="proj-scenario realistic">
                  <div className="proj-scenario-label">
                    <Target size={16} /> Realista
                  </div>
                  <div className="proj-scenario-value">{fmt(projecao.realista)}</div>
                  <div className="proj-scenario-desc">em {diasProjecao} dias</div>
                </div>
                <div className="proj-scenario conservative">
                  <div className="proj-scenario-label">
                    <BarChart3 size={16} /> Conservador
                  </div>
                  <div className="proj-scenario-value">{fmt(projecao.conservador)}</div>
                  <div className="proj-scenario-desc">em {diasProjecao} dias</div>
                </div>
              </div>

              {/* Métricas Base */}
              <div className="proj-base-stats">
                <div className="proj-base-stat">
                  <span className="proj-base-label">Média diária (últimos 60d)</span>
                  <span className="proj-base-value">{fmt(projecao.media)}</span>
                </div>
                <div className="proj-base-stat">
                  <span className="proj-base-label">Dias com venda</span>
                  <span className="proj-base-value">{projecao.diasComVenda}/{projecao.diasTotal}</span>
                </div>
                <div className="proj-base-stat">
                  <span className="proj-base-label">Taxa de atividade</span>
                  <span className="proj-base-value">{projecao.taxaAtividade}%</span>
                </div>
                <div className="proj-base-stat">
                  <span className="proj-base-label">Faturamento acumulado</span>
                  <span className="proj-base-value" style={{color: '#22c55e'}}>{fmt(faturamentoTotal)}</span>
                </div>
              </div>

              {aumento > 0 && (
                <div className="proj-tip">
                  💡 Com <strong>+{aumento}%</strong> de crescimento, sua média diária sairia de {fmt(projecao.media)} para {fmt(projecao.mediaAjustada)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 🔁 MODAL: CLONADOR DE FUNIL
// ═══════════════════════════════════════════════
function ClonadorFunil({ onClose }) {
  const { bots } = useBot();
  const [origemId, setOrigemId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [opcoes, setOpcoes] = useState({
    clonar_planos: true, clonar_flow: true, clonar_remarketing: true,
    clonar_orderbump: true, clonar_upsell: true, clonar_downsell: true
  });
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const handleClone = async () => {
    if (!origemId || !destinoId) { setError('Selecione bot de origem e destino'); return; }
    if (origemId === destinoId) { setError('Origem e destino devem ser diferentes'); return; }
    setError('');
    
    try {
      setLoading(true);
      const res = await recursosPrimeService.clonarFunil({
        bot_origem_id: parseInt(origemId),
        bot_destino_id: parseInt(destinoId),
        ...opcoes
      });
      setResultado(res);
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao clonar funil');
    } finally {
      setLoading(false);
    }
  };

  const toggleOpcao = (key) => setOpcoes(prev => ({ ...prev, [key]: !prev[key] }));

  const opcoesLabels = [
    { key: 'clonar_planos', label: 'Planos e Preços', icon: '💰' },
    { key: 'clonar_flow', label: 'Flow (Mensagens)', icon: '💬' },
    { key: 'clonar_remarketing', label: 'Remarketing', icon: '📤' },
    { key: 'clonar_orderbump', label: 'Order Bump', icon: '🎁' },
    { key: 'clonar_upsell', label: 'Upsell', icon: '⬆️' },
    { key: 'clonar_downsell', label: 'Downsell', icon: '⬇️' },
  ];

  return (
    <div className="rp-modal-overlay" onClick={onClose}>
      <div className="rp-modal" onClick={e => e.stopPropagation()}>
        <div className="rp-modal-header">
          <div className="rp-modal-header-left">
            <div className="rp-modal-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
              <Copy size={24} />
            </div>
            <div>
              <h2>Clonador de Funil</h2>
              <p>Copie toda a estratégia de um bot para outro</p>
            </div>
          </div>
          <button className="rp-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="rp-modal-body">
          {resultado ? (
            <div className="clone-result">
              <div className="clone-result-icon"><CheckCircle size={48} /></div>
              <h3>Funil clonado com sucesso!</h3>
              <p className="clone-result-bots">{resultado.origem} <ArrowRight size={16} /> {resultado.destino}</p>
              <div className="clone-result-items">
                {resultado.resultados?.map((r, i) => (
                  <div key={i} className="clone-result-item">{r}</div>
                ))}
              </div>
              <button className="rp-btn-primary" onClick={onClose}>Fechar</button>
            </div>
          ) : (
            <>
              {/* Bot Selects */}
              <div className="clone-bots-row">
                <div className="clone-bot-select">
                  <label>Bot de Origem (copiar DE)</label>
                  <select value={origemId} onChange={e => setOrigemId(e.target.value)}>
                    <option value="">Selecionar bot...</option>
                    {bots.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                  </select>
                </div>
                <div className="clone-arrow"><ArrowRight size={24} /></div>
                <div className="clone-bot-select">
                  <label>Bot de Destino (copiar PARA)</label>
                  <select value={destinoId} onChange={e => setDestinoId(e.target.value)}>
                    <option value="">Selecionar bot...</option>
                    {bots.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                  </select>
                </div>
              </div>

              {/* Opções */}
              <div className="clone-options">
                <label className="clone-options-title">O que clonar:</label>
                <div className="clone-options-grid">
                  {opcoesLabels.map(({ key, label, icon }) => (
                    <div 
                      key={key} 
                      className={`clone-option ${opcoes[key] ? 'active' : ''}`}
                      onClick={() => toggleOpcao(key)}
                    >
                      <span className="clone-option-icon">{icon}</span>
                      <span className="clone-option-label">{label}</span>
                      <div className={`clone-option-toggle ${opcoes[key] ? 'on' : ''}`}>
                        <div className="clone-option-dot" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="clone-warning">
                <AlertTriangle size={16} />
                <span>Os dados existentes no bot de destino serão <strong>substituídos</strong> pelos do bot de origem.</span>
              </div>

              {error && <div className="clone-error">{error}</div>}

              <button 
                className="rp-btn-primary full" 
                onClick={handleClone} 
                disabled={loading || !origemId || !destinoId}
              >
                {loading ? 'Clonando...' : 'Clonar Funil'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 🎯 MODAL: REVISÃO DE COPY (COM PERSONALIZAÇÃO COMPLETA)
// ═══════════════════════════════════════════════
function RevisaoCopy({ onClose }) {
  const { bots, selectedBot } = useBot();
  const [botId, setBotId] = useState(selectedBot?.id || '');
  const [tipo, setTipo] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [copyData, setCopyData] = useState(null);

  const tipos = [
    { id: 'flow', label: 'Flow Chat', desc: 'Fluxo de boas-vindas + steps extras', icon: '💬', cor: '#3b82f6' },
    { id: 'completo', label: 'Fluxo Completo', desc: 'Flow → Order Bump → Upsell → Downsell', icon: '🔄', cor: '#c333ff' },
    { id: 'orderbump', label: 'Order Bump', desc: 'Oferta adicional após pagamento', icon: '🎁', cor: '#22c55e' },
    { id: 'upsell', label: 'Upsell', desc: 'Oferta de upgrade premium', icon: '⬆️', cor: '#f59e0b' },
    { id: 'downsell', label: 'Downsell', desc: 'Oferta alternativa de menor valor', icon: '⬇️', cor: '#ef4444' },
    { id: 'canalfree', label: 'Canal Free', desc: 'Mensagem de boas-vindas do canal gratuito', icon: '📢', cor: '#06b6d4' },
    { id: 'remarketing', label: 'Remarketing', desc: 'Mensagens automáticas + alternadas', icon: '📤', cor: '#8b5cf6' },
  ];

  // Carrega os dados atuais da copy quando seleciona tipo
  const handleSelectTipo = async (tipoId) => {
    setTipo(tipoId);
    setCopyData(null);
    setEditMode(false);
    setError('');
    
    if (!botId) return;
    
    try {
      setLoadingData(true);
      const res = await recursosPrimeService.getCopyData(parseInt(botId), tipoId);
      setCopyData(res);
      setEditMode(true);
    } catch (e) {
      const msg = e.response?.data?.detail || 'Erro ao carregar dados da copy';
      setError(msg);
    } finally {
      setLoadingData(false);
    }
  };

  // Atualiza campo no copyData
  const updateField = (field, value) => {
    setCopyData(prev => ({ ...prev, [field]: value }));
  };

  // Atualiza um step extra (flow)
  const updateStep = (index, field, value) => {
    setCopyData(prev => {
      const steps = [...(prev.steps || [])];
      steps[index] = { ...steps[index], [field]: value };
      return { ...prev, steps };
    });
  };

  const handleSimular = async () => {
    if (!botId || !tipo) { setError('Selecione o bot e o tipo de simulação'); return; }
    setError(''); setResultado(null);
    try {
      setLoading(true);
      const payload = { tipo, custom_data: editMode ? copyData : null };
      const res = await recursosPrimeService.simularCopy(parseInt(botId), payload);
      setResultado(res);
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao simular');
    } finally { setLoading(false); }
  };

  // Renderiza os campos de edição conforme o tipo selecionado
  const renderEditFields = () => {
    if (!copyData || !editMode) return null;

    switch (tipo) {
      case 'flow':
        return (
          <div className="rc-edit-section">
            <h4 className="rc-edit-title">📝 Mensagem de Boas-Vindas</h4>
            <textarea
              className="rc-edit-textarea"
              value={copyData.msg_boas_vindas || ''}
              onChange={e => updateField('msg_boas_vindas', e.target.value)}
              placeholder="Texto de boas-vindas..."
              rows={5}
            />
            <div className="rc-edit-row">
              <div className="rc-edit-field">
                <label>Mídia (URL)</label>
                <input
                  className="rc-edit-input"
                  value={copyData.media_url || ''}
                  onChange={e => updateField('media_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="rc-edit-field">
                <label>Texto do Botão</label>
                <input
                  className="rc-edit-input"
                  value={copyData.btn_text_1 || ''}
                  onChange={e => updateField('btn_text_1', e.target.value)}
                  placeholder="📋 Ver Planos"
                />
              </div>
            </div>

            {/* Steps Extras */}
            {copyData.steps && copyData.steps.length > 0 && (
              <>
                <h4 className="rc-edit-title" style={{marginTop: '1.5rem'}}>📨 Passos Extras ({copyData.steps.length})</h4>
                {copyData.steps.map((step, i) => (
                  <div key={i} className="rc-edit-step">
                    <span className="rc-edit-step-label">Passo Extra {i + 1}</span>
                    <textarea
                      className="rc-edit-textarea"
                      value={step.msg_texto || ''}
                      onChange={e => updateStep(i, 'msg_texto', e.target.value)}
                      placeholder={`Texto do passo ${i + 1}...`}
                      rows={3}
                    />
                    <div className="rc-edit-row">
                      <div className="rc-edit-field">
                        <label>Mídia</label>
                        <input
                          className="rc-edit-input"
                          value={step.msg_media || ''}
                          onChange={e => updateStep(i, 'msg_media', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="rc-edit-field">
                        <label>Texto do Botão</label>
                        <input
                          className="rc-edit-input"
                          value={step.btn_texto || ''}
                          onChange={e => updateStep(i, 'btn_texto', e.target.value)}
                          placeholder="Próximo ▶️"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Mensagem de Oferta Final */}
            {copyData.msg_2_texto && (
              <>
                <h4 className="rc-edit-title" style={{marginTop: '1.5rem'}}>🛒 Mensagem de Oferta & Checkout</h4>
                <textarea
                  className="rc-edit-textarea"
                  value={copyData.msg_2_texto || ''}
                  onChange={e => updateField('msg_2_texto', e.target.value)}
                  placeholder="Texto da oferta final..."
                  rows={4}
                />
              </>
            )}

            {/* Mensagem PIX Personalizada */}
            {copyData.msg_pix !== undefined && (
              <>
                <h4 className="rc-edit-title" style={{marginTop: '1.5rem'}}>💳 Mensagem do PIX</h4>
                <textarea
                  className="rc-edit-textarea"
                  value={copyData.msg_pix || ''}
                  onChange={e => updateField('msg_pix', e.target.value)}
                  placeholder="Texto da mensagem de PIX..."
                  rows={3}
                />
              </>
            )}
          </div>
        );
      
      case 'orderbump':
        return (
          <div className="rc-edit-section">
            <h4 className="rc-edit-title">🎁 Mensagem do Order Bump</h4>
            <textarea
              className="rc-edit-textarea"
              value={copyData.msg_texto || ''}
              onChange={e => updateField('msg_texto', e.target.value)}
              placeholder="Texto do Order Bump..."
              rows={5}
            />
            <div className="rc-edit-row">
              <div className="rc-edit-field">
                <label>Mídia (URL)</label>
                <input className="rc-edit-input" value={copyData.msg_media || ''} onChange={e => updateField('msg_media', e.target.value)} placeholder="https://..." />
              </div>
              <div className="rc-edit-field">
                <label>Áudio (URL)</label>
                <input className="rc-edit-input" value={copyData.audio_url || ''} onChange={e => updateField('audio_url', e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="rc-edit-row">
              <div className="rc-edit-field">
                <label>Botão Aceitar</label>
                <input className="rc-edit-input" value={copyData.btn_aceitar || ''} onChange={e => updateField('btn_aceitar', e.target.value)} placeholder="✅ SIM" />
              </div>
              <div className="rc-edit-field">
                <label>Botão Recusar</label>
                <input className="rc-edit-input" value={copyData.btn_recusar || ''} onChange={e => updateField('btn_recusar', e.target.value)} placeholder="❌ NÃO" />
              </div>
            </div>
          </div>
        );
      
      case 'upsell':
      case 'downsell':
        const tipoLabel = tipo === 'upsell' ? 'Upsell' : 'Downsell';
        const tipoIcon = tipo === 'upsell' ? '⬆️' : '⬇️';
        return (
          <div className="rc-edit-section">
            <h4 className="rc-edit-title">{tipoIcon} Mensagem do {tipoLabel}</h4>
            <textarea
              className="rc-edit-textarea"
              value={copyData.msg_texto || ''}
              onChange={e => updateField('msg_texto', e.target.value)}
              placeholder={`Texto do ${tipoLabel}...`}
              rows={5}
            />
            <div className="rc-edit-row">
              <div className="rc-edit-field">
                <label>Mídia (URL)</label>
                <input className="rc-edit-input" value={copyData.msg_media || ''} onChange={e => updateField('msg_media', e.target.value)} placeholder="https://..." />
              </div>
              <div className="rc-edit-field">
                <label>Áudio (URL)</label>
                <input className="rc-edit-input" value={copyData.audio_url || ''} onChange={e => updateField('audio_url', e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="rc-edit-row">
              <div className="rc-edit-field">
                <label>Botão Aceitar</label>
                <input className="rc-edit-input" value={copyData.btn_aceitar || ''} onChange={e => updateField('btn_aceitar', e.target.value)} placeholder="✅ QUERO" />
              </div>
              <div className="rc-edit-field">
                <label>Botão Recusar</label>
                <input className="rc-edit-input" value={copyData.btn_recusar || ''} onChange={e => updateField('btn_recusar', e.target.value)} placeholder="❌ Não quero" />
              </div>
            </div>
          </div>
        );
      
      case 'canalfree':
        return (
          <div className="rc-edit-section">
            <h4 className="rc-edit-title">📢 Mensagem do Canal Free</h4>
            <textarea
              className="rc-edit-textarea"
              value={copyData.message_text || ''}
              onChange={e => updateField('message_text', e.target.value)}
              placeholder="Texto da mensagem de boas-vindas..."
              rows={5}
            />
            <div className="rc-edit-row">
              <div className="rc-edit-field">
                <label>Mídia (URL)</label>
                <input className="rc-edit-input" value={copyData.media_url || ''} onChange={e => updateField('media_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="rc-edit-field">
                <label>Áudio (URL)</label>
                <input className="rc-edit-input" value={copyData.audio_url || ''} onChange={e => updateField('audio_url', e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </div>
        );
      
      case 'remarketing':
        return (
          <div className="rc-edit-section">
            <h4 className="rc-edit-title">📤 Mensagem Principal do Remarketing</h4>
            <textarea
              className="rc-edit-textarea"
              value={copyData.message_text || ''}
              onChange={e => updateField('message_text', e.target.value)}
              placeholder="Texto do remarketing..."
              rows={5}
            />
            <div className="rc-edit-row">
              <div className="rc-edit-field">
                <label>Mídia (URL)</label>
                <input className="rc-edit-input" value={copyData.media_url || ''} onChange={e => updateField('media_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="rc-edit-field">
                <label>Áudio (URL)</label>
                <input className="rc-edit-input" value={copyData.audio_url || ''} onChange={e => updateField('audio_url', e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </div>
        );
      
      case 'completo':
        return (
          <div className="rc-edit-section">
            <div className="rc-edit-info-box">
              <Zap size={16} />
              <span>O fluxo completo enviará todas as etapas em sequência: <strong>Flow → Order Bump → Upsell → Downsell</strong>. Para personalizar cada uma individualmente, selecione-as separadamente.</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rp-modal-overlay" onClick={onClose}>
      <div className="rp-modal rp-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="rp-modal-header">
          <div className="rp-modal-header-left">
            <div className="rp-modal-icon" style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h2>Revisão de Copy</h2>
              <p>Personalize e simule fluxos antes de enviar ao Telegram</p>
            </div>
          </div>
          <button className="rp-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="rp-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {resultado ? (
            <div className="clone-result">
              <div className="clone-result-icon"><CheckCircle size={48} /></div>
              <h3>Simulação enviada!</h3>
              <p style={{color:'#a3a3a3', marginBottom: 12}}>
                {resultado.mensagens_enviadas} mensagens foram enviadas para o admin do bot no Telegram.
              </p>
              <p style={{color:'#888', fontSize:'0.85rem'}}>Abra o Telegram e confira a preview completa.</p>
              <div style={{display:'flex', gap:10, marginTop:20, justifyContent:'center'}}>
                <button className="rp-btn-secondary" onClick={() => { setResultado(null); setTipo(''); setCopyData(null); setEditMode(false); }}>
                  Nova simulação
                </button>
                <button className="rp-btn-primary" onClick={onClose}>Fechar</button>
              </div>
            </div>
          ) : (
            <>
              {/* Bot Select */}
              <div className="rc-bot-select">
                <label>Bot para simulação</label>
                <select value={botId} onChange={e => { setBotId(e.target.value); setTipo(''); setCopyData(null); setEditMode(false); }}>
                  <option value="">Selecionar bot...</option>
                  {bots.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                </select>
              </div>

              {/* Tipo de simulação */}
              <div className="rc-tipos">
                <label>O que deseja simular?</label>
                <div className="rc-tipos-grid">
                  {tipos.map(t => (
                    <div 
                      key={t.id}
                      className={`rc-tipo-card ${tipo === t.id ? 'active' : ''}`}
                      onClick={() => handleSelectTipo(t.id)}
                      style={{ '--tipo-cor': t.cor }}
                    >
                      <span className="rc-tipo-icon">{t.icon}</span>
                      <div className="rc-tipo-info">
                        <span className="rc-tipo-label">{t.label}</span>
                        <span className="rc-tipo-desc">{t.desc}</span>
                      </div>
                      {tipo === t.id && <CheckCircle size={18} style={{color: t.cor, flexShrink:0}} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Loading dos dados */}
              {loadingData && (
                <div style={{textAlign:'center', padding:'2rem', color:'#888'}}>
                  <div className="rp-spinner" style={{margin:'0 auto 1rem'}} />
                  <p>Carregando copy configurada...</p>
                </div>
              )}

              {/* Campos de Edição Personalizada */}
              {editMode && copyData && !loadingData && renderEditFields()}

              {/* Info */}
              <div className="rc-info">
                <Send size={16} />
                <span>As mensagens {editMode ? <strong>personalizadas</strong> : ''} serão enviadas para o <strong>admin principal</strong> do bot via Telegram.</span>
              </div>

              {error && <div className="clone-error">{error}</div>}

              <button 
                className="rp-btn-primary full"
                onClick={handleSimular}
                disabled={loading || !botId || !tipo}
              >
                {loading ? (
                  <><div className="rp-spinner-sm" /> Enviando simulação...</>
                ) : (
                  <><Play size={18} /> {editMode ? 'Simular Copy Personalizada' : 'Simular no Telegram'}</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 🏠 PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════
export function RecursosPrime() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'projecao' | 'clonador' | null
  const [toast, setToast] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await recursosPrimeService.getRecursos();
      setData(res);
    } catch (e) { console.error('Erro:', e); } finally { setLoading(false); }
  };

  const formatMoney = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const progressPercent = data ? (data.desbloqueados / data.total_recursos) * 100 : 0;

  const handleCardClick = (recurso) => {
    if (recurso.status === 'bloqueado') return;
    
    if (!recurso.implementado) {
      setToast(`${recurso.nome} estará disponível em breve!`);
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    switch (recurso.id) {
      case 'revisao_copy': setActiveModal('revisao_copy'); break;
      case 'projecao_receita': setActiveModal('projecao'); break;
      case 'clonador_funil': setActiveModal('clonador'); break;
      default: 
        setToast(`${recurso.nome} estará disponível em breve!`);
        setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="rp-container">
        <div className="rp-loading"><div className="rp-spinner" /><p>Carregando recursos...</p></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rp-container">
      {/* Toast */}
      {toast && (
        <div className="rp-toast">
          <Clock size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Modais */}
      {activeModal === 'revisao_copy' && (
        <RevisaoCopy onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'projecao' && (
        <ProjecaoReceita onClose={() => setActiveModal(null)} faturamentoTotal={data.faturamento_total_reais} />
      )}
      {activeModal === 'clonador' && (
        <ClonadorFunil onClose={() => setActiveModal(null)} />
      )}

      {/* HERO HEADER */}
      <div className="rp-hero">
        <div className="rp-hero-bg"><Crown size={200} /></div>
        <div className="rp-hero-content">
          <div className="rp-hero-badge"><Crown size={16} /> RECURSOS PRIME</div>
          <h1 className="rp-hero-title">Desbloqueie recursos exclusivos</h1>
          <p className="rp-hero-subtitle">
            Conquiste metas de faturamento e libere ferramentas poderosas para acelerar seus resultados.
          </p>
          <div className="rp-progress-section">
            <div className="rp-progress-stats">
              <span className="rp-progress-count"><Sparkles size={16} /> {data.desbloqueados}/{data.total_recursos} desbloqueados</span>
              <span className="rp-progress-revenue"><Trophy size={16} /> Faturamento total: <strong>{formatMoney(data.faturamento_total_reais)}</strong></span>
            </div>
            <div className="rp-progress-track">
              <div className="rp-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            {data.proxima_meta && (
              <div className="rp-next-goal">
                Próximo desbloqueio: <strong>{data.proxima_meta.nome}</strong> — faltam <strong>{formatMoney(data.proxima_meta.falta_reais)}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECURSOS GRID */}
      <div className="rp-grid">
        {data.recursos.map((recurso) => {
          const IconComponent = ICON_MAP[recurso.icone] || Star;
          const isLocked = recurso.status === 'bloqueado';
          const isFree = recurso.meta_reais === 0;
          const isComingSoon = !recurso.implementado && !isLocked;
          
          return (
            <div 
              key={recurso.id}
              className={`rp-card ${isLocked ? 'locked' : 'unlocked'} ${isComingSoon ? 'coming-soon' : ''}`}
              onClick={() => handleCardClick(recurso)}
              style={{ '--card-color': recurso.cor }}
            >
              {isLocked && (
                <div className="rp-card-lock-overlay">
                  <Lock size={32} />
                  <span>Fature {formatMoney(recurso.meta_reais)} para desbloquear</span>
                </div>
              )}

              <div className="rp-card-header">
                <div className="rp-card-icon" style={{ background: `${recurso.cor}15`, color: recurso.cor }}>
                  <IconComponent size={24} />
                </div>
                <div className="rp-card-status">
                  {isLocked ? (
                    <span className="rp-badge locked"><Lock size={12} /> Bloqueado</span>
                  ) : isComingSoon ? (
                    <span className="rp-badge coming-soon"><Clock size={12} /> Em breve</span>
                  ) : isFree ? (
                    <span className="rp-badge free"><Star size={12} /> Grátis</span>
                  ) : (
                    <span className="rp-badge unlocked"><CheckCircle size={12} /> Desbloqueado</span>
                  )}
                </div>
              </div>

              <h3 className="rp-card-title">{recurso.nome}</h3>
              <p className="rp-card-desc">{recurso.descricao}</p>

              <div className="rp-card-footer">
                {isLocked ? (
                  <div className="rp-card-meta-info">
                    <span className="rp-card-meta">Meta: {formatMoney(recurso.meta_reais)}</span>
                    <div className="rp-card-mini-progress">
                      <div className="rp-card-mini-fill" style={{ 
                        width: `${Math.min(100, (data.faturamento_total_reais / recurso.meta_reais) * 100)}%`,
                        background: recurso.cor 
                      }} />
                    </div>
                  </div>
                ) : isComingSoon ? (
                  <span className="rp-card-coming-text" style={{ color: recurso.cor }}>
                    <Clock size={14} /> Disponível em breve
                  </span>
                ) : (
                  <button className="rp-card-action" style={{ color: recurso.cor }}>
                    Acessar <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* INFO FOOTER */}
      <div className="rp-info-footer">
        <Star size={18} />
        <p>Os recursos são desbloqueados automaticamente conforme seu faturamento cresce. Continue vendendo para liberar ferramentas cada vez mais poderosas!</p>
      </div>
    </div>
  );
}