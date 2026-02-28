import React, { useEffect, useState } from 'react';
import { useBot } from '../context/BotContext';
import { useAuth } from '../context/AuthContext';
import { statisticsService, botService, changelogService } from '../services/api';
import {
  DollarSign, Users, TrendingUp, Star, Clock, Calendar, BarChart3, PieChart,
  ChevronDown, ChevronLeft, ChevronRight, RefreshCw, Award, Zap, ShoppingBag,
  Target, Repeat, UserCheck, Timer, ArrowUpRight, ArrowDownRight, Percent,
  FileText, Plus, Trash2, X
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend, AreaChart, Area
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

  // Diário de Mudanças
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [diaryCategory, setDiaryCategory] = useState('geral');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryNotes, setDiaryNotes] = useState([]);
  const [diarySaving, setDiarySaving] = useState(false);

  useEffect(() => { loadBots(); loadDiary(); }, []);
  useEffect(() => { loadStats(); }, [selectedBot, period, isGlobalView]);

  const loadBots = async () => { try { setUserBots(await botService.listBots() || []); } catch(e) {} };
  const loadStats = async () => {
    try {
      setLoading(true);
      setData(await statisticsService.getStats(isGlobalView ? null : selectedBot?.id, period));
    } catch(e) {} finally { setLoading(false); }
  };
  const loadDiary = async () => { try { setDiaryNotes(await changelogService.list()); } catch(e) {} };

  const saveDiary = async () => {
    if (!diaryContent.trim()) return;
    setDiarySaving(true);
    try {
      await changelogService.create({ date: diaryDate, category: diaryCategory, content: diaryContent });
      setDiaryContent(''); setShowDiaryForm(false);
      loadDiary();
    } catch(e) {} finally { setDiarySaving(false); }
  };

  const deleteDiary = async (id) => {
    try { await changelogService.delete(id); loadDiary(); } catch(e) {}
  };

  const fmt = (c) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((c||0)/100);
  const fmtN = (v) => new Intl.NumberFormat('pt-BR').format(v||0);
  const periodLabels = { '7d': 'Últimos 7 dias', '30d': 'Últimos 30 dias', '90d': 'Últimos 90 dias', 'all': 'Todo o período' };
  const COLORS = ['#c333ff', '#444', '#1a1a2e'];
  const Sk = () => <span className="sk-pulse" />;

  const MoneyTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (<div className="st-tooltip"><p className="st-tip-label">{label}</p><p className="st-tip-value">R$ {(payload[0].value||0).toFixed(2)}</p></div>);
  };
  const CountTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (<div className="st-tooltip"><p className="st-tip-label">{label}</p><p className="st-tip-value">{payload[0].value} vendas</p></div>);
  };

  const m = data?.metricas || {};
  const adv = data?.metricas_avancadas || {};
  const cnt = data?.contadores_usuarios || {};
  const tm = data?.tempo_medio || {};
  const cal = data?.calendario || [];
  const diario = data?.diario || [];

  const diasSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const hoje = new Date();

  // Calendário: calcular offset do primeiro dia
  const firstDayOffset = cal.length > 0 ? cal[0].weekday : 0;
  // Ajustar: Python weekday 0=Mon, JS 0=Sun => offset = (python_weekday + 1) % 7
  const calOffset = cal.length > 0 ? ((cal[0].weekday + 1) % 7) : 0;

  // Taxas com barra de progresso
  const TaxaCard = ({ icon, color, title, value, subtitle, max = 100 }) => (
    <div className="st-taxa-card">
      <div className="st-taxa-header">
        <div className="st-taxa-icon" style={{ background: `${color}22`, color }}>{icon}</div>
        <span className="st-taxa-title">{title}</span>
      </div>
      <div className="st-taxa-value">{loading ? <Sk /> : `${value}%`}</div>
      <div className="st-taxa-sub">{subtitle}</div>
      <div className="st-taxa-bar"><div className="st-taxa-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} /></div>
    </div>
  );

  // Contadores scrollável
  const contadorItems = [
    { icon: '👥', label: 'Total Compradores', value: cnt.total_compradores, color: '#fff' },
    { icon: '🔄', label: 'Recorrentes', value: cnt.recorrentes, color: '#06b6d4' },
    { icon: '⭐', label: 'VIPs Ativos', value: cnt.vips_ativos, color: '#10b981' },
    { icon: '↗️', label: 'Upsellers', value: cnt.upsellers, color: '#ef4444' },
    { icon: '↘️', label: 'Downsellers', value: cnt.downsellers, color: '#f59e0b' },
    { icon: '📣', label: 'Remarketing', value: cnt.remarketing, color: '#8b5cf6' },
  ];

  const categoryColors = { geral: '#06b6d4', upsell: '#ef4444', downsell: '#f59e0b', fluxo: '#10b981', preco: '#c333ff', remarketing: '#8b5cf6', plano: '#ec4899' };

  return (
    <div className="statistics-container">
      {/* HEADER */}
      <div className="st-header">
        <div>
          <h1 className="st-title">Estatísticas</h1>
          <p className="st-sub">Métricas de <strong style={{color:'#c333ff'}}>{isGlobalView ? 'Todos os Bots' : (selectedBot?.nome || 'Selecione um bot')}</strong></p>
        </div>
        <div className="st-header-right">
          <label className="st-toggle"><input type="checkbox" checked={isGlobalView} onChange={e => setIsGlobalView(e.target.checked)} /> Todos os bots</label>
          {!isGlobalView && userBots.length > 0 && (
            <select className="st-select" value={selectedBot?.id || ''} onChange={e => { const b = userBots.find(x => x.id === parseInt(e.target.value)); if (b) window.dispatchEvent(new CustomEvent('select-bot', {detail: b})); }}>
              {userBots.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
            </select>
          )}
          <div className="st-period-wrap">
            <button className="st-period-btn" onClick={() => setShowPeriodMenu(!showPeriodMenu)}><Calendar size={16} /> {periodLabels[period]} <ChevronDown size={14} /></button>
            {showPeriodMenu && (<div className="st-period-menu">{Object.entries(periodLabels).map(([k,v]) => (<button key={k} className={`st-period-opt ${period===k?'active':''}`} onClick={() => {setPeriod(k);setShowPeriodMenu(false);}}>{v}</button>))}</div>)}
          </div>
          <button className="st-refresh" onClick={loadStats}><RefreshCw size={18} className={loading?'spin':''} /></button>
        </div>
      </div>

      {/* MÉTRICAS PRINCIPAIS */}
      <section className="st-section">
        <h2 className="st-section-title">MÉTRICAS PRINCIPAIS</h2>
        <div className="st-grid-4">
          {[
            { icon: <DollarSign size={22}/>, bg:'rgba(16,185,129,0.15)', color:'#10b981', label:'Receita Total', val: fmt(m.receita_total), sub: `${fmtN(m.total_vendas)} vendas` },
            { icon: <BarChart3 size={22}/>, bg:'rgba(59,130,246,0.15)', color:'#3b82f6', label:'Ticket Médio', val: fmt(m.ticket_medio), sub:'Valor médio por venda' },
            { icon: <Users size={22}/>, bg:'rgba(195,51,255,0.15)', color:'#c333ff', label:'VIPs Ativos', val: fmtN(m.total_usuarios), sub: `${fmtN(m.total_leads)} leads` },
            { icon: <Star size={22}/>, bg:'rgba(245,158,11,0.15)', color:'#f59e0b', label:'LTV Médio', val: fmt(m.ltv_medio), sub:'Gasto médio por cliente' },
          ].map((c,i) => (
            <div key={i} className="st-metric-card">
              <div className="st-metric-icon" style={{background:c.bg, color:c.color}}>{c.icon}</div>
              <div className="st-metric-info"><span className="st-metric-label">{c.label}</span><span className="st-metric-value">{loading ? <Sk /> : c.val}</span><span className="st-metric-sub">{c.sub}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* RESUMO VENDAS */}
      <section className="st-section">
        <h2 className="st-section-title">RESUMO DE VENDAS</h2>
        <div className="st-grid-3">
          {[
            { icon: <Clock size={22}/>, bg:'rgba(245,158,11,0.15)', color:'#f59e0b', label:'Pendentes', val: fmtN(m.total_pendentes), sub: fmt(m.receita_pendentes) },
            { icon: <ShoppingBag size={22}/>, bg:'rgba(16,185,129,0.15)', color:'#10b981', label:'Confirmadas', val: fmtN(m.total_vendas), sub: fmt(m.receita_total) },
            { icon: <Target size={22}/>, bg:'rgba(195,51,255,0.15)', color:'#c333ff', label:'Conversão', val: `${(m.taxa_conversao||0).toFixed(1)}%`, sub: `${fmtN(m.total_leads)} leads → ${fmtN(m.total_vendas)} vendas`, valColor:'#c333ff' },
          ].map((c,i) => (
            <div key={i} className="st-sale-card">
              <div className="st-sale-icon" style={{background:c.bg, color:c.color}}>{c.icon}</div>
              <div><span className="st-sale-label">{c.label}</span><span className="st-sale-value" style={c.valColor?{color:c.valColor}:{}}>{loading ? '-' : c.val}</span><span className="st-sale-sub">{loading ? '' : c.sub}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* 8 TAXAS */}
      <section className="st-section">
        <h2 className="st-section-title">TAXAS DETALHADAS</h2>
        <div className="st-grid-4">
          <TaxaCard icon={<ArrowUpRight size={20}/>} color="#ef4444" title="Taxa Upsell" value={adv.taxa_upsell||0} subtitle={`${adv.upsell_vendas||0} de ${m.total_vendas||0} vendas`} />
          <TaxaCard icon={<ArrowDownRight size={20}/>} color="#f59e0b" title="Taxa Downsell" value={adv.taxa_downsell||0} subtitle={`${adv.downsell_vendas||0} de ${m.total_pendentes||0} recusas`} />
          <TaxaCard icon={<Zap size={20}/>} color="#8b5cf6" title="Taxa OrderBump" value={adv.taxa_orderbump||0} subtitle={`${adv.orderbump_vendas||0} de ${m.total_geradas||0} checkouts`} />
          <TaxaCard icon={<Repeat size={20}/>} color="#06b6d4" title="Taxa Recuperação" value={adv.taxa_recuperacao||0} subtitle={`${adv.remarketing_vendas||0} de ${m.total_pendentes||0} pendentes`} />
          <TaxaCard icon={<Repeat size={20}/>} color="#10b981" title="Taxa Recorrência" value={adv.taxa_recorrencia||0} subtitle={`${adv.recorrentes||0} de ${adv.total_compradores||0} compradores`} />
          <TaxaCard icon={<UserCheck size={20}/>} color="#3b82f6" title="Taxa Retenção" value={adv.taxa_retencao||0} subtitle={`${cnt.vips_ativos||0} VIPs de ${adv.total_compradores||0} compradores`} />
          <TaxaCard icon={<TrendingUp size={20}/>} color="#ec4899" title="Taxa Upgrade" value={adv.taxa_upgrade||0} subtitle={`${adv.upsell_vendas||0} upsells de ${adv.total_compradores||0} compradores`} />
          <TaxaCard icon={<X size={20}/>} color="#ef4444" title="Taxa Abandono" value={adv.taxa_abandono||0} subtitle={`${adv.expirados_unicos||0} ex-VIPs de ${adv.total_compradores||0} compradores`} />
        </div>
      </section>

      {/* LTV + VENDAS/USUARIO + TEMPO RETORNO + CONTADORES */}
      <section className="st-section">
        <h2 className="st-section-title">INDICADORES AVANÇADOS</h2>
        <div className="st-grid-4">
          <div className="st-big-card">
            <div className="st-big-header"><DollarSign size={20} color="#10b981" /> <span>LTV Médio</span><span className="st-big-tag" style={{color:'#10b981'}}>LIFETIME VALUE</span></div>
            <div className="st-big-value" style={{color:'#10b981'}}>{loading ? <Sk /> : fmt(m.ltv_medio)}</div>
            <div className="st-big-sub">GASTO MÉDIO POR CLIENTE</div>
          </div>
          <div className="st-big-card">
            <div className="st-big-header"><ShoppingBag size={20} color="#8b5cf6" /> <span>Vendas por Usuário</span><span className="st-big-tag" style={{color:'#8b5cf6'}}>MÉDIA</span></div>
            <div className="st-big-value" style={{color:'#f59e0b'}}>{loading ? <Sk /> : `${adv.vendas_por_usuario||0}x`}</div>
            <div className="st-big-sub">COMPRAS POR CLIENTE</div>
          </div>
          <div className="st-big-card">
            <div className="st-big-header"><Timer size={20} color="#06b6d4" /> <span>Tempo Médio Retorno</span><span className="st-big-tag" style={{color:'#06b6d4'}}>ENTRE COMPRAS</span></div>
            <div className="st-big-value" style={{color:'#c333ff'}}>{loading ? <Sk /> : adv.avg_retorno_dias||0}</div>
            <div className="st-big-sub">DIAS PARA RECOMPRA</div>
          </div>
          {/* CONTADORES SCROLLÁVEL */}
          <div className="st-contadores-card">
            <div className="st-big-header"><UserCheck size={20} color="#06b6d4" /> <span>Contadores de Usuários</span><span className="st-big-tag" style={{color:'#06b6d4'}}>POR TIPO</span></div>
            <div className="st-contadores-scroll">
              {contadorItems.map((item, i) => (
                <div key={i} className="st-contador-row">
                  <span className="st-contador-icon">{item.icon}</span>
                  <span className="st-contador-label">{item.label}</span>
                  <span className="st-contador-value" style={{color: item.color}}>{loading ? '-' : fmtN(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TEMPO MÉDIO /START → PAGAMENTO */}
      <section className="st-section">
        <h2 className="st-section-title">VELOCIDADE DE CONVERSÃO</h2>
        <div className="st-grid-4">
          <div className="st-tempo-card">
            <div className="st-tempo-header"><Clock size={20} color="#06b6d4" /> <span>Tempo Médio</span><span className="st-big-tag" style={{color:'#06b6d4'}}>/START → PAGAMENTO</span></div>
            <div className="st-tempo-values">
              <div className="st-tempo-unit"><span className="st-tempo-num">{tm.horas||0}</span><span className="st-tempo-label">HORAS</span></div>
              <div className="st-tempo-unit"><span className="st-tempo-num">{tm.minutos||0}</span><span className="st-tempo-label">MINUTOS</span></div>
              <div className="st-tempo-unit"><span className="st-tempo-num">{tm.segundos||0}</span><span className="st-tempo-label">SEGUNDOS</span></div>
            </div>
            <div className="st-tempo-dataset">DATASET: {tm.dataset||0} PAGAMENTOS</div>
          </div>
        </div>
      </section>

      {/* GRÁFICOS */}
      <section className="st-section">
        <h2 className="st-section-title">GRÁFICOS</h2>
        <div className="st-grid-chart">
          <div className="st-chart-card"><div className="st-chart-head"><TrendingUp size={18} color="#c333ff" /><span>Receita no Período</span></div>
            <div className="st-chart-body">{loading ? <div className="st-chart-sk">{[60,80,45,70,55,90,65].map((h,i)=><div key={i} className="sk-bar" style={{height:`${h}%`}}/>)}</div> : (
              <ResponsiveContainer width="100%" height={280}><AreaChart data={data?.chart_receita||[]} margin={{top:10,right:10,left:0,bottom:0}}><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c333ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#c333ff" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false}/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}} tickFormatter={v=>`R$${v}`}/><Tooltip content={<MoneyTip/>}/><Area type="monotone" dataKey="value" stroke="#c333ff" strokeWidth={2.5} fill="url(#sg)" activeDot={{r:5,fill:'#c333ff'}}/></AreaChart></ResponsiveContainer>
            )}</div>
          </div>
          <div className="st-chart-card"><div className="st-chart-head"><PieChart size={18} color="#c333ff" /><span>Conversão</span></div>
            <div className="st-chart-body" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>{loading ? <div className="sk-donut"/> : (
              <ResponsiveContainer width="100%" height={280}><RechartsPie><Pie data={[{name:'Convertidas',value:data?.donut_conversao?.convertidas||0},{name:'Pendentes',value:data?.donut_conversao?.pendentes||0},{name:'Perdidas',value:data?.donut_conversao?.perdidas||0}]} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">{COLORS.map((c,i)=><Cell key={i} fill={c}/>)}</Pie><Legend verticalAlign="bottom" iconType="circle" iconSize={10} formatter={v=><span style={{color:'#ccc',fontSize:'0.85rem'}}>{v}</span>}/><Tooltip contentStyle={{background:'#1a1a2e',border:'1px solid #333',borderRadius:8,color:'#fff'}} itemStyle={{color:'#fff'}}/></RechartsPie></ResponsiveContainer>
            )}</div>
          </div>
        </div>
      </section>

      {/* FREQUÊNCIA TEMPORAL */}
      <section className="st-section">
        <h2 className="st-section-title">FREQUÊNCIA TEMPORAL</h2>
        <div className="st-grid-chart">
          <div className="st-chart-card"><div className="st-chart-head"><Clock size={18} color="#06b6d4"/><span>Vendas por Hora</span></div>
            <div className="st-chart-body">{loading ? <div className="st-chart-sk">{Array.from({length:12}).map((_,i)=><div key={i} className="sk-bar" style={{height:`${Math.random()*80+20}%`}}/>)}</div> : (
              <ResponsiveContainer width="100%" height={280}><BarChart data={data?.chart_horas||[]} margin={{top:10,right:10,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false}/><XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:10}} interval={2}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}}/><Tooltip content={<CountTip/>}/><Bar dataKey="count" fill="#06b6d4" radius={[4,4,0,0]} maxBarSize={20}/></BarChart></ResponsiveContainer>
            )}</div>
          </div>
          <div className="st-chart-card"><div className="st-chart-head"><Calendar size={18} color="#f59e0b"/><span>Vendas por Dia da Semana</span></div>
            <div className="st-chart-body">{loading ? <div className="st-chart-sk">{[50,70,60,80,90,40,30].map((h,i)=><div key={i} className="sk-bar" style={{height:`${h}%`}}/>)}</div> : (
              <ResponsiveContainer width="100%" height={280}><BarChart data={data?.chart_semana||[]} margin={{top:10,right:10,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false}/><XAxis dataKey="day_short" axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#666',fontSize:11}}/><Tooltip content={<CountTip/>}/><Bar dataKey="count" fill="#f59e0b" radius={[4,4,0,0]} maxBarSize={40}/></BarChart></ResponsiveContainer>
            )}</div>
          </div>
        </div>
      </section>

      {/* CALENDÁRIO */}
      <section className="st-section">
        <h2 className="st-section-title">CALENDÁRIO</h2>
        <div className="st-calendario-card">
          <div className="st-cal-header"><Calendar size={20} color="#c333ff"/> <span>Calendário</span><span className="st-big-tag" style={{color:'#c333ff'}}>{meses[hoje.getMonth()].toUpperCase()} {hoje.getFullYear()}</span></div>
          <div className="st-cal-hint">Selecione uma data e veja estatísticas por dia</div>
          <div className="st-cal-grid">
            {diasSemana.map(d => <div key={d} className="st-cal-weekday">{d}</div>)}
            {Array.from({length: calOffset}).map((_,i) => <div key={`e${i}`} className="st-cal-empty" />)}
            {cal.map(day => (
              <div key={day.day} className={`st-cal-day ${day.is_today ? 'today' : ''} ${day.vendas > 0 ? 'has-sales' : ''}`} title={day.vendas > 0 ? `${day.vendas} vendas — ${fmt(day.receita)}` : 'Sem vendas'}>
                <span className="st-cal-num">{day.day}</span>
                {day.vendas > 0 && <span className="st-cal-dot">{day.vendas}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP RANKINGS */}
      <section className="st-section">
        <h2 className="st-section-title">PICOS DE DESEMPENHO</h2>
        <div className="st-grid-4">
          {[
            { icon: <Award size={18} color="#c333ff"/>, title: 'Top 5 Planos', tag:'MAIS VENDIDOS', tagColor:'#c333ff', items: data?.top_planos, empty:'Nenhum plano disponível' },
            { icon: <Zap size={18} color="#10b981"/>, title: 'Top 5 Bots', tag:'MAIS VENDIDOS', tagColor:'#10b981', items: data?.top_bots, empty:'Nenhum bot disponível' },
            { icon: <Calendar size={18} color="#f59e0b"/>, title: 'Top 7 Dias', tag:'MAIS VENDIDOS', tagColor:'#f59e0b', items: data?.top_dias, nameKey:'day', empty:'Nenhum dia disponível' },
            { icon: <Clock size={18} color="#06b6d4"/>, title: 'Top Horários', tag:'MAIS VENDIDOS', tagColor:'#06b6d4', items: data?.top_horas, nameKey:'hour', empty:'Nenhum horário disponível' },
          ].map((sec,i) => (
            <div key={i} className="st-peak-card">
              <div className="st-peak-head">{sec.icon}<span>{sec.title}</span><span className="st-big-tag" style={{color:sec.tagColor}}>{sec.tag}</span></div>
              <div className="st-peak-body">
                {loading ? <p className="st-peak-empty">Carregando...</p> : (sec.items||[]).length === 0 ? <p className="st-peak-empty">{sec.empty}</p> : (
                  <div className="st-peak-list">{(sec.items||[]).slice(0,5).map((item,j) => (
                    <div key={j} className="st-peak-item"><span className="st-peak-rank">{j+1}º</span><span className="st-peak-name">{item[sec.nameKey||'name']}</span><span className="st-peak-count">{item.count} vendas</span></div>
                  ))}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DIÁRIO DE MUDANÇAS */}
      <section className="st-section">
        <h2 className="st-section-title">DIÁRIO DE MUDANÇAS</h2>
        <div className="st-diario-card">
          <div className="st-diario-header"><FileText size={20} color="#06b6d4"/> <span>Diário de Mudanças</span><span className="st-big-tag" style={{color:'#06b6d4'}}>ANOTE ALTERAÇÕES E CORRELACIONE COM RESULTADOS</span></div>

          {!showDiaryForm ? (
            <button className="st-diario-add" onClick={() => setShowDiaryForm(true)}><Plus size={16}/> Adicionar nota</button>
          ) : (
            <div className="st-diario-form">
              <div className="st-diario-form-row">
                <input type="date" className="st-diario-input" value={diaryDate} onChange={e => setDiaryDate(e.target.value)} />
                <select className="st-diario-select" value={diaryCategory} onChange={e => setDiaryCategory(e.target.value)}>
                  <option value="geral">Geral</option><option value="upsell">Upsell</option><option value="downsell">Downsell</option>
                  <option value="fluxo">Fluxo</option><option value="preco">Preço</option><option value="remarketing">Remarketing</option><option value="plano">Plano</option>
                </select>
              </div>
              <textarea className="st-diario-textarea" value={diaryContent} onChange={e => setDiaryContent(e.target.value)} placeholder="Ex: Mudei o upsell de R$19,90 para R$14,90..." rows={3} />
              <div className="st-diario-form-actions">
                <button className="st-diario-cancel" onClick={() => { setShowDiaryForm(false); setDiaryContent(''); }}>Cancelar</button>
                <button className="st-diario-save" onClick={saveDiary} disabled={diarySaving}>{diarySaving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </div>
          )}

          <div className="st-diario-list">
            {(diaryNotes.length === 0 && diario.length === 0) ? (
              <div className="st-diario-empty"><FileText size={40} color="#333"/><p>Nenhuma nota ainda</p><small>Adicione anotações para acompanhar mudanças!</small></div>
            ) : (
              [...diaryNotes, ...diario.filter(d => !diaryNotes.find(n => n.id === d.id))].slice(0, 20).map(note => (
                <div key={note.id} className="st-diario-item">
                  <div className="st-diario-item-left">
                    <span className="st-diario-date">{note.date}</span>
                    <span className="st-diario-cat" style={{color: categoryColors[note.category] || '#888'}}>{note.category}</span>
                  </div>
                  <div className="st-diario-item-content">{note.content}</div>
                  <button className="st-diario-del" onClick={() => deleteDiary(note.id)}><Trash2 size={14}/></button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
}