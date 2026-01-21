import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../services/api';
import './SuperAdmin.css';

export function SuperAdmin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await superAdminService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
      
      // Se erro 403, não é super-admin
      if (err.response?.status === 403) {
        setError("Acesso negado: você não tem privilégios de super-administrador");
      } else {
        setError("Erro ao carregar estatísticas do sistema");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="superadmin-container">
        <div className="superadmin-loading">
          <div className="spinner"></div>
          <p>Carregando painel super admin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="superadmin-container">
        <div className="superadmin-error">
          <h2>⚠️ {error}</h2>
          <p>Somente super-administradores podem acessar esta área.</p>
          <button onClick={() => navigate('/')} className="btn-back">
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="superadmin-container">
      <div className="superadmin-header">
        <div className="header-left">
          <h1>👑 Painel Super Admin</h1>
          <p className="superadmin-subtitle">Gerenciamento global do sistema</p>
        </div>
        <div className="header-right">
          <button onClick={loadStats} className="btn-refresh">
            🔄 Atualizar
          </button>
          <button onClick={() => navigate('/superadmin/users')} className="btn-primary">
            👥 Gerenciar Usuários
          </button>
        </div>
      </div>

      {/* Estatísticas Globais */}
      <div className="stats-grid">
        {/* Card: Usuários */}
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Usuários</h3>
            <div className="stat-number">{stats?.users?.total || 0}</div>
            <div className="stat-details">
              <span className="stat-detail-item active">
                ✅ {stats?.users?.active || 0} ativos
              </span>
              <span className="stat-detail-item inactive">
                ❌ {stats?.users?.inactive || 0} inativos
              </span>
            </div>
            <div className="stat-growth">
              +{stats?.users?.new_last_30_days || 0} novos (30 dias)
              <span className="growth-badge">
                +{stats?.users?.growth_percentage || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Card: Bots */}
        <div className="stat-card bots">
          <div className="stat-icon">🤖</div>
          <div className="stat-content">
            <h3>Bots</h3>
            <div className="stat-number">{stats?.bots?.total || 0}</div>
            <div className="stat-details">
              <span className="stat-detail-item active">
                ✅ {stats?.bots?.active || 0} ativos
              </span>
              <span className="stat-detail-item inactive">
                ❌ {stats?.bots?.inactive || 0} inativos
              </span>
            </div>
            <div className="stat-info">
              Média: {stats?.users?.total > 0 
                ? (stats.bots.total / stats.users.total).toFixed(1) 
                : 0} bots/usuário
            </div>
          </div>
        </div>

        {/* Card: Receita */}
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Receita Total</h3>
            <div className="stat-number">
              R$ {(stats?.revenue?.total || 0).toLocaleString('pt-BR', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </div>
            <div className="stat-details">
              <span className="stat-detail-item">
                📅 Últimos 30 dias: R$ {(stats?.revenue?.last_30_days || 0).toLocaleString('pt-BR', { 
                  minimumFractionDigits: 2 
                })}
              </span>
            </div>
            <div className="stat-info">
              Média: R$ {(stats?.revenue?.average_per_user || 0).toLocaleString('pt-BR', { 
                minimumFractionDigits: 2 
              })} /usuário
            </div>
          </div>
        </div>

        {/* Card: Vendas */}
        <div className="stat-card sales">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Vendas</h3>
            <div className="stat-number">{stats?.sales?.total || 0}</div>
            <div className="stat-details">
              <span className="stat-detail-item">
                📅 Últimos 30 dias: {stats?.sales?.last_30_days || 0}
              </span>
            </div>
            <div className="stat-info">
              Ticket médio: R$ {stats?.sales?.total > 0 
                ? ((stats.revenue.total / stats.sales.total)).toLocaleString('pt-BR', { 
                    minimumFractionDigits: 2 
                  })
                : '0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="quick-actions">
        <h2>⚡ Ações Rápidas</h2>
        <div className="actions-grid">
          <button 
            className="action-card"
            onClick={() => navigate('/superadmin/users')}
          >
            <div className="action-icon">👥</div>
            <div className="action-content">
              <h3>Gerenciar Usuários</h3>
              <p>Ver, editar e deletar usuários do sistema</p>
            </div>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate('/audit-logs')}
          >
            <div className="action-icon">📋</div>
            <div className="action-content">
              <h3>Logs de Auditoria</h3>
              <p>Ver histórico completo de ações</p>
            </div>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate('/')}
          >
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h3>Dashboard</h3>
              <p>Voltar ao painel principal</p>
            </div>
          </button>

          <button 
            className="action-card"
            onClick={loadStats}
          >
            <div className="action-icon">🔄</div>
            <div className="action-content">
              <h3>Atualizar Dados</h3>
              <p>Recarregar estatísticas do sistema</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}