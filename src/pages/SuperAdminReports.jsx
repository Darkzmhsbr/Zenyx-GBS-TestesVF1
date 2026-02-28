import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../services/api';
import Swal from 'sweetalert2';
import './SuperAdmin.css';

const REASON_LABELS = {
  cp: '🔴 Pornografia Infantil',
  illegal: '🔴 Conteúdo Ilegal',
  fraud: '🟠 Fraude',
  scam: '🟠 Golpe',
  harassment: '🟡 Assédio',
  spam: '🟡 Spam',
  other: '⚪ Outro'
};

const STATUS_LABELS = {
  pending: { label: 'Pendente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  reviewing: { label: 'Em análise', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  resolved: { label: 'Resolvida', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  dismissed: { label: 'Descartada', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

export function SuperAdminReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { loadReports(); }, [page, statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('per_page', 20);
      
      const res = await superAdminService.getReports(statusFilter, page);
      setReports(res.reports || []);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error('Erro ao carregar denúncias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (report) => {
    const { value: formValues } = await Swal.fire({
      title: `🚨 Resolver Denúncia #${report.id}`,
      html: `
        <div style="text-align:left; color:#ccc; font-size:0.9rem;">
          <p><strong>Bot:</strong> @${report.bot_username}</p>
          <p><strong>Motivo:</strong> ${REASON_LABELS[report.reason] || report.reason}</p>
          ${report.description ? `<p><strong>Descrição:</strong> ${report.description}</p>` : ''}
          <hr style="border-color:#333; margin:12px 0"/>
          
          <label style="display:block; margin-bottom:4px; font-weight:600;">Ação/Punição:</label>
          <select id="swal-action" style="width:100%; padding:8px; background:#1b1730; color:#fff; border:1px solid #444; border-radius:6px; margin-bottom:12px;">
            <option value="none">Nenhuma ação</option>
            <option value="warning">⚠️ Aviso</option>
            <option value="strike">🟡 Strike (+1)</option>
            <option value="pause_bots">⏸️ Pausar bots</option>
            <option value="ban_account">🚫 Banir conta</option>
          </select>
          
          <label style="display:block; margin-bottom:4px; font-weight:600;">Dias de pausa (se aplicável):</label>
          <input id="swal-days" type="number" value="7" min="1" max="365" style="width:100%; padding:8px; background:#1b1730; color:#fff; border:1px solid #444; border-radius:6px; margin-bottom:12px;"/>
          
          <label style="display:block; margin-bottom:4px; font-weight:600;">Observação:</label>
          <textarea id="swal-resolution" rows="3" placeholder="Descreva a ação tomada..." style="width:100%; padding:8px; background:#1b1730; color:#fff; border:1px solid #444; border-radius:6px; resize:vertical;"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✅ Resolver',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      background: '#151515',
      color: '#fff',
      width: '500px',
      preConfirm: () => ({
        action: document.getElementById('swal-action').value,
        pause_days: parseInt(document.getElementById('swal-days').value) || 7,
        resolution: document.getElementById('swal-resolution').value,
      })
    });

    if (!formValues) return;

    try {
      await superAdminService.resolveReport(report.id, {
        status: 'resolved',
        resolution: formValues.resolution,
        action: formValues.action,
        pause_days: formValues.pause_days
      });
      Swal.fire({ title: '✅ Denúncia resolvida!', icon: 'success', timer: 2000, showConfirmButton: false, background: '#151515', color: '#fff' });
      loadReports();
    } catch (err) {
      Swal.fire({ title: 'Erro', text: err.response?.data?.detail || 'Falha ao resolver.', icon: 'error', background: '#151515', color: '#fff' });
    }
  };

  const handleDismiss = async (report) => {
    const result = await Swal.fire({
      title: 'Descartar denúncia?',
      text: `Denúncia #${report.id} contra @${report.bot_username} será marcada como descartada.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, descartar',
      cancelButtonText: 'Cancelar',
      background: '#151515',
      color: '#fff',
    });
    if (!result.isConfirmed) return;

    try {
      await superAdminService.resolveReport(report.id, { status: 'dismissed', action: 'none', resolution: 'Denúncia descartada pelo admin.' });
      loadReports();
    } catch (err) {
      Swal.fire({ title: 'Erro', text: 'Falha ao descartar.', icon: 'error', background: '#151515', color: '#fff' });
    }
  };

  const formatDate = (d) => {
    if (!d) return '-';
    let dateStr = String(d);
    if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.match(/-\d{2}:\d{2}$/)) dateStr += '-03:00';
    return new Date(dateStr).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="superadmin-container">
      <div className="superadmin-header">
        <div className="header-left">
          <h1>🚨 Denúncias</h1>
          <p className="superadmin-subtitle">Gerenciamento de denúncias recebidas</p>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/superadmin')} className="btn-back">← Voltar</button>
          <button onClick={loadReports} className="btn-refresh">🔄 Atualizar</button>
        </div>
      </div>

      {/* Filtro */}
      <div className="users-filters" style={{marginBottom: '20px'}}>
        <div style={{display:'flex', gap:'12px', alignItems:'end'}}>
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="reviewing">Em análise</option>
              <option value="resolved">Resolvidas</option>
              <option value="dismissed">Descartadas</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="superadmin-loading"><div className="spinner"></div><p>Carregando denúncias...</p></div>
      ) : reports.length === 0 ? (
        <div className="users-empty"><p>📭 Nenhuma denúncia encontrada.</p></div>
      ) : (
        <>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Data</th>
                  <th>Bot</th>
                  <th>Motivo</th>
                  <th>Denunciante</th>
                  <th>Status</th>
                  <th>Ação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => {
                  const st = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
                  return (
                    <tr key={r.id}>
                      <td><strong>#{r.id}</strong></td>
                      <td className="user-date">{formatDate(r.created_at)}</td>
                      <td><strong>@{r.bot_username}</strong></td>
                      <td>{REASON_LABELS[r.reason] || r.reason}</td>
                      <td>{r.reporter_name || <span style={{color:'#666', fontStyle:'italic'}}>Anônimo</span>}</td>
                      <td>
                        <span className="status-badge" style={{background: st.bg, color: st.color}}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{fontSize:'0.85rem', color:'#aaa'}}>{r.action_taken || '-'}</td>
                      <td className="user-actions">
                        {r.status === 'pending' && (
                          <>
                            <button className="btn-action view" title="Resolver" onClick={() => handleResolve(r)}>⚖️</button>
                            <button className="btn-action delete" title="Descartar" onClick={() => handleDismiss(r)}>🗑️</button>
                          </>
                        )}
                        {r.status === 'resolved' && <span style={{fontSize:'0.8rem', color:'#10b981'}}>✅</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="users-pagination">
              <button className="btn-page" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
              <span className="page-info">Página {page} de {totalPages}</span>
              <button className="btn-page" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próxima →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}