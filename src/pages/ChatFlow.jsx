import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Save, MessageSquare, ArrowDown, Zap, Image as ImageIcon, Video, Plus, Trash2, Edit, Clock, Layout, Globe, Smartphone, ShoppingBag } from 'lucide-react';
import { flowService } from '../services/api'; 
import { useBot } from '../context/BotContext'; 
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { RichInput } from '../components/RichInput';
import './ChatFlow.css';

// 🧼 FUNÇÃO DE LIMPEZA DE HTML PARA TELEGRAM (A MÁGICA ACONTECE AQUI)
// Essa função remove tags de site (<p>, <div>) e garante que as tags de formatação
// (<b>, <strong>, <i>) sejam enviadas corretamente para o bot.
const cleanHtmlForTelegram = (html) => {
    if (!html) return "";
    
    // 1. Cria um elemento temporário para decodificar entidades (ex: &lt;b&gt; vira <b>)
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    let decoded = txt.value;

    // 2. Substitui parágrafos e divs por quebras de linha reais (\n)
    // Telegram não suporta <p>, então trocamos </p> por Enter.
    decoded = decoded
        .replace(/<p[^>]*>/gi, "")
        .replace(/<\/p>/gi, "\n")
        .replace(/<div[^>]*>/gi, "")
        .replace(/<\/div>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n");

    // 3. Remove excesso de espaços em branco nas pontas
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
    mostrar_planos_1: false 
  });

  // Estado dos Passos Dinâmicos (Lista)
  const [steps, setSteps] = useState([]);

  // Estado do Modal de Edição de Passos
  const [showModal, setShowModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null); // null = criando novo
  const [modalData, setModalData] = useState({
    tipo: 'mensagem',
    msg_texto: '',
    msg_media: '',
    mostrar_botao: true,
    btn_texto: 'Continuar',
    delay_seconds: 0,
    autodestruir: false
  });

  // Carregar dados ao selecionar bot
  useEffect(() => {
    if (selectedBot) {
        loadData();
    }
  }, [selectedBot]);

  const loadData = async () => {
    try {
        const data = await flowService.getFlow(selectedBot.id);
        // Garante que os campos existam mesmo se vierem null
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

  // ✅ SALVAMENTO DO FLUXO (CORREÇÃO APLICADA)
  const handleSave = async () => {
    if (!selectedBot) return;
    setLoading(true);
    try {
        // Aplica a limpeza nos campos de texto rico antes de enviar
        const flowToSave = {
            ...flow,
            msg_boas_vindas: cleanHtmlForTelegram(flow.msg_boas_vindas),
            msg_2_texto: cleanHtmlForTelegram(flow.msg_2_texto),
            // Também limpamos os passos dinâmicos, caso existam
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

  // --- FUNÇÕES DOS PASSOS DINÂMICOS ---

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
    // Validação básica
    if (!modalData.msg_texto && !modalData.msg_media) {
        return Swal.fire('Atenção', 'Adicione pelo menos um texto ou mídia.', 'warning');
    }

    // Aplica limpeza no texto do modal também
    const cleanedData = {
        ...modalData,
        msg_texto: cleanHtmlForTelegram(modalData.msg_texto)
    };

    if (editingStep) {
        // Editando
        setSteps(steps.map(s => s.uid === editingStep.uid ? { ...cleanedData, uid: editingStep.uid } : s));
    } else {
        // Criando novo
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
        <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
            <Save size={18} style={{ marginLeft: 8 }} />
        </Button>
      </div>

      <div className="flow-grid">
        {/* COLUNA DA ESQUERDA - CONFIGURAÇÃO */}
        <div className="config-column">
            
            {/* 1. START / BOAS VINDAS */}
            <div className="flow-step-card start-step">
                <div className="step-badge">INÍCIO</div>
                <h3>👋 Boas Vindas</h3>
                
                <div className="input-group">
                    <label>Modo de Início</label>
                    <select 
                        value={flow.start_mode} 
                        onChange={(e) => setFlow({...flow, start_mode: e.target.value})}
                        className="custom-select"
                    >
                        <option value="padrao">Padrão (Mensagem + Botão)</option>
                        <option value="miniapp">Mini-App (Webview)</option>
                    </select>
                </div>

                {flow.start_mode === 'miniapp' ? (
                    <div className="miniapp-config">
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
                        <Input 
                            label="Mídia (URL Imagem/Vídeo) - Opcional"
                            value={flow.media_url}
                            onChange={(e) => setFlow({...flow, media_url: e.target.value})}
                            icon={<ImageIcon size={16}/>}
                        />
                        <div className="row-inputs">
                            <Input 
                                label="Texto do Botão" 
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
                    </>
                )}
            </div>

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
                
                <div className="info-box">
                    <ShoppingBag size={18} />
                    <p>Os botões dos planos configurados na aba <strong>Planos</strong> aparecerão automaticamente aqui.</p>
                </div>
            </div>

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
                            {flow.btn_text_1 && <div className="msg-btn">{flow.btn_text_1}</div>}
                        </div>

                        {/* Passos Dinâmicos (Visualização simplificada) */}
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