import React, { useState, useEffect } from 'react';
import { auditService } from '../services/api';
import './AuditLogs.css';

export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    resource_type: '',
    success: '',
    start_date: '',
    end_date: '',
    page: 1,
    per_page: 50
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 50,
    total_pages: 0
  });

  // Busca logs quando filtros mudarem
  useEffect(() => {
    loadLogs();
  }, [filters.page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const filtersToSend = {};
      
      if (filters.action) filtersToSend.action = filters.action;
      if (filters.resource_type) filtersToSend.resource_type = filters.resource_type;
      if (filters.success !== '') filtersToSend.success = filters.success === 'true';
      if (filters.start_date) filtersToSend.start_date = new Date(filters.start_date).toISOString();
      if (filters.end_date) filtersToSend.end_date = new Date(filters.end_date).toISOString();
      
      filtersToSend.page = filters.page;
      filtersToSend.per_page = filters.per_page;

      const response = await auditService.getLogs(filtersToSend);
      setLogs(response.data || []);
      setPagination({
        total: response.total || 0,
        page: response.page || 1,
        per_page: response.per_page || 50,
        total_pages: response.total_pages || 0
      });
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleApplyFilters = () => {
    loadLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      action: '',
      resource_type: '',
      success: '',
      start_date: '',
      end_date: '',
      page: 1,
      per_page: 50
    });
    setTimeout(() => loadLogs(), 100);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionBadge = (action) => {
    const badges = {
      // Autenticação
      'login_success': { color: '#10b981', icon: '✅', label: 'Login' },
      'login_failed': { color: '#ef4444', icon: '❌', label: 'Login Falhou' },
      'user_registered': { color: '#3b82f6', icon: '👤', label: 'Registro' },
      'impersonate_user': { color: '#8b5cf6', icon: '🕵️', label: 'Impersonação' },
      
      // Bots
      'bot_created': { color: '#8b5cf6', icon: '🤖', label: 'Bot Criado' },
      'bot_updated': { color: '#f59e0b', icon: '✏️', label: 'Bot Editado' },
      'bot_deleted': { color: '#ef4444', icon: '🗑️', label: 'Bot Deletado' },
      'bot_deleted_force': { color: '#dc2626', icon: '💀', label: 'Bot Forçado' },
      'bot_token_change_failed': { color: '#ef4444', icon: '⚠️', label: 'Erro Token' },
      
      // Vendas & Planos
      'sale_approved': { color: '#10b981', icon: '💰', label: 'Venda Aprovada' },
      'plan_created': { color: '#06b6d4', icon: '📦', label: 'Plano Criado' },
      'plan_deleted': { color: '#f97316', icon: '📦', label: 'Plano Deletado' },
      
      // Remarketing
      'remarketing_campaign_created': { color: '#ec4899', icon: '📣', label: 'Campanha Criada' },
      
      // Admin
      'user_promoted_superadmin': { color: '#eab308', icon: '👑', label: 'Promovido' },
      'user_demoted_superadmin': { color: '#ef4444', icon: '👑', label: 'Rebaixado' },
      'user_activated': { color: '#10b981', icon: '✅', label: 'User Ativado' },
      'user_deactivated': { color: '#ef4444', icon: '🚫', label: 'User Bloqueado' },
      'user_deleted': { color: '#dc2626', icon: '🗑️', label: 'User Deletado' },
      
      // Padrão
      'default': { color: '#6b7280', icon: '📋', label: action }
    };

    const badge = badges[action] || badges['default'];
    
    return (
      <span className="audit-badge" style={{ backgroundColor: badge.color }}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  const getResourceBadge = (type) => {
    const colors = {
      'auth': '#3b82f6',
      'bot': '#8b5cf6',
      'plano': '#10b981',
      'remarketing': '#f59e0b',
      'payment': '#06b6d4'
    };

    return (
      <span className="resource-badge" style={{ backgroundColor: colors[type] || '#6b7280' }}>
        {type}
      </span>
    );
  };

  return (
    <div className="audit-logs-container">
      <div className="audit-header">
        <h1>📋 Logs de Auditoria</h1>
        <p className="audit-subtitle">Histórico completo de ações no sistema</p>
      </div>

      {/* Filtros */}
      <div className="audit-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Ação</label>
            <select name="action" value={filters.action} onChange={handleFilterChange}>
              <option value="">Todas as ações</option>
              <option value="login_success">Login bem-sucedido</option>
              <option value="login_failed">Login falhou</option>
              <option value="user_registered">Registro de usuário</option>
              <option value="bot_created">Bot criado</option>
              <option value="bot_updated">Bot atualizado</option>
              <option value="bot_deleted">Bot deletado</option>
              <option value="bot_deleted_force">Bot deletado (forçado)</option>
              <option value="sale_approved">Venda aprovada</option>
              <option value="plan_created">Plano criado</option>
              <option value="plan_deleted">Plano deletado</option>
              <option value="remarketing_campaign_created">Campanha remarketing</option>
              <option value="impersonate_user">Impersonação</option>
              <option value="user_promoted_superadmin">Promovido a admin</option>
              <option value="user_deactivated">Usuário bloqueado</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Tipo de Recurso</label>
            <select name="resource_type" value={filters.resource_type} onChange={handleFilterChange}>
              <option value="">Todos os tipos</option>
              <option value="auth">Autenticação</option>
              <option value="bot">Bot</option>
              <option value="plano">Plano</option>
              <option value="remarketing">Remarketing</option>
              <option value="payment">Pagamento</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select name="success" value={filters.success} onChange={handleFilterChange}>
              <option value="">Todos</option>
              <option value="true">Sucesso</option>
              <option value="false">Falha</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Data Inicial</label>
            <input 
              type="date" 
              name="start_date" 
              value={filters.start_date} 
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Data Final</label>
            <input 
              type="date" 
              name="end_date" 
              value={filters.end_date} 
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn-apply" onClick={handleApplyFilters}>
            🔍 Aplicar Filtros
          </button>
          <button className="btn-clear" onClick={handleClearFilters}>
            🔄 Limpar
          </button>
        </div>
      </div>

      {/* Tabela de Logs */}
      {loading ? (
        <div className="audit-loading">
          <div className="spinner"></div>
          <p>Carregando logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="audit-empty">
          <p>📭 Nenhum log encontrado com os filtros aplicados.</p>
        </div>
      ) : (
        <>
          <div className="audit-stats">
            <span>Total de logs: <strong>{pagination.total}</strong></span>
            <span>Página {pagination.page} de {pagination.total_pages}</span>
          </div>

          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>Recurso</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className={log.success ? '' : 'log-failed'}>
                    <td className="log-date">{formatDate(log.created_at)}</td>
                    <td className="log-user">
                      <strong>{log.username}</strong>
                      <span className="user-id">ID: {log.user_id}</span>
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>{getResourceBadge(log.resource_type)}</td>
                    <td className="log-description">
                      {log.description}
                      {log.error_message && (
                        <div className="error-msg">⚠️ {log.error_message}</div>
                      )}
                    </td>
                    <td className="log-status">
                      {log.success ? (
                        <span className="status-success">✅ Sucesso</span>
                      ) : (
                        <span className="status-failed">❌ Falha</span>
                      )}
                    </td>
                    <td className="log-ip">{log.ip_address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {pagination.total_pages > 1 && (
            <div className="audit-pagination">
              <button 
                className="btn-page"
                disabled={pagination.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                ← Anterior
              </button>
              
              <span className="page-info">
                Página {pagination.page} de {pagination.total_pages}
              </span>
              
              <button 
                className="btn-page"
                disabled={pagination.page === pagination.total_pages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}