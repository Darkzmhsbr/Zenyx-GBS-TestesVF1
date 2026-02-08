import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Save, MessageSquare, ArrowDown, Zap, Image as ImageIcon, Video, Plus, Trash2, Edit, Clock, Layout, Globe, Smartphone, ShoppingBag, Link as LinkIcon, CreditCard, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
// 🔥 CORREÇÃO 1: Importação desestruturada para garantir compatibilidade com o novo api.js
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
    msg_pix: '',  
    use_custom_pix: false, 
    buttons_config: [],  // Botões mensagem 1
    buttons_config_2: []  // 🔥 Botões mensagem final
  });

  // Estado dos Passos Dinâmicos (Lista)
  const [steps, setSteps] = useState([]);

  // 🔥 ESTADO DE PLANOS (Para o Dropdown)
  const [availablePlans, setAvailablePlans] = useState([]);

  // Estado auxiliar para adicionar novos botões (MENSAGEM 1)
  const [newBtnData, setNewBtnData] = useState({ 
    type: 'action', 
    text: '', 
    value: 'step_1',
    autodestruir: false  // 🔥 NOVO
  });
  
  // 🔥 Estado auxiliar para adicionar novos botões (MENSAGEM 2 - FINAL)
  const [newBtnData2, setNewBtnData2] = useState({ 
    type: 'action', 
    text: '', 
    value: 'step_1',
    autodestruir: false  // 🔥 NOVO
  });
  
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
        // 1. Carrega o Fluxo
        const flowData = await flowService.getFlow(selectedBot.id);
        
        if (flowData) {
            const safe = (val) => {
                if (val === null || val === undefined) return '';
                if (typeof val === 'object') return ''; 
                return String(val);
            };

            let pixMsg = safe(flowData.msg_pix);
            const hasCustomPix = pixMsg.length > 0;
            if (!hasCustomPix) pixMsg = DEFAULT_PIX_TEMPLATE;

            // 🔥 PROTEÇÃO: Garante que os botões sejam sempre arrays
            let loadedButtons = flowData.buttons_config;
            if (!Array.isArray(loadedButtons)) loadedButtons = [];
            
            let loadedButtons2 = flowData.buttons_config_2;
            if (!Array.isArray(loadedButtons2)) loadedButtons2 = [];

            setFlow({
                ...flowData,
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
                msg_pix: pixMsg, 
                use_custom_pix: hasCustomPix,
                buttons_config: loadedButtons, 
                buttons_config_2: loadedButtons2 
            });
        }
        
        // 2. Carrega Passos Extras
        const stepsData = await flowService.getSteps(selectedBot.id);
        setSteps(stepsData || []);

        // 3. 🔥 CARREGA OS PLANOS DO BOT (Para o Dropdown)
        try {
            console.log("🔄 Buscando planos para o bot:", selectedBot.id);
            const plansResponse = await flowService.getPlans(selectedBot.id);
            console.log("✅ Resposta da API de planos:", plansResponse);

            // ✅ Garante que seja um array antes de setar
            if (Array.isArray(plansResponse)) {
                console.log(`📦 ${plansResponse.length} plano(s) carregado(s)`);
                setAvailablePlans(plansResponse);
            } else if (plansResponse && Array.isArray(plansResponse.plans)) {
                // Caso a API retorne { plans: [...] }
                console.log(`📦 ${plansResponse.plans.length} plano(s) carregado(s) (formato encapsulado)`);
                setAvailablePlans(plansResponse.plans);
            } else {
                console.warn("⚠️ Resposta de planos não está em formato de array:", plansResponse);
                setAvailablePlans([]);
            }
        } catch (e) {
            console.error("❌ Erro ao carregar planos:", e);
            setAvailablePlans([]);
        }
        
    } catch (error) {
        console.error("Erro ao carregar fluxo:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleRichChange = (field, val) => {
      let cleanValue = val;
      if (val && typeof val === 'object' && val.target) {
          cleanValue = val.target.value;
      }
      if (typeof cleanValue === 'object') cleanValue = '';
      
      setFlow(prev => ({ ...prev, [field]: cleanValue }));
  };

  // --- GERENCIADOR DE BOTÕES MENSAGEM 1 (FUNÇÕES) ---
  const handleAddButton = () => {
    if (!newBtnData.text.trim()) return Swal.fire('Erro', 'O botão precisa de um texto.', 'warning');
    if (!newBtnData.value) return Swal.fire('Erro', 'O valor (URL, Plano ou Ação) é obrigatório.', 'warning');

    const newBtn = {
        id: Date.now(),
        type: newBtnData.type,
        text: newBtnData.text,
        value: newBtnData.value,
        autodestruir: newBtnData.autodestruir  // 🔥 NOVO
    };

    setFlow(prev => ({
        ...prev,
        buttons_config: [...(prev.buttons_config || []), newBtn] // Proteção contra null
    }));
    setNewBtnData({ type: 'action', text: '', value: 'step_1', autodestruir: false }); // Reseta form
    
    // 🔥 Feedback visual
    Swal.fire({
        icon: 'success',
        title: 'Botão adicionado!',
        text: 'Não esqueça de salvar as alterações.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        background: '#151515',
        color: '#fff'
    });
  };

  const handleRemoveButton = (index) => {
    const newButtons = [...flow.buttons_config];
    newButtons.splice(index, 1);
    setFlow(prev => ({ ...prev, buttons_config: newButtons }));
  };

  const handleMoveButton = (index, direction) => {
    const newButtons = [...flow.buttons_config];
    if (direction === 'up' && index > 0) {
        [newButtons[index], newButtons[index - 1]] = [newButtons[index - 1], newButtons[index]];
    } else if (direction === 'down' && index < newButtons.length - 1) {
        [newButtons[index], newButtons[index + 1]] = [newButtons[index + 1], newButtons[index]];
    }
    setFlow(prev => ({ ...prev, buttons_config: newButtons }));
  };

  // 🔥 SELECIONAR PLANO NO DROPDOWN (MENSAGEM 1)
  const handleSelectPlan = (e) => {
      const planId = e.target.value;
      if (!planId) return;

      // Encontra o plano escolhido para pegar o nome
      const selectedPlan = availablePlans.find(p => String(p.id) === String(planId));
      
      console.log("🎯 Plano selecionado:", selectedPlan);
      
      setNewBtnData({
          ...newBtnData,
          value: planId,
          // 🔥 APENAS O NOME DO PLANO (com emojis/formatação)
          text: newBtnData.text ? newBtnData.text : (selectedPlan ? selectedPlan.nome_exibicao : '')
      });
  };

  // 🔥 FUNÇÕES PARA GERENCIAR BOTÕES DA MENSAGEM 2 (FINAL)
  const handleAddButton2 = () => {
    if (!newBtnData2.text.trim()) return Swal.fire('Erro', 'O botão precisa de um texto.', 'warning');
    if (!newBtnData2.value) return Swal.fire('Erro', 'O valor (URL, Plano ou Ação) é obrigatório.', 'warning');

    const newBtn = {
        id: Date.now(),
        type: newBtnData2.type,
        text: newBtnData2.text,
        value: newBtnData2.value,
        autodestruir: newBtnData2.autodestruir  // 🔥 NOVO
    };

    setFlow(prev => ({
        ...prev,
        buttons_config_2: [...(prev.buttons_config_2 || []), newBtn] // Proteção contra null
    }));
    setNewBtnData2({ type: 'action', text: '', value: 'step_1', autodestruir: false });
    
    Swal.fire({
        icon: 'success',
        title: 'Botão adicionado!',
        text: 'Não esqueça de salvar as alterações.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        background: '#151515',
        color: '#fff'
    });
  };

  const handleRemoveButton2 = (index) => {
    const newButtons = [...flow.buttons_config_2];
    newButtons.splice(index, 1);
    setFlow(prev => ({ ...prev, buttons_config_2: newButtons }));
  };

  const handleMoveButton2 = (index, direction) => {
    const newButtons = [...flow.buttons_config_2];
    if (direction === 'up' && index > 0) {
        [newButtons[index], newButtons[index - 1]] = [newButtons[index - 1], newButtons[index]];
    } else if (direction === 'down' && index < newButtons.length - 1) {
        [newButtons[index], newButtons[index + 1]] = [newButtons[index + 1], newButtons[index]];
    }
    setFlow(prev => ({ ...prev, buttons_config_2: newButtons }));
  };

  const handleSelectPlan2 = (e) => {
      const planId = e.target.value;
      if (!planId) return;

      const selectedPlan = availablePlans.find(p => String(p.id) === String(planId));
      
      setNewBtnData2({
          ...newBtnData2,
          value: planId,
          text: newBtnData2.text ? newBtnData2.text : (selectedPlan ? selectedPlan.nome_exibicao : '')
      });
  };

  // Helper para mostrar nome do plano na lista visual
  const getPlanName = (id) => {
      const p = availablePlans.find(plan => String(plan.id) === String(id));
      // 🔥 CORREÇÃO: Usa 'nome_exibicao'
      return p ? p.nome_exibicao : `Plano ID: ${id}`;
  };

  const handleSaveFixed = async () => {
    if (!selectedBot) {
        return Swal.fire('Erro', 'Nenhum bot selecionado.', 'error');
    }
    if (flow.start_mode === 'miniapp' && !flow.miniapp_url) {
        return Swal.fire('Atenção', 'Cole o link do seu Mini App para salvar.', 'warning');
    }
    
    setLoading(true);
    try {
      const pixToSend = flow.use_custom_pix ? decodeHtml(flow.msg_pix) : "";

      const flowToSave = {
          ...flow,
          msg_boas_vindas: decodeHtml(flow.msg_boas_vindas),
          msg_2_texto: decodeHtml(flow.msg_2_texto),
          msg_pix: pixToSend,
          // 🔥 GARANTIA: Envia explicitamente os arrays de botões
          buttons_config: flow.buttons_config || [], 
          buttons_config_2: flow.buttons_config_2 || [], 
          steps: steps.map(s => ({
              ...s,
              msg_texto: decodeHtml(s.msg_texto)
          }))
      };

      console.log("💾 TENTANDO SALVAR FLUXO COMPLETO...");
      console.log("Payload:", flowToSave);

      await flowService.saveFlow(selectedBot.id, flowToSave);
      console.log("✅ SALVO COM SUCESSO!");
      
      Swal.fire({
        icon: 'success',
        title: 'Fluxo Salvo!',
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        background: '#151515', color: '#fff'
      });
      
      carregarTudo();

    } catch (error) {
      console.error("❌ ERRO AO SALVAR:", error);
      Swal.fire('Erro', 'Falha ao salvar. Verifique o console.', 'error');
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
        const cleanedData = {
            ...modalData,
            msg_texto: decodeHtml(modalData.msg_texto)
        };
        
        console.log("💾 TENTANDO SALVAR PASSO ÚNICO...", cleanedData);

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
        console.error("❌ ERRO AO SALVAR PASSO:", error);
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
                        
                        {/* 🔥 RENDERIZAÇÃO DINÂMICA DOS BOTÕES NO MOCKUP */}
                        {flow.start_mode === 'padrao' && (
                            <>
                                {flow.buttons_config && flow.buttons_config.length > 0 ? (
                                    flow.buttons_config.map((btn, i) => (
                                        <div key={i} className="btn-bubble" style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                                            borderColor: btn.type === 'plan' ? '#c333ff' : btn.type === 'action' ? '#10b981' : '#3b82f6',
                                            color: btn.type === 'plan' ? '#c333ff' : btn.type === 'action' ? '#10b981' : '#3b82f6'
                                        }}>
                                            {btn.type === 'plan' ? <CreditCard size={12}/> : btn.type === 'action' ? <ArrowDown size={12}/> : <LinkIcon size={12}/>}
                                            {btn.text}
                                        </div>
                                    ))
                                ) : (
                                    flow.btn_text_1 && <div className="btn-bubble">{flow.btn_text_1}</div>
                                )}
                            </>
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
                        <RichInput label="Texto da Mensagem" value={flow.msg_boas_vindas} onChange={val => handleRichChange('msg_boas_vindas', val)} />
                        
                        <Input label="Link da Mídia (Opcional)" value={flow.media_url} onChange={e => setFlow({...flow, media_url: e.target.value})} icon={<ImageIcon size={16}/>} />
                        
                        {flow.start_mode === 'padrao' && (
                            <div className="buttons-config">
                                {/* 🔥🔥 GERENCIADOR DE BOTÕES COM AUTO-DESTRUIR 🔥🔥 */}
                                <div className="card-header-row" style={{marginBottom: '10px', borderBottom: 'none'}}>
                                    <h4 style={{margin:0, color: '#ccc', fontSize: '0.9rem'}}>Botões de Ação (Playlist)</h4>
                                </div>
                                
                                <div className="button-manager-container">
                                    {/* Lista de Botões */}
                                    <div className="btn-list">
                                        {flow.buttons_config && flow.buttons_config.length > 0 ? (
                                            flow.buttons_config.map((btn, index) => (
                                                <div key={index} className={`btn-config-item type-${btn.type}`}>
                                                    <div className="btn-config-info">
                                                        <span className="btn-label-main">
                                                            {btn.type === 'plan' ? <CreditCard size={12} style={{marginRight:5}}/> : 
                                                             btn.type === 'action' ? <ArrowDown size={12} style={{marginRight:5}}/> : 
                                                             <LinkIcon size={12} style={{marginRight:5}}/>}
                                                            {btn.text}
                                                        </span>
                                                        <span className="btn-label-sub">
                                                            {btn.type === 'plan' ? `Plano: ${getPlanName(btn.value)}` : 
                                                             btn.type === 'action' ? `Ação: ${btn.value}${btn.autodestruir ? ' 🔥' : ''}` : 
                                                             btn.value}
                                                        </span>
                                                    </div>
                                                    <div className="btn-controls">
                                                        <button className="mini-action-btn" onClick={() => handleMoveButton(index, 'up')} title="Mover para cima">
                                                            <ChevronUp size={14}/>
                                                        </button>
                                                        <button className="mini-action-btn" onClick={() => handleMoveButton(index, 'down')} title="Mover para baixo">
                                                            <ChevronDown size={14}/>
                                                        </button>
                                                        <button className="mini-action-btn delete" onClick={() => handleRemoveButton(index)} title="Remover">
                                                            <Trash2 size={14}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{color: '#666', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center'}}>Nenhum botão adicionado.</p>
                                        )}
                                    </div>

                                    {/* Área de Adicionar */}
                                    <div className="add-btn-area">
                                        <div className="row-inputs">
                                            <select 
                                                className="select-type" 
                                                value={newBtnData.type} 
                                                onChange={e => setNewBtnData({...newBtnData, type: e.target.value, value: e.target.value === 'action' ? 'step_1' : '', text: '', autodestruir: false})}
                                            >
                                                <option value="action">▶️ Ação (Próximo Passo)</option>
                                                <option value="link">🔗 Link (URL)</option>
                                                <option value="plan">💳 Plano (Checkout)</option>
                                            </select>
                                            
                                            <Input 
                                                placeholder="Texto do Botão" 
                                                value={newBtnData.text} 
                                                onChange={e => setNewBtnData({...newBtnData, text: e.target.value})} 
                                            />
                                        </div>
                                        
                                        {/* 🔥 CHECKBOX DE AUTO-DESTRUIÇÃO (apenas para botões de ação) */}
                                        {newBtnData.type === 'action' && (
                                            <div style={{padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', marginTop: '10px'}}>
                                                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#ef4444'}}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={newBtnData.autodestruir} 
                                                        onChange={e => setNewBtnData({...newBtnData, autodestruir: e.target.checked})}
                                                        style={{width: '16px', height: '16px'}}
                                                    />
                                                    🔥 Auto-destruir mensagem ao clicar
                                                </label>
                                            </div>
                                        )}
                                        
                                        <div className="add-controls-row">
                                            <div className="input-group">
                                                {newBtnData.type === 'plan' ? (
                                                    /* 🔥 DROPDOWN DE PLANOS AUTOMÁTICO */
                                                    <select 
                                                        className="select-type" 
                                                        value={newBtnData.value} 
                                                        onChange={handleSelectPlan}
                                                        style={{width: '100%', height: '42px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '6px', padding: '0 10px'}}
                                                    >
                                                        <option value="">Selecione um plano...</option>
                                                        {availablePlans && availablePlans.length > 0 ? (
                                                            availablePlans.map(plan => (
                                                                <option key={plan.id} value={plan.id}>
                                                                    {plan.nome_exibicao} - R$ {plan.preco_atual ? parseFloat(plan.preco_atual).toFixed(2) : '0.00'}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <option value="" disabled>Nenhum plano cadastrado</option>
                                                        )}
                                                    </select>
                                                ) : newBtnData.type === 'action' ? (
                                                    /* 🔥 INPUT PARA AÇÃO (callback_data) */
                                                    <Input 
                                                        placeholder="step_1" 
                                                        value={newBtnData.value} 
                                                        onChange={e => setNewBtnData({...newBtnData, value: e.target.value})} 
                                                    />
                                                ) : (
                                                    /* INPUT NORMAL PARA LINKS */
                                                    <Input 
                                                        placeholder="https://..." 
                                                        value={newBtnData.value} 
                                                        onChange={e => setNewBtnData({...newBtnData, value: e.target.value})} 
                                                    />
                                                )}
                                            </div>
                                            <button className="btn-add-action" onClick={handleAddButton}>
                                                <Plus size={16} /> Adicionar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="hint-text">💡 Dica: Arraste os botões para mudar a ordem. Botões de "Plano" geram checkout, "Ação" avança no fluxo.</p>
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
                                <RichInput label="Texto da Oferta" value={flow.msg_2_texto} onChange={val => handleRichChange('msg_2_texto', val)} />
                                
                                <Input label="Mídia da Oferta (Opcional)" value={flow.msg_2_media} onChange={e => setFlow({...flow, msg_2_media: e.target.value})} icon={<Video size={16}/>} />
                                
                                {/* 🔥🔥 GERENCIADOR DE BOTÕES PARA MENSAGEM FINAL COM AUTO-DESTRUIR 🔥🔥 */}
                                <div className="buttons-config">
                                    <div className="card-header-row" style={{marginBottom: '10px', borderBottom: 'none'}}>
                                        <h4 style={{margin:0, color: '#ccc', fontSize: '0.9rem'}}>Botões de Ação (Oferta Final)</h4>
                                    </div>
                                    
                                    <div className="button-manager-container">
                                        {/* Lista de Botões */}
                                        <div className="btn-list">
                                            {flow.buttons_config_2 && flow.buttons_config_2.length > 0 ? (
                                                flow.buttons_config_2.map((btn, index) => (
                                                    <div key={index} className={`btn-config-item type-${btn.type}`}>
                                                        <div className="btn-config-info">
                                                            <span className="btn-label-main">
                                                                {btn.type === 'plan' ? <CreditCard size={12} style={{marginRight:5}}/> : 
                                                                 btn.type === 'action' ? <ArrowDown size={12} style={{marginRight:5}}/> : 
                                                                 <LinkIcon size={12} style={{marginRight:5}}/>}
                                                                {btn.text}
                                                            </span>
                                                            <span className="btn-label-sub">
                                                                {btn.type === 'plan' ? `Plano: ${getPlanName(btn.value)}` : 
                                                                 btn.type === 'action' ? `Ação: ${btn.value}${btn.autodestruir ? ' 🔥' : ''}` : 
                                                                 btn.value}
                                                            </span>
                                                        </div>
                                                        <div className="btn-controls">
                                                            <button className="mini-action-btn" onClick={() => handleMoveButton2(index, 'up')} title="Mover para cima">
                                                                <ChevronUp size={14}/>
                                                            </button>
                                                            <button className="mini-action-btn" onClick={() => handleMoveButton2(index, 'down')} title="Mover para baixo">
                                                                <ChevronDown size={14}/>
                                                            </button>
                                                            <button className="mini-action-btn delete" onClick={() => handleRemoveButton2(index)} title="Remover">
                                                                <Trash2 size={14}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{color: '#666', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center'}}>Nenhum botão adicionado.</p>
                                            )}
                                        </div>

                                        {/* Área de Adicionar */}
                                        <div className="add-btn-area">
                                            <div className="row-inputs">
                                                <select 
                                                    className="select-type" 
                                                    value={newBtnData2.type} 
                                                    onChange={e => setNewBtnData2({...newBtnData2, type: e.target.value, value: e.target.value === 'action' ? 'step_1' : '', text: '', autodestruir: false})}
                                                >
                                                    <option value="action">▶️ Ação (Próximo Passo)</option>
                                                    <option value="link">🔗 Link (URL)</option>
                                                    <option value="plan">💳 Plano (Checkout)</option>
                                                </select>
                                                
                                                <Input 
                                                    placeholder="Texto do Botão" 
                                                    value={newBtnData2.text} 
                                                    onChange={e => setNewBtnData2({...newBtnData2, text: e.target.value})} 
                                                />
                                            </div>
                                            
                                            {/* 🔥 CHECKBOX DE AUTO-DESTRUIÇÃO (apenas para botões de ação) */}
                                            {newBtnData2.type === 'action' && (
                                                <div style={{padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', marginTop: '10px'}}>
                                                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#ef4444'}}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={newBtnData2.autodestruir} 
                                                            onChange={e => setNewBtnData2({...newBtnData2, autodestruir: e.target.checked})}
                                                            style={{width: '16px', height: '16px'}}
                                                        />
                                                        🔥 Auto-destruir mensagem ao clicar
                                                    </label>
                                                </div>
                                            )}
                                            
                                            <div className="add-controls-row">
                                                <div className="input-group">
                                                    {newBtnData2.type === 'plan' ? (
                                                        <select 
                                                            className="select-type" 
                                                            value={newBtnData2.value} 
                                                            onChange={handleSelectPlan2}
                                                            style={{width: '100%', height: '42px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '6px', padding: '0 10px'}}
                                                        >
                                                            <option value="">Selecione um plano...</option>
                                                            {availablePlans && availablePlans.length > 0 ? (
                                                                availablePlans.map(plan => (
                                                                    <option key={plan.id} value={plan.id}>
                                                                        {plan.nome_exibicao} - R$ {plan.preco_atual ? parseFloat(plan.preco_atual).toFixed(2) : '0.00'}
                                                                    </option>
                                                                ))
                                                            ) : (
                                                                <option value="" disabled>Nenhum plano cadastrado</option>
                                                            )}
                                                        </select>
                                                    ) : newBtnData2.type === 'action' ? (
                                                        <Input 
                                                            placeholder="step_1" 
                                                            value={newBtnData2.value} 
                                                            onChange={e => setNewBtnData2({...newBtnData2, value: e.target.value})} 
                                                        />
                                                    ) : (
                                                        <Input 
                                                            placeholder="https://..." 
                                                            value={newBtnData2.value} 
                                                            onChange={e => setNewBtnData2({...newBtnData2, value: e.target.value})} 
                                                        />
                                                    )}
                                                </div>
                                                <button className="btn-add-action" onClick={handleAddButton2}>
                                                    <Plus size={16} /> Adicionar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="hint-text">💡 Dica: Botões de "Plano" geram checkout automaticamente. Botões de "Ação" avançam no fluxo.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="connector-line"></div><div className="connector-arrow"><ArrowDown size={24} color="#444" /></div>
                    <Card className="step-card">
                        <div className="step-badge" style={{background: '#10b981', color: '#fff'}}>Mensagem do Pix</div>
                        <CardContent>
                            <div className="step-header">
                                <div className="step-title-row"><Zap size={20} color="#10b981"/><h3>Personalizar Mensagem do PIX</h3></div>
                                
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