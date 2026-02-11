import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../services/api';
import Swal from 'sweetalert2';
import './SuperAdminBots.css';

export function SuperAdminBots() {
  const navigate = useNavigate();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBots, setTotalBots] = useState(0);

  useEffect(() => {
    fetchBots();
  }, [page]);

  const fetchBots = async (term = searchTerm) => {
    setLoading(true);
    try {
      const data = await superAdminService.getAllBots(page, 50, term);
      setBots(data.bots || []);
      setTotalPages(data.total_pages || 1);
      setTotalBots(data.total || 0);
    } catch (error) {
      console.error("Erro ao buscar bots:", error);
      Swal.fire('Erro', 'Não foi possível carregar a lista de bots.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBots(searchTerm);
  };

  const handleDeleteBot = async (bot) => {
    const result = await Swal.fire({
      title: '🚨 DELETAR BOT FORÇADO?',
      html: `
        Você está prestes a deletar o bot <b>${bot.nome}</b>.<br>
        O dono <b>${bot.owner?.username || 'Sem dono'}</b> perderá acesso imediatamente.<br>
        <br>
        ⚠️ Essa ação apaga Leads, Pedidos e Configurações deste bot.
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, Deletar Bot',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await superAdminService.deleteBotForce(bot.id);
        Swal.fire('Deletado!', 'O bot foi removido do sistema.', 'success');
        fetchBots();
      } catch (error) {
        Swal.fire('Erro', 'Falha ao deletar o bot.', 'error');
      }
    }
  };

  const handleImpersonate = async (bot) => {
    if (!bot.owner?.id) {
      return Swal.fire('Erro', 'Este bot não tem dono associado.', 'warning');
    }

    const result = await Swal.fire({
      title: '🕵️ Entrar na conta?',
      html: `Você irá acessar a conta de <b>${bot.owner.username}</b> como se fosse ele.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, Entrar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const data = await superAdminService.impersonateUser(bot.owner.id);
        // Salvar token do usuário alvo
        localStorage.setItem('zenyx_token', data.access_token);
        localStorage.setItem('zenyx_admin_user', JSON.stringify({
          id: data.user_id,
          username: data.username,
          is_impersonation: true
        }));
        window.location.href = '/dashboard';
      } catch (error) {
        Swal.fire('Erro', 'Falha ao impersonar usuário.', 'error');
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <div className="superadmin-bots-container">
      {/* HEADER */}
      <div className="sabots-header">
        <div className="sabots-header-left">
          <button className="btn-back-sa" onClick={() => navigate('/superadmin')}>
            ← Voltar
          </button>
          <div>
            <h1>🤖 Bots do Sistema</h1>
            <p>Gerencie todos os robôs da plataforma ({totalBots} encontrados)</p>
          </div>
        </div>
        <button className="btn-refresh-sa" onClick={() => fetchBots()}>
          🔄 Atualizar
        </button>
      </div>

      {/* FILTROS */}
      <div className="sabots-filters">
        <form onSubmit={handleSearch} className="sabots-search">
          <input 
            type="text" 
            placeholder="Buscar por nome do bot, dono ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">🔍 Buscar</button>
        </form>
      </div>

      {/* TABELA */}
      <div className="sabots-table-container">
        {loading ? (
          <div className="sabots-loading">
            <div className="spinner"></div>
            <p>Carregando bots do sistema...</p>
          </div>
        ) : bots.length === 0 ? (
          <div className="sabots-empty">
            <p>🤖 Nenhum bot encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <table className="sabots-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Bot</th>
                <th>Dono</th>
                <th>Faturamento</th>
                <th>Vendas</th>
                <th>Leads</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {bots.map((bot) => (
                <tr key={bot.id}>
                  <td className="col-id">#{bot.id}</td>
                  
                  <td className="col-bot">
                    <div className="bot-name">{bot.nome}</div>
                    <div className="bot-username">@{bot.username || 'sem_user'}</div>
                  </td>

                  <td className="col-owner">
                    <div className="owner-name">{bot.owner?.username || 'Sem dono'}</div>
                    <div className="owner-email">{bot.owner?.email || '-'}</div>
                  </td>

                  <td className="col-revenue">
                    <strong>{formatCurrency(bot.stats?.receita)}</strong>
                  </td>

                  <td className="col-sales">
                    {bot.stats?.vendas || 0}
                  </td>

                  <td className="col-leads">
                    {bot.stats?.leads || 0}
                  </td>

                  <td>
                    <span className={`status-badge-sa ${bot.status === 'ativo' ? 'active' : 'inactive'}`}>
                      {bot.status === 'ativo' ? '🟢 Ativo' : '🔴 Parado'}
                    </span>
                  </td>

                  <td className="col-actions">
                    <button 
                      className="btn-action-sa impersonate" 
                      title="Entrar na conta do dono"
                      onClick={() => handleImpersonate(bot)}
                    >
                      🕵️
                    </button>
                    <button 
                      className="btn-action-sa delete" 
                      title="Deletar Bot Forçado"
                      onClick={() => handleDeleteBot(bot)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINAÇÃO */}
      {totalPages > 1 && (
        <div className="sabots-pagination">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            ← Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}