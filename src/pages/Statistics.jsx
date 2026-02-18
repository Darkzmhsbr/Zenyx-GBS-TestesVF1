import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBot } from '../context/BotContext';
import { useAuth } from '../context/AuthContext';
import { statisticsService, botService } from '../services/api';
import { 
  DollarSign, Users, TrendingUp, Star, 
  Clock, Calendar, BarChart3, PieChart, 
  ChevronDown, RefreshCw, Award, Zap,
  ArrowUpRight, ShoppingBag, Target, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';
import './Statistics.css';

export function Statistics() {
  const navigate = useNavigate();
  const { selectedBot } = useBot();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [isGlobalView, setIsGlobalView] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  // Bots do usuário para o seletor
  const [userBots, setUserBots] = useState([]);

  useEffect(() => {
    loadBots();
  }, []);

  useEffect(() => {
    loadStats();
  }, [selectedBot, period, isGlobalView]);

  const loadBots = async () => {
    try {
      const bots = await botService.listBots();
      setUserBots(bots || []);
    } catch (e) {
      console.error("Erro ao carregar bots:", e);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const botId = isGlobalView ? null : (selectedBot?.id || null);
      const result = await statisticsService.getStats(botId, period);
      setData(result);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formatadores
  const formatMoney = (centavos) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((centavos || 0) / 100);
  };

  const formatNumber = (val) => new Intl.NumberFormat('pt-BR').format(val || 0);

  const periodLabels = { '7d': 'Últimos 7 dias', '30d': 'Últimos 30 dias', '90d': 'Últimos 90 dias', 'all': 'Todo o período' };

  // Cores do donut
  const DONUT_COLORS = ['#c333ff', '#444', '#1a1a2e'];

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#1a1a2e', border: '1px solid #333', borderRadius: 8,
          padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <p style={{color:'#888', fontSize:'0.8rem', margin:0}}>{label}</p>
          <p style={{color:'#fff', fontSize:'1rem', fontWeight:'bold', margin:'4px 0 0'}}>
            R$ {(payload[0].value || 0).toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipCount = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#1a1a2e', border: '1px solid #333', borderRadius: 8,
          padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <p style={{color:'#888', fontSize:'0.8rem', margin:0}}>{label}</p>
          <p style={{color:'#fff', fontSize:'1rem', fontWeight:'bold', margin:'4px 0 0'}}>
            {payload[0].value} vendas
          </p>
        </div>
      );
    }
    return null;
  };

  const m = data?.metricas || {};

  return (
    <div className="statistics-container">
      
      {/* HEADER */}
      <div className="stats-header">
        <div className="stats-header-left">
          <h1 className="stats-title">Estatísticas</h1>
          <p className="stats-subtitle">
            Métricas de <strong style={{color:'#c333ff'}}>
              {isGlobalView ? 'Todos os Bots' : (selectedBot?.nome || 'Selecione um bot')}
            </strong>
          </p>
        </div>

        <div className="stats-header-right">
          {/* Toggle Todos */}
          <label className="stats-toggle-label">
            <input 
              type="checkbox" 
              checked={isGlobalView} 
              onChange={(e) => setIsGlobalView(e.target.checked)}
              style={{width:16, height:16, accentColor:'#c333ff'}}
            />
            Todos os bots
          </label>

          {/* Seletor de Bot */}
          {!isGlobalView && userBots.length > 0 && (
            <select 
              className="stats-bot-select"
              value={selectedBot?.id || ''}
              onChange={(e) => {
                const bot = userBots.find(b => b.id === parseInt(e.target.value));
                if (bot) window.dispatchEvent(new CustomEvent('select-bot', {detail: bot}));
              }}
            >
              {userBots.map(b => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
          )}

          {/* Seletor de Período */}
          <div className="stats-period-wrapper">
            <button 
              className="stats-period-btn" 
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
            >
              <Calendar size={16} />
              {periodLabels[period]}
              <ChevronDown size={14} />
            </button>
            {showPeriodMenu && (
              <div className="stats-period-menu">
                {Object.entries(periodLabels).map(([key, label]) => (
                  <button 
                    key={key} 
                    className={`stats-period-option ${period === key ? 'active' : ''}`}
                    onClick={() => { setPeriod(key); setShowPeriodMenu(false); }}
                  >
                    {label}
                  </button>
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
            <div className="stats-metric-icon" style={{background:'rgba(16,185,129,0.15)', color:'#10b981'}}>
              <DollarSign size={22} />
            </div>
            <div className="stats-metric-info">
              <span className="stats-metric-label">Receita Total</span>
              <span className="stats-metric-value">
                {loading ? <span className="skeleton-pulse" /> : formatMoney(m.receita_total)}
              </span>
              <span className="stats-metric-sub">{formatNumber(m.total_vendas)} vendas</span>
            </div>
          </div>

          <div className="stats-metric-card">
            <div className="stats-metric-icon" style={{background:'rgba(59,130,246,0.15)', color:'#3b82f6'}}>
              <BarChart3 size={22} />
            </div>
            <div className="stats-metric-info">
              <span className="stats-metric-label">Ticket Médio</span>
              <span className="stats-metric-value">
                {loading ? <span className="skeleton-pulse" /> : formatMoney(m.ticket_medio)}
              </span>
              <span className="stats-metric-sub">Por venda</span>
            </div>
          </div>

          <div className="stats-metric-card">
            <div className="stats-metric-icon" style={{background:'rgba(195,51,255,0.15)', color:'#c333ff'}}>
              <Users size={22} />
            </div>
            <div className="stats-metric-info">
              <span className="stats-metric-label">Total de Usuários</span>
              <span className="stats-metric-value">
                {loading ? <span className="skeleton-pulse" /> : formatNumber(m.total_usuarios)}
              </span>
              <span className="stats-metric-sub">{formatNumber(m.total_usuarios)} ativos</span>
            </div>
          </div>

          <div className="stats-metric-card">
            <div className="stats-metric-icon" style={{background:'rgba(245,158,11,0.15)', color:'#f59e0b'}}>
              <Star size={22} />
            </div>
            <div className="stats-metric-info">
              <span className="stats-metric-label">LTV Médio</span>
              <span className="stats-metric-value">
                {loading ? <span className="skeleton-pulse" /> : formatMoney(m.ltv_medio)}
              </span>
              <span className="stats-metric-sub">Lifetime Value</span>
            </div>
          </div>
        </div>
      </section>

      {/* RESUMO DE VENDAS */}
      <section className="stats-section">
        <h2 className="stats-section-title">RESUMO DE VENDAS</h2>
        <div className="stats-sales-grid">
          <div className="stats-sales-card">
            <div className="stats-sales-icon" style={{background:'rgba(245,158,11,0.15)', color:'#f59e0b'}}>
              <Clock size={22} />
            </div>
            <div className="stats-sales-info">
              <span className="stats-sales-label">Pendentes</span>
              <span className="stats-sales-value">{loading ? '-' : formatNumber(m.total_pendentes)}</span>
              <span className="stats-sales-sub">{loading ? '' : formatMoney(m.receita_pendentes)}</span>
            </div>
          </div>

          <div className="stats-sales-card">
            <div className="stats-sales-icon" style={{background:'rgba(16,185,129,0.15)', color:'#10b981'}}>
              <ShoppingBag size={22} />
            </div>
            <div className="stats-sales-info">
              <span className="stats-sales-label">Geradas</span>
              <span className="stats-sales-value">{loading ? '-' : formatNumber(m.total_geradas)}</span>
              <span className="stats-sales-sub">{loading ? '' : formatMoney(m.receita_total)}</span>
            </div>
          </div>

          <div className="stats-sales-card">
            <div className="stats-sales-icon" style={{background:'rgba(195,51,255,0.15)', color:'#c333ff'}}>
              <Target size={22} />
            </div>
            <div className="stats-sales-info">
              <span className="stats-sales-label">Conversão</span>
              <span className="stats-sales-value" style={{color:'#c333ff'}}>
                {loading ? '-' : `${(m.taxa_conversao || 0).toFixed(1)}%`}
              </span>
              <span className="stats-sales-sub">Taxa de conversão</span>
            </div>
          </div>
        </div>
      </section>

      {/* GRÁFICOS */}
      <section className="stats-section">
        <h2 className="stats-section-title">GRÁFICOS</h2>
        <div className="stats-charts-grid">
          
          {/* Gráfico de Receita por Dia */}
          <div className="stats-chart-card">
            <div className="stats-chart-header">
              <TrendingUp size={18} color="#c333ff" />
              <span>Receita no Período</span>
            </div>
            <div className="stats-chart-body">
              {loading ? (
                <div className="stats-chart-skeleton">
                  {[60,80,45,70,55,90,65].map((h,i) => (
                    <div key={i} className="skeleton-bar" style={{height:`${h}%`}} />
                  ))}
                </div>
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
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:'#666', fontSize:11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#666', fontSize:11}} tickFormatter={v => `R$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#c333ff" strokeWidth={2.5} fill="url(#statsGrad)" activeDot={{r:5, fill:'#c333ff'}} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Gráfico Donut - Conversão */}
          <div className="stats-chart-card">
            <div className="stats-chart-header">
              <PieChart size={18} color="#c333ff" />
              <span>Taxa de conversão</span>
            </div>
            <div className="stats-chart-body" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
              {loading ? (
                <div className="skeleton-donut" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPie>
                    <Pie
                      data={[
                        {name:'Convertidas', value: data?.donut_conversao?.convertidas || 0},
                        {name:'Pendentes', value: data?.donut_conversao?.pendentes || 0},
                        {name:'Perdidas', value: data?.donut_conversao?.perdidas || 0}
                      ]}
                      cx="50%" cy="50%"
                      innerRadius={70} outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {DONUT_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      iconType="circle" 
                      iconSize={10}
                      formatter={(value) => <span style={{color:'#ccc', fontSize:'0.85rem'}}>{value}</span>}
                    />
                    <Tooltip 
                      contentStyle={{background:'#1a1a2e', border:'1px solid #333', borderRadius:8, color:'#fff'}}
                      itemStyle={{color:'#fff'}}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PICOS DE DESEMPENHO */}
      <section className="stats-section">
        <h2 className="stats-section-title">PICOS DE DESEMPENHO</h2>
        <div className="stats-peaks-grid">
          
          {/* Top Planos */}
          <div className="stats-peak-card">
            <div className="stats-peak-header">
              <Award size={18} />
              <span>Planos mais vendidos</span>
            </div>
            <div className="stats-peak-body">
              {loading ? (
                <p style={{color:'#555', textAlign:'center', padding:20}}>Carregando...</p>
              ) : (data?.top_planos || []).length === 0 ? (
                <p style={{color:'#555', textAlign:'center', padding:20}}>Sem dados</p>
              ) : (
                <div className="stats-peak-list">
                  {(data?.top_planos || []).map((plano, i) => (
                    <div key={i} className="stats-peak-item">
                      <div className="stats-peak-rank">{i + 1}º</div>
                      <div className="stats-peak-name">{plano.name}</div>
                      <div className="stats-peak-count">{plano.count} vendas</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Dias */}
          <div className="stats-peak-card">
            <div className="stats-peak-header">
              <Calendar size={18} />
              <span>Dias com mais vendas</span>
            </div>
            <div className="stats-peak-body">
              {loading ? (
                <p style={{color:'#555', textAlign:'center', padding:20}}>Carregando...</p>
              ) : (data?.top_dias || []).length === 0 ? (
                <p style={{color:'#555', textAlign:'center', padding:20}}>Sem dados</p>
              ) : (
                <div className="stats-peak-list">
                  {(data?.top_dias || []).map((dia, i) => (
                    <div key={i} className="stats-peak-item">
                      <div className="stats-peak-rank">{i + 1}º</div>
                      <div className="stats-peak-name">{dia.day}</div>
                      <div className="stats-peak-count">{dia.count} vendas</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Horários */}
          <div className="stats-peak-card">
            <div className="stats-peak-header">
              <Clock size={18} />
              <span>Horários com mais vendas</span>
            </div>
            <div className="stats-peak-body">
              {loading ? (
                <p style={{color:'#555', textAlign:'center', padding:20}}>Carregando...</p>
              ) : (data?.top_horas || []).length === 0 ? (
                <p style={{color:'#555', textAlign:'center', padding:20}}>Sem dados</p>
              ) : (
                <div className="stats-peak-list">
                  {(data?.top_horas || []).map((hora, i) => (
                    <div key={i} className="stats-peak-item">
                      <div className="stats-peak-rank">{i + 1}º</div>
                      <div className="stats-peak-name">{hora.hour}</div>
                      <div className="stats-peak-count">{hora.count} vendas</div>
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