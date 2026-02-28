import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useBot } from '../context/BotContext';
import { useAuth } from '../context/AuthContext';
import { statisticsService, botService, changelogService } from '../services/api';
import {
  DollarSign, Users, TrendingUp, Star, Clock, Calendar, BarChart3, PieChart,
  ChevronDown, ChevronLeft, ChevronRight, RefreshCw, Award, Zap, ShoppingBag,
  Target, Repeat, UserCheck, Timer, ArrowUpRight, ArrowDownRight,
  FileText, Plus, Trash2, X, Link2, Megaphone, CreditCard,
  Activity, Flame, TrendingDown, Eye, Gauge, ArrowUp, ArrowDown,
  Wallet, Layers, Filter, LayoutGrid, GitBranch
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend, AreaChart, Area,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart
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

  // Calendário interativo
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedCalDay, setSelectedCalDay] = useState(null);

  // Diário de Mudanças
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [diaryCategory, setDiaryCategory] = useState('geral');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryNotes, setDiaryNotes] = useState([]);
  const [diarySaving, setDiarySaving] = useState(false);

  // Heatmap toggle
  const [heatmapView, setHeatmapView] = useState('vendas'); // 'vendas' ou 'receita'

  useEffect(() => { loadBots(); loadDiary(); }, []);
  useEffect(() => { loadStats(); }, [selectedBot, period, isGlobalView]);

  const loadBots = async () => { try { setUserBots(await botService.listBots() || []); } catch(e) {} };
  const loadStats = async () => {
    try { setLoading(true); setData(await statisticsService.getStats(isGlobalView ? null : selectedBot?.id, period)); } catch(e) {} finally { setLoading(false); }
  };
  const loadDiary = async () => { try { setDiaryNotes(await changelogService.list()); } catch(e) {} };
  const saveDiary = async () => {
    if (!diaryContent.trim()) return;
    setDiarySaving(true);
    try { await changelogService.create({ date: diaryDate, category: diaryCategory, content: diaryContent }); setDiaryContent(''); setShowDiaryForm(false); loadDiary(); } catch(e) {} finally { setDiarySaving(false); }
  };
  const deleteDiary = async (id) => { try { await changelogService.delete(id); loadDiary(); } catch(e) {} };

  const fmt = (c) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((c||0)/100);
  const fN = (v) => new Intl.NumberFormat('pt-BR').format(v||0);
  const periodLabels = { '7d': '7 dias', '30d': '30 dias', '90d': '90 dias', 'all': 'Todo período' };
  const COLORS = ['#c333ff', '#444', '#1a1a2e'];
  const COLORS_PIE = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#c333ff', '#06b6d4'];
  const Sk = () => <span className="sk-pulse" />;

  const MoneyTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return <div className="st-tip"><p className="st-tip-l">{label}</p>{payload.map((p,i)=><p key={i} className="st-tip-v" style={{color:p.color||'#fff'}}>R$ {(p.value||0).toFixed(2)}</p>)}</div>;
  };
  const CountTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return <div className="st-tip"><p className="st-tip-l">{label}</p>{payload.map((p,i)=><p key={i} className="st-tip-v" style={{color:p.color||'#fff'}}>{p.value} {p.name||'vendas'}</p>)}</div>;
  };
  const GenericTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return <div className="st-tip"><p className="st-tip-l">{label}</p>{payload.map((p,i)=><p key={i} className="st-tip-v" style={{color:p.color||p.fill||'#fff'}}>{p.name}: {p.value}</p>)}</div>;
  };

  const m = data?.metricas || {};
  const adv = data?.metricas_avancadas || {};
  const cnt = data?.contadores_usuarios || {};
  const tm = data?.tempo_medio || {};
  const cal = data?.calendario || [];
  const crescimento = data?.crescimento || {};
  const funil = data?.funil_visual || {};
  const gatewayData = data?.receita_por_gateway || {};
  const origemData = data?.vendas_por_origem || [];
  const heatmap = data?.heatmap_semanal || [];
  const projecao = data?.projecao_mensal || {};

  // ============ CALENDÁRIO INTERATIVO ============
  const mesesNomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const diasSemana = ['D','S','T','Q','Q','S','S'];

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDayWeekday = new Date(calYear, calMonth, 1).getDay();
    const today = new Date();
    const isCurrentMonth = calMonth === today.getMonth() && calYear === today.getFullYear();
    
    const days = [];
    for (let i = 0; i < firstDayWeekday; i++) days.push({ empty: true });
    
    // Find max vendas for intensity calculation
    const maxVendas = Math.max(1, ...cal.map(c => c.vendas || 0));
    
    for (let d = 1; d <= daysInMonth; d++) {
      const calDay = cal.find(c => c.day === d);
      const vendas = isCurrentMonth && calDay ? calDay.vendas : 0;
      const receita = isCurrentMonth && calDay ? calDay.receita : 0;
      days.push({
        day: d,
        vendas,
        receita,
        intensity: vendas / maxVendas, // 0 to 1 for heatmap coloring
        isToday: isCurrentMonth && d === today.getDate(),
        selected: selectedCalDay === d && isCurrentMonth,
      });
    }
    return days;
  }, [calMonth, calYear, cal, selectedCalDay]);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
    setSelectedCalDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
    setSelectedCalDay(null);
  };

  const selectedDayInfo = useMemo(() => {
    if (!selectedCalDay) return null;
    const d = cal.find(c => c.day === selectedCalDay);
    return d || { day: selectedCalDay, vendas: 0, receita: 0 };
  }, [selectedCalDay, cal]);

  // Best hour from chart_horas
  const bestHour = useMemo(() => {
    const horas = data?.chart_horas || [];
    if (!horas.length) return { hour: '0h', count: 0 };
    const best = horas.reduce((a, b) => b.count > a.count ? b : a, horas[0]);
    return best;
  }, [data]);

  // Calendar totals
  const calTotals = useMemo(() => {
    const totalV = cal.reduce((s, d) => s + (d.vendas || 0), 0);
    const totalR = cal.reduce((s, d) => s + (d.receita || 0), 0);
    const bestDay = cal.length > 0 ? cal.reduce((a, b) => (b.vendas > a.vendas ? b : a), cal[0]) : null;
    return { vendas: totalV, receita: totalR, bestDay };
  }, [cal]);

  // Funil data for chart
  const funilChartData = useMemo(() => {
    if (!funil.starts && !funil.leads && !funil.checkouts && !funil.vendas) return [];
    return [
      { name: '/start', value: funil.starts || 0, fill: '#3b82f6' },
      { name: 'Leads', value: funil.leads || 0, fill: '#06b6d4' },
      { name: 'Checkouts', value: funil.checkouts || 0, fill: '#f59e0b' },
      { name: 'Vendas', value: funil.vendas || 0, fill: '#10b981' },
    ];
  }, [funil]);

  // Heatmap processed data
  const heatmapProcessed = useMemo(() => {
    if (!heatmap.length) return [];
    const maxVal = Math.max(1, ...heatmap.map(h => h.count || 0));
    return heatmap.map(h => ({ ...h, intensity: (h.count || 0) / maxVal }));
  }, [heatmap]);

  const catColors = { geral:'#06b6d4', upsell:'#ef4444', downsell:'#f59e0b', fluxo:'#10b981', preco:'#c333ff', remarketing:'#8b5cf6', plano:'#ec4899' };
  const contadorItems = [
    { icon: '👥', label: 'Total Compradores', value: cnt.total_compradores, color: '#fff' },
    { icon: '🔄', label: 'Recorrentes', value: cnt.recorrentes, color: '#06b6d4' },
    { icon: '⭐', label: 'VIPs Ativos', value: cnt.vips_ativos, color: '#10b981' },
    { icon: '↗️', label: 'Upsellers', value: cnt.upsellers, color: '#ef4444' },
    { icon: '↘️', label: 'Downsellers', value: cnt.downsellers, color: '#f59e0b' },
    { icon: '📣', label: 'Remarketing', value: cnt.remarketing, color: '#8b5cf6' },
  ];

  // === GROWTH INDICATOR ===
  const GrowthBadge = ({ value }) => {
    if (value === undefined || value === null) return null;
    const isPositive = value >= 0;
    return (
      <span className={`st-growth ${isPositive ? 'up' : 'down'}`}>
        {isPositive ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  const TaxaCard = ({ icon, color, title, value, sub }) => (
    <div className="st-taxa">
      <div className="st-taxa-hd"><div className="st-taxa-ic" style={{background:`${color}22`,color}}>{icon}</div><span>{title}</span></div>
      <div className="st-taxa-val">{loading ? <Sk/> : `${(value||0).toFixed(1)}%`}</div>
      <div className="st-taxa-sub">{sub}</div>
      <div className="st-taxa-bar"><div className="st-taxa-fill" style={{width:`${Math.min(value||0,100)}%`,background:color}}/></div>
    </div>
  );

  const RankCard = ({ icon, title, tag, tagColor, items, nameKey='name', empty }) => (
    <div className="st-rank">
      <div className="st-rank-hd">{icon}<span className="st-rank-title">{title}</span><span className="st-rank-tag" style={{color:tagColor}}>{tag}</span></div>
      <div className="st-rank-body">
        {loading ? <p className="st-rank-empty">Carregando...</p> : (items||[]).length === 0 ? <p className="st-rank-empty">{empty}</p> : (
          <div className="st-rank-list">{(items||[]).slice(0,5).map((it,j) => (
            <div key={j} className="st-rank-row"><span className="st-rank-pos">{j+1}º</span><span className="st-rank-name">{it[nameKey]}</span><span className="st-rank-cnt">{it.count || it.revenue || 0}{it.count !== undefined ? ' vendas' : ''}</span></div>
          ))}</div>
        )}
      </div>
    </div>
  );

  // === HEATMAP CELL COMPONENT ===
  const HeatCell = ({ value, max }) => {
    const intensity = max > 0 ? value / max : 0;
    const alpha = Math.max(0.05, intensity);
    return (
      <div className="st-heat-cell" style={{ background: `rgba(195, 51, 255, ${alpha})`, color: intensity > 0.5 ? '#fff' : '#888' }}>
        {value > 0 ? value : '·'}
      </div>
    );
  };

  return (
    <div className="statistics-container">
      {/* HEADER */}
      <div className="st-hd">
        <div>
          <h1 className="st-h1">Estatísticas</h1>
          <p className="st-h1-sub">Métricas de <strong style={{color:'#c333ff'}}>{isGlobalView ? 'Todos os Bots' : (selectedBot?.nome || 'Selecione um bot')}</strong></p>
        </div>
        <div className="st-hd-r">
          <label className="st-tgl"><input type="checkbox" checked={isGlobalView} onChange={e=>setIsGlobalView(e.target.checked)}/> Todos os bots</label>
          {!isGlobalView && userBots.length > 0 && (
            <select className="st-sel" value={selectedBot?.id||''} onChange={e=>{const b=userBots.find(x=>x.id===parseInt(e.target.value));if(b) window.dispatchEvent(new CustomEvent('select-bot',{detail:b}));}}>
              {userBots.map(b=><option key={b.id} value={b.id}>{b.nome}</option>)}
            </select>
          )}
          <div className="st-per-w">
            <button className="st-per-btn" onClick={()=>setShowPeriodMenu(!showPeriodMenu)}><Calendar size={15}/> {periodLabels[period]} <ChevronDown size={13}/></button>
            {showPeriodMenu && <div className="st-per-menu">{Object.entries(periodLabels).map(([k,v])=>(<button key={k} className={`st-per-opt ${period===k?'act':''}`} onClick={()=>{setPeriod(k);setShowPeriodMenu(false);}}>{v}</button>))}</div>}
          </div>
          <button className="st-ref" onClick={loadStats}><RefreshCw size={18} className={loading?'spin':''}/></button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MÉTRICAS PRINCIPAIS — com indicadores de crescimento         */}
      {/* ============================================================ */}
      <section className="st-sec">
        <h2 className="st-sec-t">MÉTRICAS PRINCIPAIS</h2>
        <div className="g4">
          {[
            {ic:<DollarSign size={22}/>,bg:'rgba(16,185,129,0.15)',cl:'#10b981',lb:'Receita Total',vl:fmt(m.receita_total),sb:`${fN(m.total_vendas)} vendas`,grow:crescimento.receita},
            {ic:<BarChart3 size={22}/>,bg:'rgba(59,130,246,0.15)',cl:'#3b82f6',lb:'Ticket Médio',vl:fmt(m.ticket_medio),sb:'Valor médio por venda',grow:crescimento.ticket_medio},
            {ic:<Users size={22}/>,bg:'rgba(195,51,255,0.15)',cl:'#c333ff',lb:'VIPs Ativos',vl:fN(m.total_usuarios),sb:`${fN(m.total_leads)} leads`,grow:crescimento.vips},
            {ic:<Star size={22}/>,bg:'rgba(245,158,11,0.15)',cl:'#f59e0b',lb:'LTV Médio',vl:fmt(m.ltv_medio),sb:'Gasto médio por cliente',grow:crescimento.ltv},
          ].map((c,i)=>(
            <div key={i} className="st-mc"><div className="st-mc-ic" style={{background:c.bg,color:c.cl}}>{c.ic}</div><div className="st-mc-inf"><span className="st-mc-lb">{c.lb} {!loading && <GrowthBadge value={c.grow}/>}</span><span className="st-mc-vl">{loading?<Sk/>:c.vl}</span><span className="st-mc-sb">{c.sb}</span></div></div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* PROJEÇÃO + RESUMO VENDAS + TAXA APROVAÇÃO                   */}
      {/* ============================================================ */}
      <section className="st-sec">
        <h2 className="st-sec-t">RESUMO DE VENDAS & PROJEÇÃO</h2>
        <div className="g4">
          <div className="st-sc">
            <div className="st-sc-ic" style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b'}}><Clock size={22}/></div>
            <div><span className="st-sc-lb">Pendentes</span><span className="st-sc-vl">{loading?'-':fN(m.total_pendentes)}</span><span className="st-sc-sb">{loading?'':fmt(m.receita_pendentes)}</span></div>
          </div>
          <div className="st-sc">
            <div className="st-sc-ic" style={{background:'rgba(16,185,129,0.15)',color:'#10b981'}}><ShoppingBag size={22}/></div>
            <div><span className="st-sc-lb">Confirmadas</span><span className="st-sc-vl">{loading?'-':fN(m.total_vendas)}</span><span className="st-sc-sb">{loading?'':fmt(m.receita_total)}</span></div>
          </div>
          <div className="st-sc">
            <div className="st-sc-ic" style={{background:'rgba(195,51,255,0.15)',color:'#c333ff'}}><Target size={22}/></div>
            <div><span className="st-sc-lb">Conversão</span><span className="st-sc-vl" style={{color:'#c333ff'}}>{loading?'-':`${(m.taxa_conversao||0).toFixed(1)}%`}</span><span className="st-sc-sb">{loading?'':`${fN(m.total_leads)} leads → ${fN(m.total_vendas)} vendas`}</span></div>
          </div>
          {/* 🆕 PROJEÇÃO MENSAL */}
          <div className="st-sc st-sc-proj">
            <div className="st-sc-ic" style={{background:'rgba(6,182,212,0.15)',color:'#06b6d4'}}><Gauge size={22}/></div>
            <div>
              <span className="st-sc-lb">Projeção Mensal</span>
              <span className="st-sc-vl" style={{color:'#06b6d4'}}>{loading?'-':fmt(projecao.receita_projetada)}</span>
              <span className="st-sc-sb">{loading?'':`~${fN(projecao.vendas_projetadas)} vendas estimadas`}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 🆕 FUNIL VISUAL: /start → lead → checkout → venda           */}
      {/* ============================================================ */}
      <section className="st-sec">
        <h2 className="st-sec-t">FUNIL DE CONVERSÃO</h2>
        <div className="st-funil-wrap">
          <div className="st-funil-chart">
            <div className="st-chart-hd"><GitBranch size={18} color="#3b82f6"/><span>Funil Completo</span><span className="st-tag" style={{color:'#3b82f6'}}>JORNADA DO LEAD</span></div>
            {loading ? <div className="st-chart-sk">{[90,70,50,30].map((h,i)=><div key={i} className="sk-bar" style={{height:`${h}%`}}/>)}</div> : (
              <div className="st-funil-bars">
                {funilChartData.map((item, idx) => {
                  const maxVal = Math.max(1, ...funilChartData.map(f => f.value));
                  const pct = (item.value / maxVal) * 100;
                  const convRate = idx > 0 && funilChartData[idx-1].value > 0 
                    ? ((item.value / funilChartData[idx-1].value) * 100).toFixed(1)
                    : null;
                  return (
                    <div key={idx} className="st-funil-step">
                      <div className="st-funil-label">
                        <span className="st-funil-name">{item.name}</span>
                        <span className="st-funil-val" style={{color: item.fill}}>{fN(item.value)}</span>
                      </div>
                      <div className="st-funil-bar-bg">
                        <div className="st-funil-bar-fill" style={{width:`${pct}%`, background: item.fill}}/>
                      </div>
                      {convRate && <span className="st-funil-conv">↓ {convRate}% conversão</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Funil summary cards */}
          <div className="st-funil-cards">
            <div className="st-funil-kpi">
              <span className="st-funil-kpi-lb">% Viraram /starts</span>
              <span className="st-funil-kpi-vl" style={{color:'#3b82f6'}}>{loading?'-':`${(funil.taxa_start_lead||0).toFixed(1)}%`}</span>
            </div>
            <div className="st-funil-kpi">
              <span className="st-funil-kpi-lb">% Leads Viram Vendas</span>
              <span className="st-funil-kpi-vl" style={{color:'#06b6d4'}}>{loading?'-':`${(funil.taxa_lead_venda||0).toFixed(1)}%`}</span>
            </div>
            <div className="st-funil-kpi">
              <span className="st-funil-kpi-lb">Ticket Médio</span>
              <span className="st-funil-kpi-vl" style={{color:'#f59e0b'}}>{loading?'-':fmt(m.ticket_medio)}</span>
            </div>
            <div className="st-funil-kpi">
              <span className="st-funil-kpi-lb">% de Aprovação</span>
              <span className="st-funil-kpi-vl" style={{color:'#10b981'}}>{loading?'-':`${(funil.taxa_aprovacao||0).toFixed(1)}%`}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* VENDAS POR HORA — Full width com cards resumo               */}
      {/* ============================================================ */}
      <section className="st-sec">
        <h2 className="st-sec-t">VENDAS POR HORA</h2>
        <div className="st-hora-wrap">
          <div className="st-chart st-chart-full">
            <div className="st-chart-hd"><Clock size={18} color="#06b6d4"/><span>Vendas por Hora</span><span className="st-tag" style={{color:'#06b6d4'}}>FREQUÊNCIA TEMPORAL</span></div>
            <div className="st-chart-bd">{loading?<div className="st-chart-sk">{Array.from({length:12}).map((_,i)=><div key={i} className="sk-bar" style={{height:`${30+Math.random()*60}%`}}/>)}</div>:(
              <ResponsiveContainer width="100%" height={260}><BarChart data={data?.chart_horas||[]}><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false}/><XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:10}} interval={1}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}}/><Tooltip content={<CountTip/>}/><Bar dataKey="count" name="Vendas" fill="#06b6d4" radius={[3,3,0,0]} maxBarSize={18}/></BarChart></ResponsiveContainer>
            )}</div>
          </div>
          <div className="st-hora-cards">
            <div className="st-hora-c"><span className="st-hora-c-lb">MELHOR HORA</span><span className="st-hora-c-vl"><strong style={{color:'#06b6d4'}}>{bestHour.hour?.replace(':00','h')}</strong> ({bestHour.count} vendas)</span></div>
            <div className="st-hora-c"><span className="st-hora-c-lb">PAGOS</span><span className="st-hora-c-vl" style={{color:'#10b981'}}>{fN(m.total_vendas)}</span></div>
            <div className="st-hora-c"><span className="st-hora-c-lb">GERADOS</span><span className="st-hora-c-vl" style={{color:'#3b82f6'}}>{fN(m.total_geradas)}</span></div>
            <div className="st-hora-c"><span className="st-hora-c-lb">CONVERSÃO</span><span className="st-hora-c-vl" style={{color:'#c333ff'}}>{(m.taxa_conversao||0).toFixed(1)}%</span></div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* VENDAS POR DIA DA SEMANA + CALENDÁRIO MODERNO               */}
      {/* ============================================================ */}
      <section className="st-sec">
        <h2 className="st-sec-t">VENDAS POR DIA DA SEMANA</h2>
        <div className="st-semana-row">
          <div className="st-chart" style={{flex:2}}>
            <div className="st-chart-hd"><Calendar size={18} color="#f59e0b"/><span>Vendas por Dia da Semana</span><span className="st-tag" style={{color:'#f59e0b'}}>ANÁLISE SEMANAL</span></div>
            <div className="st-chart-bd">{loading?<div className="st-chart-sk">{[50,70,60,80,90,40,30].map((h,i)=><div key={i} className="sk-bar" style={{height:`${h}%`}}/>)}</div>:(
              <ResponsiveContainer width="100%" height={260}><BarChart data={data?.chart_semana||[]}><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false}/><XAxis dataKey="day_short" axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}}/><Tooltip content={<CountTip/>}/><Bar dataKey="count" name="Vendas" fill="#f59e0b" radius={[4,4,0,0]} maxBarSize={40}/></BarChart></ResponsiveContainer>
            )}</div>
          </div>

          {/* CALENDÁRIO MODERNO */}
          <div className="st-cal-modern" style={{flex:1}}>
            <div className="st-cal-top">
              <div className="st-cal-hd-modern">
                <Calendar size={20} color="#c333ff"/>
                <div className="st-cal-title-wrap">
                  <span className="st-cal-title">Calendário</span>
                  <span className="st-cal-subtitle">{mesesNomes[calMonth]?.toUpperCase()} {calYear}</span>
                </div>
              </div>
              <div className="st-cal-nav-modern">
                <button className="st-cal-arrow-modern" onClick={prevMonth}><ChevronLeft size={16}/></button>
                <span className="st-cal-month-modern">{mesesNomes[calMonth]} {calYear}</span>
                <button className="st-cal-arrow-modern" onClick={nextMonth}><ChevronRight size={16}/></button>
              </div>
            </div>

            <div className="st-cal-grid-modern">
              {diasSemana.map((d,i) => <div key={i} className="st-cal-wd-modern">{d}</div>)}
              {calendarData.map((d,i) => d.empty ? <div key={`e${i}`} className="st-cal-empty-modern"/> : (
                <div key={d.day}
                  className={`st-cal-day-modern ${d.isToday?'today':''} ${d.vendas>0?'has':''} ${d.selected?'sel':''}`}
                  style={d.vendas > 0 ? {'--heat': d.intensity} : {}}
                  onClick={() => setSelectedCalDay(d.day === selectedCalDay ? null : d.day)}>
                  <span className="st-cal-n-modern">{d.day}</span>
                  {d.vendas > 0 && <span className="st-cal-badge">{d.vendas}</span>}
                </div>
              ))}
            </div>

            {/* Calendar detail or summary */}
            {selectedDayInfo ? (
              <div className="st-cal-detail-modern">
                <div className="st-cal-detail-hd">
                  <strong>Dia {selectedDayInfo.day}</strong>
                  <button className="st-cal-detail-close" onClick={()=>setSelectedCalDay(null)}><X size={14}/></button>
                </div>
                <div className="st-cal-detail-stats">
                  <div><span className="st-cal-d-lb">Vendas</span><span className="st-cal-d-vl" style={{color:'#10b981'}}>{selectedDayInfo.vendas}</span></div>
                  <div><span className="st-cal-d-lb">Receita</span><span className="st-cal-d-vl" style={{color:'#f59e0b'}}>{fmt(selectedDayInfo.receita)}</span></div>
                </div>
              </div>
            ) : (
              <div className="st-cal-summary">
                <div className="st-cal-sum-row">
                  <span>Total do mês</span>
                  <strong style={{color:'#10b981'}}>{fN(calTotals.vendas)} vendas</strong>
                </div>
                <div className="st-cal-sum-row">
                  <span>Receita do mês</span>
                  <strong style={{color:'#f59e0b'}}>{fmt(calTotals.receita)}</strong>
                </div>
                {calTotals.bestDay && calTotals.bestDay.vendas > 0 && (
                  <div className="st-cal-sum-row">
                    <span>Melhor dia</span>
                    <strong style={{color:'#c333ff'}}>Dia {calTotals.bestDay.day} ({calTotals.bestDay.vendas}v)</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 🆕 HEATMAP SEMANAL (DIA x HORA)                             */}
      {/* ============================================================ */}
      <section className="st-sec">
        <h2 className="st-sec-t">MAPA DE CALOR — DIA DA SEMANA × HORA</h2>
        <div className="st-chart">
          <div className="st-chart-hd"><Flame size={18} color="#ef4444"/><span>Heatmap de Vendas</span><span className="st-tag" style={{color:'#ef4444'}}>QUANDO SEUS CLIENTES COMPRAM</span></div>
          {loading ? <div className="st-chart-sk" style={{height:160}}/> : (
            <div className="st-heatmap-wrap">
              <div className="st-heatmap-labels">
                {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((d,i)=>(
                  <div key={i} className="st-heat-label">{d}</div>
                ))}
              </div>
              <div className="st-heatmap-grid">
                <div className="st-heat-hours">
                  {Array.from({length:24}).map((_,h)=>(
                    <span key={h} className="st-heat-hour">{h}h</span>
                  ))}
                </div>
                {[0,1,2,3,4,5,6].map(day => {
                  const dayData = heatmapProcessed.filter(h => h.weekday === day);
                  const maxVal = Math.max(1, ...heatmapProcessed.map(h => h.count));
                  return (
                    <div key={day} className="st-heat-row">
                      {Array.from({length:24}).map((_,hour)=>{
                        const cell = dayData.find(h => h.hour === hour);
                        const val = cell ? cell.count : 0;
                        return <HeatCell key={hour} value={val} max={maxVal}/>;
                      })}
                    </div>
                  );
                })}
              </div>
              <div className="st-heat-legend">
                <span>Menos</span>
                <div className="st-heat-legend-bar"/>
                <span>Mais</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 🆕 VENDAS POR ORIGEM + RECEITA POR GATEWAY                  */}
      {/* ============================================================ */}
      <section className="st-sec">
        <h2 className="st-sec-t">DISTRIBUIÇÃO DE VENDAS</h2>
        <div className="g2">
          {/* Vendas por Origem */}
          <div className="st-chart">
            <div className="st-chart-hd"><Layers size={18} color="#8b5cf6"/><span>Vendas por Origem</span><span className="st-tag" style={{color:'#8b5cf6'}}>DE ONDE VÊM AS VENDAS</span></div>
            <div className="st-chart-bd" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
              {loading?<div className="sk-donut"/>:(
                origemData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <RechartsPie>
                      <Pie data={origemData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" stroke="none">
                        {origemData.map((_, i) => <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]}/>)}
                      </Pie>
                      <Legend verticalAlign="bottom" iconType="circle" iconSize={10} formatter={v=><span style={{color:'#ccc',fontSize:'0.8rem'}}>{v}</span>}/>
                      <Tooltip content={<GenericTip/>}/>
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : <p style={{color:'#555',fontSize:'.85rem'}}>Sem dados de origem</p>
              )}
            </div>
          </div>

          {/* Receita por Gateway */}
          <div className="st-chart">
            <div className="st-chart-hd"><Wallet size={18} color="#10b981"/><span>Receita por Gateway</span><span className="st-tag" style={{color:'#10b981'}}>PROCESSADORES DE PAGAMENTO</span></div>
            <div className="st-gateway-cards">
              {loading ? <Sk/> : (
                <>
                  {(gatewayData.items || []).map((gw, i) => (
                    <div key={i} className="st-gw-card">
                      <div className="st-gw-hd">
                        <span className="st-gw-name">{gw.name}</span>
                        <span className="st-gw-pct" style={{color: COLORS_PIE[i % COLORS_PIE.length]}}>{gw.pct}%</span>
                      </div>
                      <div className="st-gw-bar-bg"><div className="st-gw-bar-fill" style={{width:`${gw.pct}%`, background: COLORS_PIE[i % COLORS_PIE.length]}}/></div>
                      <div className="st-gw-info">
                        <span>{fN(gw.count)} vendas</span>
                        <span>{fmt(gw.receita)}</span>
                      </div>
                    </div>
                  ))}
                  {(!gatewayData.items || gatewayData.items.length === 0) && <p style={{color:'#555',fontSize:'.85rem',textAlign:'center',padding:20}}>Sem dados de gateway</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8 TAXAS                                                      */}
      {/* ============================================================ */}
      <section className="st-sec">
        <h2 className="st-sec-t">TAXAS DETALHADAS</h2>
        <div className="g4">
          <TaxaCard icon={<ArrowUpRight size={20}/>} color="#ef4444" title="Taxa Upsell" value={adv.taxa_upsell||0} sub={`${adv.upsell_vendas||0} DE ${m.total_vendas||0} VENDAS`}/>
          <TaxaCard icon={<ArrowDownRight size={20}/>} color="#f59e0b" title="Taxa Downsell" value={adv.taxa_downsell||0} sub={`${adv.downsell_vendas||0} DE ${m.total_pendentes||0} RECUSAS`}/>
          <TaxaCard icon={<Zap size={20}/>} color="#8b5cf6" title="Taxa OrderBump" value={adv.taxa_orderbump||0} sub={`${adv.orderbump_vendas||0} DE ${m.total_geradas||0} CHECKOUTS`}/>
          <TaxaCard icon={<Repeat size={20}/>} color="#06b6d4" title="Taxa Recuperação" value={adv.taxa_recuperacao||0} sub={`${adv.remarketing_vendas||0} DE ${m.total_pendentes||0} PENDENTES`}/>
          <TaxaCard icon={<Repeat size={20}/>} color="#10b981" title="Taxa Recorrência" value={adv.taxa_recorrencia||0} sub={`${adv.recorrentes||0} DE ${adv.total_compradores||0} COMPRADORES`}/>
          <TaxaCard icon={<UserCheck size={20}/>} color="#3b82f6" title="Taxa Retenção" value={adv.taxa_retencao||0} sub={`${cnt.vips_ativos||0} VIPS DE ${adv.total_compradores||0} COMPRADORES`}/>
          <TaxaCard icon={<TrendingUp size={20}/>} color="#ec4899" title="Taxa Upgrade" value={adv.taxa_upgrade||0} sub={`${adv.upsell_vendas||0} UPSELLS DE ${adv.total_compradores||0} COMPRADORES`}/>
          <TaxaCard icon={<X size={20}/>} color="#ef4444" title="Taxa Abandono" value={adv.taxa_abandono||0} sub={`${adv.expirados_unicos||0} EX-VIPS DE ${adv.total_compradores||0} COMPRADORES`}/>
        </div>
      </section>

      {/* ============================================================ */}
      {/* LTV + VENDAS/USR + RETORNO + CONTADORES                     */}
      {/* ============================================================ */}
      <section className="st-sec">
        <h2 className="st-sec-t">INDICADORES AVANÇADOS</h2>
        <div className="g4">
          <div className="st-big"><div className="st-big-hd"><DollarSign size={20} color="#10b981"/> <span>LTV Médio</span><span className="st-tag" style={{color:'#10b981'}}>LIFETIME VALUE</span></div><div className="st-big-val" style={{color:'#10b981'}}>{loading?<Sk/>:fmt(m.ltv_medio)}</div><div className="st-big-sub">GASTO MÉDIO POR CLIENTE</div></div>
          <div className="st-big"><div className="st-big-hd"><ShoppingBag size={20} color="#8b5cf6"/> <span>Vendas por Usuário</span><span className="st-tag" style={{color:'#8b5cf6'}}>MÉDIA</span></div><div className="st-big-val" style={{color:'#f59e0b'}}>{loading?<Sk/>:`${adv.vendas_por_usuario||0}x`}</div><div className="st-big-sub">COMPRAS POR CLIENTE</div></div>
          <div className="st-big"><div className="st-big-hd"><Timer size={20} color="#06b6d4"/> <span>Tempo Médio Retorno</span><span className="st-tag" style={{color:'#06b6d4'}}>ENTRE COMPRAS</span></div><div className="st-big-val" style={{color:'#c333ff'}}>{loading?<Sk/>:adv.avg_retorno_dias||0}</div><div className="st-big-sub">DIAS PARA RECOMPRA</div></div>
          <div className="st-contadores"><div className="st-big-hd"><UserCheck size={20} color="#06b6d4"/> <span>Contadores de Usuários</span><span className="st-tag" style={{color:'#06b6d4'}}>POR TIPO</span></div>
            <div className="st-cnt-scroll">{contadorItems.map((it,i)=>(<div key={i} className="st-cnt-row"><span className="st-cnt-ic">{it.icon}</span><span className="st-cnt-lb">{it.label}</span><span className="st-cnt-vl" style={{color:it.color}}>{loading?'-':fN(it.value)}</span></div>))}</div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TEMPO MÉDIO /START → PAGAMENTO                              */}
      {/* ============================================================ */}
      <section className="st-sec">
        <div className="g4">
          <div className="st-tempo">
            <div className="st-big-hd"><Clock size={20} color="#06b6d4"/> <span>Tempo Médio</span><span className="st-tag" style={{color:'#06b6d4'}}>/START → PAGAMENTO</span></div>
            <div className="st-tempo-vals"><div className="st-tempo-u"><span className="st-tempo-n">{tm.horas||0}</span><span className="st-tempo-lb">HORAS</span></div><div className="st-tempo-u"><span className="st-tempo-n">{tm.minutos||0}</span><span className="st-tempo-lb">MINUTOS</span></div><div className="st-tempo-u"><span className="st-tempo-n">{tm.segundos||0}</span><span className="st-tempo-lb">SEGUNDOS</span></div></div>
            <div className="st-tempo-ds">DATASET: {tm.dataset||0} PAGAMENTOS</div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* RANKINGS 4x2                                               */}
      {/* ============================================================ */}
      <section className="st-sec">
        <h2 className="st-sec-t">PICOS DE DESEMPENHO</h2>
        <div className="g4">
          <RankCard icon={<Zap size={18} color="#10b981"/>} title="Top 5 Bots" tag="MAIS VENDIDOS" tagColor="#10b981" items={data?.top_bots} empty="Nenhum bot disponível"/>
          <RankCard icon={<Award size={18} color="#c333ff"/>} title="Top 5 Planos" tag="MAIS VENDIDOS" tagColor="#c333ff" items={data?.top_planos} empty="Nenhum plano disponível"/>
          <RankCard icon={<Calendar size={18} color="#f59e0b"/>} title="Top 7 Dias" tag="MAIS VENDIDOS" tagColor="#f59e0b" items={data?.top_dias} nameKey="day" empty="Nenhum dia disponível"/>
          <RankCard icon={<CreditCard size={18} color="#3b82f6"/>} title="Top 5 Tickets" tag="MAIS VENDIDOS" tagColor="#3b82f6" items={data?.top_planos} empty="Nenhum ticket disponível"/>
          <RankCard icon={<Link2 size={18} color="#ec4899"/>} title="Top Códigos de Venda" tag="MAIS RECEITA" tagColor="#ec4899" items={data?.top_tracking} nameKey="name" empty="Nenhum código disponível"/>
          <RankCard icon={<Megaphone size={18} color="#8b5cf6"/>} title="Top Campanhas" tag="TRÁFEGO PAGO" tagColor="#8b5cf6" items={data?.top_campanhas} nameKey="name" empty="Nenhuma campanha com vendas"/>
          <RankCard icon={<Clock size={18} color="#06b6d4"/>} title="Top Horários" tag="MAIS VENDIDOS" tagColor="#06b6d4" items={data?.top_horas} nameKey="hour" empty="Nenhum horário disponível"/>
          {/* Tempo Médio /Start → Pagamento como card */}
          <div className="st-rank">
            <div className="st-rank-hd"><Clock size={18} color="#06b6d4"/><span className="st-rank-title">Tempo Médio</span><span className="st-rank-tag" style={{color:'#06b6d4'}}>/START → PAGAMENTO</span></div>
            <div className="st-rank-body">
              <div className="st-tempo-mini">
                <div><span className="st-tm-n">{tm.segundos||0}</span><span className="st-tm-lb">SEGUNDOS</span></div>
                <div><span className="st-tm-n">{tm.minutos||0}</span><span className="st-tm-lb">MINUTOS</span></div>
                <div><span className="st-tm-n">{tm.horas||0}</span><span className="st-tm-lb">HORAS</span></div>
              </div>
              <div className="st-tempo-ds2">DATASET: {tm.dataset||0} PAGAMENTOS</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* GRÁFICOS — Receita + Donut                                 */}
      {/* ============================================================ */}
      <section className="st-sec">
        <h2 className="st-sec-t">GRÁFICOS</h2>
        <div className="g2">
          <div className="st-chart"><div className="st-chart-hd"><TrendingUp size={18} color="#c333ff"/><span>Receita no Período</span></div>
            <div className="st-chart-bd">{loading?<div className="st-chart-sk">{[60,80,45,70,55,90,65].map((h,i)=><div key={i} className="sk-bar" style={{height:`${h}%`}}/>)}</div>:(
              <ResponsiveContainer width="100%" height={280}><AreaChart data={data?.chart_receita||[]}><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c333ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#c333ff" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false}/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}} tickFormatter={v=>`R$${v}`}/><Tooltip content={<MoneyTip/>}/><Area type="monotone" dataKey="value" stroke="#c333ff" strokeWidth={2.5} fill="url(#sg)"/></AreaChart></ResponsiveContainer>
            )}</div>
          </div>
          <div className="st-chart"><div className="st-chart-hd"><PieChart size={18} color="#c333ff"/><span>Conversão</span></div>
            <div className="st-chart-bd" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>{loading?<div className="sk-donut"/>:(
              <ResponsiveContainer width="100%" height={280}><RechartsPie><Pie data={[{name:'Convertidas',value:data?.donut_conversao?.convertidas||0},{name:'Pendentes',value:data?.donut_conversao?.pendentes||0},{name:'Perdidas',value:data?.donut_conversao?.perdidas||0}]} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">{COLORS.map((c,i)=><Cell key={i} fill={c}/>)}</Pie><Legend verticalAlign="bottom" iconType="circle" iconSize={10} formatter={v=><span style={{color:'#ccc',fontSize:'0.85rem'}}>{v}</span>}/><Tooltip contentStyle={{background:'#1a1a2e',border:'1px solid #333',borderRadius:8,color:'#fff'}} itemStyle={{color:'#fff'}}/></RechartsPie></ResponsiveContainer>
            )}</div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* DIÁRIO DE MUDANÇAS                                         */}
      {/* ============================================================ */}
      <section className="st-sec">
        <h2 className="st-sec-t">DIÁRIO DE MUDANÇAS</h2>
        <div className="st-diary">
          <div className="st-diary-hd"><FileText size={20} color="#06b6d4"/> <span>Diário de Mudanças</span><span className="st-tag" style={{color:'#06b6d4'}}>ANOTE ALTERAÇÕES E CORRELACIONE COM RESULTADOS</span></div>
          {!showDiaryForm ? (
            <button className="st-diary-add" onClick={()=>setShowDiaryForm(true)}><Plus size={16}/> Adicionar nota</button>
          ) : (
            <div className="st-diary-form">
              <div className="st-diary-row"><input type="date" className="st-diary-inp" value={diaryDate} onChange={e=>setDiaryDate(e.target.value)}/>
                <select className="st-diary-sel" value={diaryCategory} onChange={e=>setDiaryCategory(e.target.value)}><option value="geral">Geral</option><option value="upsell">Upsell</option><option value="downsell">Downsell</option><option value="fluxo">Fluxo</option><option value="preco">Preço</option><option value="remarketing">Remarketing</option><option value="plano">Plano</option></select>
              </div>
              <textarea className="st-diary-ta" value={diaryContent} onChange={e=>setDiaryContent(e.target.value)} placeholder="Ex: Mudei o upsell de R$19,90 para R$14,90..." rows={3}/>
              <div className="st-diary-acts"><button className="st-diary-canc" onClick={()=>{setShowDiaryForm(false);setDiaryContent('');}}>Cancelar</button><button className="st-diary-save" onClick={saveDiary} disabled={diarySaving}>{diarySaving?'Salvando...':'Salvar'}</button></div>
            </div>
          )}
          <div className="st-diary-list">
            {diaryNotes.length===0?(<div className="st-diary-empty"><FileText size={40} color="#333"/><p>Nenhuma nota ainda</p><small>Adicione anotações para acompanhar mudanças!</small></div>
            ):(diaryNotes.slice(0,20).map(n=>(
              <div key={n.id} className="st-diary-item"><div className="st-diary-il"><span className="st-diary-dt">{n.date}</span><span className="st-diary-cat" style={{color:catColors[n.category]||'#888'}}>{n.category}</span></div><div className="st-diary-ct">{n.content}</div><button className="st-diary-del" onClick={()=>deleteDiary(n.id)}><Trash2 size={14}/></button></div>
            )))}
          </div>
        </div>
      </section>
    </div>
  );
}