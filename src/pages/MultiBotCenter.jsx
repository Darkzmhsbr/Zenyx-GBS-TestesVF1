import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { 
  TrendingUp, Users, DollarSign, Activity, 
  Bot, Zap, Shield, CheckCircle, XCircle, ArrowRight
} from 'lucide-react';
import './MultiBotCenter.css';

export function MultiBotCenter() {
  const [loading, setLoading] = useState(true);
  const [botsData, setBotsData] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalLeads: 0,
    totalActive: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getMultiBotStats();
      
      if (res && res.data) {
        setBotsData(res.data);
        
        // Calcula os totais globais
        const totals = res.data.reduce((acc, bot) => ({
          totalRevenue: acc.totalRevenue + (bot.revenue || 0),
          totalSales: acc.totalSales + (bot.vendas || 0),
          totalLeads: acc.totalLeads + (bot.leads || 0),
          totalActive: acc.totalActive + (bot.ativos || 0)
        }), { totalRevenue: 0, totalSales: 0, totalLeads: 0, totalActive: 0 });
        
        setGlobalStats(totals);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do Multi-Bot Center:", error);
    } finally {
      setLoading(false);
    }
  };

  // Backend envia receita em centavos, então dividimos por 100
  const formatMoney = (cents) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="mbc-container">
        <div className="mbc-loading">
          <div className="mbc-spinner" />
          <p>Carregando Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mbc-container">
      {/* HEADER */}
      <div className="mbc-header">
        <div className="mbc-header-title">
          <div className="mbc-icon-wrapper">
            <Shield size={28} />
          </div>
          <div>
            <h1>Command Center</h1>
            <p>Visão executiva de todos os seus robôs em tempo real</p>
          </div>
        </div>
      </div>

      {/* OVERVIEW CARDS (TOTAIS) */}
      <div className="mbc-overview-grid">
        <div className="mbc-stat-card highlight">
          <div className="mbc-stat-icon"><DollarSign size={20} /></div>
          <div className="mbc-stat-info">
            <span>Faturamento Global</span>
            <h3>{formatMoney(globalStats.totalRevenue)}</h3>
          </div>
        </div>
        
        <div className="mbc-stat-card">
          <div className="mbc-stat-icon blue"><Zap size={20} /></div>
          <div className="mbc-stat-info">
            <span>Total de Vendas</span>
            <h3>{globalStats.totalSales}</h3>
          </div>
        </div>
        
        <div className="mbc-stat-card">
          <div className="mbc-stat-icon purple"><Users size={20} /></div>
          <div className="mbc-stat-info">
            <span>Total de Leads</span>
            <h3>{globalStats.totalLeads}</h3>
          </div>
        </div>
        
        <div className="mbc-stat-card">
          <div className="mbc-stat-icon green"><Activity size={20} /></div>
          <div className="mbc-stat-info">
            <span>VIPs Ativos Totais</span>
            <h3>{globalStats.totalActive}</h3>
          </div>
        </div>
      </div>

      {/* TABELA DE COMPARAÇÃO */}
      <div className="mbc-table-container">
        <div className="mbc-table-header">
          <h2>🏆 Ranking de Performance por Bot</h2>
        </div>
        
        {botsData.length === 0 ? (
          <div className="mbc-empty-state">
            <Bot size={40} />
            <p>Nenhum bot encontrado ou sem dados para exibir.</p>
          </div>
        ) : (
          <div className="mbc-table-wrapper">
            <table className="mbc-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Robô (Bot)</th>
                  <th>Status</th>
                  <th>Leads</th>
                  <th>Vendas</th>
                  <th>Conversão</th>
                  <th>VIPs Ativos</th>
                  <th className="align-right">Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {botsData.map((bot, index) => (
                  <tr key={bot.bot_id} className={index === 0 ? 'top-bot' : ''}>
                    <td className="rank-cell">
                      {index === 0 ? <span className="rank-badge gold">1º</span> : 
                       index === 1 ? <span className="rank-badge silver">2º</span> : 
                       index === 2 ? <span className="rank-badge bronze">3º</span> : 
                       <span className="rank-number">{index + 1}º</span>}
                    </td>
                    <td>
                      <div className="bot-name-cell">
                        <span className="b-name">{bot.nome}</span>
                        <span className="b-user">@{bot.username}</span>
                      </div>
                    </td>
                    <td>
                      {bot.status === 'ativo' ? (
                        <span className="status-badge active"><CheckCircle size={12} /> Ativo</span>
                      ) : (
                        <span className="status-badge inactive"><XCircle size={12} /> {bot.status}</span>
                      )}
                    </td>
                    <td className="metric-cell">{bot.leads}</td>
                    <td className="metric-cell">{bot.vendas}</td>
                    <td>
                      <div className="conversion-bar-container">
                        <span className="conv-value">{bot.conversao}%</span>
                        <div className="conv-track">
                          <div 
                            className="conv-fill" 
                            style={{ 
                              width: `${Math.min(bot.conversao, 100)}%`,
                              background: bot.conversao >= 10 ? '#22c55e' : bot.conversao >= 3 ? '#eab308' : '#ef4444'
                            }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="metric-cell highlight-cell">{bot.ativos}</td>
                    <td className="align-right revenue-cell">
                      {formatMoney(bot.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}