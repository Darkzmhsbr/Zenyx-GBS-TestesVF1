import React, { useState, useEffect, useCallback, useRef } from 'react';
import { premiumEmojiService } from '../services/api';
import './PremiumEmojiPicker.css';

// ✨ MOTOR BLINDADO DE URL: Força a busca da imagem no domínio correto do Backend
const getEmojiAbsoluteUrl = (emoji, packName) => {
  const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';
  let rawUrl = emoji.file_url || emoji.url;
  
  if (!rawUrl && emoji.emoji_id) {
    const pName = packName || 'Outros';
    rawUrl = `/api/emojis/thumb/${encodeURIComponent(pName)}/${emoji.emoji_id}.webp`;
  }
  
  if (!rawUrl) return null;
  return rawUrl.startsWith('http') ? rawUrl : `${API_BASE}${rawUrl}`;
};

export function PremiumEmojiPicker({ onSelect, disabled = false, position = 'top', compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const panelRef = useRef(null);
  const searchTimeout = useRef(null);

  const loadCatalog = useCallback(async () => {
    if (catalog) return;
    setLoading(true);
    try {
      const data = await premiumEmojiService.getCatalog();
      setCatalog(data);
    } catch (error) {
      console.error('Erro ao carregar catálogo de emojis premium:', error);
    } finally {
      setLoading(false);
    }
  }, [catalog]);

  const handleToggle = () => {
    if (disabled) return;
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      loadCatalog();
      setSearchTerm('');
      setSearchResults(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    setSearchResults(null);
  };

  const handleEmojiClick = (emoji) => {
    if (onSelect) {
      onSelect(emoji.shortcode);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (!value || value.length < 2) {
      setSearchResults(null);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await premiumEmojiService.search(value);
        setSearchResults(data.emojis || []);
      } catch (error) {
        console.error('Erro na busca:', error);
      }
    }, 300);
  };

  const getVisibleEmojis = () => {
    if (searchResults !== null) {
      return [{ id: 0, name: 'Resultados', icon: '🔍', emojis: searchResults }];
    }
    if (!catalog || !catalog.packs) return [];
    
    if (activeTab === 'all') {
      return catalog.packs;
    }
    
    return catalog.packs.filter(p => p.id === activeTab);
  };

  const totalEmojis = catalog?.total_emojis || 0;
  const visiblePacks = getVisibleEmojis();

  const panelStyle = position === 'bottom' 
    ? { top: 'calc(100% + 8px)', bottom: 'auto' }
    : {};

  return (
    <div className="pep-trigger-wrapper">
      <button
        type="button"
        className={`pep-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        title="Inserir Emoji Premium ✨"
      >
        <span className="pep-icon">✨</span>
        {!compact && <span>Emoji Premium</span>}
        {!compact && totalEmojis > 0 && (
          <span className="pep-badge">PRO</span>
        )}
      </button>

      {isOpen && <div className="pep-overlay" onClick={handleClose} />}

      {isOpen && (
        <div className="pep-panel" ref={panelRef} style={panelStyle}>
          <div className="pep-header">
            <h4>✨ Emojis Premium</h4>
            <button className="pep-close-btn" onClick={handleClose}>✕</button>
          </div>

          <div className="pep-search">
            <input
              type="text"
              placeholder="Buscar emoji..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>

          {!searchResults && catalog && catalog.packs && catalog.packs.length > 1 && (
            <div className="pep-tabs">
              <button
                className={`pep-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <span className="tab-icon">📋</span> Todos
              </button>
              {catalog.packs.map(pack => (
                <button
                  key={pack.id}
                  className={`pep-tab ${activeTab === pack.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(pack.id)}
                  title={pack.name}
                >
                  <span className="tab-icon">{pack.icon || '📦'}</span>
                  <span style={{ display: 'none' }}>{pack.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="pep-grid-container">
            {loading ? (
              <div className="pep-loading">
                <div className="pep-spinner" />
                <span>Carregando emojis...</span>
              </div>
            ) : visiblePacks.length === 0 ? (
              <div className="pep-empty">
                <div className="pep-empty-icon">✨</div>
                {searchTerm 
                  ? 'Nenhum emoji encontrado para essa busca.'
                  : 'Nenhum emoji premium disponível ainda.'
                }
              </div>
            ) : (
              visiblePacks.map(pack => (
                <React.Fragment key={pack.id}>
                  {activeTab === 'all' && (
                    <div className="pep-pack-label">
                      {pack.icon} {pack.name}
                    </div>
                  )}
                  <div className="pep-grid">
                    {pack.emojis.map((emoji) => {
                      const duplicates = pack.emojis.filter(e => e.fallback === emoji.fallback);
                      const hasDuplicate = duplicates.length > 1;
                      const dupIndex = hasDuplicate ? duplicates.indexOf(emoji) + 1 : 0;
                      
                      // Aplica a URL Absoluta
                      const imgUrl = getEmojiAbsoluteUrl(emoji, pack.name);
                      
                      return (
                        <button
                          key={emoji.id}
                          className="pep-emoji-item"
                          onClick={() => handleEmojiClick(emoji)}
                          title={`${emoji.name} (${emoji.shortcode})`}
                        >
                          {imgUrl ? (
                            <img 
                              src={imgUrl} 
                              alt={emoji.shortcode} 
                              className="pep-emoji-img-real"
                              style={{ width: '28px', height: '28px', objectFit: 'contain', pointerEvents: 'none' }} 
                              loading="lazy" 
                            />
                          ) : (
                            <span className="pep-emoji-fallback-text">{emoji.fallback}</span>
                          )}

                          {hasDuplicate && (
                            <span className="pep-dup-badge">{dupIndex}</span>
                          )}
                          {emoji.emoji_type === 'animated' && (
                            <span className="pep-animated-dot" />
                          )}
                          <span className="pep-tooltip">
                            {emoji.name}<br/>{emoji.shortcode}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </React.Fragment>
              ))
            )}
          </div>

          <div className="pep-footer">
            <span className="pep-footer-text">
              Emojis Premium do Telegram
            </span>
            <span className="pep-footer-count">
              {totalEmojis} emoji{totalEmojis !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PremiumEmojiPicker;