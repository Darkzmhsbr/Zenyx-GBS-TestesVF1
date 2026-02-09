import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { remarketingAutoService, planService } from '../services/api';
import { RichInput } from '../components/RichInput'; // 🔥 IMPORTAÇÃO DO COMPONENTE RICO
import './AutoRemarketingPage.css';

// Ícones (Unicode)
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
  Star: '⭐',
  Bomb: '💣',
  Stop: '🛑'
};

// Objetos padrão para evitar erros de inicialização
const DEFAULT_DISPARO = {
  is_active: false,
  message_text: '',
  media_url: '',
  media_type: null,
  delay_minutes: 5,
  auto_destruct_enabled: false,      // ✅ NOVO
  auto_destruct_seconds: 3,          // ✅ NOVO
  auto_destruct_after_click: true,   // ✅ NOVO
  promo_values: {} 
};

const DEFAULT_ALTERNATING = {
  is_active: false,
  messages: [],
  rotation_interval_seconds: 15,
  stop_before_remarketing_seconds: 60,
  auto_destruct_final: false,
  // ✅ NOVOS CAMPOS PARA DESTRUIÇÃO FINAL
  last_message_auto_destruct: false,
  last_message_destruct_seconds: 60,
  // ✅ NOVO CAMPO PARA DURAÇÃO INDEPENDENTE
  max_duration_minutes: 60
};

