import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBot } from '../context/BotContext';
import { groupService, planService } from '../services/api';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Save, 
  Link2, 
  Hash, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Loader,
  ExternalLink,
  Package
} from 'lucide-react';

// =========================================================
// 📦 PÁGINA: GRUPOS E CANAIS (ESTEIRA DE PRODUTOS)
// =========================================================
export function GruposCanais() {
  const { user } = useAuth();
  const { selectedBot } = useBot();
  const botId = selectedBot?.id;

  // Estados principais
  const [groups, setGroups] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal de criação/edição
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // Formulário
  const [formData, setFormData] = useState({
    title: '',
    group_id: '',
    link: '',
    plan_ids: [],
    is_active: true
  });

  // Feedback
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // =========================================================
  // 📡 CARREGAMENTO DE DADOS
  // =========================================================
  const loadData = useCallback(async () => {
    if (!botId) return;
    setLoading(true);
    try {
      const [groupsRes, plansRes] = await Promise.all([
        groupService.list(botId),
        planService.listPlans(botId)
      ]);
      setGroups(groupsRes.groups || []);
      setPlans(plansRes || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      showToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =========================================================
  // 🔔 TOAST (FEEDBACK)
  // =========================================================
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // =========================================================
  // 📝 FORMULÁRIO
  // =========================================================
  const resetForm = () => {
    setFormData({
      title: '',
      group_id: '',
      link: '',
      plan_ids: [],
      is_active: true
    });
    setEditingGroup(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setFormData({
      title: group.title || '',
      group_id: group.group_id || '',
      link: group.link || '',
      plan_ids: group.plan_ids || [],
      is_active: group.is_active !== false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const togglePlan = (planId) => {
    setFormData(prev => ({
      ...prev,
      plan_ids: prev.plan_ids.includes(planId)
        ? prev.plan_ids.filter(id => id !== planId)
        : [...prev.plan_ids, planId]
    }));
  };

  // =========================================================
  // 💾 SALVAR (CRIAR OU ATUALIZAR)
  // =========================================================
  const handleSave = async () => {
    // Validações
    if (!formData.title.trim()) {
      showToast('Título é obrigatório', 'error');
      return;
    }
    if (!formData.group_id.trim()) {
      showToast('ID do grupo é obrigatório', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingGroup) {
        await groupService.update(botId, editingGroup.id, formData);
        showToast('Grupo atualizado com sucesso!', 'success');
      } else {
        await groupService.create(botId, formData);
        showToast('Grupo criado com sucesso!', 'success');
      }
      closeModal();
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Erro ao salvar grupo';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // 🗑️ DELETAR
  // =========================================================
  const handleDelete = async (group) => {
    try {
      await groupService.delete(botId, group.id);
      showToast(`Grupo "${group.title}" removido!`, 'success');
      setConfirmDelete(null);
      await loadData();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Erro ao remover grupo';
      showToast(msg, 'error');
    }
  };

  // =========================================================
  // 🎨 RENDER - SEM BOT SELECIONADO
  // =========================================================
  if (!botId) {
    return (
      <div className="gc-container">
        <div style={styles.emptyState}>
          <AlertCircle size={48} style={{ color: '#c333ff', marginBottom: '16px' }} />
          <h2 style={styles.emptyTitle}>Nenhum bot selecionado</h2>
          <p style={styles.emptyText}>Selecione um bot no menu superior para gerenciar seus grupos e canais.</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // 🎨 RENDER PRINCIPAL
  // =========================================================
  return (
    <div className="gc-container">

      {/* TOAST */}
      {toast && (
        <div style={{
          ...styles.toast,
          background: toast.type === 'error' 
            ? 'linear-gradient(135deg, #ff4444, #cc0000)' 
            : 'linear-gradient(135deg, #00c853, #009624)'
        }}>
          {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 className="gc-title">
            <Layers size={28} style={{ color: '#c333ff' }} />
            Grupos e Canais
          </h1>
          <p style={styles.subtitle}>
            Cadastre grupos e canais extras para criar sua esteira de produtos. 
            Vincule-os a planos, Order Bumps, Upsells e Downsells.
          </p>
        </div>
      </div>

      {/* HERO / CTA */}
      <div className="gc-hero-card">
        <div style={styles.heroContent}>
          <h2 className="gc-hero-title">Tenha grupos e canais agora mesmo</h2>
          <p style={styles.heroText}>
            Adicione canais para expandir sua comunidade e gerenciar grupos de forma mais eficiente.
            Cada grupo pode ser vinculado a planos específicos do seu bot.
          </p>
          <button style={styles.btnPrimary} onClick={openCreateModal}>
            <Plus size={18} />
            Criar novo grupo
          </button>
        </div>
        <div className="gc-hero-icon">
          <Package size={80} style={{ color: 'rgba(195, 51, 255, 0.3)' }} />
        </div>
      </div>

      {/* LISTA DE GRUPOS */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          Grupos ativos
          <span style={styles.badge}>{groups.length}</span>
        </h3>

        {loading ? (
          <div style={styles.loadingState}>
            <Loader size={32} style={{ color: '#c333ff', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#999', marginTop: '12px' }}>Carregando grupos...</p>
          </div>
        ) : groups.length === 0 ? (
          <div style={styles.emptyList}>
            <Layers size={40} style={{ color: '#555', marginBottom: '12px' }} />
            <p style={{ color: '#888' }}>Nenhum grupo cadastrado ainda.</p>
            <p style={{ color: '#666', fontSize: '13px' }}>Clique em "Criar novo grupo" para começar.</p>
          </div>
        ) : (
          <div className="gc-table-wrapper">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Título</th>
                  <th style={styles.th}>ID do Grupo</th>
                  <th style={styles.th}>Link</th>
                  <th style={styles.th}>Planos Vinculados</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '600', color: '#fff' }}>{group.title}</span>
                    </td>
                    <td style={styles.td}>
                      <code style={styles.codeTag}>{group.group_id}</code>
                    </td>
                    <td style={styles.td}>
                      {group.link ? (
                        <a 
                          href={group.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={styles.linkTag}
                        >
                          <ExternalLink size={13} />
                          {group.link.length > 30 ? group.link.substring(0, 30) + '...' : group.link}
                        </a>
                      ) : (
                        <span style={{ color: '#666', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {group.plan_names && group.plan_names.length > 0 ? (
                        <div style={styles.planTags}>
                          {group.plan_names.map((name, i) => (
                            <span key={i} style={styles.planTag}>{name}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#666', fontSize: '13px' }}>Nenhum plano</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: group.is_active ? 'rgba(0, 200, 83, 0.15)' : 'rgba(255, 68, 68, 0.15)',
                        color: group.is_active ? '#00c853' : '#ff4444'
                      }}>
                        {group.is_active ? '● Ativo' : '● Inativo'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.actions}>
                        <button 
                          style={styles.btnAction} 
                          onClick={() => openEditModal(group)}
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          style={{ ...styles.btnAction, color: '#ff4444' }} 
                          onClick={() => setConfirmDelete(group)}
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {showModal && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} className="gc-modal" onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingGroup ? 'Editar Grupo' : 'Criar Grupo'}
              </h3>
              <button style={styles.btnClose} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Título */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Hash size={14} />
                  Título do Grupo
                </label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Ex: Grupo VIP Premium, Canal de Bônus..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* ID do Grupo */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Hash size={14} />
                  ID do Grupo
                </label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Ex: -1001234567890"
                  value={formData.group_id}
                  onChange={e => setFormData({ ...formData, group_id: e.target.value })}
                />
                <span style={styles.hint}>
                  Cole o ID do canal ou grupo do Telegram (número negativo)
                </span>
              </div>

              {/* Planos Disponíveis */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Package size={14} />
                  Planos Disponíveis
                  <span style={styles.planCount}>
                    {formData.plan_ids.length} plano(s) selecionado(s)
                  </span>
                </label>
                
                {plans.length === 0 ? (
                  <div style={styles.noPlans}>
                    <AlertCircle size={16} />
                    <span>Nenhum plano cadastrado neste bot. Crie planos primeiro.</span>
                  </div>
                ) : (
                  <div style={styles.planList}>
                    {plans.map(plan => (
                      <div
                        key={plan.id}
                        style={{
                          ...styles.planItem,
                          borderColor: formData.plan_ids.includes(plan.id) ? '#c333ff' : '#333',
                          background: formData.plan_ids.includes(plan.id) 
                            ? 'rgba(195, 51, 255, 0.1)' 
                            : 'rgba(255, 255, 255, 0.03)'
                        }}
                        onClick={() => togglePlan(plan.id)}
                      >
                        <div style={styles.planCheckbox}>
                          <div style={{
                            ...styles.checkbox,
                            background: formData.plan_ids.includes(plan.id) ? '#c333ff' : 'transparent',
                            borderColor: formData.plan_ids.includes(plan.id) ? '#c333ff' : '#555'
                          }}>
                            {formData.plan_ids.includes(plan.id) && (
                              <CheckCircle size={14} style={{ color: '#fff' }} />
                            )}
                          </div>
                          <span style={{ 
                            color: formData.plan_ids.includes(plan.id) ? '#fff' : '#ccc',
                            fontWeight: formData.plan_ids.includes(plan.id) ? '600' : '400'
                          }}>
                            {plan.nome_exibicao}
                          </span>
                        </div>
                        <span style={{ color: '#888', fontSize: '12px' }}>
                          R$ {plan.preco_atual?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <span style={styles.hint}>
                  Clique nos planos para selecioná-los ou desselecioná-los
                </span>
              </div>

              {/* Link do Grupo */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Link2 size={14} />
                  Link do Grupo
                </label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Ex: https://t.me/+abc123xyz"
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                />
                <span style={styles.hint}>
                  Link de convite do canal ou grupo (opcional)
                </span>
              </div>

              {/* Status Ativo/Inativo */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <div 
                  style={styles.toggleWrapper} 
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                >
                  <div style={{
                    ...styles.toggle,
                    background: formData.is_active 
                      ? 'linear-gradient(135deg, #c333ff, #7b1fa2)' 
                      : '#333'
                  }}>
                    <div style={{
                      ...styles.toggleDot,
                      transform: formData.is_active ? 'translateX(20px)' : 'translateX(2px)'
                    }} />
                  </div>
                  <span style={{ color: formData.is_active ? '#00c853' : '#888' }}>
                    {formData.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={closeModal}>
                Cancelar
              </button>
              <button 
                style={{ ...styles.btnPrimary, opacity: saving ? 0.7 : 1 }} 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingGroup ? 'Atualizar' : 'Salvar'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {confirmDelete && (
        <div style={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div style={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <AlertCircle size={40} style={{ color: '#ff4444', marginBottom: '16px' }} />
            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>Confirmar exclusão</h3>
            <p style={{ color: '#999', margin: '0 0 24px', textAlign: 'center', fontSize: '14px' }}>
              Tem certeza que deseja remover o grupo <strong style={{ color: '#fff' }}>"{confirmDelete.title}"</strong>?
              <br />Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={styles.btnCancel} onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button 
                style={{ ...styles.btnDanger }} 
                onClick={() => handleDelete(confirmDelete)}
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS ANIMATIONS + RESPONSIVE */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* CONTAINER RESPONSIVO */
        .gc-container {
          padding: 30px;
          margin-top: 70px;
          margin-left: 260px;
          min-height: 100vh;
          font-family: 'Segoe UI', sans-serif;
        }

        /* TITLE RESPONSIVO */
        .gc-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 26px;
          font-weight: 700;
          color: #c333ff;
          margin: 0 0 8px;
        }

        /* HERO CARD RESPONSIVO */
        .gc-hero-card {
          background: linear-gradient(135deg, rgba(195, 51, 255, 0.08), rgba(123, 31, 162, 0.12));
          border: 1px solid rgba(195, 51, 255, 0.2);
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideUp 0.4s ease;
        }

        .gc-hero-title {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 12px;
          line-height: 1.2;
        }

        .gc-hero-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 40px;
        }

        /* TABLE WRAPPER RESPONSIVO */
        .gc-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* MODAL RESPONSIVO */
        .gc-modal {
          width: 100%;
          max-width: 540px;
        }

        /* ===================== MOBILE ===================== */
        @media (max-width: 768px) {
          .gc-container {
            margin-left: 0 !important;
            margin-top: 70px;
            padding: 16px;
          }

          .gc-title {
            font-size: 20px;
            gap: 8px;
          }

          .gc-hero-card {
            flex-direction: column;
            padding: 20px;
            text-align: center;
          }

          .gc-hero-title {
            font-size: 20px;
          }

          .gc-hero-icon {
            display: none;
          }

          .gc-table-wrapper {
            margin: 0 -16px;
            padding: 0 16px;
            overflow-x: auto;
          }

          .gc-table-wrapper table {
            min-width: 600px;
          }

          .gc-modal {
            max-width: 95vw !important;
            max-height: 90vh !important;
            margin: 10px;
          }
        }

        @media (max-width: 480px) {
          .gc-container {
            padding: 12px;
          }

          .gc-hero-card {
            padding: 16px;
          }

          .gc-hero-title {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}

// =========================================================
// 🎨 ESTILOS (INLINE - DESIGN SYSTEM ZENYX GBOT)
// =========================================================
const styles = {
  container: {
    padding: '30px',
    marginTop: '70px',
    marginLeft: '260px',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', sans-serif",
  },

  // HEADER
  header: {
    marginBottom: '24px',
    animation: 'fadeIn 0.3s ease',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '26px',
    fontWeight: '700',
    color: '#c333ff',
    margin: '0 0 8px',
  },
  subtitle: {
    color: '#999',
    fontSize: '14px',
    margin: 0,
    maxWidth: '600px',
    lineHeight: '1.5',
  },

  // HERO CARD
  heroCard: {
    background: 'linear-gradient(135deg, rgba(195, 51, 255, 0.08), rgba(123, 31, 162, 0.12))',
    border: '1px solid rgba(195, 51, 255, 0.2)',
    borderRadius: '16px',
    padding: '40px',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    animation: 'slideUp 0.4s ease',
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 12px',
    lineHeight: '1.2',
  },
  heroText: {
    color: '#aaa',
    fontSize: '14px',
    margin: '0 0 24px',
    maxWidth: '450px',
    lineHeight: '1.6',
  },
  heroIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '40px',
  },

  // SECTION
  section: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '24px',
    animation: 'slideUp 0.5s ease',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 20px',
  },
  badge: {
    background: 'rgba(195, 51, 255, 0.2)',
    color: '#c333ff',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
  },

  // TABLE
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    color: '#888',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background 0.2s',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#ccc',
    verticalAlign: 'middle',
  },
  codeTag: {
    background: 'rgba(195, 51, 255, 0.1)',
    color: '#d580ff',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  linkTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#c333ff',
    fontSize: '13px',
    textDecoration: 'none',
  },
  planTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  planTag: {
    background: 'rgba(195, 51, 255, 0.12)',
    color: '#d580ff',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  btnAction: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '8px',
    color: '#ccc',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
  },

  // EMPTY / LOADING
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: '20px',
    margin: '0 0 8px',
  },
  emptyText: {
    color: '#888',
    fontSize: '14px',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
  },
  emptyList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
  },

  // BUTTONS
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #c333ff, #7b1fa2)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnCancel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.06)',
    color: '#ccc',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  btnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #ff4444, #cc0000)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  // MODAL
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    background: '#1a1a2e',
    border: '1px solid rgba(195, 51, 255, 0.2)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '540px',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp 0.3s ease',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
  },
  btnClose: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '4px',
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  confirmModal: {
    background: '#1a1a2e',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '16px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '400px',
    animation: 'slideUp 0.3s ease',
  },

  // FORM
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#ccc',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  hint: {
    display: 'block',
    color: '#666',
    fontSize: '11px',
    marginTop: '6px',
  },
  planCount: {
    marginLeft: 'auto',
    color: '#888',
    fontSize: '12px',
    fontWeight: '400',
  },
  noPlans: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 152, 0, 0.1)',
    border: '1px solid rgba(255, 152, 0, 0.2)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#ff9800',
    fontSize: '13px',
  },
  planList: {
    border: '1px solid rgba(195, 51, 255, 0.2)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  planItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid transparent',
  },
  planCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    border: '2px solid #555',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  // TOGGLE
  toggleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  toggle: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    position: 'relative',
    transition: 'background 0.3s',
  },
  toggleDot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute',
    top: '2px',
    transition: 'transform 0.3s',
  },

  // TOAST
  toast: {
    position: 'fixed',
    top: '80px',
    right: '24px',
    left: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 2000,
    animation: 'fadeIn 0.3s ease',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    maxWidth: 'calc(100vw - 48px)',
  },
};

export default GruposCanais;