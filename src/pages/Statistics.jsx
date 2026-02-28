import React, { useEffect, useState } from 'react';
import { useBot } from '../context/BotContext';
import { useAuth } from '../context/AuthContext';
import { statisticsService, botService } from '../services/api';
import { 
  DollarSign, Users, TrendingUp, Star, 
  Clock, Calendar, BarChart3, PieChart, 
  ChevronDown, RefreshCw, Award, Zap,
  ShoppingBag, Target, Repeat, UserCheck,
  Timer
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';
import './Statistics.css';

export function Statistics() {
  const { selectedBot } = useBot();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [isGlobalView, setIsGlobalView] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [userBots, setUserBots] = useState([]);

  useEffect(() => { loadBots(); }, []);
  useEffect(() => { loadStats(); }, [selectedBot, period, isGlobalView]);

  const loadBots = async () => {
    try { setUserBots(await botService.listBots() || []); } catch(e) {}
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const botId = isGlobalView ? null : (selectedBot?.id || null);
      setData(await statisticsService.getStats(botId, period));
    } catch(e) { console.error("Erro stats:", e); } finally { setLoading(false); }
  };

  const formatMoney = (c) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((c || 0) / 100);
  const formatNum = (v) => new Intl.NumberFormat('pt-BR').format(v || 0);
  const periodLabels = { '7d': 'Últimos 7 dias', '30d': 'Últimos 30 dias', '90d': 'Últimos 90 dias', 'all': 'Todo o período' };
  const DONUT_COLORS = ['#c333ff', '#444', '#1a1a2e'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:'#1a1a2e', border:'1px solid #333', borderRadius:8, padding:'10px 14px', boxShadow:'0 4px 12px rgba(0,0,0,0.5)' }}>
        <p style={{color:'#888', fontSize:'0.8rem', margin:0}}>{label}</p>
        <p style={{color:'#fff', fontSize:'1rem', fontWeight:'bold', margin:'4px 0 0'}}>
          R$ {(payload[0].value || 0).toFixed(2)}
        </p>
      </div>
    );
  };

  const CountTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:'#1a1a2e', border:'1px solid #333', borderRadius:8, padding:'10px 14px', boxShadow:'0 4px 12px rgba(0,0,0,0.5)' }}>
        <p style={{color:'#888', fontSize:'0.8rem', margin:0}}>{label}</p>
        <p style={{color:'#fff', fontSize:'1rem', fontWeight:'bold', margin:'4px 0 0'}}>{payload[0].value} vendas</p>
      </div>
    );
  };

  const Skeleton = () => <span className="skeleton-pulse" />;

  const m = data?.metricas || {};
  const adv = data?.metricas_avancadas || {};
  const counters = data?.contadores_usuarios || {};

  return (
    <div className="statistics-container">
      
      {/* HEADER */}
      <div className="stats-header">
        <div>
          <h1 className="stats-title">Estatísticas</h1>
          <p className="stats-subtitle">
            Métricas de <strong style={{color:'#c333ff'}}>
              {isGlobalView ? 'Todos os Bots' : (selectedBot?.nome || 'Selecione um bot')}
            </strong>
          </p>
        </div>

        <div className="stats-header-right">
          <label className="stats-toggle-label">
            <input type="checkbox" checked={isGlobalView} onChange={e => setIsGlobalView(e.target.checked)} style={{width:16,height:16,accentColor:'#c333ff'}} />
            Todos os bots
          </label>

          {!isGlobalView && userBots.length > 0 && (
            <select className="stats-bot-select" value={selectedBot?.id || ''} onChange={e => {
              const bot = userBots.find(b => b.id === parseInt(e.target.value));
              if (bot) window.dispatchEvent(new CustomEvent('select-bot', {detail: bot}));
            }}>
              {userBots.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
            </select>
          )}

          <div className="stats-period-wrapper">
            <button className="stats-period-btn" onClick={() => setShowPeriodMenu(!showPeriodMenu)}>
              <Calendar size={16} /> {periodLabels[period]} <ChevronDown size={14} />
            </button>
            {showPeriodMenu && (
              <div className="stats-period-menu">
                {Object.entries(periodLabels).map(([key, label]) => (
                  <button key={key} className={`stats-period-option ${period === key ? 'active' : ''}`} onClick={() => { setPeriod(key); setShowPeriodMenu(false); }}>{label}</button>
                ))}
              </div>
            )}
          </div>

          <button className="stats-refresh-btn" onClick={loadStats} title="Atualizar">
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* MÉTRICAS PRINCIPAIS */}
      <section className="stats-section">
        <h2 className="stats-section-title">MÉTRICAS PRINCIPAIS</h2>
        <div className="stats-metrics-grid">
          <div className="stats-metric-card">
            <div className="stats-metric-icon" style={{background:'rgba(16,185,129,0.15)', color:'#10b981'}}><DollarSign size={22} /></div>
            <div className="stats-metric-info">
              <span className="stats-metric-label">Receita Total</span>
              <span className="stats-metric-value">{loading ? <Skeleton /> : formatMoney(m.receita_total)}</span>
              <span className="stats-metric-sub">{formatNum(m.total_vendas)} vendas confirmadas</span>
            </div>
          </div>
          <div className="stats-metric-card">
            <div className="stats-metric-icon" style={{background:'rgba(59,130,246,0.15)', color:'#3b82f6'}}><BarChart3 size={22} /></div>
            <div className="stats-metric-info">
              <span className="stats-metric-label">Ticket Médio</span>
              <span className="stats-metric-value">{loading ? <Skeleton /> : formatMoney(m.ticket_medio)}</span>
              <span className="stats-metric-sub">Valor médio por venda</span>
            </div>
          </div>
          <div className="stats-metric-card">
            <div className="stats-metric-icon" style={{background:'rgba(195,51,255,0.15)', color:'#c333ff'}}><Users size={22} /></div>
            <div className="stats-metric-info">
              <span className="stats-metric-label">VIPs Ativos</span>
              <span className="stats-metric-value">{loading ? <Skeleton /> : formatNum(m.total_usuarios)}</span>
              <span className="stats-metric-sub">{formatNum(m.total_leads)} leads no período</span>
            </div>
          </div>
          <div className="stats-metric-card">
            <div className="stats-metric-icon" style={{background:'rgba(245,158,11,0.15)', color:'#f59e0b'}}><Star size={22} /></div>
            <div className="stats-metric-info">
              <span className="stats-metric-label">LTV Médio</span>
              <span className="stats-metric-value">{loading ? <Skeleton /> : formatMoney(m.ltv_medio)}</span>
              <span className="stats-metric-sub">Gasto médio por cliente</span>
            </div>
          </div>
        </div>
      </section>

      {/* RESUMO DE VENDAS */}
      <section className="stats-section">
        <h2 className="stats-section-title">RESUMO DE VENDAS</h2>
        <div className="stats-sales-grid">
          <div className="stats-sales-card">
            <div className="stats-sales-icon" style={{background:'rgba(245,158,11,0.15)', color:'#f59e0b'}}><Clock size={22} /></div>
            <div className="stats-sales-info">
              <span className="stats-sales-label">Pendentes</span>
              <span className="stats-sales-value">{loading ? '-' : formatNum(m.total_pendentes)}</span>
              <span className="stats-sales-sub">{loading ? '' : formatMoney(m.receita_pendentes)}</span>
            </div>
          </div>
          <div className="stats-sales-card">
            <div className="stats-sales-icon" style={{background:'rgba(16,185,129,0.15)', color:'#10b981'}}><ShoppingBag size={22} /></div>
            <div className="stats-sales-info">
              <span className="stats-sales-label">Confirmadas</span>
              <span className="stats-sales-value">{loading ? '-' : formatNum(m.total_vendas)}</span>
              <span className="stats-sales-sub">{loading ? '' : formatMoney(m.receita_total)}</span>
            </div>
          </div>
          <div className="stats-sales-card">
            <div className="stats-sales-icon" style={{background:'rgba(195,51,255,0.15)', color:'#c333ff'}}><Target size={22} /></div>
            <div className="stats-sales-info">
              <span className="stats-sales-label">Conversão</span>
              <span className="stats-sales-value" style={{color:'#c333ff'}}>{loading ? '-' : `${(m.taxa_conversao||0).toFixed(1)}%`}</span>
              <span className="stats-sales-sub">{formatNum(m.total_leads)} leads → {formatNum(m.total_vendas)} vendas</span>
            </div>
          </div>
        </div>
      </section>

      {/* INDICADORES DE PERFORMANCE */}
      <section className="stats-section">
        <h2 className="stats-section-title">INDICADORES DE PERFORMANCE</h2>
        <div className="stats-metrics-grid">
          <div className="stats-metric-card">
            <div className="stats-metric-icon" style={{background:'rgba(6,182,212,0.15)', color:'#06b6d4'}}><Repeat size={22} /></div>
            <div className="stats-metric-info">
              <span className="stats-metric-label">Taxa Retenção</span>
              <span className="stats-metric-value">{loading ? <Skeleton /> : `${adv.taxa_retencao || 0}%`}</span>
              <span className="stats-metric-sub">{formatNum(adv.recorrentes)} de {formatNum(adv.total_compradores)} recompram</span>
            </div>
          </div>
          <div className="stats-metric-card">
            <div className="stats-metric-icon" style={{background:'rgba(236,72,153,0.15)', color:'#ec4899'}}><ShoppingBag size={22} /></div>
            <div className="stats-metric-info">
              <span className="stats-metric-label">Vendas / Usuário</span>
              <span className="stats-metric-value">{loading ? <Skeleton /> : `${adv.vendas_por_usuario || 0}x`}</span>
              <span className="stats-metric-sub">Média de compras por cliente</span>
            </div>
          </div>
          <div className="stats-metric-card">
            <div className="stats-metric-icon" style={{background:'rgba(139,92,246,0.15)', color:'#8b5cf6'}}><Timer size={22} /></div>
            <div className="stats-metric-info">
              <span className="stats-metric-label">Tempo Retorno</span>
              <span className="stats-metric-value">{loading ? <Skeleton /> : `${adv.avg_retorno_dias || 0} dias`}</span>
              <span className="stats-metric-sub">Dias médios entre recompras</span>
            </div>
          </div>
          <div className="stats-metric-card">
            <div className="stats-metric-icon" style={{background:'rgba(16,185,129,0.15)', color:'#10b981'}}><UserCheck size={22} /></div>
            <div className="stats-metric-info">
              <span className="stats-metric-label">Contadores</span>
              <div style={{display:'flex', flexDirection:'column', gap:'4px', marginTop:'4px'}}>
                <span style={{fontSize:'0.8rem', color:'#aaa'}}>👥 Compradores: <strong style={{color:'#fff'}}>{formatNum(counters.total_compradores)}</strong></span>
                <span style={{fontSize:'0.8rem', color:'#aaa'}}>🔄 Recorrentes: <strong style={{color:'#06b6d4'}}>{formatNum(counters.recorrentes)}</strong></span>
                <span style={{fontSize:'0.8rem', color:'#aaa'}}>⭐ VIPs Ativos: <strong style={{color:'#10b981'}}>{formatNum(counters.vips_ativos)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRÁFICOS - Receita + Donut */}
      <section className="stats-section">
        <h2 className="stats-section-title">GRÁFICOS</h2>
        <div className="stats-charts-grid">
          <div className="stats-chart-card">
            <div className="stats-chart-header"><TrendingUp size={18} color="#c333ff" /><span>Receita no Período</span></div>
            <div className="stats-chart-body">
              {loading ? (
                <div className="stats-chart-skeleton">{[60,80,45,70,55,90,65].map((h,i) => <div key={i} className="skeleton-bar" style={{height:`${h}%`}} />)}</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data?.chart_receita || []} margin={{top:10,right:10,left:0,bottom:0}}>
                    <defs>
                      <linearGradient id="statsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c333ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#c333ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}} tickFormatter={v=>`R$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#c333ff" strokeWidth={2.5} fill="url(#statsGrad)" activeDot={{r:5,fill:'#c333ff'}} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="stats-chart-card">
            <div className="stats-chart-header"><PieChart size={18} color="#c333ff" /><span>Taxa de conversão</span></div>
            <div className="stats-chart-body" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
              {loading ? <div className="skeleton-donut" /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPie>
                    <Pie data={[
                      {name:'Convertidas', value: data?.donut_conversao?.convertidas || 0},
                      {name:'Pendentes', value: data?.donut_conversao?.pendentes || 0},
                      {name:'Perdidas', value: data?.donut_conversao?.perdidas || 0}
                    ]} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                      {DONUT_COLORS.map((c,i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Legend verticalAlign="bottom" iconType="circle" iconSize={10} formatter={v => <span style={{color:'#ccc',fontSize:'0.85rem'}}>{v}</span>} />
                    <Tooltip contentStyle={{background:'#1a1a2e',border:'1px solid #333',borderRadius:8,color:'#fff'}} itemStyle={{color:'#fff'}} />
                  </RechartsPie>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FREQUÊNCIA TEMPORAL - Vendas por Hora + Dia da Semana */}
      <section className="stats-section">
        <h2 className="stats-section-title">FREQUÊNCIA TEMPORAL</h2>
        <div className="stats-charts-grid">
          <div className="stats-chart-card">
            <div className="stats-chart-header"><Clock size={18} color="#06b6d4" /><span>Vendas por Hora</span></div>
            <div className="stats-chart-body">
              {loading ? (
                <div className="stats-chart-skeleton">{Array.from({length:12}).map((_,i) => <div key={i} className="skeleton-bar" style={{height:`${Math.random()*80+20}%`}} />)}</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data?.chart_horas || []} margin={{top:10,right:10,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:10}} interval={2} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}} />
                    <Tooltip content={<CountTooltip />} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[4,4,0,0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="stats-chart-card">
            <div className="stats-chart-header"><Calendar size={18} color="#f59e0b" /><span>Vendas por Dia da Semana</span></div>
            <div className="stats-chart-body">
              {loading ? (
                <div className="stats-chart-skeleton">{[50,70,60,80,90,40,30].map((h,i) => <div key={i} className="skeleton-bar" style={{height:`${h}%`}} />)}</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data?.chart_semana || []} margin={{top:10,right:10,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="day_short" axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}} />
                    <Tooltip content={<CountTooltip />} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4,4,0,0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* RANKINGS */}
      <section className="stats-section">
        <h2 className="stats-section-title">PICOS DE DESEMPENHO</h2>
        <div className="stats-peaks-grid stats-peaks-4col">
          
          <div className="stats-peak-card">
            <div className="stats-peak-header"><Award size={18} color="#c333ff" /><span>Top 5 Planos</span></div>
            <div className="stats-peak-body">
              {loading ? <p style={{color:'#555',textAlign:'center',padding:20}}>Carregando...</p> :
               (data?.top_planos || []).length === 0 ? <p style={{color:'#555',textAlign:'center',padding:20}}>Nenhum plano disponível</p> : (
                <div className="stats-peak-list">
                  {(data?.top_planos || []).slice(0,5).map((p,i) => (
                    <div key={i} className="stats-peak-item">
                      <div className="stats-peak-rank">{i+1}º</div>
                      <div className="stats-peak-name">{p.name}</div>
                      <div className="stats-peak-count">{p.count} vendas</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="stats-peak-card">
            <div className="stats-peak-header"><Zap size={18} color="#10b981" /><span>Top 5 Bots</span></div>
            <div className="stats-peak-body">
              {loading ? <p style={{color:'#555',textAlign:'center',padding:20}}>Carregando...</p> :
               (data?.top_bots || []).length === 0 ? <p style={{color:'#555',textAlign:'center',padding:20}}>Nenhum bot disponível</p> : (
                <div className="stats-peak-list">
                  {(data?.top_bots || []).slice(0,5).map((b,i) => (
                    <div key={i} className="stats-peak-item">
                      <div className="stats-peak-rank">{i+1}º</div>
                      <div className="stats-peak-name">{b.name}</div>
                      <div className="stats-peak-count">{b.count} vendas</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="stats-peak-card">
            <div className="stats-peak-header"><Calendar size={18} color="#f59e0b" /><span>Top 7 Dias</span></div>
            <div className="stats-peak-body">
              {loading ? <p style={{color:'#555',textAlign:'center',padding:20}}>Carregando...</p> :
               (data?.top_dias || []).length === 0 ? <p style={{color:'#555',textAlign:'center',padding:20}}>Nenhum dia disponível</p> : (
                <div className="stats-peak-list">
                  {(data?.top_dias || []).map((d,i) => (
                    <div key={i} className="stats-peak-item">
                      <div className="stats-peak-rank">{i+1}º</div>
                      <div className="stats-peak-name">{d.day}</div>
                      <div className="stats-peak-count">{d.count} vendas</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="stats-peak-card">
            <div className="stats-peak-header"><Clock size={18} color="#06b6d4" /><span>Top Horários</span></div>
            <div className="stats-peak-body">
              {loading ? <p style={{color:'#555',textAlign:'center',padding:20}}>Carregando...</p> :
               (data?.top_horas || []).length === 0 ? <p style={{color:'#555',textAlign:'center',padding:20}}>Nenhum horário disponível</p> : (
                <div className="stats-peak-list">
                  {(data?.top_horas || []).map((h,i) => (
                    <div key={i} className="stats-peak-item">
                      <div className="stats-peak-rank">{i+1}º</div>
                      <div className="stats-peak-name">{h.hour}</div>
                      <div className="stats-peak-count">{h.count} vendas</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}