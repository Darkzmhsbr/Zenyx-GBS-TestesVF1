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

// --- FUNÇÃO DE LIMPEZA E DECODIFICAÇÃO ---
const decodeHtml = (html) => {
    if (!html) return "";
    const str = String(html);
    
    // Cria área temporária para o navegador decodificar as entidades (&lt; para <)
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    let decoded = txt.value;

    // Remove tags de bloco e troca por quebra de linha
    decoded = decoded
        .replace(/<p[^>]*>/gi, "")
        .replace(/<\/p>/gi, "\n")
        .replace(/<div[^>]*>/gi, "")
        .replace(/<\/div>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n");

    return decoded.trim();
};

// 🔥 MENSAGEM PADRÃO DO PIX (TEMPLATE INTELIGENTE COM {oferta})
const DEFAULT_PIX_TEMPLATE = `🌟 Seu pagamento foi gerado:

🎁 Plano: <b>{plano}</b>
{oferta}

🔐 Pix Copia e Cola:

{qrcode}

👆 Toque para copiar
⚡ Acesso automático!`;

export function ChatFlow() {
  const { selectedBot } = useBot(); 
  const [loading, setLoading] = useState(false);
  
  // Estado do Fluxo
  const [flow, setFlow] = useState({
    start_mode: 'padrao', 
    miniapp_url: '',
    miniapp_btn_text: 'ABRIR LOJA 🛍️',
    msg_boas_vindas: '',
    media_url: '',
    btn_text_1: '',
    autodestruir_1: false,
    msg_2_texto: '',
    msg_2_media: '',
    mostrar_planos_2: true,
    mostrar_planos_1: false,
    msg_pix: '',  // Conteúdo da mensagem
    use_custom_pix: false // Estado do toggle visual (controle local)
  });

  // Estado dos Passos Dinâmicos (Lista)
  const [steps, setSteps] = useState([]);
  
  // Estado do Modal
  const [showModal, setShowModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null); 
  const [modalData, setModalData] = useState({
    msg_texto: '',
    msg_media: '',
    btn_texto: 'Próximo ▶️',
    autodestruir: false,
    mostrar_botao: true,
    delay_seconds: 0 
  });

  // Carrega tudo ao mudar o bot
  useEffect(() => {
    if (selectedBot) {
      carregarTudo();
    }
  }, [selectedBot]);

  const carregarTudo = async () => {
    setLoading(true);
    try {
        const flowData = await flowService.getFlow(selectedBot.id);
        
        if (flowData) {
            // Helper para evitar null/undefined, mas PRESERVANDO dados antigos
            const safe = (val) => {
                if (val === null || val === undefined) return '';
                if (typeof val === 'object') return ''; // Proteção contra objetos vazios
                return String(val);
            };

            // 🔥 LÓGICA DO PIX: Se vier vazio do banco, usa o padrão
            let pixMsg = safe(flowData.msg_pix);
            const hasCustomPix = pixMsg.length > 0;
            
            if (!hasCustomPix) {
                pixMsg = DEFAULT_PIX_TEMPLATE;
            }

            setFlow({
                ...flowData, // Espalha propriedades existentes para garantir que nada se perca
                start_mode: flowData.start_mode || 'padrao',
                miniapp_btn_text: flowData.miniapp_btn_text || 'ABRIR LOJA 🛍️',
                msg_boas_vindas: safe(flowData.msg_boas_vindas),
                media_url: flowData.media_url || '',
                btn_text_1: flowData.btn_text_1 || '🔓 DESBLOQUEAR ACESSO',
                autodestruir_1: flowData.autodestruir_1 || false,
                msg_2_texto: safe(flowData.msg_2_texto), 
                msg_2_media: flowData.msg_2_media || '',
                mostrar_planos_2: flowData.mostrar_planos_2 !== false,
                mostrar_planos_1: flowData.mostrar_planos_1 || false,
                msg_pix: pixMsg, // ✅ Carrega o padrão (com {oferta}) se estiver vazio
                use_custom_pix: hasCustomPix // Define estado inicial do toggle
            });
        }
        
        const stepsData = await flowService.getSteps(selectedBot.id);
        setSteps(stepsData || []);
        
    } catch (error) {
        console.error("Erro ao carregar fluxo:", error);
    } finally {
        setLoading(false);
    }
  };

  // ✅ CORREÇÃO DO [object Object]: Extrai o valor corretamente
  const handleRichChange = (field, val) => {
      let cleanValue = val;
      // Se vier um evento (e.target.value), extrai. Se vier string, usa direto.
      if (val && typeof val === 'object' && val.target) {
          cleanValue = val.target.value;
      }
      // Proteção final: se ainda for objeto, vira string vazia
      if (typeof cleanValue === 'object') cleanValue = '';
      
      setFlow(prev => ({ ...prev, [field]: cleanValue }));
  };

  const handleSaveFixed = async () => {
    if (flow.start_mode === 'miniapp' && !flow.miniapp_url) {
        return Swal.fire('Atenção', 'Cole o link do seu Mini App para salvar.', 'warning');
    }
    
    setLoading(true);
    try {
      // 🔥 LÓGICA DO TOGGLE:
      // Se use_custom_pix for FALSE, enviamos string vazia "".
      // O backend reconhece "" e usa o padrão hardcoded (com preço tachado).
      // Se for TRUE, enviamos o texto editado.
      const pixToSend = flow.use_custom_pix ? decodeHtml(flow.msg_pix) : "";

      // 🔥 AQUI APLICAMOS A CORREÇÃO DE FORMATAÇÃO
      // Limpamos o HTML e decodificamos as entidades ANTES de enviar pro banco
      const flowToSave = {
          ...flow,
          msg_boas_vindas: decodeHtml(flow.msg_boas_vindas),
          msg_2_texto: decodeHtml(flow.msg_2_texto), // Limpa a oferta
          msg_pix: pixToSend, // 🔥 SALVA O PIX (OU VAZIO SE DESATIVADO)
          steps: steps.map(s => ({
              ...s,
              msg_texto: decodeHtml(s.msg_texto)
          }))
      };

      await flowService.saveFlow(selectedBot.id, flowToSave);
      
      Swal.fire({
        icon: 'success',
        title: 'Fluxo Salvo!',
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        background: '#151515', color: '#fff'
      });
      
      // Recarrega para garantir que os dados limpos voltem do banco
      carregarTudo();

    } catch (error) {
      console.error("Erro ao salvar:", error);
      Swal.fire('Erro', 'Falha ao salvar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingStep(null);
    setModalData({ msg_texto: '', msg_media: '', btn_texto: 'Próximo ▶️', autodestruir: false, mostrar_botao: true, delay_seconds: 0 });
    setShowModal(true);
  };

  const handleOpenEditModal = (step) => {
    setEditingStep(step);
    setModalData({
      msg_texto: step.msg_texto || '',
      msg_media: step.msg_media || '',
      btn_texto: step.btn_texto || 'Próximo ▶️',
      autodestruir: step.autodestruir || false,
      mostrar_botao: step.mostrar_botao !== false,
      delay_seconds: step.delay_seconds || 0
    });
    setShowModal(true);
  };

  const handleSaveStep = async () => {
    if (!modalData.msg_texto && !modalData.msg_media) {
      return Swal.fire('Atenção', 'O passo precisa ter texto ou mídia!', 'warning');
    }
    try {
        // Limpeza no modal também
        const cleanedData = {
            ...modalData,
            msg_texto: decodeHtml(modalData.msg_texto)
        };

        if (editingStep) {
            await flowService.updateStep(selectedBot.id, editingStep.id, cleanedData);
            Swal.fire({ icon: 'success', title: 'Passo Atualizado!', timer: 1500, showConfirmButton: false, background: '#151515', color: '#fff' });
        } else {
            await flowService.addStep(selectedBot.id, { ...cleanedData, step_order: steps.length + 1 });
            Swal.fire({ icon: 'success', title: 'Passo Adicionado!', timer: 1500, showConfirmButton: false, background: '#151515', color: '#fff' });
        }
        setShowModal(false);
        setEditingStep(null);
        carregarTudo(); 
    } catch (error) {
        Swal.fire('Erro', 'Falha ao salvar passo.', 'error');
    }
  };

  const handleDeleteStep = async (stepId) => {
    const result = await Swal.fire({
        title: 'Excluir Passo?',
        text: "Isso removerá esta mensagem do fluxo.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir',
        background: '#151515', 
        color: '#fff'
    });
    if (result.isConfirmed) {
        try {
            await flowService.deleteStep(selectedBot.id, stepId);
            carregarTudo();
        } catch (error) {
            Swal.fire('Erro', 'Falha ao excluir.', 'error');
        }
    }
  };

  if (!selectedBot) return <div className="chatflow-container">Selecione um bot...</div>;

  return (
    <div className="chatflow-container">
      
      {/* HEADER */}
      <div className="chatflow-header">
        <div className="header-titles">
          <h1>Editor de Fluxo</h1>
          <p>Configure a sequência de mensagens do seu bot.</p>
        </div>
        <div className="header-actions">
          <Button onClick={handleSaveFixed} disabled={loading} className="btn-save-main">
            <Save size={20} style={{marginRight: '8px'}} /> 
            SALVAR ALTERAÇÕES
          </Button>
        </div>
      </div>

      <div className="flow-grid">
         {/* COLUNA ESQUERDA: VISUALIZAÇÃO CELULAR */}
         <div className="preview-column">
            <div className="iphone-mockup">
                <div className="notch"></div>
                <div className="screen-content">
                    <div className="chat-header-mock">
                        <div className="bot-avatar-mock">🤖</div>
                        <div className="bot-info-mock">
                            <strong>{selectedBot?.nome || "Seu Bot"}</strong>
                            <span>bot</span>
                        </div>
                    </div>
                    <div className="messages-area">
                        <div className="msg-bubble bot">
                            {flow.media_url && (
                                <div className="media-preview-mock">
                                    {flow.media_url.includes('mp4') ? <Video size={20}/> : <ImageIcon size={20}/>} Mídia
                                </div>
                            )}
                            <p dangerouslySetInnerHTML={{__html: (typeof flow.msg_boas_vindas === 'string' ? flow.msg_boas_vindas : '') || "Olá! Configure sua mensagem..."}}></p>
                        </div>
                        {flow.start_mode === 'padrao' && flow.btn_text_1 && (
                            <div className="btn-bubble">{flow.btn_text_1}</div>
                        )}
                        {flow.start_mode === 'miniapp' && (
                             <div className="btn-bubble store-btn">
                                <Smartphone size={14} style={{marginRight:4}}/>
                                {flow.miniapp_btn_text}
                             </div>
                        )}
                        {steps.map((s, idx) => (
                            <div key={idx} style={{opacity: 0.7, marginTop: 10}}>
                                <div className="msg-bubble bot">
                                    {s.msg_media && <div className="media-preview-mock"><ImageIcon size={14}/></div>}
                                    <p dangerouslySetInnerHTML={{__html: s.msg_texto}}></p>
                                </div>
                                {s.btn_texto && <div className="btn-bubble">{s.btn_texto}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
         </div>

         {/* COLUNA DIREITA: CONFIGURAÇÃO */}
         <div className="config-column">
            <Card className="step-card start-mode-card">
                <CardContent>
                    <div className="card-header-row">
                        <Layout size={24} color="#c333ff" />
                        <h3>Modo de Início do Bot (/start)</h3>
                    </div>
                    <div className="mode-selector-grid">
                        <div className={`mode-card ${flow.start_mode === 'padrao' ? 'selected-padrao' : ''}`}
                             onClick={() => setFlow({...flow, start_mode: 'padrao'})}>
                            <div className="mode-icon"><MessageSquare size={28} /></div>
                            <div className="mode-info"><h4>Fluxo Padrão</h4><p>Mensagem + Botão que libera conteúdo.</p></div>
                            {flow.start_mode === 'padrao' && <div className="check-badge">ATIVO</div>}
                        </div>
                        <div className={`mode-card ${flow.start_mode === 'miniapp' ? 'selected-miniapp' : ''}`}
                             onClick={() => setFlow({...flow, start_mode: 'miniapp'})}>
                            <div className="mode-icon"><Smartphone size={28} /></div>
                            <div className="mode-info"><h4>Mini App / Loja</h4><p>Botão Web App que abre a loja direta.</p></div>
                            {flow.start_mode === 'miniapp' && <div className="check-badge">ATIVO</div>}
                        </div>
                    </div>
                    {flow.start_mode === 'miniapp' && (
                        <div className="miniapp-config-box">
                            <Input label="Link da Loja / Mini App" value={flow.miniapp_url} onChange={e => setFlow({...flow, miniapp_url: e.target.value})} icon={<Globe size={16} />} />
                            <Input label="Texto do Botão" value={flow.miniapp_btn_text} onChange={e => setFlow({...flow, miniapp_btn_text: e.target.value})} />
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flow-connector"><ArrowDown size={24} /></div>

            <Card className="step-card">
                <div className="step-badge">Passo 1 (Início)</div>
                <CardContent>
                    <div className="step-header">
                        <div className="step-title-row"><MessageSquare size={20} color="#d65ad1"/><h3>Mensagem de Boas-Vindas</h3></div>
                    </div>
                    <div className="form-grid">
                        {/* 🔥 USO DA FUNÇÃO DE MUDANÇA SEGURA */}
                        <RichInput label="Texto da Mensagem" value={flow.msg_boas_vindas} onChange={val => handleRichChange('msg_boas_vindas', val)} />
                        
                        <Input label="Link da Mídia (Opcional)" value={flow.media_url} onChange={e => setFlow({...flow, media_url: e.target.value})} icon={<ImageIcon size={16}/>} />
                        {flow.start_mode === 'padrao' && (
                            <div className="buttons-config">
                                <div className="toggle-wrapper full-width">
                                    <label>Mostrar botões de Planos (Checkout) nesta mensagem?</label>
                                    <div className={`custom-toggle ${flow.mostrar_planos_1 ? 'active-green' : ''}`} onClick={() => setFlow({...flow, mostrar_planos_1: !flow.mostrar_planos_1})}>
                                        <div className="toggle-handle"></div><span className="toggle-label">{flow.mostrar_planos_1 ? 'SIM' : 'NÃO'}</span>
                                    </div>
                                </div>
                                {!flow.mostrar_planos_1 && (
                                    <div className="row-inputs">
                                            <Input label="Texto do Botão de Ação" value={flow.btn_text_1} onChange={e => setFlow({...flow, btn_text_1: e.target.value})} />
                                            <div className="toggle-wrapper">
                                                <label>Auto-destruir ao clicar?</label>
                                                <div className={`custom-toggle ${flow.autodestruir_1 ? 'active' : ''}`} onClick={() => setFlow({...flow, autodestruir_1: !flow.autodestruir_1})}>
                                                    <div className="toggle-handle"></div><span className="toggle-label">{flow.autodestruir_1 ? 'SIM' : 'NÃO'}</span>
                                                </div>
                                            </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {flow.start_mode === 'padrao' && (
                <>
                    <div className="connector-line"></div><div className="connector-arrow"><ArrowDown size={24} color="#444" /></div>
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <Card className="step-card step-card-dynamic">
                                <div className="step-badge dynamic-badge">Passo Extra {index + 1}</div>
                                <CardContent>
                                    <div className="step-header">
                                        <div className="step-title-row"><Zap size={20} color="#fff"/><h3>Mensagem Intermediária</h3></div>
                                        <div className="step-actions">
                                            <button className="icon-btn edit" onClick={() => handleOpenEditModal(step)}><Edit size={18} color="#3b82f6"/></button>
                                            <button className="icon-btn danger" onClick={() => handleDeleteStep(step.id)}><Trash2 size={18} color="#ef4444"/></button>
                                        </div>
                                    </div>
                                    <div className="preview-box"><p>{step.msg_texto ? step.msg_texto.substring(0, 100) : '(Mídia)'}</p></div>
                                </CardContent>
                            </Card>
                            <div className="connector-line"></div><div className="connector-arrow"><ArrowDown size={24} color="#444" /></div>
                        </React.Fragment>
                    ))}
                    <div className="add-step-wrapper">
                        <button className="btn-add-step" onClick={handleOpenCreateModal}><Plus size={20} /> Adicionar Nova Mensagem</button>
                    </div>
                    <div className="connector-line"></div><div className="connector-arrow"><ArrowDown size={24} color="#444" /></div>
                    <Card className="step-card">
                        <div className="step-badge final">Passo Final (Oferta)</div>
                        <CardContent>
                            <div className="step-header"><div className="step-title-row"><ShoppingBag size={20} color="#10b981"/><h3>Mensagem de Oferta & Checkout</h3></div></div>
                            <div className="form-grid">
                                {/* 🔥 AQUI ESTÁ A CORREÇÃO PRINCIPAL */}
                                <RichInput label="Texto da Oferta" value={flow.msg_2_texto} onChange={val => handleRichChange('msg_2_texto', val)} />
                                
                                <Input label="Mídia da Oferta (Opcional)" value={flow.msg_2_media} onChange={e => setFlow({...flow, msg_2_media: e.target.value})} icon={<Video size={16}/>} />
                                <div className="toggle-wrapper full-width">
                                    <label>Mostrar botões de Planos automaticamente?</label>
                                    <div className={`custom-toggle ${flow.mostrar_planos_2 ? 'active-green' : ''}`} onClick={() => setFlow({...flow, mostrar_planos_2: !flow.mostrar_planos_2})}>
                                        <div className="toggle-handle"></div><span className="toggle-label">{flow.mostrar_planos_2 ? 'SIM' : 'OCULTAR'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 🔥 CARD MENSAGEM DO PIX (COM TOGGLE E {oferta}) */}
                    <div className="connector-line"></div><div className="connector-arrow"><ArrowDown size={24} color="#444" /></div>
                    <Card className="step-card">
                        <div className="step-badge" style={{background: '#10b981', color: '#fff'}}>Mensagem do Pix</div>
                        <CardContent>
                            <div className="step-header">
                                <div className="step-title-row"><Zap size={20} color="#10b981"/><h3>Personalizar Mensagem do PIX</h3></div>
                                
                                {/* TOGGLE DE ATIVAÇÃO */}
                                <div className="toggle-wrapper">
                                    <label style={{marginRight: 10, fontSize: '0.9rem', color: '#ccc'}}>Personalizar?</label>
                                    <div 
                                        className={`custom-toggle ${flow.use_custom_pix ? 'active-green' : ''}`} 
                                        onClick={() => setFlow({...flow, use_custom_pix: !flow.use_custom_pix})}
                                    >
                                        <div className="toggle-handle"></div>
                                        <span className="toggle-label">{flow.use_custom_pix ? 'SIM' : 'NÃO'}</span>
                                    </div>
                                </div>
                            </div>

                            {flow.use_custom_pix ? (
                                <div className="form-grid fade-in-up">
                                    <div className="alert-box" style={{background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem', color: '#fff', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
                                        ℹ️ <b>Variáveis disponíveis:</b><br/>
                                        <code>{'{nome}'}</code>, <code>{'{plano}'}</code>, <code>{'{valor}'}</code>, <code>{'{oferta}'}</code>, <code>{'{qrcode}'}</code>
                                    </div>
                                    <RichInput 
                                        label="Texto da Mensagem Pix" 
                                        value={flow.msg_pix} 
                                        onChange={val => handleRichChange('msg_pix', val)}
                                        rows={8}
                                    />
                                </div>
                            ) : (
                                <div className="disabled-state" style={{padding: '20px', textAlign: 'center', color: '#666', border: '1px dashed #333', borderRadius: '8px'}}>
                                    <p>Usando mensagem padrão do sistema.</p>
                                    <small>(Ative a personalização acima para editar)</small>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
         </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header-row"><h2>{editingStep ? 'Editar Mensagem' : 'Nova Mensagem'}</h2><button className="btn-close-modal" onClick={() => setShowModal(false)}>✕</button></div>
                <div className="modal-body">
                    {/* 🔥 CORREÇÃO MODAL TAMBÉM */}
                    <RichInput 
                        label="Texto" 
                        value={modalData.msg_texto} 
                        onChange={val => {
                            let clean = val;
                            if (val && typeof val === 'object' && val.target) clean = val.target.value;
                            if (typeof clean === 'object') clean = '';
                            setModalData({...modalData, msg_texto: clean});
                        }} 
                    />
                    <Input label="Mídia URL" value={modalData.msg_media} onChange={e => setModalData({...modalData, msg_media: e.target.value})} />
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