import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map, Users, Search, ChevronLeft, ChevronRight, ShoppingBag,
  ArrowLeft, X, Clock, DollarSign, CheckCircle, XCircle,
  AlertTriangle, Gift, TrendingUp, TrendingDown, Megaphone,
  Filter, ArrowUpRight, ArrowDownRight, Eye, Loader2
} from 'lucide-react';
import { recursosPrimeService } from '../services/api';
import './JornadaCliente.css';

export function JornadaCliente() {
  const navigate = useNavigate();
  
  // Lista
  const [contatos, setContatos] = useState([]);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [botSelecionado, setBotSelecionado] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Mapa (Modal)
  const [mapaAberto, setMapaAberto] = useState(null);
  const [mapaData, setMapaData] = useState(null);
  const [mapaLoading, setMapaLoading] = useState(false);

  const carregarContatos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recursosPrimeService.getJornadaLista(
        botSelecionado, abaAtiva, page, 50, searchTerm
      );
      setContatos(res.data || []);
      setTotalPages(res.total_pages || 1);
      setTotal(res.total || 0);
      if (res.bots && res.bots.length > 0 && bots.length === 0) {
        setBots(res.bots);
      }
    } catch (e) {
      console.error('Erro ao carregar jornada:', e);
      setContatos([]);
    } finally {
      setLoading(false);
    }
  }, [botSelecionado, abaAtiva, page, searchTerm]);

  useEffect(() => { carregarContatos(); }, [carregarContatos]);
  
  // Reset page on filter change
  useEffect(() => { setPage(1); }, [botSelecionado, abaAtiva, searchTerm]);

  const abrirMapa = async (contato) => {
    setMapaAberto(contato);
    setMapaLoading(true);
    setMapaData(null);
    try {
      const res = await recursosPrimeService.getJornadaMapa(
        contato.telegram_id, contato.bot_id
      );
      setMapaData(res);
    } catch (e) {
      console.error('Erro ao carregar mapa:', e);
    } finally {
      setMapaLoading(false);
    }
  };

  const fecharMapa = () => {
    setMapaAberto(null);
    setMapaData(null);
  };

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  
  const fmtDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  const statusLabel = (s) => {
    switch(s) {
      case 'pagante': return { text: 'Pagante', color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
      case 'pendente': return { text: 'Pendente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
      case 'expirado': return { text: 'Expirado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
      default: return { text: 'Lead', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
    }
  };

  // 🔥 CORREÇÃO 2 APLICADA AQUI: Adicionada a aba "Leads"
  const abas = [
    { key: 'todos', label: 'Todos', icon: <Users size={15} /> },
    { key: 'pagantes', label: 'Pagantes', icon: <CheckCircle size={15} /> },
    { key: 'pendentes', label: 'Pendentes', icon: <Clock size={15} /> },
    { key: 'expirados', label: 'Expirados', icon: <XCircle size={15} /> },
    { key: 'leads', label: 'Leads', icon: <Eye size={15} /> },
  ];

  const etapaIcon = (etapa) => {
    if (etapa.includes('lead_start')) return <Users size={18} />;
    if (etapa.includes('gerou_pix')) return <DollarSign size={18} />;
    if (etapa.includes('pagou')) return <CheckCircle size={18} />;
    if (etapa.includes('order_bump')) return <Gift size={18} />;
    if (etapa.includes('upsell')) return <ArrowUpRight size={18} />;
    if (etapa.includes('downsell')) return <ArrowDownRight size={18} />;
    if (etapa.includes('remarketing')) return <Megaphone size={18} />;
    return <Eye size={18} />;
  };

  const statusDotClass = (status) => {
    switch(status) {
      case 'completo': return 'jc-dot-success';
      case 'falhou': return 'jc-dot-danger';
      case 'pendente': return 'jc-dot-warning';
      case 'recusado': return 'jc-dot-muted';
      case 'enviado': return 'jc-dot-info';
      default: return 'jc-dot-muted';
    }
  };

  return (
    <div className="jc-container">
      {/* HEADER */}
      <div className="jc-header">
        <div className="jc-header-left">
          <button className="jc-back" onClick={() => navigate('/recursos-prime')}>
            <ArrowLeft size={18} />
          </button>
          <div className="jc-header-icon"><Map size={28} /></div>
          <div>
            <h1>Jornada do Cliente</h1>
            <p>Visualize o percurso completo de cada lead no funil</p>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="jc-filters">
        <div className="jc-filters-row">
          {/* Seletor de Bot */}
          <div className="jc-bot-select">
            <Filter size={16} />
            <select 
              value={botSelecionado || ''} 
              onChange={(e) => setBotSelecionado(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Todos os Bots</option>
              {bots.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
            </select>
          </div>

          {/* Search */}
          <div className="jc-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome, username ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Abas */}
        <div className="jc-tabs">
          {abas.map(a => (
            <button 
              key={a.key}
              className={`jc-tab ${abaAtiva === a.key ? 'active' : ''}`}
              onClick={() => setAbaAtiva(a.key)}
            >
              {a.icon} {a.label}
            </button>
          ))}
          <span className="jc-total-badge">{total} contatos</span>
        </div>
      </div>

      {/* TABELA */}
      <div className="jc-card">
        {loading ? (
          <div className="jc-loading">
            <Loader2 size={32} className="jc-spin" />
            <p>Carregando contatos...</p>
          </div>
        ) : contatos.length === 0 ? (
          <div className="jc-empty">
            <Map size={48} style={{ color: '#333' }} />
            <h3>Nenhum contato encontrado</h3>
            <p>Ajuste os filtros ou selecione outro bot.</p>
          </div>
        ) : (
          <>
            <div className="jc-table-wrap">
              <table className="jc-table">
                <thead>
                  <tr>
                    <th>Contato</th>
                    <th>Status</th>
                    <th>Plano</th>
                    <th style={{ textAlign: 'center' }}>Funil</th>
                    <th style={{ textAlign: 'right' }}>Gasto Total</th>
                    <th style={{ textAlign: 'center' }}>Mapa</th>
                  </tr>
                </thead>
                <tbody>
                  {contatos.map((c, i) => {
                    const st = statusLabel(c.ultimo_status);
                    return (
                      <tr key={`${c.bot_id}_${c.telegram_id}_${i}`}>
                        <td>
                          <div className="jc-user-cell">
                            <div className="jc-user-avatar">{(c.first_name || '?').charAt(0).toUpperCase()}</div>
                            <div>
                              <span className="jc-user-name">{c.first_name || 'Sem nome'}</span>
                              {c.username && <span className="jc-user-username">@{c.username}</span>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="jc-status-badge" style={{ color: st.color, background: st.bg }}>
                            {st.text}
                          </span>
                        </td>
                        <td>
                          <span className="jc-plano">{c.plano_principal || '—'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="jc-funil-icons">
                            <span className={`jc-fi ${c.plano_principal ? 'active' : ''}`} title="Plano Principal">
                              <ShoppingBag size={13} />
                            </span>
                            <span className={`jc-fi ${c.tem_order_bump ? 'active green' : ''}`} title="Order Bump">
                              <Gift size={13} />
                            </span>
                            <span className={`jc-fi ${c.tem_upsell ? 'active blue' : ''}`} title="Upsell">
                              <ArrowUpRight size={13} />
                            </span>
                            <span className={`jc-fi ${c.tem_downsell ? 'active orange' : ''}`} title="Downsell">
                              <ArrowDownRight size={13} />
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="jc-gasto">{fmt(c.total_gasto)}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="jc-mapa-btn" onClick={() => abrirMapa(c)} title="Ver Jornada Completa">
                            <Map size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="jc-pagination">
                <button 
                  className="jc-page-btn" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="jc-page-info">Página {page} de {totalPages}</span>
                <button 
                  className="jc-page-btn" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Próxima <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: MAPA DO PERCURSO DO LEAD                          */}
      {/* ========================================================= */}
      {mapaAberto && (
        <div className="jc-modal-overlay" onClick={fecharMapa}>
          <div className="jc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="jc-modal-header">
              <div className="jc-modal-title">
                <Map size={22} color="#06b6d4" />
                <div>
                  <h2>Mapa do Percurso</h2>
                  <p>{mapaAberto.first_name} {mapaAberto.username ? `(@${mapaAberto.username})` : ''}</p>
                </div>
              </div>
              <button className="jc-modal-close" onClick={fecharMapa}><X size={18} /></button>
            </div>

            <div className="jc-modal-body">
              {mapaLoading ? (
                <div className="jc-loading" style={{ padding: '60px 0' }}>
                  <Loader2 size={32} className="jc-spin" />
                  <p>Carregando jornada...</p>
                </div>
              ) : mapaData ? (
                <>
                  {/* Resumo */}
                  <div className="jc-mapa-resumo">
                    <div className="jc-resumo-item">
                      <span className="jc-resumo-label">Total Gasto</span>
                      <span className="jc-resumo-value" style={{ color: '#10b981' }}>{fmt(mapaData.info.total_gasto)}</span>
                    </div>
                    <div className="jc-resumo-item">
                      <span className="jc-resumo-label">Pedidos Pagos</span>
                      <span className="jc-resumo-value">{mapaData.info.total_pedidos}</span>
                    </div>
                    <div className="jc-resumo-item">
                      <span className="jc-resumo-label">Primeiro Contato</span>
                      <span className="jc-resumo-value" style={{ fontSize: '0.85rem' }}>{fmtDate(mapaData.info.primeiro_contato)}</span>
                    </div>
                    <div className="jc-resumo-item">
                      <span className="jc-resumo-label">Bot</span>
                      <span className="jc-resumo-value" style={{ fontSize: '0.85rem' }}>{mapaData.bot_nome}</span>
                    </div>
                  </div>

                  {/* Config ativa */}
                  <div className="jc-config-tags">
                    <span className={`jc-config-tag ${mapaData.config_ativa.order_bump ? 'on' : 'off'}`}>
                      <Gift size={12} /> Order Bump {mapaData.config_ativa.order_bump ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className={`jc-config-tag ${mapaData.config_ativa.upsell ? 'on' : 'off'}`}>
                      <ArrowUpRight size={12} /> Upsell {mapaData.config_ativa.upsell ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className={`jc-config-tag ${mapaData.config_ativa.downsell ? 'on' : 'off'}`}>
                      <ArrowDownRight size={12} /> Downsell {mapaData.config_ativa.downsell ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Timeline */}
                  <div className="jc-timeline">
                    {mapaData.timeline.map((step, idx) => (
                      <div key={idx} className={`jc-tl-item ${step.status}`}>
                        <div className="jc-tl-line">
                          <div className={`jc-tl-dot ${statusDotClass(step.status)}`} style={{ borderColor: step.cor }}>
                            {etapaIcon(step.etapa)}
                          </div>
                          {idx < mapaData.timeline.length - 1 && <div className="jc-tl-connector" />}
                        </div>
                        <div className="jc-tl-content">
                          <div className="jc-tl-header">
                            <span className="jc-tl-title">{step.titulo}</span>
                            {step.data && <span className="jc-tl-date">{fmtDate(step.data)}</span>}
                          </div>
                          <p className="jc-tl-desc">{step.descricao}</p>
                        </div>
                      </div>
                    ))}

                    {mapaData.timeline.length === 0 && (
                      <div className="jc-empty" style={{ padding: '40px 0' }}>
                        <Map size={32} style={{ color: '#333' }} />
                        <p>Nenhum evento registrado para este lead.</p>
                      </div>
                    )}
                  </div>

                  {/* Linha do tempo resumida (texto) */}
                  {mapaData.timeline.length > 0 && (
                    <div className="jc-timeline-text">
                      <Clock size={14} color="#6b7280" />
                      <span>
                        {mapaData.timeline.map(s => s.titulo).join(' → ')}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="jc-empty" style={{ padding: '40px 0' }}>
                  <AlertTriangle size={32} color="#ef4444" />
                  <p>Erro ao carregar dados da jornada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}