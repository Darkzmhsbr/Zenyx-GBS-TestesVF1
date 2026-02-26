import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { upsellService, downsellService, groupService, testSendService } from '../services/api';
import { Rocket, ArrowDownCircle, Save, AlertCircle, Image as ImageIcon, Link as LinkIcon, DollarSign, MessageSquare, Trash2, Clock, Layers, Mic } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { RichInput } from '../components/RichInput';
import { MediaUploader } from '../components/MediaUploader'; // 🔥 NOVO COMPONENTE DE UPLOAD
import Swal from 'sweetalert2';
import './UpsellDownsell.css';

// Configurações por tipo
const CONFIG = {
  upsell: {
    title: 'Upsell (Oferta Pós-Compra #1)',
    subtitle: 'Configure uma oferta enviada automaticamente após o cliente comprar um plano principal.',
    icon: Rocket,
    iconColor: '#10b981',
    gradientFrom: '#10b981',
    gradientTo: '#059669',
    defaultMsg: '🔥 Oferta exclusiva para você!',
    defaultBtnAceitar: '✅ QUERO ESSA OFERTA!',
    defaultBtnRecusar: '❌ NÃO, OBRIGADO',
    defaultDelay: 2,
    delayLabel: 'Delay após pagamento do plano principal (minutos)',
    delayHelper: 'Tempo de espera após o cliente pagar o plano principal antes de enviar esta oferta.'
  },
  downsell: {
    title: 'Downsell (Oferta Pós-Compra #2)',
    subtitle: 'Configure uma oferta enviada automaticamente após o cliente comprar o Upsell.',
    icon: ArrowDownCircle,
    iconColor: '#f59e0b',
    gradientFrom: '#f59e0b',
    gradientTo: '#d97706',
    defaultMsg: '🎁 Última chance! Oferta especial só para você!',
    defaultBtnAceitar: '✅ QUERO ESSA OFERTA!',
    defaultBtnRecusar: '❌ NÃO, OBRIGADO',
    defaultDelay: 10,
    delayLabel: 'Delay após pagamento do Upsell (minutos)',
    delayHelper: 'Tempo de espera após o cliente pagar o Upsell antes de enviar esta oferta.'
  }
};

