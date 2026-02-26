import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { remarketingAutoService, planService, testSendService } from '../services/api';
import { RichInput } from '../components/RichInput'; // 🔥 IMPORTAÇÃO DO COMPONENTE RICO
import { MediaUploader } from '../components/MediaUploader'; // 🔥 NOVO COMPONENTE DE UPLOAD
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
  audio_url: '', // 🔥 NOVO: Áudio separado (Voice Note)
  audio_delay_seconds: 3, // 🔥 NOVO: Delay entre áudio e próxima msg
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
  

  // 🔊 HELPER: Detecta se a URL é um áudio OGG
  const isAudioUrl = (url) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(ogg|mp3|wav)$/i);
  };

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
      // Mesclamos com DEFAULT_DISPARO para garantir que audio_url exista
      setDisparoConfig({
          ...DEFAULT_DISPARO,
          ...(remarketing || {})
      });
      
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
      // Se tiver áudio ou mídia visual ou texto, tá valendo
      const hasContent = disparoConfig.message_text.trim() || disparoConfig.media_url || disparoConfig.audio_url;

      if (!hasContent) {
        alert('Por favor, adicione ao menos um texto, áudio ou mídia.');
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
    }
    
    setSaving(true);
    
    try {
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
  // PLANOS PROMOCIONAIS
  // =========================================================
  
  function handleTogglePlano(planoId) {
    setDisparoConfig(prev => {
      const currentPromos = prev.promo_values || {};
      const newPromo = { ...currentPromos };
      
      if (newPromo[planoId]) {
        delete newPromo[planoId];
      } else {
        const plano = planos.find(p => p.id === planoId);
        if (plano) {
          const valorOriginal = Number(plano.preco_atual) || 0;
          newPromo[planoId] = {
            price: valorOriginal * 0.7,
            button_text: ''
          };
        }
      }
      
      return { ...prev, promo_values: newPromo };
    });
  }
  
  function handlePromoChange(planoId, field, value) {
    setDisparoConfig(prev => {
      const currentPromos = prev.promo_values || {};
      const currentPlano = currentPromos[planoId] || {};
      
      return {
        ...prev,
        promo_values: {
          ...currentPromos,
          [planoId]: {
            ...currentPlano,
            [field]: field === 'price' ? parseFloat(value) || 0 : value
          }
        }
      };
    });
  }
  
  // =========================================================
  // MENSAGENS ALTERNANTES
  // =========================================================
  
  function handleAddMessage() {
    if (!newMessage.trim()) return;
    
    setAlternatingConfig(prev => ({
      ...prev,
      messages: [...(prev.messages || []), newMessage]
    }));
    setNewMessage('');
  }
  
  function handleRemoveMessage(index) {
    setAlternatingConfig(prev => ({
      ...prev,
      messages: (prev.messages || []).filter((_, i) => i !== index)
    }));
  }
  
  function handleEditMessage(index, value) {
    setAlternatingConfig(prev => {
      const updated = [...(prev.messages || [])];
      updated[index] = value;
      return { ...prev, messages: updated };
    });
  }
  
  // =========================================================
  // RENDER
  // =========================================================
  
  if (!selectedBot) {
    return (
      <div className="auto-remarketing-container">
        <div className="alert alert-warning">
          <span>{Icons.Alert}</span> Nenhum bot selecionado.
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="auto-remarketing-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="auto-remarketing-container">
      
      {/* HEADER */}
      <div className="auto-remarketing-header">
        <div className="header-titles">
          <h1>{Icons.Rocket} Disparo Automático</h1>
          <p>Configure mensagens de remarketing inteligentes</p>
        </div>
        <div className="header-actions">
           <button className="btn-test-send" onClick={async () => {
             if (!selectedBot) return;
             const msg = activeTab === 'disparo' ? disparoConfig.message_text : (alternatingConfig.messages[0] || '');
             const msgText = typeof msg === 'string' ? msg : msg.content || '';
             if (!msgText) { Swal.fire('Aviso', 'Preencha a mensagem antes de testar.', 'warning'); return; }
             try {
               Swal.fire({ title: '🧪 Enviando teste...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#151515', color: '#fff' });
               await testSendService.send(selectedBot.id, { message: msgText, media_url: disparoConfig.media_url || null, source: 'auto_remarketing' });
               Swal.fire({ title: '✅ Teste enviado!', text: 'Verifique o Telegram do admin.', icon: 'success', timer: 2500, showConfirmButton: false, background: '#151515', color: '#fff' });
             } catch (e) { Swal.fire({ title: 'Erro', text: e.response?.data?.detail || 'Falha ao enviar teste.', icon: 'error', background: '#151515', color: '#fff' }); }
           }} style={{background:'#333', color:'#fff', border:'1px solid #555', padding:'10px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:'6px'}}>
             🧪 Enviar Teste
           </button>
           <button className="btn-save-main" onClick={activeTab === 'disparo' ? handleSaveDisparo : handleSaveAlternating} disabled={saving}>
             {saving ? 'Salvando...' : <>{Icons.Save} Salvar Alterações</>}
           </button>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'disparo' ? 'active' : ''}`}
          onClick={() => setActiveTab('disparo')}
        >
          {Icons.Rocket} Mensagem de Disparo
        </button>
        <button 
          className={`tab-btn ${activeTab === 'alternating' ? 'active' : ''}`}
          onClick={() => setActiveTab('alternating')}
        >
          {Icons.Message} Mensagens Alternantes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          {Icons.Chart} Analytics
        </button>
      </div>

      {/* CONTENT */}
      <div className="content-area">
        
        {/* === ABA 1: DISPARO AUTOMÁTICO === */}
        {activeTab === 'disparo' && (
          <div className="config-layout">
            
            {/* COLUNA ESQUERDA: CONFIGURAÇÃO */}
            <div className="config-form">
              
              {/* Card 1: Ativação */}
              <div className="config-card mb-4">
                <div className="switch-wrapper">
                  <div className="switch-label">
                    <span>Ativar Disparo Automático</span>
                    <small>Envia mensagem X minutos após gerar PIX</small>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={disparoConfig.is_active}
                      onChange={e => setDisparoConfig({...disparoConfig, is_active: e.target.checked})}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {disparoConfig.is_active && (
                    <div className="form-group mt-3">
                      <label>{Icons.Clock} Tempo de espera (minutos)</label>
                      <input 
                        type="number" 
                        className="input-field"
                        value={disparoConfig.delay_minutes}
                        onChange={e => setDisparoConfig({...disparoConfig, delay_minutes: parseInt(e.target.value)})}
                      />
                    </div>
                )}
              </div>

              {/* Card 2: Conteúdo da Mensagem */}
              <div className="config-card mb-4">
                <div className="card-header">
                  <h3>{Icons.Message} Conteúdo da Mensagem</h3>
                </div>
                
                {/* 🔥 UPLOADER DE ÁUDIO SEPARADO (ESTRATÉGIA COMBO) */}
                <div className="form-group">
                   <MediaUploader 
                     label="🎤 Áudio / Voice Note (Chega PRIMEIRO)" 
                     value={disparoConfig.audio_url || ''} 
                     onChange={(url) => setDisparoConfig({...disparoConfig, audio_url: url})} 
                   />
                </div>

                {/* Delay entre Áudio e Mídia Visual */}
                {disparoConfig.audio_url && (
                    <div className="form-group" style={{
                        marginLeft:'15px', 
                        borderLeft:'3px solid #c333ff', 
                        paddingLeft:'10px', 
                        marginBottom:'20px',
                        background: 'rgba(195, 51, 255, 0.05)',
                        padding: '10px',
                        borderRadius: '0 8px 8px 0'
                    }}>
                        <label style={{color: '#c333ff', fontWeight: 'bold'}}>⏳ Delay do Áudio (segundos)</label>
                        <input 
                            type="number" 
                            className="input-field"
                            value={disparoConfig.audio_delay_seconds || 0}
                            onChange={e => setDisparoConfig({...disparoConfig, audio_delay_seconds: parseInt(e.target.value)})}
                        />
                        <small style={{color:'#666'}}>Tempo para o cliente ouvir o áudio antes de chegar a Imagem + Botões.</small>
                    </div>
                )}

                {/* 🔥 COMPONENTE DE UPLOAD VISUAL ATUALIZADO */}
                <div className="form-group">
                  <MediaUploader 
                    label="🖼️ Mídia Visual (Foto/Vídeo - Chega DEPOIS)" 
                    value={disparoConfig.media_url || ''} 
                    onChange={(url) => {
                        let type = null;
                        if (url.match(/\.(jpeg|jpg|png|gif|webp)$/i)) type = 'photo';
                        if (url.match(/\.(mp4|mov|avi)$/i)) type = 'video';
                        if (url.match(/\.(ogg|mp3|wav)$/i)) type = 'audio'; // Fallback
                        setDisparoConfig({...disparoConfig, media_url: url, media_type: type});
                    }} 
                  />
                </div>

                {/* 🔊 ALERTA DE MODO COMBO */}
                {disparoConfig.audio_url && disparoConfig.media_url && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        padding: '12px 15px',
                        marginTop: '10px',
                        marginBottom: '10px'
                    }}>
                        <p style={{color: '#059669', fontSize: '0.85rem', margin: 0}}>
                            🚀 <strong>Combo Ativado!</strong> Primeiro envia o Áudio, espera {disparoConfig.audio_delay_seconds}s e depois envia a Mídia com a Oferta.
                        </p>
                    </div>
                )}

                <div className="form-group">
                  <RichInput
                    label={disparoConfig.audio_url ? "Legenda (acompanha a Mídia Visual/Botões)" : "Legenda / Texto"}
                    value={disparoConfig.message_text}
                    onChange={(e) => setDisparoConfig({...disparoConfig, message_text: e.target.value})}
                    placeholder="Olá {first_name}, vi que gerou um PIX..."
                    rows={6}
                  />
                  <small style={{color:'#666', display:'block', marginTop:'5px'}}>
                    Use: <code>{'{first_name}'}</code>, <code>{'{plano_original}'}</code>, <code>{'{valor_original}'}</code>
                  </small>
                </div>
              </div>

              {/* Card 3: Auto-Destruição */}
              <div className="config-card mb-4" style={{ borderLeft: '4px solid #c333ff', background: 'rgba(195, 51, 255, 0.03)' }}>
                <div className="card-header">
                  <h3>{Icons.Bomb} Auto-Destruição</h3>
                </div>
                
                <div className="switch-wrapper">
                    <div className="switch-label">
                        <span>Ativar Auto-Destruição</span>
                        <small>Apaga a mensagem após um tempo</small>
                    </div>
                    <label className="toggle-switch">
                        <input 
                            type="checkbox" 
                            checked={disparoConfig.auto_destruct_enabled}
                            onChange={e => setDisparoConfig({...disparoConfig, auto_destruct_enabled: e.target.checked})}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>

                <div className="hint-text" style={{ marginBottom: '20px' }}>
                    <span>{Icons.Alert}</span>
                    Quando ativado, a mensagem de disparo será automaticamente apagada após o tempo configurado
                </div>

                {disparoConfig.auto_destruct_enabled && (
                    <>
                        <div className="form-group mt-3">
                            <label>⏱️ Destruir em (segundos)</label>
                            <input 
                                type="number" 
                                className="input-field"
                                value={disparoConfig.auto_destruct_seconds}
                                onChange={e => setDisparoConfig({...disparoConfig, auto_destruct_seconds: parseInt(e.target.value) || 0})}
                            />
                        </div>

                        <div className="switch-wrapper mt-3">
                            <div className="switch-label">
                                <span>👆 Destruir SÓ após clicar?</span>
                                <small>Se ativo, conta o tempo só depois que o user clica no botão.</small>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={disparoConfig.auto_destruct_after_click}
                                    onChange={e => setDisparoConfig({...disparoConfig, auto_destruct_after_click: e.target.checked})}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </>
                )}
              </div>

              {/* Card 4: Oferta Promocional */}
              <div className="config-card mb-4">
                <div className="card-header">
                  <h3>{Icons.Money} Oferta Promocional (Botões)</h3>
                </div>
                
                <div className="alert alert-info mb-3">
                   Configure um preço menor para recuperar a venda. O botão já vai com o link de pagamento atualizado.
                </div>

                {planos.length === 0 ? (
                    <div className="alert alert-warning">
                      <span>{Icons.Alert}</span> Nenhum plano cadastrado.
                    </div>
                ) : (
                    <div className="planos-grid">
                        {planos.map(plano => {
                           const promo = (disparoConfig.promo_values || {})[plano.id] || {};
                           const isActive = !!(disparoConfig.promo_values || {})[plano.id];
                           const valorOriginal = Number(plano.preco_atual) || 0;
                           
                           return (
                             <div key={plano.id} className={`plano-card ${isActive ? 'active' : ''}`}>
                                <div className="plano-card-header">
                                    <div className="plano-info">
                                        <strong>{plano.nome_exibicao}</strong>
                                        <span className="original-price">De: R$ {valorOriginal.toFixed(2)}</span>
                                    </div>
                                    <div 
                                        className={`custom-toggle small ${isActive ? 'active' : ''}`}
                                        onClick={() => handleTogglePlano(plano.id)}
                                    >
                                        <div className="toggle-handle"></div>
                                    </div>
                                </div>
                                
                                {isActive && (
                                    <div className="plano-card-body">
                                       <div className="form-group">
                                          <label>Novo Preço (R$)</label>
                                          <input 
                                            type="number" 
                                            step="0.01"
                                            className="input-field"
                                            value={promo.price || ''}
                                            onChange={e => handlePromoChange(plano.id, 'price', parseFloat(e.target.value))}
                                          />
                                       </div>
                                       <div className="form-group">
                                          <label>Texto do Botão</label>
                                          <input 
                                            type="text" 
                                            className="input-field"
                                            placeholder="Ver Oferta 🔥"
                                            value={promo.button_text || ''}
                                            onChange={e => handlePromoChange(plano.id, 'button_text', e.target.value)}
                                          />
                                       </div>
                                    </div>
                                )}
                             </div>
                           )
                        })}
                    </div>
                )}
              </div>

            </div>

            {/* COLUNA DIREITA: PREVIEW */}
            <div className="preview-wrapper">
              <div className="iphone-mockup">
                <div className="screen-content">
                  
                  {/* Msg de Disparo */}
                  <div className="msg-bubble-container" style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                      
                      {/* PREVIEW 1: ÁUDIO (Se houver) */}
                      {disparoConfig.audio_url && (
                          <div className="msg-bubble" style={{borderRadius: '20px 20px 20px 5px', width: '80%'}}>
                             <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '5px'
                             }}>
                                <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#c333ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px'}}>▶</div>
                                <div style={{flex:1, height:'4px', background:'rgba(0,0,0,0.1)', borderRadius:'2px', position:'relative'}}>
                                    <div style={{width:'40%', height:'100%', background:'#c333ff', borderRadius:'2px'}}></div>
                                </div>
                                <span style={{fontSize:'0.75rem', color:'#666'}}>0:21</span>
                             </div>
                             <div className="msg-time" style={{textAlign:'right', fontSize:'0.7em', color:'#aaa', marginTop:'2px'}}>10:05</div>
                          </div>
                      )}

                      {/* PREVIEW 2: MÍDIA VISUAL + TEXTO */}
                      <div className="msg-bubble">
                          {disparoConfig.media_url && disparoConfig.media_url.match(/\.(jpeg|jpg|png|gif|webp)$/i) && (
                             <div className="media-preview" style={{backgroundImage: `url(${disparoConfig.media_url})`}}></div>
                          )}
                          
                          {/* PREVIEW PARA VÍDEO */}
                          {disparoConfig.media_url && disparoConfig.media_url.match(/\.(mp4|mov|avi)$/i) && (
                              <div 
                                 className="media-preview-mock"
                                 style={{width: '100%', height: '120px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', marginBottom: '8px'}}
                              >
                                 📹 Vídeo
                              </div>
                          )}
                          
                          {/* Fallback se user colocou audio no media_url (Legado) */}
                          {isAudioUrl(disparoConfig.media_url) && !disparoConfig.audio_url && (
                              <div style={{padding:'10px', background:'#eee', borderRadius:'5px', marginBottom:'5px'}}>
                                  🎤 Áudio (Legado)
                              </div>
                          )}

                          <div className="msg-text" dangerouslySetInnerHTML={{ __html: disparoConfig.message_text || 'Configure a mensagem...' }}></div>
                          <div className="msg-time">10:05</div>
                          
                          {/* Botão Fake */}
                          <div className="inline-btn">
                            Ver Oferta 🔥
                          </div>
                      </div>

                  </div>

                  {/* Mensagem Alternante (Exemplo) */}
                  {alternatingConfig.is_active && alternatingConfig.messages.length > 0 && (
                      <div className="msg-bubble" style={{opacity:0.7, marginTop:'10px'}}>
                         <div className="msg-text">
                            {typeof alternatingConfig.messages[0] === 'string' 
                               ? alternatingConfig.messages[0] 
                               : alternatingConfig.messages[0].content}
                         </div>
                         <div className="msg-time">10:02</div>
                      </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        )}
        
        {/* === ABA 2: MENSAGENS ALTERNANTES === */}
        {activeTab === 'alternating' && (
          <div className="config-layout" style={{ gridTemplateColumns: '1fr' }}> {/* Alternating ocupa largura total */}
            <div className="config-form">
                <div className="config-card">
                    <div className="card-header">
                        <h3>🔄 Mensagens Alternantes (Anti-Bloqueio)</h3>
                    </div>
                    
                    <div className="switch-wrapper">
                        <div className="switch-label">
                        <span>Ativar Alternância</span>
                        <small>Envia mensagens aleatórias enquanto o usuário não paga</small>
                        </div>
                        <label className="toggle-switch">
                            <input 
                                type="checkbox" 
                                checked={alternatingConfig.is_active}
                                onChange={e => setAlternatingConfig({...alternatingConfig, is_active: e.target.checked})}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {alternatingConfig.is_active && (
                        <div className="alternating-msgs mt-3">
                            <div className="messages-list">
                                {alternatingConfig.messages.map((msg, idx) => (
                                    <div key={idx} className="message-item">
                                        <div className="message-number">{idx + 1}</div>
                                        <div style={{flex:1}}>
                                          <RichInput 
                                            label=""
                                            value={typeof msg === 'string' ? msg : msg.content}
                                            onChange={val => {
                                                if (typeof msg === 'string') {
                                                    handleEditMessage(idx, val);
                                                } else {
                                                    const updatedMsg = { ...msg, content: val };
                                                    const newMsgs = [...alternatingConfig.messages];
                                                    newMsgs[idx] = updatedMsg;
                                                    setAlternatingConfig(prev => ({ ...prev, messages: newMsgs }));
                                                }
                                            }}
                                          />
                                        </div>
                                        <button onClick={() => handleRemoveMessage(idx)} className="btn-remove">
                                            {Icons.Trash}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="add-message-box">
                                <input 
                                    type="text"
                                    className="input-field"
                                    placeholder="Nova frase..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button onClick={handleAddMessage} className="btn-add w-100">
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
                                        <label>🕒 Duração Total (minutos)</label>
                                        <input 
                                            type="number"
                                            min="1"
                                            className="input-field"
                                            placeholder="Ex: 60"
                                            value={alternatingConfig.max_duration_minutes || 60}
                                            onChange={(e) => setAlternatingConfig(prev => ({ ...prev, max_duration_minutes: parseInt(e.target.value) || 60 }))}
                                        />
                                        <small style={{display:'block', color:'#666', marginTop:'5px'}}>Tempo total de envio</small>
                                    </div>
                                )}
                            </div>

                            {/* ✅ NOVA SEÇÃO DE DESTRUIÇÃO FINAL */}
                            <div className="config-card mt-3" style={{background:'#fff0f0', border:'1px solid #ffcccc'}}>
                                <div className="switch-wrapper">
                                    <div className="switch-label">
                                        <span style={{color:'#d32f2f'}}>🛑 Encerrar e Destruir Última?</span>
                                        <small style={{color:'#666'}}>Ao chegar na última msg: envia, espera e apaga.</small>
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
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
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