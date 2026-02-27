import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { canalFreeService, testSendService } from '../services/api';
import { RefreshCw, Save, AlertCircle, CheckCircle, Info, Unlock, Plus, Trash2, Image, Video, Mic } from 'lucide-react';
import Swal from 'sweetalert2';
import { RichInput } from '../components/RichInput'; // Importando componente de texto rico
import { MediaUploader } from '../components/MediaUploader'; // 🔥 NOVO COMPONENTE DE UPLOAD
import './CanalFree.css';

// --- FUNÇÃO DE LIMPEZA E DECODIFICAÇÃO (Igual ao ChatFlow) ---
const decodeHtml = (html) => {
  if (!html) return "";
  const str = String(html);
  
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  let decoded = txt.value;

  decoded = decoded
      .replace(/<p[^>]*>/gi, "")
      .replace(/<\/p>/gi, "\n")
      .replace(/<div[^>]*>/gi, "")
      .replace(/<\/div>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n");

  return decoded.trim();
};

export function CanalFree() {
  const { selectedBot } = useBot();
  
  // Estados
  const [config, setConfig] = useState({
    canal_id: '',
    canal_name: '',
    is_active: false,
    message_text: 'Olá! Percebi que você solicitou entrar no meu Canal FREE, mas só lembrando que a promoção do meu canal VIP está prestes a encerrar! Aproveita agora, pois em poucos minutos o valor vai dobrar... Venha!',
    
    // 🔥 NOVOS CAMPOS PARA COMBO ÁUDIO
    audio_url: '', 
    audio_delay_seconds: 3,

    media_url: '',
    media_type: null,
    buttons: [],
    delay_seconds: 60
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [newButton, setNewButton] = useState({ text: '', url: '' });
  const [showInstructions, setShowInstructions] = useState(true);

  // 🔊 HELPER: Detecta se a URL é um áudio OGG
  const isAudioUrl = (url) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(ogg|mp3|wav)$/i);
  };

  // Carregar configuração ao montar
  useEffect(() => {
    if (selectedBot?.id) {
      loadConfig();
    }
  }, [selectedBot]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await canalFreeService.getConfig(selectedBot.id);
      
      // Merge seguro dos dados
      setConfig({
        canal_id: '',
        canal_name: '',
        is_active: false,
        message_text: '',
        audio_url: '',
        audio_delay_seconds: 3,
        media_url: '',
        media_type: null,
        buttons: [],
        delay_seconds: 60,
        ...data, // Sobrescreve com o que veio da API
        message_text: data.message_text || '' // Garante string
      });

    } catch (error) {
      console.error('Erro ao carregar config:', error);
      setStatus({ type: 'error', message: 'Erro ao carregar configuração' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validações
    // Se tiver áudio OU texto, passa.
    if (!config.message_text.trim() && !config.audio_url) {
      setStatus({ type: 'error', message: 'Defina ao menos um Áudio ou uma Mensagem de texto.' });
      return;
    }

    if (config.delay_seconds < 1 || config.delay_seconds > 86400) {
      setStatus({ type: 'error', message: 'Delay de aprovação deve estar entre 1 e 86400 segundos (24h)' });
      return;
    }

    try {
      setSaving(true);

      // Prepara o objeto para salvar, limpando o HTML do texto
      const configToSave = {
        ...config,
        message_text: decodeHtml(config.message_text)
      };

      await canalFreeService.saveConfig(selectedBot.id, configToSave);
      setStatus({ type: 'success', message: '✅ Configuração salva com sucesso!' });
      
      // Limpar status após 3s
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setStatus({ type: 'error', message: 'Erro ao salvar configuração' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddButton = () => {
    if (!newButton.text.trim() || !newButton.url.trim()) {
      setStatus({ type: 'error', message: 'Preencha texto e URL do botão' });
      return;
    }

    setConfig({
      ...config,
      buttons: [...config.buttons, { ...newButton }]
    });
    
    setNewButton({ text: '', url: '' });
    setStatus(null);
  };

  const handleRemoveButton = (index) => {
    setConfig({
      ...config,
      buttons: config.buttons.filter((_, i) => i !== index)
    });
  };

  // Handler específico para o RichInput
  const handleRichChange = (val) => {
    let cleanValue = val;
    // O RichInput pode retornar um evento ou valor direto dependendo da implementação
    if (val && typeof val === 'object' && val.target) {
        cleanValue = val.target.value;
    }
    setConfig({ ...config, message_text: cleanValue });
  };

  if (loading) {
    return (
      <div className="canal-free-container">
        <div className="loading-state">
          <RefreshCw className="spin" size={32} />
          <p>Carregando configuração...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="canal-free-container">
      <div className="canal-free-header">
        <div>
          <h1>
            <Unlock size={28} />
            Canal Free
          </h1>
          <p className="subtitle">Configure aprovação automática de usuários com mensagem personalizada</p>
        </div>
      </div>

      {/* Status da Configuração */}
      {!config.canal_id && (
        <div className="status-alert warning">
          <AlertCircle size={20} />
          <div>
            <strong>Status da configuração</strong>
            <p>O bot não conseguiu encontrar o canal free. Adicione o bot no canal ou configure o ID abaixo.</p>
          </div>
        </div>
      )}

      {config.canal_id && !config.is_active && (
        <div className="status-alert info">
          <Info size={20} />
          <div>
            <strong>Canal configurado mas inativo</strong>
            <p>Ative a configuração abaixo para começar a aprovar usuários automaticamente.</p>
          </div>
        </div>
      )}

      {config.canal_id && config.is_active && (
        <div className="status-alert success">
          <CheckCircle size={20} />
          <div>
            <strong>✅ Canal Free ativo!</strong>
            <p>O bot está aprovando solicitações automaticamente após {config.delay_seconds} segundos.</p>
          </div>
        </div>
      )}

      {/* Mensagens de Feedback */}
      {status && (
        <div className={`status-alert ${status.type}`}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Card Principal */}
      <div className="canal-free-card">
        
        {/* Toggle Ativar/Desativar */}
        <div className="form-section">
          <div className="switch-wrapper">
            <div>
              <label className="section-title">Ativar Canal Free</label>
              <p className="helper-text">Ative para começar a aprovar solicitações automaticamente</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={config.is_active}
                onChange={(e) => setConfig({ ...config, is_active: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* ID do Canal */}
        <div className="form-section">
          <label className="section-title">
            🔗 Canal
          </label>
          
          <div className="canal-input-group">
            <input
              type="text"
              className="input-field"
              placeholder="ID do canal (ex: -1001234567890)"
              value={config.canal_id || ''}
              onChange={(e) => setConfig({ ...config, canal_id: e.target.value })}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Nome do canal (opcional)"
              value={config.canal_name || ''}
              onChange={(e) => setConfig({ ...config, canal_name: e.target.value })}
            />
          </div>
          
          <p className="helper-text">
            Não encontrado? Adicione o bot no canal ou clique no ícone acima para procurar seu canal.
          </p>
        </div>

        {/* 🔥 NOVA SEÇÃO: ÁUDIO INTRODUTÓRIO (VOICE NOTE) */}
        <div className="form-section" style={{background: 'rgba(195, 51, 255, 0.02)', borderLeft: '3px solid #c333ff'}}>
          <label className="section-title" style={{display:'flex', alignItems:'center', gap:'8px'}}>
             <Mic size={18} color="#c333ff"/> 
             Áudio de Entrada (Voice Note)
          </label>
          
          <div className="mt-2">
            <MediaUploader 
              label="🎤 Upload de Áudio OGG (Chega PRIMEIRO)" 
              value={config.audio_url || ''} 
              onChange={(url) => setConfig({ ...config, audio_url: url })} 
            />
          </div>

          {config.audio_url && (
            <div className="mt-3" style={{paddingLeft: '5px'}}>
               <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <div style={{flex: 1}}>
                    <label style={{fontWeight:'bold', color:'#c333ff', fontSize:'0.9rem'}}>⏳ Delay do Áudio (segundos)</label>
                    <input 
                        type="number" 
                        className="input-field"
                        value={config.audio_delay_seconds || 0}
                        onChange={e => setConfig({...config, audio_delay_seconds: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div style={{flex: 2}}>
                     <p className="helper-text" style={{marginTop:'25px'}}>
                       Tempo que o bot espera o cliente ouvir o áudio antes de mandar o Texto + Botões.
                     </p>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Mensagem de Boas-Vindas (COM RICH INPUT E DICAS) */}
        <div className="form-section">
          <label className="section-title">💬 Mensagem de Boas-Vindas {config.audio_url && <small style={{fontWeight:'normal', color:'#666'}}>(Chega após o áudio)</small>}</label>
          
          {/* Box de Dicas de Variáveis */}
          <div className="status-alert info" style={{ padding: '0.8rem', marginBottom: '1rem', alignItems: 'center' }}>
            <Info size={18} />
            <div style={{ fontSize: '0.85rem' }}>
              <strong>Variáveis disponíveis:</strong>
              <p style={{ marginTop: '4px', opacity: 0.9 }}>
                Use <code>{'{first_name}'}</code> para o primeiro nome, 
                <code>{'{username}'}</code> para o usuário e 
                <code>{'{id}'}</code> para o ID do Telegram.
              </p>
            </div>
          </div>
          
          <RichInput
            value={config.message_text}
            onChange={handleRichChange}
            placeholder="Ex: Olá {first_name}! Em breve você será aceito no canal. Enquanto isso, que tal conhecer nosso VIP?"
            rows={6}
          />
          
          <p className="helper-text">
            Esta mensagem será enviada no privado quando o usuário solicitar entrada. Use a barra de ferramentas para formatar (Negrito, Itálico, Links).
          </p>
        </div>

        {/* Mídia (Foto, Vídeo ou Áudio) */}
        <div className="form-section">
          <label className="section-title">🖼️ Mídia Visual (Acompanha o Texto)</label>
          
          <div className="media-type-selector">
            <button
              type="button"
              className={`media-btn ${!config.media_type ? 'active' : ''}`}
              onClick={() => setConfig({ ...config, media_type: null, media_url: '' })}
            >
              Sem mídia visual
            </button>
            <button
              type="button"
              className={`media-btn ${config.media_type === 'photo' ? 'active' : ''}`}
              onClick={() => setConfig({ ...config, media_type: 'photo' })}
            >
              <Image size={18} /> Foto
            </button>
            <button
              type="button"
              className={`media-btn ${config.media_type === 'video' ? 'active' : ''}`}
              onClick={() => setConfig({ ...config, media_type: 'video' })}
            >
              <Video size={18} /> Vídeo
            </button>
            {/* Opção legada de áudio no media_type mantida para compatibilidade, mas o foco é o campo separado acima */}
            <button
              type="button"
              className={`media-btn ${config.media_type === 'audio' ? 'active' : ''}`}
              onClick={() => setConfig({ ...config, media_type: 'audio' })}
            >
              🎙️ Áudio (Legado)
            </button>
          </div>

          {/* 🔥 COMPONENTE DE UPLOAD ATUALIZADO AQUI */}
          {config.media_type && (
            <div className="mt-2">
              <MediaUploader 
                label={`Upload de ${config.media_type === 'photo' ? 'Foto' : config.media_type === 'video' ? 'Vídeo' : 'Áudio'}`} 
                value={config.media_url || ''} 
                onChange={(url) => {
                  let type = config.media_type;
                  // Auto-detecta e corrige o tipo baseado na extensão
                  if (url.match(/\.(jpeg|jpg|png|gif|webp)$/i)) type = 'photo';
                  if (url.match(/\.(mp4|mov|avi)$/i)) type = 'video';
                  if (url.match(/\.(ogg|mp3|wav)$/i)) type = 'audio';
                  
                  setConfig({ ...config, media_url: url, media_type: type });
                }} 
              />
            </div>
          )}

          {/* 🔊 ALERTA DE ÁUDIO LEGADO */}
          {config.media_type === 'audio' && !config.audio_url && (
              <div style={{
                  background: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 15px',
                  marginTop: '12px'
              }}>
                  <p style={{color: '#eab308', fontSize: '0.85rem', margin: 0}}>
                      ⚠️ <strong>Dica:</strong> Para enviar áudio + texto/botões juntos, use o campo "Áudio de Entrada" acima e deixe esta mídia visual vazia ou como Foto.
                  </p>
              </div>
          )}

          {/* ALERTA DE COMBO ATIVO */}
          {config.audio_url && (config.media_url || config.message_text) && (
             <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '12px 15px',
                marginTop: '12px'
             }}>
                 <p style={{color: '#059669', fontSize: '0.85rem', margin: 0}}>
                    🚀 <strong>Combo Ativado!</strong> 1º Voice Note ➔ espera {config.audio_delay_seconds}s ➔ 2º Texto/Mídia + Botões.
                 </p>
             </div>
          )}
        </div>

        {/* Botões Personalizados */}
        <div className="form-section">
          <label className="section-title">🔘 Botões Personalizados {config.audio_url && <span style={{fontSize: '0.75rem', color: '#666', fontWeight: 'normal'}}>(enviados junto com o texto)</span>}</label>
          
          {/* Lista de botões */}
          {config.buttons && config.buttons.length > 0 && (
            <div className="buttons-list">
              {config.buttons.map((btn, index) => (
                <div key={index} className="button-item">
                  <div className="button-info">
                    <strong>{btn.text}</strong>
                    <small>{btn.url}</small>
                  </div>
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={() => handleRemoveButton(index)}
                    title="Remover botão"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Adicionar novo botão */}
          <div className="add-button-section">
            <input
              type="text"
              className="input-field"
              placeholder="Texto do botão (ex: Ver Canal VIP)"
              value={newButton.text}
              onChange={(e) => setNewButton({ ...newButton, text: e.target.value })}
            />
            <input
              type="text"
              className="input-field"
              placeholder="URL (ex: https://t.me/seu_canal)"
              value={newButton.url}
              onChange={(e) => setNewButton({ ...newButton, url: e.target.value })}
            />
            <button
              type="button"
              className="btn-add"
              onClick={handleAddButton}
            >
              <Plus size={18} /> Adicionar Botão
            </button>
          </div>
        </div>

        {/* Tempo de Aprovação */}
        <div className="form-section">
          <label className="section-title">⏰ Tempo para Aceitar a Solicitação</label>
          <div className="time-input-group">
            <input
              type="number"
              className="input-field"
              min="1"
              max="86400"
              value={config.delay_seconds}
              onChange={(e) => setConfig({ ...config, delay_seconds: parseInt(e.target.value) || 60 })}
            />
            <span className="time-unit">segundos</span>
          </div>
          <p className="helper-text">
            O bot aguardará este tempo antes de aprovar automaticamente. 
            <br />
            <strong>Sugestão:</strong> 60 segundos (1 minuto) | 3600 segundos (1 hora)
          </p>
        </div>

        {/* Botão Salvar + Teste */}
        <div className="form-actions" style={{gap:'12px'}}>
          <button
            onClick={async () => {
              if (!selectedBot) return;
              if (!config.message_text?.trim() && !config.audio_url) { 
                Swal.fire({title:'Aviso', text:'Preencha a mensagem de boas-vindas ou defina um áudio antes de testar.', icon:'warning', background:'#151515', color:'#fff'}); 
                return; 
              }
              try {
                Swal.fire({ title: '🧪 Enviando teste...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#151515', color: '#fff' });
                // Monta botões customizados (se existirem)
                const btns = (config.buttons || []).map(b => ({ text: b.text, url: b.url }));
                await testSendService.send(selectedBot.id, { 
                  message: config.message_text || '', 
                  media_url: config.media_url || null, 
                  media_type: config.media_type || null, 
                  audio_url: config.audio_url || null,
                  source: 'canal_free',
                  buttons: btns.length > 0 ? btns : null
                });
                Swal.fire({ title: '✅ Teste enviado!', text: 'Verifique o Telegram do admin do bot.', icon: 'success', timer: 2500, showConfirmButton: false, background: '#151515', color: '#fff' });
              } catch (e) { Swal.fire({ title: 'Erro', text: e.response?.data?.detail || 'Falha ao enviar teste.', icon: 'error', background: '#151515', color: '#fff' }); }
            }}
            style={{background:'#333', color:'#fff', border:'1px solid #555', padding:'1rem 1.5rem', borderRadius:'10px', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.95rem'}}
          >
            🧪 Enviar Teste
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw className="spin" size={18} />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card de Instruções */}
      <div className="instructions-card">
        <div 
          className="instructions-header"
          onClick={() => setShowInstructions(!showInstructions)}
        >
          <h3>📚 Como Funciona?</h3>
          <button className="toggle-instructions">
            {showInstructions ? '−' : '+'}
          </button>
        </div>

        {showInstructions && (
          <div className="instructions-content">
            <div className="warning-box">
              <AlertCircle size={20} />
              <p>⚠️ Esse recurso só pode ser usado em <strong>canais privados</strong> com links de aprovação.</p>
            </div>

            <h4>Checklist para utilizar esse recurso:</h4>
            <ol className="checklist">
              <li>Adicione seu bot como <strong>administrador</strong> do seu canal FREE</li>
              <li>Acesse sua conta na plataforma e vá para "<strong>Canal FREE</strong>"</li>
              <li>Crie um link personalizado e ative a opção "<strong>Pedir aprovação de admins</strong>"</li>
              <li>Volte para o painel e configure o ID do canal acima</li>
              <li>Defina uma mensagem de boas-vindas atraente e estratégica</li>
              <li>Configure o tempo em segundos para aceitar as solicitações</li>
            </ol>

            <h4>Entenda o funcionamento:</h4>
            <p>
              O bot irá aprovar <strong>automaticamente</strong> todos os usuários que solicitarem 
              entrar no canal gratuito, sendo aceitos após o período em segundos configurado.
            </p>
            
            <div className="benefit-box">
              <CheckCircle size={20} color="#10b981" />
              <p>
                Ao divulgar esse link do seu canal gratuito, todos que solicitarem entrada 
                receberão uma mensagem do seu bot no chat privado, convidando-os para o VIP e, 
                além disso, eles serão adicionados instantaneamente à sua <strong>lista de leads</strong>!
              </p>
            </div>

            <p className="support-text">
              Esse recurso é simplesmente incrível! 🚀 Em caso de dúvidas, entre em contato com o suporte.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}