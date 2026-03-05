import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, TrendingUp, TrendingDown, DollarSign, ShoppingBag, RefreshCw, Activity,
  UserPlus, Percent, CreditCard, Calendar as CalendarIcon, ChevronDown,
  LayoutGrid, Bot, X, CheckCircle, ArrowUpRight, ArrowDownRight,
  Zap, Target, Eye, BarChart3, Sparkles, Trophy
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ptBR from 'date-fns/locale/pt-BR';
import { dashboardService } from '../services/api';
import { useBot } from '../context/BotContext';
import { Button } from '../components/Button';
import './Dashboard.css';

// Registra o idioma para o DatePicker
registerLocale('pt-BR', ptBR);

export function Dashboard() {
  const navigate = useNavigate();
  const { selectedBot } = useBot();
  const { onboarding } = useAuth();
  
  // Estados da página
  const [loading, setLoading] = useState(true);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [isGlobalView, setIsGlobalView] = useState(false);
  const [dateRange, setDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 30)), new Date()
  ]);
  
  const [startDate, endDate] = dateRange;
  const [metrics, setMetrics] = useState({
    total_revenue: 0, active_users: 0, sales_today: 0, leads_mes: 0,
    leads_hoje: 0, ticket_medio: 0, total_transacoes: 0, reembolsos: 0,
    taxa_conversao: 0, chart_data: []
  });
  const [prevMetrics, setPrevMetrics] = useState(null);

  // Controle do Welcome Banner
  useEffect(() => {
    const seen = localStorage.getItem('zenyx_welcome_shown');
    if (onboarding?.completed && !seen) { 
      setShowWelcomeBanner(true); 
      localStorage.setItem('zenyx_welcome_shown', 'true'); 
    }
  }, [onboarding]);

  // Gatilho de carregamento de dados
  useEffect(() => { 
    carregarDados(); 
  }, [selectedBot, endDate, isGlobalView]);

  // Função principal de fetch
  const carregarDados = async () => {
    if (!startDate || !endDate) return;
    try {
      setLoading(true);
      // Mestre Código Fácil: A lógica dinâmica do Backend já traz dados de todas as gateways!
      const botId = isGlobalView ? null : (selectedBot ? selectedBot.id : null);
      const data = await dashboardService.getStats(botId, startDate, endDate);
      
      if (!data.chart_data) data.chart_data = [];
      setMetrics(data);
      
      // Cálculo do período anterior para comparações (Growth)
      const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const prevEnd = new Date(startDate); prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - diffDays);
      
      try { 
        const prev = await dashboardService.getStats(botId, prevStart, prevEnd); 
        setPrevMetrics(prev); 
      } catch { 
        setPrevMetrics(null); 
      }
    } catch (e) { 
      console.error("Erro ao carregar Dashboard:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  // Funções de formatação
  const formatMoney = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((v || 0) / 100);
  const formatNumber = (v) => new Intl.NumberFormat('pt-BR').format(v || 0);
  const calcChange = (cur, prev) => { 
    if (!prev || prev === 0) return cur > 0 ? 100 : 0; 
    return ((cur - prev) / prev * 100).toFixed(1); 
  };

  // Cálculos analíticos (Memoizados para performance)
  const analytics = useMemo(() => {
    const data = metrics.chart_data || [];
    if (!data.length) return { bestDay: null, avgDaily: 0, trend: 'stable', weekData: [] };
    
    const values = data.map(d => d.value || 0);
    const maxVal = Math.max(...values);
    const bestDay = data.find(d => (d.value || 0) === maxVal);
    const avgDaily = values.reduce((a, b) => a + b, 0) / values.length;
    
    const first7 = values.slice(0, 7), last7 = values.slice(-7);
    const avgFirst = first7.reduce((a, b) => a + b, 0) / first7.length;
    const avgLast = last7.reduce((a, b) => a + b, 0) / last7.length;
    const trend = avgLast > avgFirst * 1.1 ? 'up' : avgLast < avgFirst * 0.9 ? 'down' : 'stable';
    
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weekAccum = Array(7).fill(0), weekCount = Array(7).fill(0);
    
    data.forEach(d => {
      if (d.name) {
        const [dd, mm] = d.name.split('/');
        const date = new Date(new Date().getFullYear(), parseInt(mm) - 1, parseInt(dd));
        const dow = date.getDay();
        weekAccum[dow] += d.value || 0; 
        weekCount[dow]++;
      }
    });
    
    const weekData = dayNames.map((name, i) => ({ 
      name, 
      value: weekCount[i] > 0 ? Math.round(weekAccum[i] / weekCount[i]) : 0 
    }));
    
    return { bestDay, avgDaily, trend, weekData };
  }, [metrics.chart_data]);

  // Tooltip customizado do gráfico Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        <p className="chart-tooltip-value">R$ {(payload[0].value || 0).toFixed(2)}</p>
      </div>
    );
    return null;
  };

  const getGreeting = () => { 
    const h = new Date().getHours(); 
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; 
  };

  // Variações em relação ao período anterior
  const revenueChange = prevMetrics ? calcChange(metrics.total_revenue, prevMetrics.total_revenue) : null;
  const leadsChange = prevMetrics ? calcChange(metrics.leads_mes, prevMetrics.leads_mes) : null;
  const transChange = prevMetrics ? calcChange(metrics.total_transacoes, prevMetrics.total_transacoes) : null;

  return (
    <div className="dashboard-container">
      {/* BANNER DE BOAS VINDAS */}
      {showWelcomeBanner && (
        <div className="welcome-banner">
          <div className="welcome-banner-content">
            <button className="welcome-banner-close" onClick={() => setShowWelcomeBanner(false)}><X size={20} /></button>
            <div className="welcome-banner-header">
              <div className="welcome-banner-icon"><CheckCircle size={32} /></div>
              <div className="welcome-banner-text">
                <h2>🎉 Parabéns! Seu bot está pronto para vender!</h2>
                <p>Configuração concluída com sucesso. Explore o painel!</p>
              </div>
            </div>
            <div className="welcome-banner-status">
              {['Bot Criado', 'Configurado', 'Planos Criados', 'Fluxo Configurado'].map((t, i) => (
                <div className="status-item" key={i}>
                  <div className="status-icon completed"><CheckCircle size={16} /></div>
                  <div className="status-text"><span className="status-title">{t}</span><span className="status-subtitle">Concluído</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HEADER DO DASHBOARD */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-title-group">
            <p className="dashboard-greeting">{getGreeting()} 👋</p>
            <h1 className="dashboard-title">
              {isGlobalView
                ? <>Resumo analítico de <span className="highlight-text">todos os bots</span></>
                : <>Resumo de <span className="highlight-text">{selectedBot?.nome || "Selecione um Bot"}</span></>
              }
            </h1>
            <p className="dashboard-subtitle">Gerencie, acompanhe e tome decisões com mais clareza.</p>
          </div>
        </div>
        <div className="dashboard-header-actions">
          <Button variant="ghost" size="icon" onClick={carregarDados} title="Atualizar" disabled={loading} className="refresh-btn">
            <RefreshCw size={20} className={loading ? "spin" : ""} />
          </Button>
          <Button onClick={() => setIsGlobalView(!isGlobalView)} className="view-toggle-btn">
            {isGlobalView ? <><Bot size={18} /><span>Ver bot selecionado</span></> : <><LayoutGrid size={18} /><span>Ver todos os bots</span></>}
          </Button>
        </div>
      </header>

      {/* ═══════ HERO METRICS ═══════ */}
      <section className="hero-metrics-section">
        <div className="hero-metrics-grid">
          <div className="hero-card hero-card-revenue">
            <div className="hero-card-bg"><DollarSign size={120} /></div>
            <div className="hero-card-content">
              <div className="hero-card-top">
                <span className="hero-card-label">Faturamento no período</span>
                <div className="hero-card-icon"><TrendingUp size={20} /></div>
              </div>
              <div className="hero-card-value">{loading ? <span className="skeleton-value" /> : formatMoney(metrics.total_revenue)}</div>
              {revenueChange !== null && (
                <div className={`hero-card-change ${Number(revenueChange) >= 0 ? 'positive' : 'negative'}`}>
                  {Number(revenueChange) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  <span>{Math.abs(revenueChange)}% vs. período anterior</span>
                </div>
              )}
            </div>
          </div>

          <div className="hero-card hero-card-kpi">
            <div className="hero-kpi-icon leads"><UserPlus size={22} /></div>
            <div className="hero-kpi-info">
              <span className="hero-kpi-label">Leads no período</span>
              <span className="hero-kpi-value">{loading ? '—' : formatNumber(metrics.leads_mes)}</span>
              {leadsChange !== null && <span className={`hero-kpi-change ${Number(leadsChange) >= 0 ? 'positive' : 'negative'}`}>{Number(leadsChange) >= 0 ? '+' : ''}{leadsChange}%</span>}
            </div>
          </div>

          <div className="hero-card hero-card-kpi">
            <div className="hero-kpi-icon today"><Zap size={22} /></div>
            <div className="hero-kpi-info">
              <span className="hero-kpi-label">Vendas hoje</span>
              <span className="hero-kpi-value">{loading ? '—' : formatMoney(metrics.sales_today)}</span>
              <span className="hero-kpi-sub">{formatNumber(metrics.leads_hoje)} leads hoje</span>
            </div>
          </div>

          <div className="hero-card hero-card-kpi">
            <div className="hero-kpi-icon active"><Activity size={22} /></div>
            <div className="hero-kpi-info">
              <span className="hero-kpi-label">Assinantes ativos</span>
              <span className="hero-kpi-value">{loading ? '—' : formatNumber(metrics.active_users)}</span>
              <span className="hero-kpi-sub">Planos ativos</span>
            </div>
          </div>

          <div className="hero-card hero-card-kpi">
            <div className="hero-kpi-icon conversion"><Target size={22} /></div>
            <div className="hero-kpi-info">
              <span className="hero-kpi-label">Conversão</span>
              <span className="hero-kpi-value highlight-conversion">{loading ? '—' : `${(metrics.taxa_conversao || 0).toFixed(1)}%`}</span>
              <span className="hero-kpi-sub">{formatNumber(metrics.total_transacoes)} transações</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CHART + KPIs ═══════ */}
      <section className="main-analytics-section">
        <div className="main-analytics-grid">
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-header-left">
                <div className="chart-icon-wrapper"><TrendingUp size={24} /></div>
                <div className="chart-header-info">
                  <span className="chart-label">Faturamento (Período)</span>
                  <span className="chart-value">{loading ? <span className="skeleton-value-sm" /> : formatMoney(metrics.total_revenue)}</span>
                </div>
              </div>
              <div className="chart-header-right">
                <div className="date-picker-wrapper">
                  <CalendarIcon size={16} className="date-picker-icon" />
                  <DatePicker selectsRange startDate={startDate} endDate={endDate} onChange={setDateRange} locale="pt-BR" dateFormat="dd/MM/yyyy" placeholderText="Selecionar período" className="date-picker-input" popperPlacement="bottom-end" />
                  <ChevronDown size={16} className="date-picker-chevron" />
                </div>
              </div>
            </div>
            <div className="chart-container">
              {loading ? (
                <div className="chart-skeleton">{[60,80,45,70,55,90,65].map((h,i) => <div key={i} className="chart-skeleton-bar" style={{height:`${h}%`}} />)}</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.chart_data} margin={{top:20,right:20,left:0,bottom:0}}>
                    <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.4}/><stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false}/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'var(--muted-foreground)',fontSize:12}} dy={10}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'var(--muted-foreground)',fontSize:12}} tickFormatter={v=>`R$${v}`} dx={-10}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Area type="monotone" dataKey="value" stroke="var(--chart-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{r:6,fill:'var(--chart-primary)',strokeWidth:0}}/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            {!loading && analytics.trend !== 'stable' && (
              <div className={`chart-trend-banner ${analytics.trend}`}>
                {analytics.trend === 'up' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                <span>{analytics.trend === 'up' ? 'Tendência de crescimento nos últimos 7 dias' : 'Receita em queda — hora de reforçar o remarketing!'}</span>
              </div>
            )}
          </div>

          <div className="kpi-column">
            <div className="kpi-card"><div className="kpi-icon-wrapper"><DollarSign size={22}/></div><div className="kpi-content"><span className="kpi-label">Ticket médio</span><span className="kpi-value">{loading ? <span className="skeleton-value-sm"/> : formatMoney(metrics.ticket_medio)}</span></div></div>
            <div className="kpi-card"><div className="kpi-icon-wrapper accent"><ShoppingBag size={22}/></div><div className="kpi-content"><span className="kpi-label">Vendas hoje</span><span className="kpi-value">{loading ? <span className="skeleton-value-sm"/> : formatMoney(metrics.sales_today)}</span></div></div>
            <div className="kpi-card"><div className="kpi-icon-wrapper info"><CreditCard size={22}/></div><div className="kpi-content"><span className="kpi-label">Transações</span><span className="kpi-value">{loading ? <span className="skeleton-value-sm"/> : formatNumber(metrics.total_transacoes)}</span></div>
              {transChange !== null && <div className={`kpi-badge ${Number(transChange)>=0?'positive':'negative'}`}>{Number(transChange)>=0?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>}<span>{Math.abs(transChange)}%</span></div>}
            </div>
            <div className="kpi-card"><div className="kpi-icon-wrapper warning"><RefreshCw size={22}/></div><div className="kpi-content"><span className="kpi-label">Reembolsos</span><span className="kpi-value text-danger">{loading ? <span className="skeleton-value-sm"/> : formatMoney(metrics.reembolsos)}</span></div></div>
            <div className="kpi-card kpi-card-highlight"><div className="kpi-icon-wrapper success"><Percent size={22}/></div><div className="kpi-content"><span className="kpi-label">Taxa de conversão</span><span className="kpi-value highlight-conversion">{loading ? <span className="skeleton-value-sm"/> : `${(metrics.taxa_conversao||0).toFixed(1)}%`}</span></div></div>
          </div>
        </div>
      </section>

      {/* ═══════ INSIGHTS ═══════ */}
      <section className="insights-section">
        <div className="section-header">
          <Sparkles size={20} className="section-icon"/>
          <h2 className="section-title">Insights do Período</h2>
        </div>
        <div className="insights-grid">
          <div className="insight-card insight-best">
            <div className="insight-icon-wrap best"><Trophy size={24}/></div>
            <div className="insight-info">
              <span className="insight-label">Melhor dia</span>
              <span className="insight-value">{loading ? '—' : analytics.bestDay ? analytics.bestDay.name : 'Sem dados'}</span>
              <span className="insight-detail">{!loading && analytics.bestDay ? `R$ ${analytics.bestDay.value.toFixed(2)}` : ''}</span>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon-wrap avg"><BarChart3 size={24}/></div>
            <div className="insight-info">
              <span className="insight-label">Média diária</span>
              <span className="insight-value">{loading ? '—' : `R$ ${analytics.avgDaily.toFixed(2)}`}</span>
              <span className="insight-detail">por dia no período</span>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon-wrap rpl"><Eye size={24}/></div>
            <div className="insight-info">
              <span className="insight-label">Receita por lead</span>
              <span className="insight-value">{loading ? '—' : metrics.leads_mes > 0 ? formatMoney(Math.round(metrics.total_revenue / metrics.leads_mes)) : 'R$ 0,00'}</span>
              <span className="insight-detail">valor médio por lead</span>
            </div>
          </div>
          <div className="insight-card insight-actions">
            <span className="insight-label" style={{marginBottom:8}}>Ações rápidas</span>
            <div className="quick-actions">
              <button className="quick-action-btn" onClick={() => navigate('/remarketing')}><Zap size={16}/> Remarketing</button>
              <button className="quick-action-btn" onClick={() => navigate('/estatisticas')}><BarChart3 size={16}/> Estatísticas</button>
              <button className="quick-action-btn" onClick={() => navigate('/ranking')}><Trophy size={16}/> Ranking</button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ WEEKLY ═══════ */}
      {!loading && analytics.weekData.some(d => d.value > 0) && (
        <section className="weekly-section">
          <div className="section-header">
            <CalendarIcon size={20} className="section-icon"/>
            <h2 className="section-title">Performance Semanal</h2>
            <span className="section-subtitle">Média de faturamento por dia da semana</span>
          </div>
          <div className="weekly-chart-card">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.weekData} margin={{top:10,right:20,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#a3a3a3',fontSize:13}}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill:'#a3a3a3',fontSize:12}} tickFormatter={v=>`R$${v}`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="value" radius={[6,6,0,0]} maxBarSize={50}>
                  {analytics.weekData.map((entry, i) => {
                    const max = Math.max(...analytics.weekData.map(d => d.value));
                    return <Cell key={i} fill={entry.value === max && max > 0 ? '#c333ff' : 'rgba(195,51,255,0.35)'}/>;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}