export function UpsellDownsell({ type = 'upsell' }) {
  const { selectedBot } = useBot();
  const [loading, setLoading] = useState(false);
  
  const cfg = CONFIG[type];
  const service = type === 'upsell' ? upsellService : downsellService;
  const IconComponent = cfg.icon;
  
  // ✅ FASE 2: Lista de grupos do catálogo
  const [groups, setGroups] = useState([]);
  
  const [formData, setFormData] = useState({
    ativo: false,
    nome_produto: '',
    preco: '',
    link_acesso: '',
    group_id: null, // ✅ FASE 2: Grupo do catálogo
    delay_minutos: cfg.defaultDelay,
    autodestruir: false,
    msg_texto: cfg.defaultMsg,
    
    // 🔥 NOVOS CAMPOS PARA COMBO ÁUDIO
    audio_url: '', 
    audio_delay_seconds: 3,

    msg_media: '',
    btn_aceitar: cfg.defaultBtnAceitar,
    btn_recusar: cfg.defaultBtnRecusar
  });


  // 🔊 HELPER: Detecta se a URL é um áudio OGG
  const isAudioUrl = (url) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(ogg|mp3|wav)$/i);
  };

  useEffect(() => {
    if (selectedBot) {
      carregarConfig();
    }
  }, [selectedBot, type]);

  const carregarConfig = async () => {
    setLoading(true);
    try {
      const [data, groupsRes] = await Promise.all([
        service.get(selectedBot.id),
        groupService.list(selectedBot.id)
      ]);
      
      // ✅ FASE 2: Carrega lista de grupos
      setGroups(groupsRes.groups || []);
      
      if (data) {
        setFormData({
          ativo: data.ativo ?? false,
          nome_produto: data.nome_produto || '',
          preco: data.preco || '',
          link_acesso: data.link_acesso || '',
          group_id: data.group_id || null, // ✅ FASE 2
          delay_minutos: data.delay_minutos ?? cfg.defaultDelay,
          autodestruir: data.autodestruir ?? false,
          msg_texto: data.msg_texto || cfg.defaultMsg,
          
          audio_url: data.audio_url || '', // 🔥 Carrega áudio
          audio_delay_seconds: data.audio_delay_seconds || 3, // 🔥 Carrega delay

          msg_media: data.msg_media || '',
          btn_aceitar: data.btn_aceitar || cfg.defaultBtnAceitar,
          btn_recusar: data.btn_recusar || cfg.defaultBtnRecusar
        });
      }
    } catch (error) {
      console.error(`Erro ao carregar ${type}`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.nome_produto || !formData.preco || !formData.link_acesso) {
      return Swal.fire({
        title: 'Erro',
        text: 'Preencha Nome, Preço e Link de Acesso.',
        icon: 'error',
        background: '#151515',
        color: '#fff'
      });
    }

    setLoading(true);
    try {
      await service.save(selectedBot.id, {
        ...formData,
        preco: parseFloat(formData.preco),
        delay_minutos: parseInt(formData.delay_minutos) || cfg.defaultDelay
      });
      Swal.fire({
        title: 'Sucesso!',
        text: `Configurações de ${type === 'upsell' ? 'Upsell' : 'Downsell'} salvas!`,
        icon: 'success',
        background: '#151515',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire({
        title: 'Erro',
        text: 'Falha ao salvar configurações.',
        icon: 'error',
        background: '#151515',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedBot) {
    return (
      <div className="upsell-downsell-container empty-state">
        <AlertCircle size={48} color={cfg.iconColor} />
        <h2>Nenhum Bot Selecionado</h2>
        <p>Selecione um bot no menu superior para configurar o {type === 'upsell' ? 'Upsell' : 'Downsell'}.</p>
      </div>
    );
  }

  return (
    <div className="upsell-downsell-container">
      <div className="page-header">
        <div>
          <h1>
            <IconComponent size={28} style={{ verticalAlign: 'middle', marginRight: '10px', color: cfg.iconColor }} />
            {cfg.title}
          </h1>
          <p style={{color:'var(--muted-foreground)'}}>
            {cfg.subtitle} Bot: <strong style={{color: cfg.iconColor}}>{selectedBot.nome}</strong>
          </p>
        </div>
        <div className="status-badge">
          STATUS: <span className={formData.ativo ? "active" : "inactive"}>{formData.ativo ? "ATIVO" : "INATIVO"}</span>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="bump-grid">
          
          {/* COLUNA ESQUERDA - DADOS DO PRODUTO */}
          <div className="bump-col">
            <Card>
              <CardContent>
                <div className="card-header-title">
                  <IconComponent size={20} color={cfg.iconColor}/>
                  <h3>Dados do Produto</h3>
                </div>

                {/* SWITCH DE ATIVAR */}
                <div className="form-group toggle-group">
                  <label>Ativar {type === 'upsell' ? 'Upsell' : 'Downsell'}?</label>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={formData.ativo}
                      onChange={e => setFormData({...formData, ativo: e.target.checked})}
                    />
                    <span className="slider round" style={formData.ativo ? {backgroundColor: cfg.iconColor} : {}}></span>
                  </label>
                </div>

                <Input 
                  label="Nome do Produto"
                  placeholder="Ex: Pack de Fotos Exclusivas"
                  value={formData.nome_produto}
                  onChange={e => setFormData({...formData, nome_produto: e.target.value})}
                  required
                />

                <div className="form-row">
                  <Input 
                    label="Preço (R$)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 19.90"
                    value={formData.preco}
                    onChange={e => setFormData({...formData, preco: e.target.value})}
                    icon={<DollarSign size={16}/>}
                    required
                  />
                  <Input 
                    label={<><Clock size={14} style={{verticalAlign:'middle'}}/> Delay (minutos)</>}
                    type="number"
                    min="1"
                    placeholder={`Ex: ${cfg.defaultDelay}`}
                    value={formData.delay_minutos}
                    onChange={e => setFormData({...formData, delay_minutos: e.target.value})}
                    icon={<Clock size={16}/>}
                  />
                </div>
                <p className="helper-text">{cfg.delayHelper}</p>

                <Input 
                  label="Link do Canal/Grupo VIP"
                  placeholder="https://t.me/+AbCdEfGhIjKlMnOp"
                  value={formData.link_acesso}
                  onChange={e => setFormData({...formData, link_acesso: e.target.value})}
                  icon={<LinkIcon size={16}/>}
                  required
                />
                <p className="helper-text">Este link será entregue automaticamente ao cliente após o pagamento desta oferta.</p>

                {/* ✅ FASE 2: SELEÇÃO DE GRUPO DO CATÁLOGO */}
                {groups.length > 0 && (
                  <div className="form-group" style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #333'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                      <Layers size={18} color={cfg.iconColor} />
                      <label style={{marginBottom:0, fontWeight:'600', color:'#ccc', fontSize:'13px'}}>
                        Grupo do Catálogo (Convite Automático)
                      </label>
                    </div>
                    <select
                      value={formData.group_id || ''}
                      onChange={e => setFormData({...formData, group_id: e.target.value ? parseInt(e.target.value) : null})}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="" style={{background:'#1a1a2e'}}>Nenhum (usar link manual acima)</option>
                      {groups.filter(g => g.is_active).map(g => (
                        <option key={g.id} value={g.id} style={{background:'#1a1a2e'}}>
                          {g.title} ({g.group_id})
                        </option>
                      ))}
                    </select>
                    <p className="helper-text" style={{marginTop:'6px'}}>
                      Se selecionado, o bot gera um convite automático para este grupo ao invés de apenas enviar o link.
                    </p>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

          {/* COLUNA DIREITA - APARÊNCIA */}
          <div className="bump-col">
            <Card>
              <CardContent>
                <div className="card-header-title">
                  <MessageSquare size={20} color={cfg.iconColor}/>
                  <h3>Mensagem e Aparência</h3>
                </div>

                {/* 🔥 UPLOADER DE ÁUDIO SEPARADO (ESTRATÉGIA COMBO) */}
                <div style={{ marginBottom: '15px', background: 'rgba(195, 51, 255, 0.05)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #c333ff' }}>
                   <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px'}}>
                      <Mic size={16} color="#c333ff" />
                      <label style={{fontSize:'0.9rem', color:'#fff', fontWeight:'600'}}>Áudio de Introdução (Opcional)</label>
                   </div>
                   <MediaUploader 
                     label="🎤 Voice Note (Chega PRIMEIRO)" 
                     value={formData.audio_url || ''} 
                     onChange={(url) => setFormData({...formData, audio_url: url})} 
                   />
                   
                   {formData.audio_url && (
                      <div style={{marginTop:'10px'}}>
                        <label style={{fontSize:'0.85rem', color:'#ccc'}}>⏳ Delay do Áudio (segundos)</label>
                        <input 
                            type="number" 
                            style={{
                                width: '100%',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid #444',
                                padding: '8px',
                                borderRadius: '6px',
                                color: '#fff',
                                marginTop: '4px'
                            }}
                            value={formData.audio_delay_seconds || 0}
                            onChange={e => setFormData({...formData, audio_delay_seconds: parseInt(e.target.value) || 0})}
                        />
                      </div>
                   )}
                </div>

                <RichInput 
                  label={formData.audio_url ? "Texto da Oferta (enviado SEPARADO após o áudio)" : "Texto da Oferta"}
                  placeholder="Ex: 🔥 Parabéns pela compra! Tenho uma oferta exclusiva para você..."
                  value={formData.msg_texto}
                  onChange={e => setFormData({...formData, msg_texto: e.target.value})}
                  rows={4}
                />

                {/* 🔥 COMPONENTE DE UPLOAD DE MÍDIA INJETADO AQUI */}
                <div style={{ marginTop: '15px' }}>
                  <MediaUploader 
                    label="Mídia da Oferta (Opcional - Foto ou Vídeo)" 
                    value={formData.msg_media} 
                    onChange={(url) => setFormData({...formData, msg_media: url})} 
                  />
                </div>

                {/* 🔊 ALERTA DE MODO COMBO */}
                {formData.audio_url && (formData.msg_media || formData.msg_texto) && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        padding: '12px 15px',
                        marginTop: '10px',
                        marginBottom: '10px'
                    }}>
                        <p style={{color: '#059669', fontSize: '0.85rem', margin: 0}}>
                            🚀 <strong>Combo Ativado!</strong> Áudio chega primeiro ➔ espera {formData.audio_delay_seconds}s ➔ Mensagem/Oferta chega depois.
                        </p>
                    </div>
                )}

                {/* ALERTA DE ÁUDIO NO CAMPO ERRADO (LEGADO) */}
                {isAudioUrl(formData.msg_media) && !formData.audio_url && (
                    <div style={{
                        background: 'rgba(234, 179, 8, 0.1)',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        borderRadius: '8px',
                        padding: '12px 15px',
                        marginTop: '10px',
                        marginBottom: '10px'
                    }}>
                        <p style={{color: '#eab308', fontSize: '0.85rem', margin: 0}}>
                            ⚠️ <strong>Dica:</strong> Para enviar áudio + texto/botões juntos, use o campo "Áudio de Introdução" acima e deixe esta mídia visual vazia ou como Foto.
                        </p>
                    </div>
                )}

                {/* SWITCH DE AUTODESTRUIR */}
                <div className="form-group toggle-group" style={{marginTop: '15px', marginBottom: '15px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <Trash2 size={18} color="#ef4444" />
                    <label style={{marginBottom:0}}>Auto-destruir após a escolha?</label>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={formData.autodestruir}
                      onChange={e => setFormData({...formData, autodestruir: e.target.checked})}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <p className="helper-text" style={{marginTop:'-10px'}}>
                  Se ativado, a mensagem da oferta será apagada assim que o cliente clicar em "Sim" ou "Não".
                </p>

                <div className="form-row">
                  <Input 
                    label={formData.audio_url ? "Botão Aceitar (msg separada)" : "Texto Botão Aceitar"}
                    value={formData.btn_aceitar}
                    onChange={e => setFormData({...formData, btn_aceitar: e.target.value})}
                  />
                  <Input 
                    label={formData.audio_url ? "Botão Recusar (msg separada)" : "Texto Botão Recusar"}
                    value={formData.btn_recusar}
                    onChange={e => setFormData({...formData, btn_recusar: e.target.value})}
                  />
                </div>

                <div className="preview-buttons">
                  <label>Prévia dos Botões: {formData.audio_url && <span style={{fontSize: '0.75rem', color: '#eab308'}}>(enviados em msg separada)</span>}</label>
                  <div className="telegram-buttons">
                    <button type="button" className="tg-btn accept" style={{borderColor: cfg.iconColor}}>
                      {formData.btn_aceitar} (R$ {formData.preco || '0'})
                    </button>
                    <button type="button" className="tg-btn decline">{formData.btn_recusar}</button>
                  </div>
                </div>

                {/* INFO BOX */}
                <div className="info-box" style={{borderColor: cfg.iconColor}}>
                  <strong>ℹ️ Como funciona?</strong>
                  {type === 'upsell' ? (
                    <p>Após o cliente pagar um plano principal, o bot aguarda <strong>{formData.delay_minutos || cfg.defaultDelay} minutos</strong> e envia esta oferta automaticamente.</p>
                  ) : (
                    <p>Após o cliente pagar o <strong>Upsell</strong>, o bot aguarda <strong>{formData.delay_minutos || cfg.defaultDelay} minutos</strong> e envia esta oferta como última chance.</p>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

        <div className="action-bar" style={{gap:'10px'}}>
          <button type="button" onClick={async () => {
            if (!selectedBot || !formData.msg_texto) { Swal.fire('Aviso', 'Preencha a mensagem antes de testar.', 'warning'); return; }
            try {
              Swal.fire({ title: '🧪 Enviando teste...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#151515', color: '#fff' });
              await testSendService.send(selectedBot.id, { message: formData.msg_texto, media_url: formData.msg_media || null, source: type });
              Swal.fire({ title: '✅ Teste enviado!', text: 'Verifique o Telegram do admin.', icon: 'success', timer: 2500, showConfirmButton: false, background: '#151515', color: '#fff' });
            } catch (e) { Swal.fire({ title: 'Erro', text: e.response?.data?.detail || 'Falha.', icon: 'error', background: '#151515', color: '#fff' }); }
          }} style={{background:'#333', color:'#fff', border:'1px solid #555', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:600}}>
            🧪 Enviar Teste
          </button>
          <Button type="submit" disabled={loading} style={{minWidth: '200px'}}>
            <Save size={18} style={{marginRight:'8px'}}/>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>
    </div>
  );
}