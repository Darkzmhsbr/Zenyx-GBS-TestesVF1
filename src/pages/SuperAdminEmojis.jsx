import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { premiumEmojiService } from '../services/api';
import Swal from 'sweetalert2';
import './SuperAdminEmojis.css';

export function SuperAdminEmojis() {
  const navigate = useNavigate();
  
  // === STATE ===
  const [activeTab, setActiveTab] = useState('packs'); // 'packs' | 'emojis'
  const [loading, setLoading] = useState(true);
  
  // Pacotes
  const [packs, setPacks] = useState([]);
  
  // Emojis
  const [emojis, setEmojis] = useState([]);
  const [emojiTotal, setEmojiTotal] = useState(0);
  const [emojiFilters, setEmojiFilters] = useState({ search: '', pack_id: '', page: 1 });
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create_pack', 'edit_pack', 'create_emoji', 'edit_emoji', 'import_pack'
  const [editingItem, setEditingItem] = useState(null);
  
  // Form Pack
  const [packForm, setPackForm] = useState({ name: '', icon: '📦', description: '', sort_order: 0 });
  
  // Form Emoji
  const [emojiForm, setEmojiForm] = useState({
    emoji_id: '', fallback: '', name: '', shortcode: '',
    pack_id: '', sort_order: 0, emoji_type: 'animated', thumbnail_url: ''
  });

  // Form Import Pack
  const [importForm, setImportForm] = useState({ pack_link: '', pack_name: '', pack_icon: '📦' });
  const [importing, setImporting] = useState(false);

  // === LOAD DATA ===
  useEffect(() => { loadPacks(); loadEmojis(); }, []);
  useEffect(() => { loadEmojis(); }, [emojiFilters.pack_id, emojiFilters.page]);

  const loadPacks = async () => {
    try {
      const data = await premiumEmojiService.listPacks();
      setPacks(data || []);
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
    }
  };

  const loadEmojis = async () => {
    setLoading(true);
    try {
      const data = await premiumEmojiService.listEmojis(emojiFilters);
      setEmojis(data.emojis || []);
      setEmojiTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao carregar emojis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchEmojis = useCallback(() => {
    setEmojiFilters(prev => ({ ...prev, page: 1 }));
    loadEmojis();
  }, [emojiFilters.search]);

  // === PACK CRUD ===
  const openCreatePack = () => {
    setPackForm({ name: '', icon: '📦', description: '', sort_order: packs.length + 1 });
    setEditingItem(null);
    setModalType('create_pack');
    setShowModal(true);
  };

  const openEditPack = (pack) => {
    setPackForm({ name: pack.name, icon: pack.icon || '📦', description: pack.description || '', sort_order: pack.sort_order });
    setEditingItem(pack);
    setModalType('edit_pack');
    setShowModal(true);
  };

  const handleSavePack = async () => {
    if (!packForm.name.trim()) {
      return Swal.fire('Atenção', 'Nome do pacote é obrigatório.', 'warning');
    }

    try {
      if (modalType === 'create_pack') {
        await premiumEmojiService.createPack(packForm);
        Swal.fire('Sucesso', 'Pacote criado!', 'success');
      } else {
        await premiumEmojiService.updatePack(editingItem.id, packForm);
        Swal.fire('Sucesso', 'Pacote atualizado!', 'success');
      }
      setShowModal(false);
      loadPacks();
    } catch (error) {
      Swal.fire('Erro', error?.response?.data?.detail || 'Falha ao salvar pacote.', 'error');
    }
  };

  const handleDeletePack = async (pack) => {
    const result = await Swal.fire({
      title: '🗑️ Deletar Pacote?',
      html: `Tem certeza que deseja deletar <b>${pack.name}</b>?<br><small>Todos os emojis deste pacote serão removidos.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sim, Deletar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await premiumEmojiService.deletePack(pack.id);
        Swal.fire('Deletado!', 'Pacote removido.', 'success');
        loadPacks();
        loadEmojis();
      } catch (error) {
        Swal.fire('Erro', 'Falha ao deletar pacote.', 'error');
      }
    }
  };

  const handleTogglePackActive = async (pack) => {
    try {
      await premiumEmojiService.updatePack(pack.id, { is_active: !pack.is_active });
      loadPacks();
    } catch (error) {
      Swal.fire('Erro', 'Falha ao alterar status.', 'error');
    }
  };

  // === EMOJI CRUD ===
  const openCreateEmoji = () => {
    setEmojiForm({
      emoji_id: '', fallback: '', name: '', shortcode: '',
      pack_id: packs.length > 0 ? packs[0].id : '', sort_order: 0, emoji_type: 'animated', thumbnail_url: ''
    });
    setEditingItem(null);
    setModalType('create_emoji');
    setShowModal(true);
  };

  const openEditEmoji = (emoji) => {
    setEmojiForm({
      emoji_id: emoji.emoji_id,
      fallback: emoji.fallback,
      name: emoji.name,
      shortcode: emoji.shortcode,
      pack_id: emoji.pack_id || '',
      sort_order: emoji.sort_order,
      emoji_type: emoji.emoji_type || 'static',
      thumbnail_url: emoji.thumbnail_url || ''
    });
    setEditingItem(emoji);
    setModalType('edit_emoji');
    setShowModal(true);
  };

  const handleSaveEmoji = async () => {
    if (!emojiForm.emoji_id.trim() || !emojiForm.fallback.trim() || !emojiForm.name.trim() || !emojiForm.shortcode.trim()) {
      return Swal.fire('Atenção', 'Preencha todos os campos obrigatórios.', 'warning');
    }

    const payload = { ...emojiForm, pack_id: emojiForm.pack_id || null };

    try {
      if (modalType === 'create_emoji') {
        await premiumEmojiService.createEmoji(payload);
        Swal.fire('Sucesso', 'Emoji cadastrado!', 'success');
      } else {
        await premiumEmojiService.updateEmoji(editingItem.id, payload);
        Swal.fire('Sucesso', 'Emoji atualizado!', 'success');
      }
      setShowModal(false);
      loadEmojis();
      loadPacks(); // Atualiza contagem
    } catch (error) {
      Swal.fire('Erro', error?.response?.data?.detail || 'Falha ao salvar emoji.', 'error');
    }
  };

  const handleDeleteEmoji = async (emoji) => {
    const result = await Swal.fire({
      title: `Remover ${emoji.fallback} ${emoji.name}?`,
      text: 'Este emoji será removido do catálogo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Remover',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await premiumEmojiService.deleteEmoji(emoji.id);
        Swal.fire('Removido!', 'Emoji removido do catálogo.', 'success');
        loadEmojis();
        loadPacks();
      } catch (error) {
        Swal.fire('Erro', 'Falha ao remover emoji.', 'error');
      }
    }
  };

  const handleToggleEmojiActive = async (emoji) => {
    try {
      await premiumEmojiService.updateEmoji(emoji.id, { is_active: !emoji.is_active });
      loadEmojis();
    } catch (error) {
      Swal.fire('Erro', 'Falha ao alterar status.', 'error');
    }
  };

  // === IMPORT PACK ===
  const openImportPack = () => {
    setImportForm({ pack_link: '', pack_name: '', pack_icon: '📦' });
    setModalType('import_pack');
    setShowModal(true);
  };

  const handleImportPack = async () => {
    if (!importForm.pack_link.trim()) {
      return Swal.fire('Atenção', 'Cole o link do pack de emojis.', 'warning');
    }

    setImporting(true);
    try {
      const result = await premiumEmojiService.importPack({
        pack_link: importForm.pack_link.trim(),
        pack_name: importForm.pack_name.trim() || null,
        pack_icon: importForm.pack_icon || '📦',
        auto_create_pack: true
      });
      
      setShowModal(false);
      
      Swal.fire({
        title: '✅ Pack Importado!',
        html: `
          <div style="text-align:left; font-size:0.95rem">
            <p><strong>${result.pack_title}</strong></p>
            <p>✨ <b>${result.created}</b> emojis cadastrados</p>
            ${result.skipped > 0 ? `<p>⏭️ ${result.skipped} já existiam (ignorados)</p>` : ''}
            <p style="color:#888; font-size:0.85rem; margin-top:8px">Total no pack: ${result.total_in_pack}</p>
          </div>
        `,
        icon: 'success'
      });
      
      loadPacks();
      loadEmojis();
    } catch (error) {
      const detail = error?.response?.data?.detail || 'Falha ao importar pack. Verifique o link.';
      Swal.fire('Erro', detail, 'error');
    } finally {
      setImporting(false);
    }
  };

  // === STATS ===
  const totalPacks = packs.length;
  const activePacks = packs.filter(p => p.is_active).length;
  const totalEmojisAll = packs.reduce((acc, p) => acc + (p.emoji_count || 0), 0);

  // === RENDER ===
  return (
    <div className="sa-emojis-container">
      {/* HEADER */}
      <div className="sae-header">
        <div className="sae-header-left">
          <button className="sae-btn sae-btn-back" onClick={() => navigate('/superadmin')}>
            ← Voltar
          </button>
          <h1>✨ Emojis Premium</h1>
          <p>Gerencie o catálogo de custom emojis do Telegram disponíveis na plataforma</p>
        </div>
        <div className="sae-header-actions">
          <button className="sae-btn sae-btn-secondary" onClick={() => { loadPacks(); loadEmojis(); }}>
            🔄 Atualizar
          </button>
          <button className="sae-btn sae-btn-import" onClick={openImportPack}>
            📦 Importar Pack
          </button>
          {activeTab === 'packs' && (
            <button className="sae-btn sae-btn-primary" onClick={openCreatePack}>
              ➕ Novo Pacote
            </button>
          )}
          {activeTab === 'emojis' && (
            <button className="sae-btn sae-btn-primary" onClick={openCreateEmoji}>
              ➕ Novo Emoji
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="sae-stats">
        <div className="sae-stat-card">
          <div className="sae-stat-number">{totalPacks}</div>
          <div className="sae-stat-label">Pacotes</div>
        </div>
        <div className="sae-stat-card">
          <div className="sae-stat-number">{activePacks}</div>
          <div className="sae-stat-label">Pacotes Ativos</div>
        </div>
        <div className="sae-stat-card">
          <div className="sae-stat-number">{totalEmojisAll || emojiTotal}</div>
          <div className="sae-stat-label">Emojis Cadastrados</div>
        </div>
      </div>

      {/* INFO BOX */}
      <div className="sae-info-box">
        <strong>📦 Importação rápida:</strong> Use o botão <strong>"Importar Pack"</strong> para importar 
        packs completos do Telegram automaticamente! Basta colar o link como <code>https://t.me/addemoji/NomeDoPack</code>. 
        Todos os emojis são cadastrados de uma vez com shortcodes gerados automaticamente.
        <br /><br />
        <strong>💡 Cadastro individual:</strong> Para emojis avulsos, envie o emoji premium 
        pelo Telegram para o bot <code>@JsonDumpBot</code>. Ele retorna o JSON com o campo 
        <code>custom_emoji_id</code> — esse é o número que você cola no campo "Emoji ID".
        O dono do bot precisa ter Telegram Premium para que os emojis funcionem no envio.
      </div>

      {/* TABS */}
      <div className="sae-tabs">
        <button className={`sae-tab ${activeTab === 'packs' ? 'active' : ''}`} onClick={() => setActiveTab('packs')}>
          📦 Pacotes <span className="sae-tab-badge">{totalPacks}</span>
        </button>
        <button className={`sae-tab ${activeTab === 'emojis' ? 'active' : ''}`} onClick={() => setActiveTab('emojis')}>
          ✨ Emojis <span className="sae-tab-badge">{emojiTotal}</span>
        </button>
      </div>

      {/* === TAB PACOTES === */}
      {activeTab === 'packs' && (
        <div>
          {packs.length === 0 ? (
            <div className="sae-empty">
              <div className="sae-empty-icon">📦</div>
              <p>Nenhum pacote criado ainda.</p>
              <button className="sae-btn sae-btn-primary" onClick={openCreatePack}>
                ➕ Criar Primeiro Pacote
              </button>
            </div>
          ) : (
            <div className="sae-packs-grid">
              {packs.map(pack => (
                <div key={pack.id} className={`sae-pack-card ${!pack.is_active ? 'inactive' : ''}`}>
                  <div className="sae-pack-top">
                    <div className="sae-pack-icon">{pack.icon || '📦'}</div>
                    <div className="sae-pack-info">
                      <h3>{pack.name}</h3>
                      <p>{pack.description || 'Sem descrição'}</p>
                    </div>
                  </div>
                  <div className="sae-pack-meta">
                    <div className="sae-pack-count">
                      ✨ {pack.emoji_count || 0} emoji{(pack.emoji_count || 0) !== 1 ? 's' : ''}
                      {!pack.is_active && <span style={{ color: '#ef4444', marginLeft: 8 }}>● Inativo</span>}
                    </div>
                    <div className="sae-pack-actions">
                      <button className="sae-btn sae-btn-sm sae-btn-secondary" onClick={() => handleTogglePackActive(pack)} title={pack.is_active ? 'Desativar' : 'Ativar'}>
                        {pack.is_active ? '🔴' : '🟢'}
                      </button>
                      <button className="sae-btn sae-btn-sm sae-btn-secondary" onClick={() => openEditPack(pack)} title="Editar">
                        ✏️
                      </button>
                      <button className="sae-btn sae-btn-sm sae-btn-danger" onClick={() => handleDeletePack(pack)} title="Deletar">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === TAB EMOJIS === */}
      {activeTab === 'emojis' && (
        <div>
          {/* Toolbar */}
          <div className="sae-toolbar">
            <input
              type="text"
              className="sae-search-input"
              placeholder="Buscar por nome, shortcode ou fallback..."
              value={emojiFilters.search}
              onChange={(e) => setEmojiFilters({ ...emojiFilters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchEmojis()}
            />
            <select
              className="sae-filter-select"
              value={emojiFilters.pack_id}
              onChange={(e) => setEmojiFilters({ ...emojiFilters, pack_id: e.target.value, page: 1 })}
            >
              <option value="">Todos os pacotes</option>
              {packs.map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.name} ({p.emoji_count || 0})</option>
              ))}
            </select>
            <button className="sae-btn sae-btn-secondary" onClick={handleSearchEmojis}>🔍 Buscar</button>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="sae-loading">
              <div className="spinner" />
              <p>Carregando emojis...</p>
            </div>
          ) : emojis.length === 0 ? (
            <div className="sae-empty">
              <div className="sae-empty-icon">✨</div>
              <p>Nenhum emoji encontrado.</p>
              <button className="sae-btn sae-btn-primary" onClick={openCreateEmoji} style={{ marginTop: 12 }}>
                ➕ Cadastrar Emoji
              </button>
            </div>
          ) : (
            <>
              {/* TABELA DESKTOP */}
              <table className="sae-emojis-table sae-desktop-only">
                <thead>
                  <tr>
                    <th>Emoji</th>
                    <th>Shortcode</th>
                    <th>Tipo</th>
                    <th>Pacote</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {emojis.map(emoji => (
                    <tr key={emoji.id}>
                      <td>
                        <div className="sae-emoji-cell">
                          <div className="sae-emoji-big">{emoji.fallback}</div>
                          <div className="sae-emoji-details">
                            <h4>{emoji.name}</h4>
                            <span>ID: {emoji.emoji_id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="sae-shortcode-badge">{emoji.shortcode}</span>
                      </td>
                      <td>
                        <span className={`sae-type-badge ${emoji.emoji_type}`}>
                          {emoji.emoji_type === 'animated' ? '✦ Animado' : '● Estático'}
                        </span>
                      </td>
                      <td>
                        {emoji.pack_name 
                          ? <span className="sae-pack-tag">{emoji.pack_name}</span>
                          : <span style={{ color: '#555' }}>—</span>
                        }
                      </td>
                      <td>
                        <span className={`sae-status-dot ${emoji.is_active ? 'active' : 'inactive'}`} />
                        {emoji.is_active ? 'Ativo' : 'Inativo'}
                      </td>
                      <td>
                        <div className="sae-actions-cell">
                          <button className="sae-btn sae-btn-sm sae-btn-secondary" onClick={() => handleToggleEmojiActive(emoji)} title={emoji.is_active ? 'Desativar' : 'Ativar'}>
                            {emoji.is_active ? '🔴' : '🟢'}
                          </button>
                          <button className="sae-btn sae-btn-sm sae-btn-secondary" onClick={() => openEditEmoji(emoji)} title="Editar">
                            ✏️
                          </button>
                          <button className="sae-btn sae-btn-sm sae-btn-danger" onClick={() => handleDeleteEmoji(emoji)} title="Remover">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* CARDS MOBILE */}
              <div className="sae-emoji-cards sae-mobile-only">
                {emojis.map(emoji => (
                  <div key={emoji.id} className="sae-emoji-card">
                    <div className="sae-ecard-top">
                      <div className="sae-ecard-emoji">{emoji.fallback}</div>
                      <div className="sae-ecard-info">
                        <h4>{emoji.name}</h4>
                        <span className="sae-shortcode-badge">{emoji.shortcode}</span>
                      </div>
                      <span className={`sae-status-dot ${emoji.is_active ? 'active' : 'inactive'}`} style={{ marginLeft: 'auto' }} />
                    </div>
                    <div className="sae-ecard-meta">
                      <span className={`sae-type-badge ${emoji.emoji_type}`}>
                        {emoji.emoji_type === 'animated' ? '✦ Animado' : '● Estático'}
                      </span>
                      {emoji.pack_name && <span className="sae-pack-tag">{emoji.pack_name}</span>}
                    </div>
                    <div className="sae-ecard-id">ID: {emoji.emoji_id}</div>
                    <div className="sae-ecard-actions">
                      <button className="sae-btn sae-btn-sm sae-btn-secondary" onClick={() => handleToggleEmojiActive(emoji)}>
                        {emoji.is_active ? '🔴 Desativar' : '🟢 Ativar'}
                      </button>
                      <button className="sae-btn sae-btn-sm sae-btn-secondary" onClick={() => openEditEmoji(emoji)}>
                        ✏️ Editar
                      </button>
                      <button className="sae-btn sae-btn-sm sae-btn-danger" onClick={() => handleDeleteEmoji(emoji)}>
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* === MODAL === */}
      {showModal && (
        <div className="sae-modal-overlay" onClick={() => !importing && setShowModal(false)}>
          <div className="sae-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* MODAL: PACOTE */}
            {(modalType === 'create_pack' || modalType === 'edit_pack') && (
              <>
                <div className="sae-modal-header">
                  <h3>{modalType === 'create_pack' ? '📦 Novo Pacote' : '✏️ Editar Pacote'}</h3>
                  <button className="pep-close-btn" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="sae-modal-body">
                  <div className="sae-field-row">
                    <div className="sae-field" style={{ flex: 0.3 }}>
                      <label>Ícone</label>
                      <input
                        type="text"
                        value={packForm.icon}
                        onChange={(e) => setPackForm({ ...packForm, icon: e.target.value })}
                        placeholder="📦"
                        maxLength={4}
                        style={{ textAlign: 'center', fontSize: '1.5rem' }}
                      />
                    </div>
                    <div className="sae-field" style={{ flex: 1 }}>
                      <label>Nome do Pacote *</label>
                      <input
                        type="text"
                        value={packForm.name}
                        onChange={(e) => setPackForm({ ...packForm, name: e.target.value })}
                        placeholder="Ex: Populares, Corações, Animais..."
                      />
                    </div>
                  </div>
                  <div className="sae-field">
                    <label>Descrição</label>
                    <input
                      type="text"
                      value={packForm.description}
                      onChange={(e) => setPackForm({ ...packForm, description: e.target.value })}
                      placeholder="Ex: Emojis premium mais usados"
                    />
                  </div>
                  <div className="sae-field">
                    <label>Ordem de Exibição</label>
                    <input
                      type="number"
                      value={packForm.sort_order}
                      onChange={(e) => setPackForm({ ...packForm, sort_order: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                    <small>Menor número = aparece primeiro</small>
                  </div>
                </div>
                <div className="sae-modal-footer">
                  <button className="sae-btn sae-btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="sae-btn sae-btn-primary" onClick={handleSavePack}>
                    {modalType === 'create_pack' ? '✅ Criar Pacote' : '💾 Salvar'}
                  </button>
                </div>
              </>
            )}

            {/* MODAL: EMOJI */}
            {(modalType === 'create_emoji' || modalType === 'edit_emoji') && (
              <>
                <div className="sae-modal-header">
                  <h3>{modalType === 'create_emoji' ? '✨ Novo Emoji Premium' : '✏️ Editar Emoji'}</h3>
                  <button className="pep-close-btn" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="sae-modal-body">
                  {/* Preview */}
                  {emojiForm.fallback && (
                    <div className="sae-emoji-preview">
                      <div className="sae-emoji-preview-big">{emojiForm.fallback}</div>
                      <div className="sae-emoji-preview-code">
                        {emojiForm.shortcode ? emojiForm.shortcode : ':shortcode:'}
                        {emojiForm.emoji_id && (
                          <><br />{'<tg-emoji emoji-id="' + emojiForm.emoji_id + '">' + emojiForm.fallback + '</tg-emoji>'}</>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="sae-field-row">
                    <div className="sae-field">
                      <label>Emoji ID do Telegram *</label>
                      <input
                        type="text"
                        value={emojiForm.emoji_id}
                        onChange={(e) => setEmojiForm({ ...emojiForm, emoji_id: e.target.value })}
                        placeholder="Ex: 5408846744727334338"
                      />
                      <small>Obtido via @JsonDumpBot</small>
                    </div>
                    <div className="sae-field" style={{ flex: 0.4 }}>
                      <label>Fallback *</label>
                      <input
                        type="text"
                        value={emojiForm.fallback}
                        onChange={(e) => setEmojiForm({ ...emojiForm, fallback: e.target.value })}
                        placeholder="🔥"
                        maxLength={4}
                        style={{ textAlign: 'center', fontSize: '1.5rem' }}
                      />
                      <small>Emoji normal</small>
                    </div>
                  </div>

                  <div className="sae-field-row">
                    <div className="sae-field">
                      <label>Nome *</label>
                      <input
                        type="text"
                        value={emojiForm.name}
                        onChange={(e) => setEmojiForm({ ...emojiForm, name: e.target.value })}
                        placeholder="Ex: Fogo Animado"
                      />
                    </div>
                    <div className="sae-field">
                      <label>Shortcode *</label>
                      <input
                        type="text"
                        value={emojiForm.shortcode}
                        onChange={(e) => setEmojiForm({ ...emojiForm, shortcode: e.target.value })}
                        placeholder="Ex: :fire_premium:"
                      />
                      <small>Formato: :nome:</small>
                    </div>
                  </div>

                  <div className="sae-field-row">
                    <div className="sae-field">
                      <label>Pacote</label>
                      <select
                        value={emojiForm.pack_id}
                        onChange={(e) => setEmojiForm({ ...emojiForm, pack_id: e.target.value ? parseInt(e.target.value) : '' })}
                      >
                        <option value="">Sem pacote</option>
                        {packs.map(p => (
                          <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sae-field">
                      <label>Tipo</label>
                      <select
                        value={emojiForm.emoji_type}
                        onChange={(e) => setEmojiForm({ ...emojiForm, emoji_type: e.target.value })}
                      >
                        <option value="animated">✦ Animado</option>
                        <option value="static">● Estático</option>
                      </select>
                    </div>
                  </div>

                  <div className="sae-field">
                    <label>Ordem no Pacote</label>
                    <input
                      type="number"
                      value={emojiForm.sort_order}
                      onChange={(e) => setEmojiForm({ ...emojiForm, sort_order: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                </div>
                <div className="sae-modal-footer">
                  <button className="sae-btn sae-btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="sae-btn sae-btn-primary" onClick={handleSaveEmoji}>
                    {modalType === 'create_emoji' ? '✅ Cadastrar Emoji' : '💾 Salvar'}
                  </button>
                </div>
              </>
            )}

            {/* MODAL: IMPORTAR PACK */}
            {modalType === 'import_pack' && (
              <>
                <div className="sae-modal-header">
                  <h3>📦 Importar Pack do Telegram</h3>
                  <button className="pep-close-btn" onClick={() => !importing && setShowModal(false)}>✕</button>
                </div>
                <div className="sae-modal-body">
                  <div className="sae-import-info">
                    <p>Cole o link de um pack de emojis premium do Telegram. Todos os emojis do pack serão importados automaticamente com shortcodes gerados.</p>
                    <div className="sae-import-example">
                      <strong>Exemplos de links válidos:</strong>
                      <code>https://t.me/addemoji/DecorationEmojiPack</code>
                      <code>https://t.me/addemoji/RestrictedEmoji</code>
                      <code>DecorationEmojiPack</code>
                    </div>
                  </div>

                  <div className="sae-field">
                    <label>Link do Pack *</label>
                    <input
                      type="text"
                      value={importForm.pack_link}
                      onChange={(e) => setImportForm({ ...importForm, pack_link: e.target.value })}
                      placeholder="https://t.me/addemoji/NomeDoPack"
                      disabled={importing}
                    />
                    <small>Cole o link completo ou apenas o nome do pack</small>
                  </div>

                  <div className="sae-field-row">
                    <div className="sae-field" style={{ flex: 0.3 }}>
                      <label>Ícone</label>
                      <input
                        type="text"
                        value={importForm.pack_icon}
                        onChange={(e) => setImportForm({ ...importForm, pack_icon: e.target.value })}
                        placeholder="📦"
                        maxLength={4}
                        style={{ textAlign: 'center', fontSize: '1.5rem' }}
                        disabled={importing}
                      />
                    </div>
                    <div className="sae-field" style={{ flex: 1 }}>
                      <label>Nome do Pacote (opcional)</label>
                      <input
                        type="text"
                        value={importForm.pack_name}
                        onChange={(e) => setImportForm({ ...importForm, pack_name: e.target.value })}
                        placeholder="Deixe vazio para usar o nome original do Telegram"
                        disabled={importing}
                      />
                      <small>Se vazio, usa o título do pack no Telegram</small>
                    </div>
                  </div>
                </div>
                <div className="sae-modal-footer">
                  <button className="sae-btn sae-btn-secondary" onClick={() => setShowModal(false)} disabled={importing}>
                    Cancelar
                  </button>
                  <button className="sae-btn sae-btn-import" onClick={handleImportPack} disabled={importing}>
                    {importing ? (
                      <><span className="sae-btn-spinner" /> Importando...</>
                    ) : (
                      '📦 Importar Pack Completo'
                    )}
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