export function AutoRemarketing() {
  const { selectedBot } = useBot();
  
  // Estados Inicializados com Defaults Seguros
  const [disparoConfig, setDisparoConfig] = useState(DEFAULT_DISPARO);
  const [alternatingConfig, setAlternatingConfig] = useState(DEFAULT_ALTERNATING);
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState('disparo'); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planos, setPlanos] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stats, setStats] = useState({
    total_sent: 0,
    total_converted: 0,
    conversion_rate: 0,
    today_sent: 0,
    total_revenue: 0,
    recent_logs: [],
    logs: [] // Fallback
  });
  
  // Carregar dados ao iniciar
  useEffect(() => {
    if (selectedBot) {
      loadAllData();
    }
  }, [selectedBot]);
  
  async function loadAllData() {
    if (!selectedBot?.id) return;
    
    setLoading(true);
    
    try {
      const [remarketing, alternating, planosData, statistics] = await Promise.all([
        remarketingAutoService.getRemarketingConfig(selectedBot.id),
        remarketingAutoService.getAlternatingMessages(selectedBot.id),
        planService.listPlans(selectedBot.id),
        remarketingAutoService.getRemarketingStats(selectedBot.id)
      ]);
      
      // Validação de dados vindos da API
      setDisparoConfig(remarketing || DEFAULT_DISPARO);
      
      // Merge com defaults para garantir que os novos campos existam
      setAlternatingConfig({
          ...DEFAULT_ALTERNATING,
          ...(alternating || {})
      });

      setPlanos(Array.isArray(planosData) ? planosData : []); 
      
      // Garante estrutura mínima para stats
      const safeStats = statistics || {};
      setStats({
          total_sent: safeStats.total_sent || 0,
          total_converted: safeStats.total_converted || 0,
          conversion_rate: safeStats.conversion_rate || 0,
          today_sent: safeStats.today_sent || 0,
          total_revenue: safeStats.total_revenue || 0,
          recent_logs: safeStats.recent_logs || [],
          logs: safeStats.logs || safeStats.recent_logs || [] // Compatibilidade
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }
  
  // =========================================================
  // FUNÇÕES DE SALVAMENTO
  // =========================================================
  
  async function handleSaveDisparo() {
    if (!selectedBot?.id) return;
    
    if (disparoConfig.is_active) {
      if (!disparoConfig.message_text.trim()) {
        alert('Por favor, adicione uma mensagem de remarketing.');
        return;
      }
      
      if (disparoConfig.delay_minutes < 1 || disparoConfig.delay_minutes > 1440) {
        alert('O intervalo deve estar entre 1 e 1440 minutos.');
        return;
      }
    }
    
    setSaving(true);
    
    try {
      const payload = {
          ...disparoConfig,
          promo_values: disparoConfig.promo_values || {}
      };
      
      await remarketingAutoService.saveRemarketingConfig(selectedBot.id, payload);
      alert('✅ Configuração de disparo automático salva!');
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      alert('Erro ao salvar. Verifique o console.');
    } finally {
      setSaving(false);
    }
  }
  
  async function handleSaveAlternating() {
    if (!selectedBot?.id) return;
    
    if (alternatingConfig.is_active) {
      if (alternatingConfig.messages.length < 2) {
        alert('São necessárias pelo menos 2 mensagens.');
        return;
      }
      
      // ✅ VALIDAÇÃO: Se remarketing está INATIVO, é obrigatório ter max_duration_minutes
      if (!disparoConfig.is_active) {
        if (!alternatingConfig.max_duration_minutes || alternatingConfig.max_duration_minutes < 1) {
          alert('⚠️ Quando o Disparo Automático está desativado, é obrigatório definir a "Duração Total" das mensagens alternantes (mínimo 1 minuto).');
          return;
        }
      }
    }
    
    setSaving(true);
    
    try {
      // ✅ LOG DE DEBUG NO FRONTEND
      console.log('🔍 [FRONTEND-DEBUG] Salvando alternating config:', alternatingConfig);
      
      await remarketingAutoService.saveAlternatingMessages(selectedBot.id, alternatingConfig);
      alert('✅ Mensagens alternantes salvas!');
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      alert('Erro ao salvar mensagens.');
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // FUNÇÕES DE MANIPULAÇÃO DE MENSAGENS ALTERNANTES
  // =========================================================
  
  function addMessage() {
    if (!newMessage.trim()) return;
    
    setAlternatingConfig(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage.trim()]
    }));
    setNewMessage('');
  }
  
  function removeMessage(index) {
    setAlternatingConfig(prev => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index)
    }));
  }
  
  function editMessage(index, newContent) {
    setAlternatingConfig(prev => ({
      ...prev,
      messages: prev.messages.map((msg, i) => i === index ? newContent : msg)
    }));
  }
  
  // =========================================================
  // COMPONENTE PRINCIPAL
  // =========================================================
  
  if (loading) {
    return (
      <div className="remarketing-container">
        <div style={{textAlign:'center', padding:'50px'}}>
          <div className="spinner"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }
  
  if (!selectedBot) {
    return (
      <div className="remarketing-container">
        <div className="empty-state">
          <div className="empty-icon">{Icons.Alert}</div>
          <h2>Nenhum bot selecionado</h2>
          <p>Por favor, selecione um bot para configurar o remarketing automático.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="remarketing-container">
      <div className="page-header">
        <div className="page-title">
          <h1>{Icons.Fire} Auto-Remarketing</h1>
          <p>Configure mensagens automáticas de reengajamento para recuperar vendas perdidas</p>
        </div>
      </div>
      
      <div className="remarketing-content">
        {/* === TABS === */}
        <div className="tabs">
          <button 
            className={activeTab === 'disparo' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('disparo')}
          >
            {Icons.Rocket} Disparo Automático
          </button>
          <button 
            className={activeTab === 'alternating' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('alternating')}
          >
            {Icons.Message} Mensagens Alternantes
          </button>
          <button 
            className={activeTab === 'analytics' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('analytics')}
          >
            {Icons.Chart} Analytics
          </button>
        </div>
        
        {/* === ABA 1: DISPARO AUTOMÁTICO === */}
        {activeTab === 'disparo' && (
          <div className="tab-content">
            <div className="config-card">
              <div className="card-header">
                <h3>🎯 Configuração do Disparo</h3>
                <div className="switch-wrapper">
                  <span className="switch-label">Ativar Disparo Automático</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={disparoConfig.is_active}
                      onChange={e => setDisparoConfig({...disparoConfig, is_active: e.target.checked})}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
              
              {disparoConfig.is_active && (
                <div className="card-body">
                  {/* Timing */}
                  <div className="form-group">
                    <label>{Icons.Clock} Aguardar quanto tempo antes de enviar? (minutos)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={disparoConfig.delay_minutes}
                      onChange={e => setDisparoConfig({...disparoConfig, delay_minutes: parseInt(e.target.value)||5})}
                      min="1"
                      max="1440"
                    />
                    <small className="field-hint">Ex: 5 minutos após o PIX ser gerado</small>
                  </div>
                  
                  {/* Mensagem */}
                  <div className="form-group">
                    <label>{Icons.Message} Mensagem de Remarketing</label>
                    <RichInput 
                      value={disparoConfig.message_text}
                      onChange={(text) => setDisparoConfig({...disparoConfig, message_text: text})}
                      placeholder="Olá {nome}! Notamos que você ainda não finalizou seu pagamento..."
                    />
                    <small className="field-hint">Use {'{nome}'} para personalizar</small>
                  </div>
                  
                  {/* Mídia */}
                  <div className="form-group">
                    <label>{Icons.Photo} Tipo de Mídia</label>
                    <select 
                      className="input-field"
                      value={disparoConfig.media_type || ''}
                      onChange={e => setDisparoConfig({...disparoConfig, media_type: e.target.value || null})}
                    >
                      <option value="">Nenhuma</option>
                      <option value="photo">Foto</option>
                      <option value="video">Vídeo</option>
                    </select>
                  </div>
                  
                  {disparoConfig.media_type && (
                    <div className="form-group">
                      <label>🔗 URL da Mídia</label>
                      <input 
                        type="url"
                        className="input-field"
                        placeholder="https://..."
                        value={disparoConfig.media_url}
                        onChange={e => setDisparoConfig({...disparoConfig, media_url: e.target.value})}
                      />
                    </div>
                  )}

                  {/* ✅ NOVA SEÇÃO: AUTO-DESTRUIÇÃO */}
                  <div className="config-card" style={{background:'#fff9e6', border:'1px solid #ffd966', marginTop:'20px'}}>
                    <div className="switch-wrapper">
                      <div className="switch-label">
                        <span>{Icons.Bomb} Auto-Destruição da Mensagem</span>
                        <small style={{color:'#666'}}>A mensagem será apagada após X segundos</small>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={disparoConfig.auto_destruct_enabled || false}
                          onChange={e => setDisparoConfig({...disparoConfig, auto_destruct_enabled: e.target.checked})}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    {disparoConfig.auto_destruct_enabled && (
                      <div style={{marginTop:'15px'}}>
                        <div className="form-group">
                          <label>⏳ Tempo para auto-destruição (segundos)</label>
                          <input 
                            type="number" 
                            className="input-field" 
                            value={disparoConfig.auto_destruct_seconds || 3}
                            onChange={e => setDisparoConfig({...disparoConfig, auto_destruct_seconds: parseInt(e.target.value)||3})}
                            min="1"
                          />
                          <small className="field-hint">Padrão: 3 segundos</small>
                        </div>

                        <div className="form-group">
                          <label className="checkbox-label">
                            <input 
                              type="checkbox"
                              checked={disparoConfig.auto_destruct_after_click || false}
                              onChange={e => setDisparoConfig({...disparoConfig, auto_destruct_after_click: e.target.checked})}
                            />
                            <span>Destruir somente APÓS clicar no botão</span>
                          </label>
                          <small className="field-hint">Se marcado, a mensagem só será apagada se o usuário clicar</small>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Valores Promocionais */}
                  {planos.length > 0 && (
                    <div className="form-group">
                      <label>{Icons.Money} Valores Promocionais (Opcional)</label>
                      <div className="promo-list">
                        {planos.map(plano => (
                          <div key={plano.id} className="promo-item">
                            <span className="promo-plan-name">{plano.nome}</span>
                            <input 
                              type="number"
                              className="input-field-inline"
                              placeholder={`R$ ${plano.valor}`}
                              value={disparoConfig.promo_values?.[plano.id] || ''}
                              onChange={e => setDisparoConfig({
                                ...disparoConfig, 
                                promo_values: {...(disparoConfig.promo_values || {}), [plano.id]: e.target.value}
                              })}
                            />
                          </div>
                        ))}
                      </div>
                      <small className="field-hint">Deixe vazio para usar o valor original</small>
                    </div>
                  )}
                  
                  {/* Botão Salvar */}
                  <button 
                    className="btn btn-primary btn-block"
                    onClick={handleSaveDisparo}
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : `${Icons.Save} Salvar Configuração`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* === ABA 2: MENSAGENS ALTERNANTES === */}
        {activeTab === 'alternating' && (
          <div className="tab-content">
            <div className="config-card">
                <div className="card-header">
                    <h3>🔄 Mensagens Alternantes</h3>
                    <div className="switch-wrapper">
                        <span className="switch-label">Ativar Rotação</span>
                        <label className="toggle-switch">
                            <input 
                                type="checkbox" 
                                checked={alternatingConfig.is_active}
                                onChange={e => setAlternatingConfig({...alternatingConfig, is_active: e.target.checked})}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>
                
                {alternatingConfig.is_active && (
                    <div className="card-body">
                        {/* Lista de mensagens */}
                        <div className="form-group">
                            <label>{Icons.Message} Mensagens Cadastradas ({alternatingConfig.messages.length})</label>
                            {alternatingConfig.messages.length === 0 ? (
                                <div className="empty-list">
                                    <p>Nenhuma mensagem cadastrada ainda.</p>
                                </div>
                            ) : (
                                <div className="messages-list">
                                    {alternatingConfig.messages.map((msg, idx) => (
                                        <div key={idx} className="message-item">
                                            <div className="message-number">{idx + 1}</div>
                                            <div className="message-content">
                                                <textarea 
                                                    className="input-field"
                                                    value={msg}
                                                    onChange={(e) => editMessage(idx, e.target.value)}
                                                    rows="2"
                                                />
                                            </div>
                                            <button 
                                                className="btn btn-icon-danger"
                                                onClick={() => removeMessage(idx)}
                                                title="Remover"
                                            >
                                                {Icons.Trash}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Adicionar nova mensagem */}
                        <div className="form-group">
                            <label>{Icons.Plus} Nova Mensagem</label>
                            <div className="input-group">
                                <textarea 
                                    className="input-field"
                                    placeholder="Digite a mensagem alternante..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    rows="3"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                            addMessage();
                                        }
                                    }}
                                />
                            </div>
                            <button 
                                className="btn btn-secondary btn-block"
                                onClick={addMessage}
                                disabled={!newMessage.trim()}
                            >
                                {Icons.Plus} Adicionar Variação
                            </button>
                        </div>

                        <div className="form-group mt-3" style={{display:'flex', gap:'20px'}}>
                            <div style={{flex:1}}>
                                <label>⏱️ Intervalo entre mensagens (segundos)</label>
                                <input 
                                    type="number"
                                    min="1"
                                    className="input-field"
                                    value={alternatingConfig.rotation_interval_seconds || 15}
                                    onChange={(e) => setAlternatingConfig(prev => ({ ...prev, rotation_interval_seconds: parseInt(e.target.value) || 15 }))}
                                />
                            </div>
                            
                            {disparoConfig.is_active ? (
                                <div style={{flex:1}}>
                                    <label>🛑 Parar antes remarketing (segundos)</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        className="input-field"
                                        value={alternatingConfig.stop_before_remarketing_seconds || 60}
                                        onChange={(e) => setAlternatingConfig(prev => ({ ...prev, stop_before_remarketing_seconds: parseInt(e.target.value) || 60 }))}
                                    />
                                </div>
                            ) : (
                                <div style={{flex:1}}>
                                    <label>🕒 Duração Total (minutos) *</label>
                                    <input 
                                        type="number"
                                        min="1"
                                        className="input-field"
                                        placeholder="Ex: 60"
                                        value={alternatingConfig.max_duration_minutes || 60}
                                        onChange={(e) => setAlternatingConfig(prev => ({ ...prev, max_duration_minutes: parseInt(e.target.value) || 60 }))}
                                    />
                                    <small style={{display:'block', color:'#d32f2f', marginTop:'5px', fontWeight:'600'}}>
                                        ⚠️ Campo obrigatório quando Disparo está desativado
                                    </small>
                                </div>
                            )}
                        </div>

                        {/* ✅ NOVA SEÇÃO DE DESTRUIÇÃO FINAL */}
                        <div className="config-card mt-3" style={{background:'#fff0f0', border:'1px solid #ffcccc'}}>
                            <div className="switch-wrapper">
                                <div className="switch-label">
                                    <span style={{color:'#d32f2f'}}>🛑 Auto-Destruir Última Mensagem?</span>
                                    <small style={{color:'#666'}}>Ao fim do ciclo: envia última msg, aguarda e apaga</small>
                                </div>
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={alternatingConfig.last_message_auto_destruct || false}
                                        onChange={e => setAlternatingConfig({...alternatingConfig, last_message_auto_destruct: e.target.checked})}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            {alternatingConfig.last_message_auto_destruct && (
                                <div className="form-group mt-2">
                                    <label>⏳ Tempo para apagar a última (segundos)</label>
                                    <input 
                                        type="number" 
                                        className="input-field" 
                                        value={alternatingConfig.last_message_destruct_seconds || 60}
                                        onChange={e => setAlternatingConfig({...alternatingConfig, last_message_destruct_seconds: parseInt(e.target.value)||60})} 
                                        min="1"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Botão Salvar */}
                        <button 
                            className="btn btn-primary btn-block mt-3"
                            onClick={handleSaveAlternating}
                            disabled={saving}
                        >
                            {saving ? 'Salvando...' : `${Icons.Save} Salvar Mensagens`}
                        </button>
                    </div>
                )}
            </div>
          </div>
        )}

        {/* === ABA 3: ANALYTICS === */}
        {activeTab === 'analytics' && (
          <div className="tab-content">
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
                <div className="stat-icon">{Icons.Check}</div>
                <div className="stat-info">
                  <div className="stat-label">Taxa de Abertura</div>
                  <div className="stat-value">--%</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">{Icons.Star}</div>
                <div className="stat-info">
                  <div className="stat-label">Receita Recuperada</div>
                  <div className="stat-value">
                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.total_revenue || 0)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabela de logs */}
            <div className="config-card">
                <div className="card-header">
                    <h3>📜 Histórico de Envios</h3>
                </div>
                <div className="logs-table-container">
                    <table className="logs-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Usuário</th>
                                <th>Status</th>
                                <th>Convertido?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.logs && stats.logs.length > 0 ? (
                                stats.logs.map((log) => {
                                    // 🎨 TRADUTOR DE STATUS
                                    let statusLabel = log.status;
                                    let statusClass = log.status;

                                    if (log.status === 'sent') statusLabel = 'Enviado 📤';
                                    if (log.status === 'error') statusLabel = 'Falhou ❌';
                                    if (log.status === 'pending') statusLabel = 'Agendado ⏳';
                                    
                                    // Se foi convertido, o status visual ganha destaque
                                    if (log.converted) {
                                        statusLabel = 'Recuperado 💰';
                                        statusClass = 'success';
                                    }

                                    return (
                                        <tr key={log.id}>
                                            <td>{new Date(log.sent_at).toLocaleString()}</td>
                                            <td>
                                                {/* ✅ MOSTRA NOME + USERNAME */}
                                                <div style={{display:'flex', flexDirection:'column'}}>
                                                    <span style={{fontWeight:'600'}}>{log.user_name || log.user_id}</span>
                                                    {log.user_username && <span style={{fontSize:'0.8em', color:'#888'}}>{log.user_username}</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${statusClass}`}>
                                                    {statusLabel}
                                                </span>
                                            </td>
                                            <td>
                                                {log.converted ? <span style={{color:'#4caf50', fontWeight:'bold'}}>✅ Sim</span> : <span style={{color:'#666'}}>Aguardando...</span>}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{textAlign:'center', padding:'20px'}}>
                                        Nenhum envio registrado ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}