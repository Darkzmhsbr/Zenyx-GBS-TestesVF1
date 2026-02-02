import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Save, MessageSquare, ArrowDown, Zap, Image as ImageIcon, Video, Plus, Trash2, Edit, Clock, Layout, Globe, Smartphone, ShoppingBag, CheckCircle } from 'lucide-react';
import { flowService } from '../services/api'; 
import { useBot } from '../context/BotContext'; 
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { RichInput } from '../components/RichInput';
import './ChatFlow.css';

// 🧼 FUNÇÃO DE LIMPEZA DE HTML PARA TELEGRAM
const cleanHtmlForTelegram = (html) => {
    if (!html) return "";
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    let decoded = txt.value;
    decoded = decoded
        .replace(/<p[^>]*>/gi, "")
        .replace(/<\/p>/gi, "\n")
        .replace(/<div[^>]*>/gi, "")
        .replace(/<\/div>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n");
    return decoded.trim();
};

export function ChatFlow() {
  const { selectedBot } = useBot(); 
  const [loading, setLoading] = useState(false);
  
  // Estado do Fluxo
  const [flow, setFlow] = useState({
    start_mode: 'padrao', // 'padrao' ou 'miniapp'
    miniapp_url: '',
    miniapp_btn_text: 'ABRIR LOJA 🛍️',
    msg_boas_vindas: '',
    media_url: '',
    btn_text_1: '',
    autodestruir_1: false,
    msg_2_texto: '',
    msg_2_media: '',
    mostrar_planos_2: true,
    mostrar_planos_1: false // 🔥 A opção que faltava
  });

  const [steps, setSteps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null); 
  const [modalData, setModalData] = useState({
    tipo: 'mensagem',
    msg_texto: '',
    msg_media: '',
    mostrar_botao: true,
    btn_texto: 'Continuar',
    delay_seconds: 0,
    autodestruir: false
  });

  useEffect(() => {
    if (selectedBot) {
        loadData();
    }
  }, [selectedBot]);

  const loadData = async () => {
    try {
        const data = await flowService.getFlow(selectedBot.id);
        setFlow({
            start_mode: data.start_mode || 'padrao',
            miniapp_url: data.miniapp_url || '',
            miniapp_btn_text: data.miniapp_btn_text || 'ABRIR LOJA 🛍️',
            msg_boas_vindas: data.msg_boas_vindas || '',
            media_url: data.media_url || '',
            btn_text_1: data.btn_text_1 || '',
            autodestruir_1: data.autodestruir_1 || false,
            msg_2_texto: data.msg_2_texto || '',
            msg_2_media: data.msg_2_media || '',
            mostrar_planos_2: data.mostrar_planos_2 !== undefined ? data.mostrar_planos_2 : true,
            mostrar_planos_1: data.mostrar_planos_1 || false
        });
        setSteps(data.steps || []);
    } catch (error) {
        console.error("Erro ao carregar fluxo:", error);
    }
  };

  const handleSave = async () => {
    if (!selectedBot) return;
    setLoading(true);
    try {
        const flowToSave = {
            ...flow,
            msg_boas_vindas: cleanHtmlForTelegram(flow.msg_boas_vindas),
            msg_2_texto: cleanHtmlForTelegram(flow.msg_2_texto),
            steps: steps.map(step => ({
                ...step,
                msg_texto: cleanHtmlForTelegram(step.msg_texto)
            }))
        };

        await flowService.updateFlow(selectedBot.id, flowToSave);
        Swal.fire({
            icon: 'success',
            title: 'Fluxo Salvo!',
            text: 'As configurações foram atualizadas com sucesso.',
            timer: 2000,
            showConfirmButton: false
        });
    } catch (error) {
        Swal.fire('Erro', 'Não foi possível salvar o fluxo.', 'error');
    } finally {
        setLoading(false);
    }
  };

  // --- FUNÇÕES DOS PASSOS ---
  const handleOpenModal = (step = null) => {
    if (step) {
        setEditingStep(step);
        setModalData({...step});
    } else {
        setEditingStep(null);
        setModalData({
            tipo: 'mensagem',
            msg_texto: '',
            msg_media: '',
            mostrar_botao: true,
            btn_texto: 'Próximo',
            delay_seconds: 0,
            autodestruir: false
        });
    }
    setShowModal(true);
  };

  const handleSaveStep = () => {
    if (!modalData.msg_texto && !modalData.msg_media) {
        return Swal.fire('Atenção', 'Adicione pelo menos um texto ou mídia.', 'warning');
    }
    const cleanedData = {
        ...modalData,
        msg_texto: cleanHtmlForTelegram(modalData.msg_texto)
    };
    if (editingStep) {
        setSteps(steps.map(s => s.uid === editingStep.uid ? { ...cleanedData, uid: editingStep.uid } : s));
    } else {
        setSteps([...steps, { ...cleanedData, uid: Date.now() }]);
    }
    setShowModal(false);
  };

  const handleDeleteStep = (uid) => {
    setSteps(steps.filter(s => s.uid !== uid));
  };

  const moveStep = (index, direction) => {
    const newSteps = [...steps];
    if (direction === 'up' && index > 0) {
        [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
    } else if (direction === 'down' && index < newSteps.length - 1) {
        [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    }
    setSteps(newSteps);
  };

  if (!selectedBot) {
    return (
        <div className="empty-state">
            <h2>👈 Selecione um bot no menu lateral para configurar o fluxo.</h2>
        </div>
    );
  }

  return (
    <div className="chatflow-container">
      <div className="chatflow-header">
        <div className="header-titles">
            <h1>Fluxo de Conversa</h1>
            <p>Personalize como seu bot interage com os clientes.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="btn-save-main">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
            <Save size={18} />
        </Button>
      </div>

      <div className="flow-grid">
        {/* COLUNA DA ESQUERDA - CONFIGURAÇÃO */}
        <div className="config-column">
            
            {/* 1. START / BOAS VINDAS */}
            <div className="flow-step-card start-step">
                <div className="step-badge">INÍCIO</div>
                <h3>👋 Configuração Inicial</h3>
                
                {/* 🔥 MODO DE INÍCIO (CARDS VISUAIS RESTAURADOS) */}
                <div className="mode-selector-grid">
                    <div 
                        className={`mode-card ${flow.start_mode === 'padrao' ? 'selected-padrao' : ''}`}
                        onClick={() => setFlow({...flow, start_mode: 'padrao'})}
                    >
                        <div className="mode-icon"><MessageSquare size={24} /></div>
                        <div className="mode-info">
                            <h4>Modo Padrão</h4>
                            <p>Mensagem + Botão</p>
                        </div>
                        {flow.start_mode === 'padrao' && <div className="check-badge">ATIVO</div>}
                    </div>

                    <div 
                        className={`mode-card ${flow.start_mode === 'miniapp' ? 'selected-miniapp' : ''}`}
                        onClick={() => setFlow({...flow, start_mode: 'miniapp'})}
                    >
                        <div className="mode-icon"><Smartphone size={24} /></div>
                        <div className="mode-info">
                            <h4>Mini-App</h4>
                            <p>Abre o site direto</p>
                        </div>
                        {flow.start_mode === 'miniapp' && <div className="check-badge">ATIVO</div>}
                    </div>
                </div>

                {flow.start_mode === 'miniapp' ? (
                    <div className="miniapp-config-box">
                        <Input 
                            label="URL do Mini-App" 
                            placeholder="https://seu-site.com"
                            value={flow.miniapp_url}
                            onChange={(e) => setFlow({...flow, miniapp_url: e.target.value})}
                            icon={<Globe size={16}/>}
                        />
                        <Input 
                            label="Texto do Botão" 
                            value={flow.miniapp_btn_text}
                            onChange={(e) => setFlow({...flow, miniapp_btn_text: e.target.value})}
                            icon={<Smartphone size={16}/>}
                        />
                    </div>
                ) : (
                    <>
                        <div className="input-group">
                            <label>Mensagem de Saudação</label>
                            <RichInput 
                                value={flow.msg_boas_vindas}
                                onChange={(val) => setFlow({...flow, msg_boas_vindas: val})}
                                placeholder="Olá {nome}, seja bem vindo!"
                            />
                        </div>
                        
                        {/* 🔥 OPÇÃO DE MOSTRAR PLANOS RESTAURADA 🔥 */}
                        <div className="toggle-wrapper full-width" style={{marginTop: '10px', marginBottom: '15px'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <label style={{color: flow.mostrar_planos_1 ? '#10b981' : '#ccc', fontWeight: flow.mostrar_planos_1 ? 'bold' : 'normal'}}>
                                    {flow.mostrar_planos_1 ? '🛒 Planos visíveis na 1ª Mensagem' : '👁️ Mostrar planos nesta mensagem?'}
                                </label>
                                <div 
                                    className={`custom-toggle ${flow.mostrar_planos_1 ? 'active-green' : ''}`}
                                    onClick={() => setFlow({...flow, mostrar_planos_1: !flow.mostrar_planos_1})}
                                >
                                    <div className="toggle-handle"></div>
                                </div>
                            </div>
                            <small className="hint-text" style={{marginTop: 5}}>
                                {flow.mostrar_planos_1 
                                    ? "⚠️ Atenção: O fluxo encerrará aqui. Passos seguintes serão ignorados." 
                                    : "Os planos aparecerão apenas no final do fluxo."}
                            </small>
                        </div>

                        <Input 
                            label="Mídia (URL Imagem/Vídeo) - Opcional"
                            value={flow.media_url}
                            onChange={(e) => setFlow({...flow, media_url: e.target.value})}
                            icon={<ImageIcon size={16}/>}
                        />
                        
                        {!flow.mostrar_planos_1 && (
                            <div className="row-inputs">
                                <Input 
                                    label="Texto do Botão (Próximo)" 
                                    value={flow.btn_text_1}
                                    onChange={(e) => setFlow({...flow, btn_text_1: e.target.value})}
                                />
                                <div className="toggle-wrapper">
                                    <label>Auto-destruir?</label>
                                    <div 
                                        className={`custom-toggle ${flow.autodestruir_1 ? 'active' : ''}`}
                                        onClick={() => setFlow({...flow, autodestruir_1: !flow.autodestruir_1})}
                                    >
                                        <div className="toggle-handle"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* SE MOSTRAR PLANOS NA 1ª, ESCONDE O RESTO DO FLUXO VISUALMENTE PARA NÃO CONFUNDIR */}
            {!flow.mostrar_planos_1 && flow.start_mode !== 'miniapp' && (
                <>
                    <div className="connector-line">
                        <ArrowDown size={24} />
                    </div>

                    {/* 2. PASSOS DINÂMICOS */}
                    {steps.map((step, index) => (
                        <React.Fragment key={step.uid || index}>
                            <div className="flow-step-card dynamic-step">
                                <div className="step-header">
                                    <span className="step-number">#{index + 1}</span>
                                    <div className="step-actions">
                                        <button onClick={() => moveStep(index, 'up')} disabled={index === 0}>⬆</button>
                                        <button onClick={() => moveStep(index, 'down')} disabled={index === steps.length - 1}>⬇</button>
                                        <button className="edit-btn" onClick={() => handleOpenModal(step)}><Edit size={14}/></button>
                                        <button className="delete-btn" onClick={() => handleDeleteStep(step.uid)}><Trash2 size={14}/></button>
                                    </div>
                                </div>
                                <div className="step-preview">
                                    <p><strong>Msg:</strong> {step.msg_texto.replace(/<[^>]*>/g, '').substring(0, 50)}...</p>
                                    {step.mostrar_botao ? (
                                        <span className="tag-btn">Botão: {step.btn_texto}</span>
                                    ) : (
                                        <span className="tag-delay">Wait: {step.delay_seconds}s</span>
                                    )}
                                </div>
                            </div>
                            <div className="connector-line"><ArrowDown size={24} /></div>
                        </React.Fragment>
                    ))}

                    <div className="add-step-wrapper">
                        <button className="btn-add-step" onClick={() => handleOpenModal()}>
                            <Plus size={20} /> Adicionar Passo Intermediário
                        </button>
                    </div>

                    <div className="connector-line"><ArrowDown size={24} /></div>

                    {/* 3. CHECKOUT / OFERTA */}
                    <div className="flow-step-card end-step">
                        <div className="step-badge final">FINAL</div>
                        <h3>💰 Oferta & Checkout</h3>
                        
                        <div className="input-group">
                            <label>Mensagem de Oferta</label>
                            <RichInput 
                                value={flow.msg_2_texto}
                                onChange={(val) => setFlow({...flow, msg_2_texto: val})}
                                placeholder="Ex: Essa é a sua chance..."
                            />
                        </div>
                        <Input 
                            label="Mídia da Oferta (URL)"
                            value={flow.msg_2_media}
                            onChange={(e) => setFlow({...flow, msg_2_media: e.target.value})}
                            icon={<Video size={16}/>}
                        />
                        
                        <div className="info-box" style={{marginTop: 15, padding: 15, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'center'}}>
                            <ShoppingBag size={20} color="#10b981" />
                            <p style={{margin:0, fontSize: '0.9rem', color: '#fff'}}>
                                Botões de compra serão exibidos automaticamente aqui.
                            </p>
                        </div>
                    </div>
                </>
            )}

        </div>

        {/* COLUNA DA DIREITA - PREVIEW (MOCKUP) */}
        <div className="preview-column">
            <div className="iphone-mockup">
                <div className="iphone-notch"></div>
                <div className="iphone-screen">
                    <div className="telegram-header">
                        <div className="bot-avatar">🤖</div>
                        <div className="bot-info">
                            <h4>{selectedBot.nome || 'Seu Bot'}</h4>
                            <span>bot</span>
                        </div>
                    </div>
                    <div className="chat-content">
                        {/* Mensagem 1 */}
                        <div className="msg-bubble bot">
                            {flow.media_url && <div className="msg-media-placeholder">📷 Mídia</div>}
                            <div className="msg-text" dangerouslySetInnerHTML={{__html: flow.msg_boas_vindas || '...'}} />
                            
                            {/* 🔥 PREVIEW: SE MOSTRAR PLANOS AQUI, EXIBE BOTÕES DE COMPRA */}
                            {flow.mostrar_planos_1 ? (
                                <>
                                    <div className="msg-btn">🔥 Plano Mensal - R$ 14,90</div>
                                    <div className="msg-btn">💎 Vitalício - R$ 19,90</div>
                                </>
                            ) : (
                                flow.btn_text_1 && <div className="msg-btn">{flow.btn_text_1}</div>
                            )}
                        </div>

                        {/* SE NÃO MOSTRAR PLANOS NA 1ª, MOSTRA O RESTO DO PREVIEW */}
                        {!flow.mostrar_planos_1 && flow.start_mode !== 'miniapp' && (
                            <>
                                {steps.length > 0 && (
                                    <div className="msg-divider">
                                        <span>+ {steps.length} passos...</span>
                                    </div>
                                )}

                                {/* Mensagem Oferta */}
                                <div className="msg-bubble bot">
                                    {flow.msg_2_media && <div className="msg-media-placeholder">📹 Vídeo</div>}
                                    <div className="msg-text" dangerouslySetInnerHTML={{__html: flow.msg_2_texto || '...'}} />
                                    <div className="msg-btn">🔥 Plano Mensal - R$ 14,90</div>
                                    <div className="msg-btn">💎 Vitalício - R$ 19,90</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO DE PASSOS */}
      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{editingStep ? 'Editar Passo' : 'Novo Passo'}</h3>
                    <button onClick={() => setShowModal(false)}><Trash2 size={18}/></button>
                </div>
                <div className="modal-body">
                    <div className="input-group">
                        <label>Mensagem</label>
                        <RichInput value={modalData.msg_texto} onChange={val => setModalData({...modalData, msg_texto: val})} />
                    </div>
                    <Input label="Mídia (URL)" value={modalData.msg_media} onChange={e => setModalData({...modalData, msg_media: e.target.value})} />
                    <div className="modal-options-box">
                        <label className="checkbox-label"><input type="checkbox" checked={modalData.mostrar_botao} onChange={e => setModalData({...modalData, mostrar_botao: e.target.checked})} /> Mostrar botão "Próximo"?</label>
                        {modalData.mostrar_botao ? (<Input label="Texto do Botão" value={modalData.btn_texto} onChange={e => setModalData({...modalData, btn_texto: e.target.value})} />) : (<div className="delay-input-wrapper"><Input label="Intervalo (s)" type="number" value={modalData.delay_seconds} onChange={e => setModalData({...modalData, delay_seconds: parseInt(e.target.value) || 0})} icon={<Clock size={16}/>} /></div>)}
                    </div>
                    <div className="toggle-wrapper modal-toggle">
                        <label>Auto-destruir?</label>
                        <div className={`custom-toggle ${modalData.autodestruir ? 'active' : ''}`} onClick={() => setModalData({...modalData, autodestruir: !modalData.autodestruir})}><div className="toggle-handle"></div></div>
                    </div>
                    <div className="modal-actions"><button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn-save" onClick={handleSaveStep}>Salvar</button></div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}