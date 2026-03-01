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
      
      const res = await superAdminService.getReports(statusFilter || null, page);
      setReports(res.reports || []);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error('Erro ao carregar denúncias:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 TESTE RÁPIDO: Executa a ação diretamente para testar o backend
  const handleQuickTest = async (report, actionType) => {
    let title = '';
    let text = '';
    
    if (actionType === 'strike') {
      title = '🧪 TESTE: Aplicar Strike';
      text = `Isso aplicará 1 strike real na conta @${report.owner_username || 'Desconhecido'} para testar o funcionamento. Continuar?`;
    } else if (actionType === 'pause_bots') {
      title = '🧪 TESTE: Pausar Bots';
      text = `Isso pausará os bots do usuário @${report.owner_username || 'Desconhecido'} por 7 dias para testar a função. Continuar?`;
    } else if (actionType === 'ban_account') {
      title = '🧪 TESTE: Banir Conta';
      text = `Isso vai BANIR a conta @${report.owner_username || 'Desconhecido'} para testar o sistema! Continuar?`;
    }

    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c333ff',
      cancelButtonColor: '#2a2a4a',
      confirmButtonText: 'Sim, Executar Teste',
      cancelButtonText: 'Cancelar',
      background: '#151515',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await superAdminService.resolveReport(report.id, {
          status: 'resolved',
          action: actionType,
          resolution: `[TESTE DE SISTEMA] Punição aplicada rapidamente: ${actionType}`
        });
        Swal.fire({
          title: 'Teste Aplicado!', 
          text: 'Verifique no banco de dados se a punição surtiu efeito.', 
          icon: 'success',
          background: '#151515',
          color: '#fff',
          timer: 2500,
          showConfirmButton: false
        });
        loadReports();
      } catch (error) {
        Swal.fire({
          title: 'Erro no Teste', 
          text: error.response?.data?.detail || 'Falha ao executar o teste.', 
          icon: 'error',
          background: '#151515',
          color: '#fff'
        });
      }
    }
  };

  // ⚖️ OFICIAL: Fluxo completo de resolução de denúncias
  const handleResolve = async (report) => {
    const { value: formValues } = await Swal.fire({
      title: `⚖️ Julgar Denúncia #${report.id}`,
      html: `
        <div style="text-align:left; color:#ccc; font-size:0.9rem;">
          <p><strong>Bot:</strong> @${report.bot_username}</p>
          <p><strong>Dono:</strong> @${report.owner_username || 'Desconhecido'}</p>
          <p><strong>Motivo:</strong> ${REASON_LABELS[report.reason] || report.reason}</p>
          ${report.description ? `<p><strong>Descrição:</strong> ${report.description}</p>` : ''}
          <hr style="border-color:#333; margin:12px 0"/>
          
          <label style="display:block; margin-bottom:4px; font-weight:600;">Ação/Punição Oficial:</label>
          <select id="swal-action" style="width:100%; padding:8px; background:#1b1730; color:#fff; border:1px solid #444; border-radius:6px; margin-bottom:12px; cursor:pointer;">
            <option value="none">Nenhuma ação</option>
            <option value="warning">⚠️ Apenas Aviso</option>
            <option value="strike">🟡 Aplicar Strike (+1)</option>
            <option value="pause_bots">⏸️ Pausar todos os bots</option>
            <option value="ban_account">🚫 Banir conta permanentemente</option>
          </select>
          
          <label style="display:block; margin-bottom:4px; font-weight:600;">Dias de pausa (se aplicável):</label>
          <input id="swal-days" type="number" value="7" min="1" max="365" style="width:100%; padding:8px; background:#1b1730; color:#fff; border:1px solid #444; border-radius:6px; margin-bottom:12px;"/>
          
          <label style="display:block; margin-bottom:4px; font-weight:600;">Resolução (Motivo para o log):</label>
          <textarea id="swal-resolution" rows="3" placeholder="Descreva a decisão tomada..." style="width:100%; padding:8px; background:#1b1730; color:#fff; border:1px solid #444; border-radius:6px; resize:vertical;"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✅ Confirmar Sentença',
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
        resolution: formValues.resolution || 'Sem observações.',
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
      text: `Denúncia #${report.id} contra @${report.bot_username} será marcada como improcedente (descartada).`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, descartar',
      cancelButtonText: 'Cancelar',
      background: '#151515',
      color: '#fff',
    });
    if (!result.isConfirmed) return;

    try {
      await superAdminService.resolveReport(report.id, { status: 'dismissed', action: 'none', resolution: 'Denúncia descartada por falta de provas ou improcedência.' });
      loadReports();
    } catch (err) {
      Swal.fire({ title: 'Erro', text: 'Falha ao descartar.', icon: 'error', background: '#151515', color: '#fff' });
    }
  };

  const viewDetails = (report) => {
    const ACTION_NAMES = { strike: '⚠️ Strike', pause_bots: '⏸️ Pausa de Bots', ban_account: '🚫 Banimento', warning: '⚠️ Aviso', none: 'Nenhuma' };
    Swal.fire({
      title: `👁️ Detalhes: Denúncia #${report.id}`,
      html: `
        <div style="text-align: left; font-size: 0.9rem; line-height: 1.6; color: #ccc;">
          <p><strong>Bot Denunciado:</strong> @${report.bot_username}</p>
          <p><strong>Dono do Bot:</strong> <span style="color: #c333ff;">@${report.owner_username || 'Desconhecido'}</span></p>
          <p><strong>Motivo:</strong> ${REASON_LABELS[report.reason] || report.reason}</p>
          <p><strong>Denunciante:</strong> ${report.reporter_name || 'Anônimo'} (IP: ${report.ip_address || 'N/A'})</p>
          <p><strong>Data:</strong> ${formatDate(report.created_at)}</p>
          <hr style="border-color:#333; margin:12px 0"/>
          <p><strong>Descrição:</strong><br/> ${report.description || 'Nenhuma descrição fornecida.'}</p>
          ${report.evidence_url ? `<p style="margin-top:10px;"><strong>Evidência URL:</strong><br/><a href="${report.evidence_url}" target="_blank" style="color:#3b82f6; word-break: break-all;">${report.evidence_url}</a></p>` : ''}
          ${report.resolution ? `
            <hr style="border-color:#333; margin:12px 0"/>
            <p><strong>Ação Tomada:</strong> <span style="color:#10b981;">${ACTION_NAMES[report.action_taken] || report.action_taken || 'Nenhuma'}</span></p>
            <p><strong>Resolução Admin:</strong> ${report.resolution}</p>
          ` : ''}
        </div>
      `,
      background: '#151515',
      color: '#fff',
      confirmButtonColor: '#c333ff',
      confirmButtonText: 'Fechar'
    });
  };

  // 🔄 REVERTER PUNIÇÃO APLICADA
  const handleRevert = async (report) => {
    const ACTION_NAMES = { strike: '⚠️ Strike', pause_bots: '⏸️ Pausa de Bots', ban_account: '🚫 Banimento', warning: '⚠️ Aviso' };
    const actionLabel = ACTION_NAMES[report.action_taken] || report.action_taken || 'Desconhecida';

    const { value: reason } = await Swal.fire({
      title: '🔄 Reverter Punição',
      html: `
        <div style="text-align:left; color:#ccc; font-size:0.9rem;">
          <p><strong>Usuário:</strong> <span style="color:#c333ff;">@${report.owner_username || 'Desconhecido'}</span></p>
          <p><strong>Punição aplicada:</strong> <span style="color:#ef4444;">${actionLabel}</span></p>
          <hr style="border-color:#333; margin:12px 0"/>
          <p style="font-size:0.85rem; color:#aaa;">Isso irá:</p>
          <ul style="color:#aaa; font-size:0.82rem; padding-left:18px; margin:6px 0;">
            <li>Remover ban (se houver)</li>
            <li>Remover pausa dos bots</li>
            <li>Reativar todos os bots pausados</li>
            <li>Decrementar contador de strikes</li>
            <li>Marcar denúncia como "Descartada"</li>
          </ul>
          <hr style="border-color:#333; margin:12px 0"/>
          <label style="display:block; margin-bottom:4px; font-weight:600;">Motivo da reversão:</label>
          <textarea id="swal-revert-reason" rows="2" placeholder="Ex: Teste concluído, falso positivo..." style="width:100%; padding:8px; background:#1b1730; color:#fff; border:1px solid #444; border-radius:6px; resize:vertical;"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '🔄 Confirmar Reversão',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f59e0b',
      background: '#151515',
      color: '#fff',
      width: '480px',
      preConfirm: () => document.getElementById('swal-revert-reason').value || 'Sem motivo'
    });

    if (!reason && reason !== '') return;

    try {
      const res = await superAdminService.revertReport(report.id, reason);
      Swal.fire({
        title: '✅ Punição Revertida!',
        html: `<div style="text-align:left; color:#ccc; font-size:0.85rem;">
          ${(res.details || []).map(d => `<p style="margin:3px 0;">✓ ${d}</p>`).join('')}
          <p style="margin-top:10px; color:#10b981;"><strong>Conta restaurada:</strong> @${res.user || '?'}</p>
        </div>`,
        icon: 'success',
        background: '#151515',
        color: '#fff',
        confirmButtonColor: '#c333ff'
      });
      loadReports();
    } catch (err) {
      Swal.fire({
        title: 'Erro ao Reverter',
        text: err.response?.data?.detail || 'Falha ao reverter punição.',
        icon: 'error',
        background: '#151515',
        color: '#fff'
      });
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
      {/* 💅 ESTILOS LOCAIS PARA GARANTIR ORGANIZAÇÃO PERFEITA NAS AÇÕES */}
      <style>{`
        .actions-cell-wrapper { display: flex; flex-direction: column; gap: 8px; min-width: 240px; }
        .action-row { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.03); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); }
        .action-label { font-size: 0.65rem; color: #888; font-weight: 700; text-transform: uppercase; width: 60px; flex-shrink: 0; }
        .test-row { background: rgba(195, 51, 255, 0.05); border-color: rgba(195, 51, 255, 0.2); }
        .test-label { color: #c333ff; }
        .btn-mini-icon { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: none; cursor: pointer; transition: 0.2s; font-size: 15px; background: #2a2a4a; color: #fff; }
        .btn-mini-icon:hover { transform: scale(1.1); filter: brightness(1.2); }
        .btn-mini-icon.view { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        .btn-mini-icon.resolve { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .btn-mini-icon.delete { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .btn-mini-icon.strike { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .btn-mini-icon.pause { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        .btn-mini-icon.ban { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        @media(max-width: 768px) {
          .actions-cell-wrapper { min-width: 100%; }
        }
      `}</style>

      <div className="superadmin-header">
        <div className="header-left">
          <h1>🚨 Gestão de Denúncias</h1>
          <p className="superadmin-subtitle">Julgamento e aplicação de punições na plataforma</p>
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
            <label>Filtrar por Status</label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">Todas as Denúncias</option>
              <option value="pending">Apenas Pendentes</option>
              <option value="reviewing">Em Análise</option>
              <option value="resolved">Resolvidas / Punidas</option>
              <option value="dismissed">Descartadas</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="superadmin-loading"><div className="spinner"></div><p>Buscando relatórios...</p></div>
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
                  <th>Dono do Bot</th>
                  <th>Bot Envolvido</th>
                  <th>Motivo</th>
                  <th>Status</th>
                  <th>Gestão de Punições</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => {
                  const st = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
                  return (
                    <tr key={r.id}>
                      <td><strong style={{color:'#666'}}>#{r.id}</strong></td>
                      <td className="user-date" style={{fontSize: '0.85rem'}}>{formatDate(r.created_at)}</td>
                      <td style={{fontWeight: 'bold', color: '#c333ff'}}>
                        {r.owner_username ? `@${r.owner_username}` : 'Desconhecido'}
                      </td>
                      <td>
                        <a href={`https://t.me/${r.bot_username}`} target="_blank" rel="noreferrer" style={{color: '#3b82f6', textDecoration: 'none', fontWeight:'500'}}>
                          @{r.bot_username}
                        </a>
                      </td>
                      <td>{REASON_LABELS[r.reason] || r.reason}</td>
                      <td>
                        <span className="status-badge" style={{background: st.bg, color: st.color}}>
                          {st.label}
                        </span>
                      </td>
                      <td>
                        {/* 🛠️ AÇÕES ORGANIZADAS COM LAYOUT LIMPO */}
                        {r.status === 'pending' ? (
                          <div className="actions-cell-wrapper">
                            
                            {/* Bloco 1: Ações Oficiais */}
                            <div className="action-row">
                              <span className="action-label">Oficial</span>
                              <button className="btn-mini-icon view" title="Ver Detalhes e Provas" onClick={() => viewDetails(r)}>👁️</button>
                              <button className="btn-mini-icon resolve" title="Julgar Manualmente" onClick={() => handleResolve(r)}>⚖️</button>
                              <button className="btn-mini-icon delete" title="Descartar Denúncia" onClick={() => handleDismiss(r)}>🗑️</button>
                            </div>
                            
                            {/* Bloco 2: Testes Rápidos */}
                            <div className="action-row test-row">
                              <span className="action-label test-label">1 Clique</span>
                              <button className="btn-mini-icon strike" title="Aplicar 1 Strike Direto" onClick={() => handleQuickTest(r, 'strike')}>⚠️</button>
                              <button className="btn-mini-icon pause" title="Pausar Bots por 7 dias" onClick={() => handleQuickTest(r, 'pause_bots')}>⏸️</button>
                              <button className="btn-mini-icon ban" title="Banir Usuário Imediatamente" onClick={() => handleQuickTest(r, 'ban_account')}>🚫</button>
                            </div>

                          </div>
                        ) : (
                          <div className="actions-cell-wrapper">
                            <div className="action-row">
                              <span className="action-label">Decisão</span>
                              <button className="btn-mini-icon view" title="Ver Detalhes da Resolução" onClick={() => viewDetails(r)}>👁️</button>
                              <span style={{fontSize:'0.8rem', color:'#aaa', marginLeft:'4px'}}>
                                {r.action_taken === 'none' ? 'Sem Punição' : r.action_taken}
                              </span>
                            </div>
                            {/* 🔄 BOTÃO REVERTER — só se teve punição real e não foi já revertido */}
                            {r.status === 'resolved' && r.action_taken && r.action_taken !== 'none' && !String(r.action_taken).startsWith('revertido') && (
                              <div className="action-row" style={{background:'rgba(245,158,11,0.06)', borderColor:'rgba(245,158,11,0.2)'}}>
                                <span className="action-label" style={{color:'#f59e0b'}}>Reverter</span>
                                <button className="btn-mini-icon" style={{background:'rgba(245,158,11,0.2)', color:'#f59e0b'}} title="Reverter punição e restaurar conta/bots" onClick={() => handleRevert(r)}>🔄</button>
                                <span style={{fontSize:'0.7rem', color:'#f59e0b80', marginLeft:'4px'}}>Desfazer tudo</span>
                              </div>
                            )}
                            {/* Indicador de revertido */}
                            {String(r.action_taken || '').startsWith('revertido') && (
                              <div className="action-row" style={{background:'rgba(16,185,129,0.06)', borderColor:'rgba(16,185,129,0.2)'}}>
                                <span style={{fontSize:'0.75rem', color:'#10b981'}}>✅ Punição já revertida</span>
                              </div>
                            )}
                          </div>
                        )}
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