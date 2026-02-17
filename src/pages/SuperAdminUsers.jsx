import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../services/api';
import './SuperAdmin.css';
import Swal from 'sweetalert2';

export function SuperAdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    per_page: 50
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 50,
    total_pages: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'details', 'delete', 'status', 'promote'
  const [actionLoading, setActionLoading] = useState(false);

  // Estado para edição de dados extras
  const [editData, setEditData] = useState({ taxa_venda: 60, pushin_pay_id: '', wiinpay_user_id: '' });

  useEffect(() => {
    loadUsers();
  }, [filters.page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await superAdminService.listUsers(filters);
      setUsers(response.data || []);
      setPagination({
        total: response.total || 0,
        page: response.page || 1,
        per_page: response.per_page || 50,
        total_pages: response.total_pages || 0
      });
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      
      if (error.response?.status === 403) {
        alert("Acesso negado: você não tem privilégios de super-administrador");
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    loadUsers();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      page: 1,
      per_page: 50
    });
    setTimeout(() => loadUsers(), 100);
  };

  // Abre modal para ações simples (status, delete, promote)
  const openModal = (type, user) => {
    setSelectedUser(user);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalType(null);
  };

  // 🔥 CORREÇÃO AQUI: Busca detalhes E preenche os inputs
  const handleViewDetails = async (user) => {
    setActionLoading(true);
    try {
      const details = await superAdminService.getUserDetails(user.id);
      setSelectedUser(details);
      
      // 👇 AQUI ESTÁ O PULO DO GATO:
      // Pegamos o que veio do banco e jogamos no editData para aparecer na caixa
      setEditData({
        taxa_venda: details.user.taxa_venda || 60,
        pushin_pay_id: details.user.pushin_pay_id || '',
        wiinpay_user_id: details.user.wiinpay_user_id || ''
      });

      setModalType('details');
      setShowModal(true);
    } catch (error) {
      alert("Erro ao carregar detalhes do usuário");
    } finally {
      setActionLoading(false);
    }
  };

  // Salvar Taxa e Dados Financeiros
  const handleSaveFinancials = async () => {
    // Verifica se temos o usuário carregado
    if (!selectedUser || !selectedUser.user) return;
    
    setActionLoading(true);
    try {
        await superAdminService.updateUser(selectedUser.user.id, {
            taxa_venda: parseInt(editData.taxa_venda),
            pushin_pay_id: editData.pushin_pay_id,
            wiinpay_user_id: editData.wiinpay_user_id
        });
        
        // Atualiza visualmente o objeto selecionado na tela para não precisar recarregar
        setSelectedUser(prev => ({
            ...prev,
            user: {
                ...prev.user,
                taxa_venda: editData.taxa_venda,
                pushin_pay_id: editData.pushin_pay_id,
                wiinpay_user_id: editData.wiinpay_user_id
            }
        }));
        
        Swal.fire('Salvo', 'Dados financeiros atualizados com sucesso!', 'success');
    } catch (error) {
        Swal.fire('Erro', 'Falha ao salvar dados financeiros.', 'error');
    } finally {
        setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const newStatus = !selectedUser.is_active;
      await superAdminService.updateUserStatus(selectedUser.id, newStatus);
      
      alert(`Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso!`);
      closeModal();
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.detail || "Erro ao atualizar status do usuário");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      await superAdminService.deleteUser(selectedUser.id);
      
      alert(`Usuário '${selectedUser.username}' deletado com sucesso!`);
      closeModal();
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.detail || "Erro ao deletar usuário");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromoteUser = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const newStatus = !selectedUser.is_superuser;
      await superAdminService.promoteUser(selectedUser.id, newStatus);
      
      alert(`Usuário ${newStatus ? 'promovido a' : 'rebaixado de'} super-admin!`);
      closeModal();
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.detail || "Erro ao alterar privilégios");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="superadmin-container">
      <div className="superadmin-header">
        <div className="header-left">
          <button onClick={() => navigate('/superadmin')} className="btn-back">
            ← Voltar
          </button>
          <div>
            <h1>👥 Gerenciar Usuários</h1>
            <p className="superadmin-subtitle">Visualizar e gerenciar todos os usuários do sistema</p>
          </div>
        </div>
        <div className="header-right">
          <button onClick={loadUsers} className="btn-refresh">
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="users-filters">
        <div className="filter-row">
          <div className="filter-group search-group">
            <label>🔍 Buscar</label>
            <input
              type="text"
              placeholder="Username, email ou nome..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn-apply" onClick={handleSearch}>
              Aplicar
            </button>
            <button className="btn-clear" onClick={handleClearFilters}>
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="users-stats">
        <span>Total de usuários: <strong>{pagination.total}</strong></span>
        <span>Página {pagination.page} de {pagination.total_pages}</span>
      </div>

      {/* Tabela de Usuários */}
      {loading ? (
        <div className="users-loading">
          <div className="spinner"></div>
          <p>Carregando usuários...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="users-empty">
          <p>📭 Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Nome Completo</th>
                  <th>Bots</th>
                  <th>Receita</th>
                  <th>Vendas</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={!user.is_active ? 'user-inactive' : ''}>
                    <td className="user-username">
                      <strong>{user.username}</strong>
                      {user.is_superuser && <span className="badge-superadmin">👑 Admin</span>}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.full_name || '-'}</td>
                    <td className="user-bots">{user.total_bots}</td>
                    <td className="user-revenue">{formatCurrency(user.total_revenue)}</td>
                    <td className="user-sales">{user.total_sales}</td>
                    <td>
                      {user.is_active ? (
                        <span className="status-badge active">✅ Ativo</span>
                      ) : (
                        <span className="status-badge inactive">❌ Inativo</span>
                      )}
                    </td>
                    <td className="user-date">{formatDate(user.created_at)}</td>
                    <td className="user-actions">
                      <button
                        className="btn-action view"
                        onClick={() => handleViewDetails(user)}
                        title="Ver detalhes"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-action status"
                        onClick={() => openModal('status', user)}
                        title={user.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {user.is_active ? '🔒' : '🔓'}
                      </button>
                      <button
                        className="btn-action promote"
                        onClick={() => openModal('promote', user)}
                        title={user.is_superuser ? 'Rebaixar' : 'Promover'}
                      >
                        {user.is_superuser ? '👤' : '👑'}
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => openModal('delete', user)}
                        title="Deletar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {pagination.total_pages > 1 && (
            <div className="users-pagination">
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

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal: Detalhes */}
            {modalType === 'details' && selectedUser.user && (
              <>
                <div className="modal-header">
                  <h2>👤 Detalhes do Usuário</h2>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <div className="modal-body">
                  <div className="user-details">
                    <div className="detail-section">
                      <h3>Informações Básicas</h3>
                      <p><strong>Username:</strong> {selectedUser.user.username}</p>
                      <p><strong>Email:</strong> {selectedUser.user.email}</p>
                      <p><strong>Nome Completo:</strong> {selectedUser.user.full_name || '-'}</p>
                      <p><strong>Status:</strong> {selectedUser.user.is_active ? '✅ Ativo' : '❌ Inativo'}</p>
                      <p><strong>Super Admin:</strong> {selectedUser.user.is_superuser ? '👑 Sim' : '❌ Não'}</p>
                      <p><strong>Cadastro:</strong> {formatDate(selectedUser.user.created_at)}</p>
                    </div>

                    {/* 🆕 ÁREA FINANCEIRA NO MODAL */}
                    <div className="detail-section" style={{ border: '1px solid #c333ff', background: 'rgba(195, 51, 255, 0.03)' }}>
                        <h3 style={{ color: '#c333ff', borderBottomColor: '#c333ff' }}>💰 Financeiro & Split</h3>
                        <div style={{ display: 'grid', gap: '15px', marginTop: '10px' }}>
                            <div>
                                <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', color: '#ccc' }}>
                                    Taxa por Venda (em centavos)
                                </label>
                                <input 
                                    type="number" 
                                    value={editData.taxa_venda}
                                    onChange={(e) => setEditData({...editData, taxa_venda: e.target.value})}
                                    style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        background: '#1a1a1a',
                                        border: '1px solid #444', 
                                        color: '#fff',
                                        borderRadius: '4px' 
                                    }}
                                />
                                <span style={{fontSize: '11px', color: '#888'}}>Ex: 60 = R$ 0,60</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', color: '#ccc' }}>
                                    Pushin Pay ID (Destino do Lucro)
                                </label>
                                <input 
                                    type="text" 
                                    value={editData.pushin_pay_id}
                                    onChange={(e) => setEditData({...editData, pushin_pay_id: e.target.value})}
                                    placeholder="Ex: 9D4FA0F6-..."
                                    style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        background: '#1a1a1a',
                                        border: '1px solid #444', 
                                        color: '#fff',
                                        borderRadius: '4px' 
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', color: '#ccc' }}>
                                    WiinPay User ID (Destino do Lucro)
                                </label>
                                <input 
                                    type="text" 
                                    value={editData.wiinpay_user_id}
                                    onChange={(e) => setEditData({...editData, wiinpay_user_id: e.target.value})}
                                    placeholder="Ex: cmllismb726j1od..."
                                    style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        background: '#1a1a1a',
                                        border: '1px solid #444', 
                                        color: '#fff',
                                        borderRadius: '4px' 
                                    }}
                                />
                            </div>
                            <button 
                                onClick={handleSaveFinancials}
                                disabled={actionLoading}
                                style={{ 
                                    marginTop: '5px', 
                                    padding: '10px', 
                                    background: '#c333ff', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: '0.2s'
                                }}
                            >
                                {actionLoading ? 'Salvando...' : '💾 Salvar Alterações Financeiras'}
                            </button>
                        </div>
                    </div>

                    <div className="detail-section">
                      <h3>Estatísticas</h3>
                      <p><strong>Total de Bots:</strong> {selectedUser.stats.total_bots}</p>
                      <p><strong>Receita Total:</strong> {formatCurrency(selectedUser.stats.total_revenue)}</p>
                      <p><strong>Total de Vendas:</strong> {selectedUser.stats.total_sales}</p>
                      <p><strong>Total de Leads:</strong> {selectedUser.stats.total_leads}</p>
                    </div>

                    {selectedUser.bots && selectedUser.bots.length > 0 && (
                      <div className="detail-section">
                        <h3>Bots ({selectedUser.bots.length})</h3>
                        <div className="bots-list">
                          {selectedUser.bots.map((bot) => (
                            <div key={bot.id} className="bot-item">
                              <p><strong>{bot.nome}</strong> (@{bot.username})</p>
                              <p className="bot-stats">
                                {formatCurrency(bot.revenue)} | {bot.sales} vendas | {bot.status}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedUser.recent_activity && selectedUser.recent_activity.length > 0 && (
                      <div className="detail-section">
                        <h3>Atividade Recente</h3>
                        <div className="activity-list">
                          {selectedUser.recent_activity.map((log) => (
                            <div key={log.id} className="activity-item">
                              <p>
                                {log.success ? '✅' : '❌'} {log.description}
                              </p>
                              <span className="activity-date">
                                {formatDate(log.created_at)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Modal: Alterar Status */}
            {modalType === 'status' && (
              <>
                <div className="modal-header">
                  <h2>🔒 {selectedUser.is_active ? 'Desativar' : 'Ativar'} Usuário</h2>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <div className="modal-body">
                  <p>
                    Tem certeza que deseja <strong>{selectedUser.is_active ? 'DESATIVAR' : 'ATIVAR'}</strong> o usuário:
                  </p>
                  <div className="user-info-box">
                    <p><strong>Username:</strong> {selectedUser.username}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                  </div>
                  {selectedUser.is_active && (
                    <p className="warning-text">
                      ⚠️ O usuário não poderá fazer login enquanto estiver desativado.
                    </p>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button
                    className="btn-confirm"
                    onClick={handleToggleStatus}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processando...' : 'Confirmar'}
                  </button>
                </div>
              </>
            )}

            {/* Modal: Deletar */}
            {modalType === 'delete' && (
              <>
                <div className="modal-header">
                  <h2>🗑️ Deletar Usuário</h2>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <div className="modal-body">
                  <p className="danger-text">
                    ⚠️ <strong>ATENÇÃO: ESTA AÇÃO É IRREVERSÍVEL!</strong>
                  </p>
                  <p>
                    Você está prestes a deletar o usuário:
                  </p>
                  <div className="user-info-box danger">
                    <p><strong>Username:</strong> {selectedUser.username}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Bots:</strong> {selectedUser.total_bots}</p>
                  </div>
                  <p className="danger-text">
                    Todos os bots, planos, pedidos e dados deste usuário serão permanentemente deletados.
                  </p>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button
                    className="btn-danger"
                    onClick={handleDeleteUser}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Deletando...' : 'Deletar Permanentemente'}
                  </button>
                </div>
              </>
            )}

            {/* Modal: Promover/Rebaixar */}
            {modalType === 'promote' && (
              <>
                <div className="modal-header">
                  <h2>👑 {selectedUser.is_superuser ? 'Rebaixar' : 'Promover'} Usuário</h2>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <div className="modal-body">
                  <p>
                    Tem certeza que deseja <strong>{selectedUser.is_superuser ? 'REBAIXAR' : 'PROMOVER'}</strong> o usuário:
                  </p>
                  <div className="user-info-box">
                    <p><strong>Username:</strong> {selectedUser.username}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                  </div>
                  {!selectedUser.is_superuser && (
                    <p className="warning-text">
                      ⚠️ Super-admins têm acesso total ao sistema, incluindo gerenciamento de outros usuários.
                    </p>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button
                    className="btn-confirm"
                    onClick={handlePromoteUser}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processando...' : 'Confirmar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}