import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { remarketingService, botService } from '../services/api';
import './Remarketing.css';

// Ícones (usando Unicode)
const Icons = {
  Save: '💾',
  Rocket: '🚀',
  Message: '💬',
  Photo: '🖼️',
  Video: '🎥',
  Clock: '⏰',
  Trash: '🗑️',
  Plus: '➕',
  Check: '✅',
  Alert: '⚠️',
  Chart: '📊',
  Fire: '🔥',
  Money: '💰',
  Users: '👥',
  Star: '⭐'
};

export function Remarketing() {
  const { selectedBot } = useBot();
  
  // Estados para Disparo Automático
  const [remarketingConfig, setRemarketingConfig] = useState({
    is_active: false,
    message_text: '',
    media_url: '',
    media_type: null,
    delay_minutes: 5,
    auto_destruct_seconds: 0,
    promo_values: {}
  });
  
  // Estados para Mensagens Alternantes
  const [alternatingConfig, setAlternatingConfig] = useState({
    is_active: false,
    messages: [],
    rotation_interval_seconds: 15,
    stop_before_remarketing_seconds: 60,
    auto_destruct_final: false
  });
  
  // Estados para Analytics
  const [stats, setStats] = useState({
    total_sent: 0,
    total_converted: 0,
    conversion_rate: 0,
    today_sent: 0,
    recent_logs: []
  });
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState('disparo'); // 'disparo', 'alternating', 'analytics'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planos, setPlanos] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Carregar dados ao iniciar ou trocar bot
  useEffect(() => {
    if (selectedBot) {
      loadAllData();
    }
  }, [selectedBot]);
  
  // Função principal de carregamento
  async function loadAllData() {
    if (!selectedBot?.id) return;
    
    setLoading(true);
    
    try {
      // Carregar configurações em paralelo
      const [remarketing, alternating, statistics, planosData] = await Promise.all([
        remarketingService.getRemarketingConfig(selectedBot.id),
        remarketingService.getAlternatingMessages(selectedBot.id),
        remarketingService.getRemarketingStats(selectedBot.id),
        botService.buscarPlanos(selectedBot.id)
      ]);
      
      setRemarketingConfig(remarketing);
      setAlternatingConfig(alternating);
      setStats(statistics);
      setPlanos(planosData);
      
      console.log('✅ Dados de remarketing carregados:', { remarketing, alternating, statistics });
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      alert('Erro ao carregar configurações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }
  
  // =========================================================
  // FUNÇÕES DE SALVAMENTO
  // =========================================================
  
  async function handleSaveRemarketing() {
    if (!selectedBot?.id) return;
    
    // Validações
    if (remarketingConfig.is_active) {
      if (!remarketingConfig.message_text.trim()) {
        alert('Por favor, adicione uma mensagem de remarketing.');
        return;
      }
      
      if (remarketingConfig.delay_minutes < 1 || remarketingConfig.delay_minutes > 1440) {
        alert('O intervalo deve estar entre 1 e 1440 minutos (24 horas).');
        return;
      }
      
      if (remarketingConfig.media_url && !remarketingConfig.media_type) {
        alert('Por favor, selecione o tipo de mídia (Foto ou Vídeo).');
        return;
      }
    }
    
    setSaving(true);
    
    try {
      await remarketingService.saveRemarketingConfig(selectedBot.id, remarketingConfig);
      alert('✅ Configuração de disparo automático salva com sucesso!');
      console.log('✅ Remarketing salvo:', remarketingConfig);
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      alert('Erro ao salvar configuração: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  }
  
  async function handleSaveAlternating() {
    if (!selectedBot?.id) return;
    
    // Validações
    if (alternatingConfig.is_active) {
      if (alternatingConfig.messages.length < 2) {
        alert('São necessárias pelo menos 2 mensagens para ativar a alternação.');
        return;
      }
      
      if (alternatingConfig.rotation_interval_seconds < 5 || alternatingConfig.rotation_interval_seconds > 300) {
        alert('O intervalo de rotação deve estar entre 5 e 300 segundos.');
        return;
      }
    }
    
    setSaving(true);
    
    try {
      await remarketingService.saveAlternatingMessages(selectedBot.id, alternatingConfig);
      alert('✅ Configuração de mensagens alternantes salva com sucesso!');
      console.log('✅ Alternating salvo:', alternatingConfig);
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      alert('Erro ao salvar configuração: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  }
  
  // =========================================================
  // FUNÇÕES DE MANIPULAÇÃO DE MENSAGENS ALTERNANTES
  // =========================================================
  
  function handleAddMessage() {
    if (!newMessage.trim()) {
      alert('Digite uma mensagem antes de adicionar.');
      return;
    }
    
    setAlternatingConfig(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage.trim()]
    }));
    
    setNewMessage('');
  }
  
  function handleRemoveMessage(index) {
    setAlternatingConfig(prev => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index)
    }));
  }
  
  function handleEditMessage(index, newText) {
    setAlternatingConfig(prev => ({
      ...prev,
      messages: prev.messages.map((msg, i) => i === index ? newText : msg)
    }));
  }
  
  // =========================================================
  // FUNÇÕES DE PREÇOS PROMOCIONAIS
  // =========================================================
  
  function handlePromoValueChange(planoId, value) {
    setRemarketingConfig(prev => ({
      ...prev,
      promo_values: {
        ...prev.promo_values,
        [planoId]: parseFloat(value) || 0
      }
    }));
  }
  
  function handleTogglePromo(planoId) {
    setRemarketingConfig(prev => {
      const newPromoValues = { ...prev.promo_values };
      
      if (newPromoValues[planoId]) {
        delete newPromoValues[planoId];
      } else {
        // Busca o plano para pegar o valor original
        const plano = planos.find(p => p.id === planoId);
        newPromoValues[planoId] = plano ? plano.valor * 0.7 : 0; // 30% de desconto padrão
      }
      
      return {
        ...prev,
        promo_values: newPromoValues
      };
    });
  }
  
  // =========================================================
  // RENDERIZAÇÃO CONDICIONAL
  // =========================================================
  
  if (!selectedBot) {
    return (
      <div className="remarketing-container">
        <div className="alert alert-warning">
          <span>{Icons.Alert}</span>
          <p>Por favor, selecione um bot na barra lateral para configurar o remarketing.</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="remarketing-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }
  
  // =========================================================
  // RENDER PRINCIPAL
  // =========================================================
  
  return (
    <div className="remarketing-container">
      {/* Header */}
      <div className="remarketing-header">
        <div className="header-titles">
          <h1>{Icons.Rocket} Remarketing Automático</h1>
          <p>Configure disparos automáticos para recuperar vendas abandonadas</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-save-main"
            onClick={activeTab === 'disparo' ? handleSaveRemarketing : handleSaveAlternating}
            disabled={saving || activeTab === 'analytics'}
          >
            <span>{Icons.Save}</span>
            <span className="btn-text">{saving ? 'Salvando...' : 'Salvar Configuração'}</span>
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="remarketing-tabs">
        <button 
          className={`tab-button ${activeTab === 'disparo' ? 'active' : ''}`}
          onClick={() => setActiveTab('disparo')}
        >
          <span>{Icons.Rocket}</span>
          Disparo Automático
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'alternating' ? 'active' : ''}`}
          onClick={() => setActiveTab('alternating')}
        >
          <span>{Icons.Message}</span>
          Mensagens Alternantes
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span>{Icons.Chart}</span>
          Analytics
        </button>
      </div>
      
      {/* Conteúdo das Abas */}
      <div className="remarketing-content">
        
        {/* ===================================================== */}
        {/* ABA 1: DISPARO AUTOMÁTICO */}
        {/* ===================================================== */}
        {activeTab === 'disparo' && (
          <div className="tab-content">
            
            {/* Toggle Ativar/Desativar */}
            <div className="config-card">
              <div className="toggle-wrapper full-width">
                <label htmlFor="remarketing-active">
                  {Icons.Rocket} Ativar Disparo Automático
                </label>
                <div 
                  className={`custom-toggle ${remarketingConfig.is_active ? 'active-green' : ''}`}
                  onClick={() => setRemarketingConfig(prev => ({ ...prev, is_active: !prev.is_active }))}
                >
                  <div className="toggle-handle"></div>
                  <span className="toggle-label">{remarketingConfig.is_active ? 'ON' : 'OFF'}</span>
                </div>
              </div>
              
              {remarketingConfig.is_active && (
                <div className="hint-text">
                  <span>{Icons.Check}</span>
                  <span>Sistema ativo! Disparos serão enviados automaticamente para carrinhos abandonados.</span>
                </div>
              )}
            </div>
            
            {/* Configurações (só aparecem se ativo) */}
            {remarketingConfig.is_active && (
              <>
                {/* Editor de Texto (igual ChatFlow) */}
                <div className="config-card">
                  <label className="config-label">
                    {Icons.Message} Mensagem de Remarketing
                  </label>
                  
                  <div className="text-editor-toolbar">
                    <button 
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('remarketing-message');
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = remarketingConfig.message_text;
                        const before = text.substring(0, start);
                        const selected = text.substring(start, end);
                        const after = text.substring(end);
                        
                        setRemarketingConfig(prev => ({
                          ...prev,
                          message_text: `${before}<b>${selected || 'texto em negrito'}</b>${after}`
                        }));
                      }}
                      title="Negrito"
                    >
                      <strong>B</strong>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('remarketing-message');
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = remarketingConfig.message_text;
                        const before = text.substring(0, start);
                        const selected = text.substring(start, end);
                        const after = text.substring(end);
                        
                        setRemarketingConfig(prev => ({
                          ...prev,
                          message_text: `${before}<i>${selected || 'texto em itálico'}</i>${after}`
                        }));
                      }}
                      title="Itálico"
                    >
                      <em>I</em>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('remarketing-message');
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = remarketingConfig.message_text;
                        const before = text.substring(0, start);
                        const selected = text.substring(start, end);
                        const after = text.substring(end);
                        
                        setRemarketingConfig(prev => ({
                          ...prev,
                          message_text: `${before}<code>${selected || 'código'}</code>${after}`
                        }));
                      }}
                      title="Código"
                    >
                      {'</>'}
                    </button>
                  </div>
                  
                  <textarea
                    id="remarketing-message"
                    className="input-field textarea-large"
                    rows={8}
                    value={remarketingConfig.message_text}
                    onChange={(e) => setRemarketingConfig(prev => ({ ...prev, message_text: e.target.value }))}
                    placeholder="Digite a mensagem que será enviada para recuperar o cliente...&#10;&#10;Variáveis disponíveis:&#10;{first_name} - Nome do cliente&#10;{plano_original} - Nome do plano escolhido&#10;{valor_original} - Valor original"
                  />
                  
                  <div className="hint-text">
                    <span>{Icons.Alert}</span>
                    <span>Use as variáveis para personalizar: {'{first_name}'}, {'{plano_original}'}, {'{valor_original}'}</span>
                  </div>
                </div>
                
                {/* Mídia */}
                <div className="config-card">
                  <label className="config-label">
                    {Icons.Photo} Mídia (Opcional)
                  </label>
                  
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <input
                        type="url"
                        className="input-field"
                        value={remarketingConfig.media_url || ''}
                        onChange={(e) => setRemarketingConfig(prev => ({ ...prev, media_url: e.target.value }))}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    
                    <div className="form-group" style={{ flex: 1 }}>
                      <select
                        className="input-field"
                        value={remarketingConfig.media_type || ''}
                        onChange={(e) => setRemarketingConfig(prev => ({ ...prev, media_type: e.target.value || null }))}
                      >
                        <option value="">Sem mídia</option>
                        <option value="photo">🖼️ Foto</option>
                        <option value="video">🎥 Vídeo</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="hint-text">
                    <span>{Icons.Alert}</span>
                    <span>Cole o link direto da imagem ou vídeo hospedado online</span>
                  </div>
                </div>
                
                {/* Preços Promocionais */}
                <div className="config-card">
                  <label className="config-label">
                    {Icons.Money} Preços Promocionais
                  </label>
                  
                  {planos.length === 0 ? (
                    <div className="alert alert-warning">
                      <span>{Icons.Alert}</span>
                      <p>Nenhum plano cadastrado. Configure planos primeiro.</p>
                    </div>
                  ) : (
                    <div className="promo-grid">
                      {planos.map(plano => {
                        const isActive = remarketingConfig.promo_values[plano.id] !== undefined;
                        const promoValue = remarketingConfig.promo_values[plano.id] || (plano.valor * 0.7);
                        
                        return (
                          <div key={plano.id} className={`promo-card ${isActive ? 'active' : ''}`}>
                            <div className="promo-card-header">
                              <div className="promo-info">
                                <strong>{plano.nome_exibicao}</strong>
                                <span className="original-price">R$ {plano.valor.toFixed(2)}</span>
                              </div>
                              
                              <div 
                                className={`custom-toggle small ${isActive ? 'active-green' : ''}`}
                                onClick={() => handleTogglePromo(plano.id)}
                              >
                                <div className="toggle-handle"></div>
                              </div>
                            </div>
                            
                            {isActive && (
                              <div className="promo-card-body">
                                <label>Preço Promocional:</label>
                                <div className="input-with-prefix">
                                  <span>R$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className="input-field"
                                    value={promoValue}
                                    onChange={(e) => handlePromoValueChange(plano.id, e.target.value)}
                                  />
                                </div>
                                
                                <div className="promo-savings">
                                  {Icons.Fire} Economia: R$ {(plano.valor - promoValue).toFixed(2)} ({((1 - promoValue / plano.valor) * 100).toFixed(0)}%)
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Timing */}
                <div className="config-card">
                  <label className="config-label">
                    {Icons.Clock} Configurações de Tempo
                  </label>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Aguardar (minutos)</label>
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        className="input-field"
                        value={remarketingConfig.delay_minutes}
                        onChange={(e) => setRemarketingConfig(prev => ({ 
                          ...prev, 
                          delay_minutes: parseInt(e.target.value) || 1 
                        }))}
                      />
                      <div className="hint-text">
                        <span>{Icons.Clock}</span>
                        <span>Tempo após abandono do carrinho</span>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Auto-destruir após (segundos)</label>
                      <input
                        type="number"
                        min="0"
                        className="input-field"
                        value={remarketingConfig.auto_destruct_seconds}
                        onChange={(e) => setRemarketingConfig(prev => ({ 
                          ...prev, 
                          auto_destruct_seconds: parseInt(e.target.value) || 0 
                        }))}
                      />
                      <div className="hint-text">
                        <span>{Icons.Trash}</span>
                        <span>0 = não auto-destruir</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
          </div>
        )}
        
        {/* ===================================================== */}
        {/* ABA 2: MENSAGENS ALTERNANTES */}
        {/* ===================================================== */}
        {activeTab === 'alternating' && (
          <div className="tab-content">
            
            {/* Toggle Ativar/Desativar */}
            <div className="config-card">
              <div className="toggle-wrapper full-width">
                <label htmlFor="alternating-active">
                  {Icons.Message} Ativar Mensagens Alternantes
                </label>
                <div 
                  className={`custom-toggle ${alternatingConfig.is_active ? 'active-green' : ''}`}
                  onClick={() => setAlternatingConfig(prev => ({ ...prev, is_active: !prev.is_active }))}
                >
                  <div className="toggle-handle"></div>
                  <span className="toggle-label">{alternatingConfig.is_active ? 'ON' : 'OFF'}</span>
                </div>
              </div>
              
              <div className="hint-text">
                <span>{Icons.Alert}</span>
                <span>
                  Mensagens que alternam na mesma bolha enquanto o usuário aguarda o disparo automático.
                  Mantém o cliente engajado!
                </span>
              </div>
            </div>
            
            {/* Configurações */}
            {alternatingConfig.is_active && (
              <>
                {/* Lista de Mensagens */}
                <div className="config-card">
                  <label className="config-label">
                    {Icons.Message} Mensagens para Alternar (mínimo 2)
                  </label>
                  
                  <div className="messages-list">
                    {alternatingConfig.messages.map((msg, index) => (
                      <div key={index} className="message-item">
                        <div className="message-number">{index + 1}</div>
                        
                        <textarea
                          className="input-field message-textarea"
                          rows={3}
                          value={msg}
                          onChange={(e) => handleEditMessage(index, e.target.value)}
                          placeholder={`Mensagem ${index + 1}`}
                        />
                        
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => handleRemoveMessage(index)}
                          title="Remover mensagem"
                        >
                          {Icons.Trash}
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Adicionar Nova Mensagem */}
                  <div className="add-message-box">
                    <textarea
                      className="input-field"
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite uma nova mensagem para adicionar..."
                    />
                    
                    <button
                      type="button"
                      className="btn-add"
                      onClick={handleAddMessage}
                    >
                      <span>{Icons.Plus}</span>
                      <span>Adicionar Mensagem</span>
                    </button>
                  </div>
                  
                  {alternatingConfig.messages.length < 2 && (
                    <div className="alert alert-warning">
                      <span>{Icons.Alert}</span>
                      <p>Adicione pelo menos 2 mensagens para ativar a alternação.</p>
                    </div>
                  )}
                </div>
                
                {/* Configurações de Timing */}
                <div className="config-card">
                  <label className="config-label">
                    {Icons.Clock} Configurações de Alternação
                  </label>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Alternar a cada (segundos)</label>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        className="input-field"
                        value={alternatingConfig.rotation_interval_seconds}
                        onChange={(e) => setAlternatingConfig(prev => ({ 
                          ...prev, 
                          rotation_interval_seconds: parseInt(e.target.value) || 15 
                        }))}
                      />
                      <div className="hint-text">
                        <span>{Icons.Clock}</span>
                        <span>Intervalo entre cada troca (5-300s)</span>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Parar X segundos antes do disparo</label>
                      <input
                        type="number"
                        min="0"
                        className="input-field"
                        value={alternatingConfig.stop_before_remarketing_seconds}
                        onChange={(e) => setAlternatingConfig(prev => ({ 
                          ...prev, 
                          stop_before_remarketing_seconds: parseInt(e.target.value) || 60 
                        }))}
                      />
                      <div className="hint-text">
                        <span>{Icons.Alert}</span>
                        <span>Para evitar conflito com o disparo</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Auto-destruir */}
                  <div className="toggle-wrapper full-width" style={{ marginTop: '20px' }}>
                    <label>
                      {Icons.Trash} Auto-destruir mensagem ao parar
                    </label>
                    <div 
                      className={`custom-toggle ${alternatingConfig.auto_destruct_final ? 'active' : ''}`}
                      onClick={() => setAlternatingConfig(prev => ({ 
                        ...prev, 
                        auto_destruct_final: !prev.auto_destruct_final 
                      }))}
                    >
                      <div className="toggle-handle"></div>
                      <span className="toggle-label">{alternatingConfig.auto_destruct_final ? 'SIM' : 'NÃO'}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            
          </div>
        )}
        
        {/* ===================================================== */}
        {/* ABA 3: ANALYTICS */}
        {/* ===================================================== */}
        {activeTab === 'analytics' && (
          <div className="tab-content">
            
            {/* Cards de Estatísticas */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">{Icons.Rocket}</div>
                <div className="stat-info">
                  <div className="stat-label">Total Enviados</div>
                  <div className="stat-value">{stats.total_sent}</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">{Icons.Money}</div>
                <div className="stat-info">
                  <div className="stat-label">Conversões</div>
                  <div className="stat-value">{stats.total_converted}</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">{Icons.Chart}</div>
                <div className="stat-info">
                  <div className="stat-label">Taxa de Conversão</div>
                  <div className="stat-value">{stats.conversion_rate}%</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">{Icons.Fire}</div>
                <div className="stat-info">
                  <div className="stat-label">Hoje</div>
                  <div className="stat-value">{stats.today_sent}</div>
                </div>
              </div>
            </div>
            
            {/* Histórico Recente */}
            <div className="config-card">
              <label className="config-label">
                {Icons.Chart} Histórico Recente
              </label>
              
              {stats.recent_logs.length === 0 ? (
                <div className="alert alert-info">
                  <span>{Icons.Alert}</span>
                  <p>Nenhum disparo realizado ainda. Configure e ative o remarketing para começar!</p>
                </div>
              ) : (
                <div className="logs-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID Usuário</th>
                        <th>Data/Hora</th>
                        <th>Status</th>
                        <th>Converteu?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_logs.map(log => (
                        <tr key={log.id}>
                          <td>{log.user_telegram_id}</td>
                          <td>{new Date(log.sent_at).toLocaleString('pt-BR')}</td>
                          <td>
                            <span className={`status-badge ${log.status}`}>
                              {log.status === 'sent' && Icons.Check}
                              {log.status === 'error' && Icons.Alert}
                              {log.status}
                            </span>
                          </td>
                          <td>
                            {log.converted ? (
                              <span className="converted-yes">{Icons.Check} Sim</span>
                            ) : (
                              <span className="converted-no">❌ Não</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
          </div>
        )}
        
      </div>
    </div>
  );
}