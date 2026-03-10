import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../services/api';
import Swal from 'sweetalert2';
import {
  ArrowLeft, Search, Crown, Lock, Unlock, Users, DollarSign,
  Save, X, RefreshCw, ChevronLeft, ChevronRight, Loader2, Shield
} from 'lucide-react';
import './PrimeOverrides.css';

export function PrimeOverrides() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal de edição
  const [selectedUser, setSelectedUser] = useState(null);
  const [recursos, setRecursos] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [saving, setSaving] = useState(null); // recurso_id sendo salvo

  useEffect(() => { loadUsers(); }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.listUsers({ page, per_page: 30, search });
      setUsers(res.data || []);
      setTotalPages(res.total_pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setPage(1); loadUsers(); };

  const abrirEditor = async (user) => {
    setSelectedUser(user);
    setModalLoading(true);
    setRecursos([]);
    try {
      const res = await superAdminService.getUserPrimeOverrides(user.id);
      setRecursos(res.recursos || []);
      // Enrich selected user with faturamento
      setSelectedUser(prev => ({ ...prev, faturamento_reais: res.user?.faturamento_reais || 0 }));
    } catch (e) {
      console.error(e);
      Swal.fire('Erro', 'Não foi possível carregar recursos do usuário.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const fecharEditor = () => {
    setSelectedUser(null);
    setRecursos([]);
  };

  const salvarOverride = async (recurso, forceStatus, customMeta) => {
    if (!selectedUser) return;
    setSaving(recurso.id);
    try {
      await superAdminService.setUserPrimeOverride(selectedUser.id, {
        recurso_id: recurso.id,
        force_status: forceStatus || null,
        custom_meta: customMeta !== '' && customMeta !== null ? parseFloat(customMeta) : null
      });
      // Recarregar
      const res = await superAdminService.getUserPrimeOverrides(selectedUser.id);
      setRecursos(res.recursos || []);
      Swal.fire({ icon: 'success', title: 'Salvo!', text: `Override de "${recurso.nome}" atualizado.`, timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire('Erro', 'Falha ao salvar override.', 'error');
    } finally {
      setSaving(null);
    }
  };

  const removerOverride = async (recurso) => {
    if (!selectedUser) return;
    setSaving(recurso.id);
    try {
      await superAdminService.setUserPrimeOverride(selectedUser.id, {
        recurso_id: recurso.id,
        force_status: null,
        custom_meta: null
      });
      const res = await superAdminService.getUserPrimeOverrides(selectedUser.id);
      setRecursos(res.recursos || []);
      Swal.fire({ icon: 'info', title: 'Removido', text: `Override de "${recurso.nome}" removido. Voltou ao padrão.`, timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire('Erro', 'Falha ao remover override.', 'error');
    } finally {
      setSaving(null);
    }
  };

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  return (
    <div className="po-container">
      {/* HEADER */}
      <div className="po-header">
        <div className="po-header-left">
          <button className="po-back" onClick={() => navigate('/superadmin')}>
            <ArrowLeft size={18} />
          </button>
          <Crown size={28} color="#c333ff" />
          <div>
            <h1>Gerenciar Recursos Prime</h1>
            <p>Controle individual de metas, bloqueios e desbloqueios por usuário</p>
          </div>
        </div>
      </div>

      {/* BUSCA */}
      <div className="po-search-row">
        <div className="po-search-box">
          <Search size={16} />
          <input 
            placeholder="Buscar usuário por nome ou email..."
            value={search} 
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button className="po-search-btn" onClick={handleSearch}>Buscar</button>
      </div>

      {/* LISTA DE USUÁRIOS */}
      <div className="po-card">
        {loading ? (
          <div className="po-loading"><Loader2 size={28} className="po-spin" /><p>Carregando...</p></div>
        ) : users.length === 0 ? (
          <div className="po-empty"><Users size={40} color="#333" /><p>Nenhum usuário encontrado</p></div>
        ) : (
          <>
            <table className="po-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'center' }}>Bots</th>
                  <th style={{ textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="po-user-cell">
                        <span className="po-user-name">{u.username}</span>
                        {u.is_superuser && <span className="po-badge-admin">ADMIN</span>}
                      </div>
                    </td>
                    <td><span className="po-email">{u.email}</span></td>
                    <td style={{ textAlign: 'center' }}>{u.bot_count ?? u.bots?.length ?? 0}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="po-edit-btn" onClick={() => abrirEditor(u)}>
                        <Crown size={14} /> Gerenciar Prime
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="po-pagination">
                <button className="po-page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}>
                  <ChevronLeft size={16} />
                </button>
                <span>Pág {page}/{totalPages}</span>
                <button className="po-page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: EDITOR DE RECURSOS PRIME POR USUÁRIO               */}
      {/* ========================================================= */}
      {selectedUser && (
        <div className="po-modal-overlay" onClick={fecharEditor}>
          <div className="po-modal" onClick={e => e.stopPropagation()}>
            <div className="po-modal-header">
              <div className="po-modal-title">
                <Crown size={22} color="#c333ff" />
                <div>
                  <h2>Recursos Prime — {selectedUser.username}</h2>
                  <p>Faturamento: <strong style={{ color: '#10b981' }}>{fmt(selectedUser.faturamento_reais)}</strong></p>
                </div>
              </div>
              <button className="po-modal-close" onClick={fecharEditor}><X size={18} /></button>
            </div>

            <div className="po-modal-body">
              {modalLoading ? (
                <div className="po-loading" style={{ padding: '40px 0' }}>
                  <Loader2 size={28} className="po-spin" /><p>Carregando recursos...</p>
                </div>
              ) : (
                <div className="po-recursos-list">
                  {recursos.map(rec => (
                    <RecursoOverrideRow 
                      key={rec.id} 
                      recurso={rec} 
                      saving={saving === rec.id}
                      onSave={salvarOverride}
                      onRemove={removerOverride}
                      fmt={fmt}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// Componente individual para cada recurso
// =========================================================
function RecursoOverrideRow({ recurso, saving, onSave, onRemove, fmt }) {
  const [forceStatus, setForceStatus] = useState(recurso.override_force || '');
  const [customMeta, setCustomMeta] = useState(recurso.override_meta !== null && recurso.override_meta !== undefined ? recurso.override_meta : '');

  useEffect(() => {
    setForceStatus(recurso.override_force || '');
    setCustomMeta(recurso.override_meta !== null && recurso.override_meta !== undefined ? recurso.override_meta : '');
  }, [recurso]);

  const statusColor = {
    'desbloqueado': '#10b981',
    'bloqueado': '#ef4444',
    'em_breve': '#f59e0b'
  };

  return (
    <div className={`po-recurso-row ${recurso.has_override ? 'has-override' : ''}`}>
      <div className="po-rec-top">
        <div className="po-rec-info">
          <span className="po-rec-name">{recurso.nome}</span>
          <span className="po-rec-meta">Meta padrão: {fmt(recurso.meta_padrao)}</span>
        </div>
        <div className="po-rec-status">
          <span className="po-rec-badge" style={{ color: statusColor[recurso.status_efetivo] || '#888', background: `${statusColor[recurso.status_efetivo] || '#888'}15` }}>
            {recurso.status_efetivo === 'desbloqueado' ? <Unlock size={12} /> : <Lock size={12} />}
            {recurso.status_efetivo}
          </span>
          {recurso.has_override && <span className="po-override-tag"><Shield size={10} /> Override</span>}
        </div>
      </div>

      <div className="po-rec-controls">
        <div className="po-rec-field">
          <label>Forçar Status</label>
          <select value={forceStatus} onChange={e => setForceStatus(e.target.value)}>
            <option value="">Automático (por meta)</option>
            <option value="desbloqueado">Desbloqueado</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </div>
        <div className="po-rec-field">
          <label>Meta Customizada (R$)</label>
          <input 
            type="number" 
            step="0.01" 
            placeholder={recurso.meta_padrao}
            value={customMeta}
            onChange={e => setCustomMeta(e.target.value)}
          />
        </div>
        <div className="po-rec-actions">
          <button 
            className="po-save-btn" 
            onClick={() => onSave(recurso, forceStatus || null, customMeta)}
            disabled={saving}
          >
            {saving ? <Loader2 size={14} className="po-spin" /> : <Save size={14} />}
            Salvar
          </button>
          {recurso.has_override && (
            <button 
              className="po-remove-btn" 
              onClick={() => onRemove(recurso)}
              disabled={saving}
            >
              <X size={14} /> Resetar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}