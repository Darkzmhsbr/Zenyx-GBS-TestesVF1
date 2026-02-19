import React, { useState, useEffect } from 'react';
import { useBot } from '../context/BotContext';
import { orderBumpService, groupService } from '../services/api';
import { ShoppingBag, Save, AlertCircle, Image as ImageIcon, Link as LinkIcon, DollarSign, MessageSquare, Trash2, Layers } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
// import { TextArea } from '../components/TextArea'; // REMOVIDO
import { RichInput } from '../components/RichInput'; // 🔥 NOVO COMPONENTE
import { MediaUploader } from '../components/MediaUploader'; // 🔥 COMPONENTE DE UPLOAD
import Swal from 'sweetalert2';
import './OrderBump.css';

export function OrderBump() {
  const { selectedBot } = useBot();
  const [loading, setLoading] = useState(false);
  
  // ✅ FASE 2: Lista de grupos do catálogo
  const [groups, setGroups] = useState([]);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    ativo: false,
    nome_produto: '',
    preco: '',
    link_acesso: '',
    group_id: null, // ✅ FASE 2: Grupo do catálogo
    autodestruir: false,
    msg_texto: '',
    msg_media: '',
    btn_aceitar: '✅ SIM, ADICIONAR',
    btn_recusar: '❌ NÃO, OBRIGADO'
  });


  // 🔊 HELPER: Detecta se a URL é um áudio OGG
  const isAudioUrl = (url) => {
    if (!url) return false;
    return url.toLowerCase().match(/\.(ogg|mp3|wav)$/i);
  };

  // Carrega dados quando muda o bot
  useEffect(() => {
    if (selectedBot) {
      carregarConfig();
    }
  }, [selectedBot]);

  const carregarConfig = async () => {
    setLoading(true);
    try {
      const [data, groupsRes] = await Promise.all([
        orderBumpService.get(selectedBot.id),
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
          autodestruir: data.autodestruir ?? false,
          msg_texto: data.msg_texto || '',
          msg_media: data.msg_media || '',
          btn_aceitar: data.btn_aceitar || '✅ SIM, ADICIONAR',
          btn_recusar: data.btn_recusar || '❌ NÃO, OBRIGADO'
        });
      }
    } catch (error) {
      console.error("Erro ao carregar order bump", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome_produto || !formData.preco || !formData.link_acesso) {
      return Swal.fire('Erro', 'Preencha Nome, Preço e Link de Acesso.', 'error');
    }

    try {
      await orderBumpService.save(selectedBot.id, {
        ...formData,
        preco: parseFloat(formData.preco) 
      });
      Swal.fire('Sucesso', 'Configurações de Order Bump salvas!', 'success');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar configurações.', 'error');
    }
  };

  if (!selectedBot) {
    return (
      <div className="order-bump-container empty-state">
        <AlertCircle size={48} color="#c333ff" />
        <h2>Nenhum Bot Selecionado</h2>
        <p>Selecione um bot no menu superior para configurar o Order Bump.</p>
      </div>
    );
  }

  return (
    <div className="order-bump-container">
      <div className="page-header">
        <div>
          <h1>Order Bump (Oferta Adicional)</h1>
          <p style={{color:'var(--muted-foreground)'}}>
            Configure uma oferta extra para aparecer no checkout do bot: <strong style={{color:'#c333ff'}}>{selectedBot.nome}</strong>
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
                  <ShoppingBag size={20} color="#c333ff"/>
                  <h3>Dados do Produto</h3>
                </div>

                {/* SWITCH DE ATIVAR */}
                <div className="form-group toggle-group">
                  <label>Ativar Order Bump?</label>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={formData.ativo}
                      onChange={e => setFormData({...formData, ativo: e.target.checked})}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <Input 
                  label="Nome do Produto Extra"
                  placeholder="Ex: Grupo de Fotos Exclusivas"
                  value={formData.nome_produto}
                  onChange={e => setFormData({...formData, nome_produto: e.target.value})}
                  required
                />

                <div className="form-row">
                  <Input 
                    label="Preço Adicional (R$)"
                    type="number"
                    placeholder="Ex: 9.90"
                    value={formData.preco}
                    onChange={e => setFormData({...formData, preco: e.target.value})}
                    icon={<DollarSign size={16}/>}
                    required
                  />
                </div>

                <Input 
                  label="Link do Canal/Grupo VIP"
                  placeholder="https://t.me/+AbCdEfGhIjKlMnOp"
                  value={formData.link_acesso}
                  onChange={e => setFormData({...formData, link_acesso: e.target.value})}
                  icon={<LinkIcon size={16}/>}
                  required
                />
                <p className="helper-text">Este é o link que será entregue junto com o produto principal se o cliente aceitar.</p>

                {/* ✅ FASE 2: SELEÇÃO DE GRUPO DO CATÁLOGO */}
                {groups.length > 0 && (
                  <div className="form-group" style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #333'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                      <Layers size={18} color="#c333ff" />
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
                  <MessageSquare size={20} color="#c333ff"/>
                  <h3>Mensagem e Aparência</h3>
                </div>

                {/* 🔥 ATUALIZADO PARA RICH INPUT */}
                <RichInput 
                  label={isAudioUrl(formData.msg_media) ? "Texto da Oferta (enviado SEPARADO após o áudio)" : "Texto da Oferta"}
                  placeholder="Ex: Gostaria de adicionar o acesso ao meu Pack de Fotos por apenas + R$ 9,90?"
                  value={formData.msg_texto}
                  onChange={e => setFormData({...formData, msg_texto: e.target.value})}
                  rows={4}
                />

                {/* 🔥 COMPONENTE DE UPLOAD DE MÍDIA INJETADO AQUI */}
                <div style={{ marginTop: '15px' }}>
                  <MediaUploader 
                    label="Mídia da Oferta (Opcional - Imagem, Vídeo ou Áudio)" 
                    value={formData.msg_media} 
                    onChange={(url) => setFormData({...formData, msg_media: url})} 
                  />
                </div>

                {/* 🔊 ALERTA DE ÁUDIO */}
                {isAudioUrl(formData.msg_media) && (
                    <div style={{
                        background: 'rgba(234, 179, 8, 0.1)',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        borderRadius: '8px',
                        padding: '12px 15px',
                        marginTop: '10px',
                        marginBottom: '10px'
                    }}>
                        <p style={{color: '#eab308', fontSize: '0.85rem', margin: 0}}>
                            🎙️ <strong>Modo Áudio Ativo</strong> — O áudio será enviado como voice note nativo. O texto da oferta e os botões Aceitar/Recusar serão enviados em uma mensagem separada logo após o áudio.
                        </p>
                    </div>
                )}

                {/* 🔥 NOVO SWITCH DE AUTODESTRUIR */}
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
                    label={isAudioUrl(formData.msg_media) ? "Botão Aceitar (msg separada)" : "Texto Botão Aceitar"}
                    value={formData.btn_aceitar}
                    onChange={e => setFormData({...formData, btn_aceitar: e.target.value})}
                  />
                  <Input 
                    label={isAudioUrl(formData.msg_media) ? "Botão Recusar (msg separada)" : "Texto Botão Recusar"}
                    value={formData.btn_recusar}
                    onChange={e => setFormData({...formData, btn_recusar: e.target.value})}
                  />
                </div>

                <div className="preview-buttons">
                  <label>Prévia dos Botões: {isAudioUrl(formData.msg_media) && <span style={{fontSize: '0.75rem', color: '#eab308'}}>(enviados em msg separada)</span>}</label>
                  <div className="telegram-buttons">
                    <button type="button" className="tg-btn accept">{formData.btn_aceitar} (+ R$ {formData.preco || '0'})</button>
                    <button type="button" className="tg-btn decline">{formData.btn_recusar}</button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

        <div className="action-bar">
          <Button type="submit" disabled={loading} style={{minWidth: '200px'}}>
            <Save size={18} style={{marginRight:'8px'}}/>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>
    </div>
  );
}