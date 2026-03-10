import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inviteService } from '../services/api';
import './SuperAdmin.css';
import Swal from 'sweetalert2';

export function SuperAdminInvites() {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [stats, setStats] = useState({ total: 0, used: 0, available: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [inviteRequired, setInviteRequired] = useState(true);
  const [togglingReq, setTogglingReq] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadInvites();
    loadRequirementStatus();
  }, [filterStatus]);

  const loadInvites = async () => {
    setLoading(true);
    try {
      const response = await inviteService.list(filterStatus || null);
      setInvites(response.invites || []);
      setStats(response.stats || { total: 0, used: 0, available: 0 });
    } catch (error) {
      console.error("Erro ao carregar convites:", error);
      if (error.response?.status === 403) {
        navigate('/superadmin');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRequirementStatus = async () => {
    try {
      const response = await inviteService.getRequirementStatus();
      setInviteRequired(response.invite_required);
    } catch (error) {
      console.error("Erro ao verificar status de convite:", error);
    }
  };

  const handleGenerate = async () => {
    if (quantidade < 1 || quantidade > 50) {
      return Swal.fire('Atenção', 'Quantidade deve ser entre 1 e 50.', 'warning');
    }

    setGenerating(true);
    try {
      const response = await inviteService.generate(quantidade);
      
      Swal.fire({
        title: '🎟️ Códigos Gerados!',
        html: `
          <div style="text-align: left; max-height: 300px; overflow-y: auto;">
            ${response.codes.map(code => `
              <div style="
                background: rgba(195, 51, 255, 0.1);
                border: 1px solid rgba(195, 51, 255, 0.3);
                border-radius: 8px;
                padding: 10px 14px;
                margin: 6px 0;
                font-family: monospace;
                font-size: 16px;
                letter-spacing: 2px;
                font-weight: bold;
                color: #c333ff;
              ">${code}</div>
            `).join('')}
          </div>
          <p style="margin-top: 12px; font-size: 13px; color: #888;">
            ${response.codes.length} código(s) gerado(s) com sucesso
          </p>
        `,
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff',
        width: 450
      });

      loadInvites();
    } catch (error) {
      Swal.fire('Erro', error.response?.data?.detail || 'Falha ao gerar códigos.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (invite) => {
    const result = await Swal.fire({
      title: 'Deletar Código?',
      text: `Código: ${invite.code}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4444',
      cancelButtonColor: '#444',
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar',
      background: '#1b1730',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await inviteService.delete(invite.id);
        Swal.fire({ title: 'Deletado!', text: 'Código removido.', icon: 'success', background: '#1b1730', color: '#fff', confirmButtonColor: '#c333ff', timer: 1500 });
        loadInvites();
      } catch (error) {
        Swal.fire('Erro', error.response?.data?.detail || 'Falha ao deletar.', 'error');
      }
    }
  };

  const handleToggleRequirement = async () => {
    setTogglingReq(true);
    try {
      const newValue = !inviteRequired;
      await inviteService.toggleRequirement(newValue);
      setInviteRequired(newValue);
      Swal.fire({
        title: newValue ? '🔒 Convite Obrigatório' : '🔓 Registro Aberto',
        text: newValue 
          ? 'Novos usuários precisarão de código de convite.' 
          : 'Qualquer pessoa pode se registrar agora.',
        icon: 'success',
        background: '#1b1730',
        color: '#fff',
        confirmButtonColor: '#c333ff',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      Swal.fire('Erro', 'Falha ao alterar configuração.', 'error');
    } finally {
      setTogglingReq(false);
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const available = invites.filter(i => !i.is_used).map(i => i.code);
    if (available.length === 0) {
      return Swal.fire('Atenção', 'Nenhum código disponível para copiar.', 'warning');
    }
    navigator.clipboard.writeText(available.join('\n'));
    Swal.fire({
      title: 'Copiados!',
      text: `${available.length} código(s) disponíveis copiados para a área de transferência.`,
      icon: 'success',
      background: '#1b1730',
      color: '#fff',
      confirmButtonColor: '#c333ff',
      timer: 2000,
      timerProgressBar: true
    });
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="superadmin-container">
      <div className="superadmin-header">
        <div className="header-left">
          <button onClick={() => navigate('/superadmin')} className="btn-back">
            ← Voltar
          </button>
          <div>
            <h1>🎟️ Códigos de Convite</h1>
            <p className="superadmin-subtitle">Gerenciamento de convites para pré-lançamento</p>
          </div>
        </div>
        <div className="header-right">
          <button onClick={loadInvites} className="btn-refresh">
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card" style={{ borderLeft: '3px solid #c333ff' }}>
          <div className="stat-content">
            <h3>Total</h3>
            <div className="stat-number">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #00e676' }}>
          <div className="stat-content">
            <h3>Disponíveis</h3>
            <div className="stat-number" style={{ color: '#00e676' }}>{stats.available}</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #ff9800' }}>
          <div className="stat-content">
            <h3>Utilizados</h3>
            <div className="stat-number" style={{ color: '#ff9800' }}>{stats.used}</div>
          </div>
        </div>
      </div>

      {/* Toggle de Exigência + Gerador */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
        
        {/* Toggle Convite Obrigatório */}
        <div className="config-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '15px' }}>🔐 Controle de Acesso ao Registro</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <label className="toggle-switch" style={{ flexShrink: 0 }}>
              <input 
                type="checkbox" 
                checked={inviteRequired}
                onChange={handleToggleRequirement}
                disabled={togglingReq}
              />
              <span className="slider round"></span>
            </label>
            <div>
              <strong style={{ color: inviteRequired ? '#c333ff' : '#888' }}>
                {inviteRequired ? 'Convite Obrigatório (Pré-Lançamento)' : 'Registro Aberto (Público)'}
              </strong>
              <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>
                {inviteRequired 
                  ? 'Novos usuários precisam de um código válido para se registrar.'
                  : 'Qualquer pessoa pode criar conta sem código de convite.'}
              </p>
            </div>
          </div>
        </div>

        {/* Gerador de Códigos */}
        <div className="config-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '15px' }}>⚡ Gerar Novos Códigos</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>Quantidade</label>
              <input 
                type="number" 
                min="1" 
                max="50" 
                value={quantidade}
                onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1a1a2e',
                  border: '1px solid #333',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '16px',
                  textAlign: 'center'
                }}
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={generating}
              style={{
                padding: '10px 24px',
                background: generating ? '#555' : 'linear-gradient(135deg, #c333ff, #7c3aed)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: generating ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                marginTop: '18px',
                whiteSpace: 'nowrap'
              }}
            >
              {generating ? '⏳ Gerando...' : '🎟️ Gerar'}
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '8px 16px',
            background: '#1a1a2e',
            border: '1px solid #333',
            color: '#fff',
            borderRadius: '6px',
            fontSize: '13px'
          }}
        >
          <option value="">Todos</option>
          <option value="available">Disponíveis</option>
          <option value="used">Utilizados</option>
        </select>
        <button 
          onClick={handleCopyAll}
          style={{
            padding: '8px 16px',
            background: 'rgba(195, 51, 255, 0.15)',
            border: '1px solid rgba(195, 51, 255, 0.3)',
            color: '#c333ff',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          📋 Copiar Todos Disponíveis
        </button>
      </div>

      {/* Tabela de Convites */}
      {loading ? (
        <div className="users-loading">
          <div className="spinner"></div>
          <p>Carregando códigos...</p>
        </div>
      ) : invites.length === 0 ? (
        <div className="users-empty">
          <p>📭 Nenhum código de convite encontrado.</p>
          <p style={{ fontSize: '13px', color: '#888' }}>Use o gerador acima para criar novos códigos.</p>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Status</th>
                <th>Usado Por</th>
                <th>Criado Em</th>
                <th>Usado Em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.id} style={{ opacity: invite.is_used ? 0.6 : 1 }}>
                  <td>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      letterSpacing: '1.5px',
                      color: invite.is_used ? '#888' : '#c333ff',
                      textDecoration: invite.is_used ? 'line-through' : 'none'
                    }}>
                      {invite.code}
                    </span>
                  </td>
                  <td>
                    {invite.is_used ? (
                      <span className="status-badge inactive">🔥 Utilizado</span>
                    ) : (
                      <span className="status-badge active">✅ Disponível</span>
                    )}
                  </td>
                  <td>
                    {invite.used_by_username ? (
                      <span style={{ color: '#fff' }}>
                        👤 {invite.used_by_username}
                      </span>
                    ) : (
                      <span style={{ color: '#555' }}>-</span>
                    )}
                  </td>
                  <td style={{ fontSize: '12px', color: '#888' }}>{formatDate(invite.created_at)}</td>
                  <td style={{ fontSize: '12px', color: '#888' }}>{formatDate(invite.used_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-action view"
                        onClick={() => handleCopyCode(invite.code, invite.id)}
                        title="Copiar código"
                        style={{ fontSize: '14px' }}
                      >
                        {copiedId === invite.id ? '✅' : '📋'}
                      </button>
                      {!invite.is_used && (
                        <button
                          className="btn-action delete"
                          onClick={() => handleDelete(invite)}
                          title="Deletar código"
                          style={{ fontSize: '14px' }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}