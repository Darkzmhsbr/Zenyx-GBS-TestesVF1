import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  RefreshCw, 
  Activity,
  UserPlus,
  Percent,
  CreditCard,
  Calendar as CalendarIcon, 
  ChevronDown,
  LayoutGrid,
  Bot,
  X,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ptBR from 'date-fns/locale/pt-BR';

import { dashboardService } from '../services/api';
import { useBot } from '../context/BotContext';
import { Button } from '../components/Button';
import './Dashboard.css';

registerLocale('pt-BR', ptBR);

export function Dashboard() {
  const navigate = useNavigate();
  const { selectedBot } = useBot();
  const { onboarding } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar banner de conclusão
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  // Estado de visão - CORRIGIDO: começa com bot individual
  const [isGlobalView, setIsGlobalView] = useState(false);

  // Estado de data - mantém últimos 30 dias
  const [dateRange, setDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 30)),
    new Date()
  ]);
  const [startDate, endDate] = dateRange;

  // Estado das métricas - CORRIGIDO: snake_case (backend)
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    active_users: 0,
    sales_today: 0,
    leads_mes: 0,
    leads_hoje: 0,
    ticket_medio: 0,
    total_transacoes: 0,
    reembolsos: 0,
    taxa_conversao: 0,
    chart_data: []
  });

  // Verificar banner de boas-vindas
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('zenyx_welcome_shown');
    if (onboarding?.completed && !hasSeenWelcome) {
      setShowWelcomeBanner(true);
      localStorage.setItem('zenyx_welcome_shown', 'true');
    }
  }, [onboarding]);

  // Carregar métricas - CORRIGIDO: usa getStats do backend
  useEffect(() => {
    carregarDados();
  }, [selectedBot, endDate, isGlobalView]);

  const carregarDados = async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      
      const botId = isGlobalView ? null : (selectedBot ? selectedBot.id : null);
      
      // CORRIGIDO: usa getStats (método real do backend)
      const data = await dashboardService.getStats(botId, startDate, endDate);
      
      // Garantir que chart_data existe
      if (!data.chart_data) data.chart_data = [];
      
      setMetrics(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    carregarDados();
  };

  const dismissWelcomeBanner = () => {
    setShowWelcomeBanner(false);
  };

  const toggleViewMode = () => {
    setIsGlobalView(!isGlobalView);
  };

  // CORRIGIDO: formatação de moeda com divisão por 100 (centavos)
  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format((value || 0) / 100);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  // Tooltip customizado para o gráfico
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label}</p>
          <p className="chart-tooltip-value">
            R$ {(payload[0].value || 0).toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      {/* Banner de Boas-Vindas */}
      {showWelcomeBanner && (
        <div className="welcome-banner">
          <div className="welcome-banner-content">
            <button 
              className="welcome-banner-close"
              onClick={dismissWelcomeBanner}
              aria-label="Fechar banner"
            >
              <X size={20} />
            </button>

            <div className="welcome-banner-header">
              <div className="welcome-banner-icon">
                <CheckCircle size={32} />
              </div>
              
              <div className="welcome-banner-text">
                <h2>🎉 Parabéns! Seu bot está pronto para vender!</h2>
                <p>Você completou com sucesso todas as etapas de configuração. Agora você tem acesso completo a todas as funcionalidades da plataforma!</p>
              </div>
            </div>
            
            <div className="welcome-banner-status">
              <div className="status-item">
                <div className="status-icon completed">
                  <CheckCircle size={16} />
                </div>
                <div className="status-text">
                  <span className="status-title">Bot Criado</span>
                  <span className="status-subtitle">Conectado e ativo</span>
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-icon completed">
                  <CheckCircle size={16} />
                </div>
                <div className="status-text">
                  <span className="status-title">Configurado</span>
                  <span className="status-subtitle">Todos os dados salvos</span>
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-icon completed">
                  <CheckCircle size={16} />
                </div>
                <div className="status-text">
                  <span className="status-title">Planos Criados</span>
                  <span className="status-subtitle">Pronto para vendas</span>
                </div>
              </div>
              
              <div className="status-item">
                <div className="status-icon completed">
                  <CheckCircle size={16} />
                </div>
                <div className="status-text">
                  <span className="status-title">Fluxo Configurado</span>
                  <span className="status-subtitle">Mensagens prontas</span>
                </div>
              </div>
            </div>

            <div className="welcome-banner-tip">
              💡 <strong>Dica:</strong> Explore o menu lateral para acessar recursos avançados como Remarketing, Funil de Vendas e Integrações!
            </div>
          </div>
        </div>
      )}

      {/* CABEÇALHO DA PÁGINA */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-title-group">
            <h1 className="dashboard-title">
              {isGlobalView ? (
                <>
                  Resumo analítico de <span className="highlight-text">todos os bots</span>
                </>
              ) : (
                <>
                  Resumo analítico de bot selecionado: <span className="highlight-text">{selectedBot ? selectedBot.nome : "Selecione um Bot"}</span>
                </>
              )}
            </h1>
            <p className="dashboard-subtitle">Gerencie, acompanhe e tome decisões com mais clareza.</p>
          </div>
        </div>
        
        <div className="dashboard-header-actions">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh} 
            title="Atualizar Dados"
            disabled={loading}
            className="refresh-btn"
          >
            <RefreshCw size={20} className={loading ? "spin" : ""} />
          </Button>

          <Button 
            onClick={toggleViewMode}
            className="view-toggle-btn"
          >
            {isGlobalView ? (
              <>
                <Bot size={18} />
                <span>Ver bot selecionado</span>
              </>
            ) : (
              <>
                <LayoutGrid size={18} />
                <span>Ver todos os bots</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Top Cards - Métricas Principais */}
      <section className="top-cards-section">
        <div className="top-cards-grid">
          <div className="metric-card metric-card-primary">
            <div className="metric-card-header">
              <span className="metric-label">Leads no período</span>
              <div className="metric-icon-wrapper">
                <UserPlus size={20} />
              </div>
            </div>
            <div className="metric-value-large">
              {loading ? <span className="skeleton-value" /> : formatNumber(metrics.leads_mes)}
            </div>
            <div className="metric-trend positive">
              <TrendingUp size={14} />
              <span>vs. período anterior</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card-header">
              <span className="metric-label">Leads hoje</span>
              <div className="metric-icon-wrapper accent">
                <Users size={20} />
              </div>
            </div>
            <div className="metric-value-large">
              {loading ? <span className="skeleton-value" /> : formatNumber(metrics.leads_hoje)}
            </div>
            <div className="metric-footer">
              <span className="metric-footer-text">Últimas 24 horas</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card-header">
              <span className="metric-label">Assinantes ativos</span>
              <div className="metric-icon-wrapper success">
                <Activity size={20} />
              </div>
            </div>
            <div className="metric-value-large">
              {loading ? <span className="skeleton-value" /> : formatNumber(metrics.active_users)}
            </div>
            <div className="metric-footer">
              <span className="metric-footer-text">Planos ativos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid - Gráfico e KPIs */}
      <section className="main-analytics-section">
        <div className="main-analytics-grid">
          {/* Coluna do Gráfico */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-header-left">
                <div className="chart-icon-wrapper">
                  <TrendingUp size={24} />
                </div>
                <div className="chart-header-info">
                  <span className="chart-label">Faturamento (Período)</span>
                  <span className="chart-value">
                    {loading ? <span className="skeleton-value-sm" /> : formatMoney(metrics.total_revenue)}
                  </span>
                </div>
              </div>
              <div className="chart-header-right">
                <div className="date-picker-wrapper">
                  <CalendarIcon size={16} className="date-picker-icon" />
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => setDateRange(update)}
                    locale="pt-BR"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Selecionar período"
                    className="date-picker-input"
                    popperPlacement="bottom-end"
                  />
                  <ChevronDown size={16} className="date-picker-chevron" />
                </div>
              </div>
            </div>
            
            <div className="chart-container">
              {loading ? (
                <div className="chart-skeleton">
                  <div className="chart-skeleton-bar" style={{ height: '60%' }} />
                  <div className="chart-skeleton-bar" style={{ height: '80%' }} />
                  <div className="chart-skeleton-bar" style={{ height: '45%' }} />
                  <div className="chart-skeleton-bar" style={{ height: '70%' }} />
                  <div className="chart-skeleton-bar" style={{ height: '55%' }} />
                  <div className="chart-skeleton-bar" style={{ height: '90%' }} />
                  <div className="chart-skeleton-bar" style={{ height: '65%' }} />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={metrics.chart_data}
                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="var(--chart-grid)" 
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      tickFormatter={(value) => `R$${value}`}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--chart-primary)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      activeDot={{ r: 6, fill: 'var(--chart-primary)', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Coluna de KPIs */}
          <div className="kpi-column">
            <div className="kpi-card">
              <div className="kpi-icon-wrapper">
                <DollarSign size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Ticket médio</span>
                <span className="kpi-value">
                  {loading ? <span className="skeleton-value-sm" /> : formatMoney(metrics.ticket_medio)}
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrapper accent">
                <ShoppingBag size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Vendas hoje</span>
                <span className="kpi-value">
                  {loading ? <span className="skeleton-value-sm" /> : formatMoney(metrics.sales_today)}
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrapper info">
                <CreditCard size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Transações</span>
                <span className="kpi-value">
                  {loading ? <span className="skeleton-value-sm" /> : formatNumber(metrics.total_transacoes)}
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrapper warning">
                <RefreshCw size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Reembolsos</span>
                <span className="kpi-value text-danger">
                  {loading ? <span className="skeleton-value-sm" /> : formatMoney(metrics.reembolsos)}
                </span>
              </div>
            </div>

            <div className="kpi-card kpi-card-highlight">
              <div className="kpi-icon-wrapper success">
                <Percent size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">Taxa de conversão</span>
                <span className="kpi-value highlight-conversion">
                  {loading ? <span className="skeleton-value-sm" /> : `${(metrics.taxa_conversao || 0).toFixed(1)}%`}
                </span>
              </div>
              <div className="kpi-badge">
                <ArrowUpRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}