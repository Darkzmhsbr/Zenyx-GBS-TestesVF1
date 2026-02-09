import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { canalFreeService } from '../services/api';
import { RefreshCw, Save, AlertCircle, CheckCircle, Info, Unlock, Plus, Trash2, Image, Video } from 'lucide-react';
import './CanalFree.css';

export function CanalFree() {
  const { selectedBot } = useBot();
  
  // Estados
  const [config, setConfig] = useState({
    canal_id: '',
    canal_name: '',
    is_active: false,
    message_text: 'Olá! Percebi que você solicitou entrar no meu Canal FREE, mas só lembrando que a promoção do meu canal VIP está prestes a encerrar! Aproveita agora, pois em poucos minutos o valor vai dobrar... Venha!',
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
      setConfig(data);
    } catch (error) {
      console.error('Erro ao carregar config:', error);
      setStatus({ type: 'error', message: 'Erro ao carregar configuração' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validações
    if (!config.message_text.trim()) {
      setStatus({ type: 'error', message: 'Mensagem de boas-vindas é obrigatória' });
      return;
    }

    if (config.delay_seconds < 1 || config.delay_seconds > 86400) {
      setStatus({ type: 'error', message: 'Delay deve estar entre 1 e 86400 segundos (24h)' });
      return;
    }

    try {
      setSaving(true);
      await canalFreeService.saveConfig(selectedBot.id, config);
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

        {/* Mensagem de Boas-Vindas */}
        <div className="form-section">
          <label className="section-title">💬 Mensagem de Boas-Vindas</label>
          <textarea
            className="textarea-field"
            rows="5"
            placeholder="Ex: Olá! Em breve você será aceito no canal. Enquanto isso, que tal conhecer nosso VIP?"
            value={config.message_text}
            onChange={(e) => setConfig({ ...config, message_text: e.target.value })}
          />
          <p className="helper-text">
            Esta mensagem será enviada no privado quando o usuário solicitar entrada.
          </p>
        </div>

        {/* Mídia (Foto ou Vídeo) */}
        <div className="form-section">
          <label className="section-title">🖼️ Mídia (Opcional)</label>
          
          <div className="media-type-selector">
            <button
              type="button"
              className={`media-btn ${!config.media_type ? 'active' : ''}`}
              onClick={() => setConfig({ ...config, media_type: null, media_url: '' })}
            >
              Sem mídia
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
          </div>

          {config.media_type && (
            <input
              type="text"
              className="input-field mt-2"
              placeholder={`URL da ${config.media_type === 'photo' ? 'foto' : 'vídeo'} (ex: https://i.imgur.com/abc.jpg)`}
              value={config.media_url || ''}
              onChange={(e) => setConfig({ ...config, media_url: e.target.value })}
            />
          )}
        </div>

        {/* Botões Personalizados */}
        <div className="form-section">
          <label className="section-title">🔘 Botões Personalizados</label>
          
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

        {/* Botão Salvar */}
        <div className="form-actions">
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