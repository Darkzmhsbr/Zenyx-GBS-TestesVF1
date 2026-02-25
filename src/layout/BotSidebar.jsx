import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Search, Check, Plus, Power, GripVertical, Eye } from 'lucide-react';
import { botService } from '../services/api';

export function BotSidebar({ isOpen, onClose, bots, selectedBot, changeBot, botLimit, onCreateBot, refreshBots }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedId, setDraggedId] = useState(null);
  const [localBots, setLocalBots] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [showStats, setShowStats] = useState(null); // bot_id ou null
  const searchRef = useRef(null);

  // Sincroniza bots locais quando abre ou bots mudam
  useEffect(() => {
    if (isOpen) {
      setLocalBots([...bots]);
      setSearchTerm('');
      // Foca no campo de busca ao abrir
      setTimeout(() => searchRef.current?.focus(), 300);
    }
  }, [isOpen, bots]);

  // Filtra bots pelo termo de busca
  const filteredBots = localBots.filter(bot =>
    bot.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bot.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selecionar bot e fechar
  const handleSelectBot = (bot) => {
    changeBot(bot);
    onClose();
  };

  // ==========================================
  // 🚀 DRAG AND DROP & TOUCH MOBILE
  // ==========================================
  
  // Função centralizada para trocar a ordem visualmente
  const moveBot = (dragId, targetId) => {
    setLocalBots(prev => {
      const dragIdx = prev.findIndex(b => b.id === dragId);
      const targetIdx = prev.findIndex(b => b.id === targetId);
      if (dragIdx === -1 || targetIdx === -1) return prev;
      
      const newBots = [...prev];
      const [removed] = newBots.splice(dragIdx, 1);
      newBots.splice(targetIdx, 0, removed);
      return newBots;
    });
  };

  const handleDragStart = (e, botId) => {
    setDraggedId(botId);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e, targetId) => {
    if (e.preventDefault) e.preventDefault();
    if (draggedId === targetId) return;
    moveBot(draggedId, targetId);
  };

  // Salvar no backend e ATUALIZAR O FRONTEND
  const handleDragEnd = async () => {
    const currentDrag = draggedId;
    setDraggedId(null); // Limpa o estado de drag na hora para a interface
    
    if (!currentDrag) return;

    // Salva nova ordem no backend
    const orderIds = localBots.map(b => b.id);
    try {
      setSavingOrder(true);
      await botService.updateSelectorOrder(orderIds);
      
      // 🔥 O SEGREDO DO SALVAMENTO: Atualiza a lista global no Header/Contexto!
      if (refreshBots) {
        await refreshBots();
      }
    } catch (err) {
      console.error('Erro ao salvar ordem:', err);
    } finally {
      setSavingOrder(false);
    }
  };

  // --- EVENTOS EXCLUSIVOS PARA CELULAR (TOUCH) ---
  const handleTouchStart = (e, botId) => {
    // Evita scroll da tela ao segurar o ícone de arrastar
    setDraggedId(botId);
  };

  const handleTouchMove = (e) => {
    if (!draggedId) return;
    
    // Descobre onde o dedo está na tela
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    // Acha qual bot está embaixo do dedo no momento
    const targetItem = element.closest('.bot-sidebar-item');
    if (targetItem) {
      const targetId = Number(targetItem.getAttribute('data-id'));
      if (targetId && targetId !== draggedId) {
        moveBot(draggedId, targetId);
      }
    }
  };

  // Bloqueia scroll do body quando sidebar está aberta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* OVERLAY */}
      <div className="bot-sidebar-overlay" onClick={onClose} />

      {/* SIDEBAR */}
      <div className={`bot-sidebar ${isOpen ? 'open' : ''}`}>
        
        {/* HEADER */}
        <div className="bot-sidebar-header">
          <div>
            <h3>Todos os Bots</h3>
            {botLimit && (
              <span className="bot-sidebar-count">{botLimit.current}/{botLimit.max} bots</span>
            )}
          </div>
          <button className="bot-sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* BARRA DE BUSCA */}
        <div className="bot-sidebar-search">
          <Search size={16} className="search-icon" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar bot por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* INDICADOR DE BARRA DE PROGRESSO DO LIMITE */}
        {botLimit && (
          <div className="bot-sidebar-limit-bar">
            <div 
              className="bot-sidebar-limit-fill"
              style={{ 
                width: `${Math.min(100, (botLimit.current / botLimit.max) * 100)}%`,
                background: botLimit.current >= botLimit.max 
                  ? '#ef4444' 
                  : botLimit.current >= botLimit.max * 0.8 
                    ? '#f59e0b' 
                    : '#c333ff'
              }}
            />
          </div>
        )}

        {/* DICA DE DRAG */}
        {!searchTerm && bots.length > 1 && (
          <div className="bot-sidebar-drag-hint">
            <GripVertical size={12} />
            <span>Arraste para reordenar • Os 7 primeiros aparecem no seletor</span>
            {savingOrder && <span className="saving-indicator">Salvando...</span>}
          </div>
        )}

        {/* LISTA DE BOTS */}
        <div className="bot-sidebar-list">
          {filteredBots.length === 0 ? (
            <div className="bot-sidebar-empty">
              <Bot size={40} style={{ opacity: 0.2 }} />
              <p>{searchTerm ? 'Nenhum bot encontrado' : 'Nenhum bot cadastrado'}</p>
            </div>
          ) : (
            filteredBots.map((bot, index) => (
              <div
                key={bot.id}
                data-id={bot.id} /* 🔥 ESSENCIAL PARA O TOUCH DO MOBILE */
                className={`bot-sidebar-item ${selectedBot?.id === bot.id ? 'selected' : ''} ${draggedId === bot.id ? 'dragging' : ''}`}
                draggable={!searchTerm}
                onDragStart={(e) => handleDragStart(e, bot.id)}
                onDragOver={(e) => handleDragOver(e, bot.id)}
                onDragEnd={handleDragEnd}
                onTouchMove={handleTouchMove} /* 🔥 EVENTO DE ARRASTAR NO CELULAR */
                onTouchEnd={handleDragEnd}    /* 🔥 SALVAR AO SOLTAR NO CELULAR */
              >
                {/* DRAG HANDLE */}
                {!searchTerm && (
                  <div 
                    className="bot-sidebar-drag-handle"
                    onTouchStart={(e) => handleTouchStart(e, bot.id)} /* 🔥 INICIA O ARRASTO NO CELULAR */
                  >
                    <GripVertical size={14} />
                  </div>
                )}

                {/* NUMERAL DE POSIÇÃO */}
                {!searchTerm && (
                  <div className={`bot-sidebar-position ${index < 7 ? 'visible' : 'hidden-pos'}`}>
                    {index + 1}
                  </div>
                )}

                {/* AVATAR */}
                <div className={`bot-sidebar-avatar ${bot.status === 'ativo' ? 'active' : 'inactive'}`}>
                  <Bot size={16} />
                </div>

                {/* INFO */}
                <div className="bot-sidebar-info" onClick={() => handleSelectBot(bot)}>
                  <span className="bot-sidebar-name">{bot.nome}</span>
                  <span className="bot-sidebar-username">
                    @{bot.username || 'sem_user'}
                    {index < 7 && !searchTerm && <span className="in-selector-badge">no seletor</span>}
                  </span>
                </div>

                {/* STATUS */}
                <div className="bot-sidebar-status-area">
                  {selectedBot?.id === bot.id && (
                    <div className="bot-sidebar-selected-badge">
                      <Check size={12} /> Ativo
                    </div>
                  )}
                  <div className={`bot-sidebar-status-dot ${bot.status === 'ativo' ? 'online' : 'offline'}`} 
                       title={bot.status === 'ativo' ? 'Online' : 'Parado'} />
                </div>

                {/* BOTÃO VISÃO GERAL */}
                <button 
                  className="bot-sidebar-eye-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStats(showStats === bot.id ? null : bot.id);
                  }}
                  title="Visão geral"
                >
                  <Eye size={14} />
                </button>

                {/* VISÃO GERAL EXPANDIDA */}
                {showStats === bot.id && (
                  <div className="bot-sidebar-stats-panel" onClick={(e) => e.stopPropagation()}>
                    <div className="bot-stats-row">
                      <span>Leads</span>
                      <strong>{bot.leads || 0}</strong>
                    </div>
                    <div className="bot-stats-row">
                      <span>Faturamento</span>
                      <strong>R$ {typeof bot.revenue === 'number' ? (bot.revenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</strong>
                    </div>
                    <div className="bot-stats-row">
                      <span>Status</span>
                      <strong style={{ color: bot.status === 'ativo' ? '#10b981' : '#ef4444' }}>
                        {bot.status === 'ativo' ? 'Online' : 'Parado'}
                      </strong>
                    </div>
                    <div className="bot-stats-row">
                      <span>Criado em</span>
                      <strong>{bot.created_at ? new Date(bot.created_at).toLocaleDateString('pt-BR') : '—'}</strong>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* FOOTER: CRIAR NOVO BOT */}
        <div className="bot-sidebar-footer">
          <button 
            className={`bot-sidebar-create-btn ${botLimit && !botLimit.can_create ? 'disabled' : ''}`}
            onClick={onCreateBot}
            disabled={botLimit && !botLimit.can_create}
          >
            <Plus size={18} />
            <span>Criar Novo Bot</span>
            {botLimit && !botLimit.can_create && (
              <span className="limit-badge">LIMITE</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}