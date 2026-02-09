import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Save, MessageSquare, ArrowDown, Zap, Image as ImageIcon, Video, Plus, Trash2, Edit, Clock, Layout, Globe, Smartphone, ShoppingBag, Link as LinkIcon, CreditCard, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
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
    
    // 🔥 NOVOS CAMPOS PARA BOTÕES PERSONALIZADOS
    button_mode: 'next_step', // 'next_step' ou 'custom'
    buttons_config: [],  // Botões mensagem 1
    buttons_config_2: []  // Botões mensagem final
  });

  // Estado dos Passos Dinâmicos (Lista)
  const [steps, setSteps] = useState([]);

  // 🔥 ESTADO DE PLANOS (Para o Dropdown)
  const [availablePlans, setAvailablePlans] = useState([]);

  // Estado auxiliar para adicionar novos botões (MENSAGEM 1)
  const [newBtnData, setNewBtnData] = useState({ 
    type: 'link', 
    text: '', 
    url: '',
    plan_id: null
  });
  
  // 🔥 Estado auxiliar para adicionar novos botões (MENSAGEM 2 - FINAL)
  const [newBtnData2, setNewBtnData2] = useState({ 
    type: 'link', 
    text: '', 
    url: '',
    plan_id: null
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
                
                // 🔥 NOVOS CAMPOS
                button_mode: flowData.button_mode || 'next_step',
                buttons_config: loadedButtons, 
                buttons_config_2: loadedButtons2 
            });
        }
        
        // 2. Carrega Passos Extras
        const stepsData = await flowService.getSteps(selectedBot.id);
        setSteps(stepsData || []);

        // 3. 🔥 CARREGA OS PLANOS DO BOT (Para o Dropdown)
        try {
            const plansResponse = await flowService.getPlans(selectedBot.id);

            if (Array.isArray(plansResponse)) {
                setAvailablePlans(plansResponse);
            } else if (plansResponse && Array.isArray(plansResponse.plans)) {
                setAvailablePlans(plansResponse.plans);
            } else {
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
    
    const newBtn = {
        id: Date.now(),
        type: newBtnData.type,
        text: newBtnData.text
    };

    // Define o valor baseado no tipo
    if (newBtnData.type === 'link') {
        if (!newBtnData.url.trim()) return Swal.fire('Erro', 'URL é obrigatória para botão de link.', 'warning');
        newBtn.url = newBtnData.url;
    } else if (newBtnData.type === 'plan') {
        if (!newBtnData.plan_id) return Swal.fire('Erro', 'Selecione um plano.', 'warning');
        newBtn.plan_id = newBtnData.plan_id;
    }

    setFlow(prev => ({
        ...prev,
        buttons_config: [...(prev.buttons_config || []), newBtn]
    }));
    
    setNewBtnData({ type: 'link', text: '', url: '', plan_id: null });
    
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

  // 🔥 FUNÇÕES PARA GERENCIAR BOTÕES DA MENSAGEM 2 (FINAL)
  const handleAddButton2 = () => {
    if (!newBtnData2.text.trim()) return Swal.fire('Erro', 'O botão precisa de um texto.', 'warning');
    
    const newBtn = {
        id: Date.now(),
        type: newBtnData2.type,
        text: newBtnData2.text
    };

    if (newBtnData2.type === 'link') {
        if (!newBtnData2.url.trim()) return Swal.fire('Erro', 'URL é obrigatória para botão de link.', 'warning');
        newBtn.url = newBtnData2.url;
    } else if (newBtnData2.type === 'plan') {
        if (!newBtnData2.plan_id) return Swal.fire('Erro', 'Selecione um plano.', 'warning');
        newBtn.plan_id = newBtnData2.plan_id;
    }

    setFlow(prev => ({
        ...prev,
        buttons_config_2: [...(prev.buttons_config_2 || []), newBtn]
    }));
    
    setNewBtnData2({ type: 'link', text: '', url: '', plan_id: null });
    
    Swal.fire({
        icon: 'success',
        title: 'Botão adicionado!',
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

  // Helper para mostrar nome do plano na lista visual
  const getPlanName = (id) => {
      const p = availablePlans.find(plan => String(plan.id) === String(id));
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
          
          // 🔥 NOVOS CAMPOS
          button_mode: flow.button_mode,
          buttons_config: flow.buttons_config || [], 
          buttons_config_2: flow.buttons_config_2 || [], 
          
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
        return Swal.fire('Erro', 'Preencha o texto ou adicione uma mídia.', 'warning');
    }

    const stepData = {
        ...modalData,
        msg_texto: decodeHtml(modalData.msg_texto)
    };

    try {
        if (editingStep) {
            const updatedSteps = steps.map(s => s.id === editingStep.id ? { ...s, ...stepData } : s);
            setSteps(updatedSteps);
        } else {
            const newId = Date.now();
            setSteps([...steps, { ...stepData, id: newId }]);
        }
        setShowModal(false);
    } catch (error) {
        console.error("Erro ao salvar passo:", error);
        Swal.fire('Erro', 'Falha ao salvar passo.', 'error');
    }
  };

  const handleDeleteStep = async (stepId) => {
    const result = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Esta mensagem será removida do fluxo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, deletar',
        cancelButtonText: 'Cancelar',
        background: '#151515',
        color: '#fff'
    });

    if (result.isConfirmed) {
        setSteps(steps.filter(s => s.id !== stepId));
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="chatflow-container">
      {/* HEADER */}
      <div className="chatflow-header">
        <div className="header-titles">
            <h1>💬 Chat Flow</h1>
            <p>Configure o fluxo de conversação do seu bot</p>
        </div>
        <div className="header-actions">
            <Button variant="primary" onClick={handleSaveFixed} className="btn-save-main" disabled={loading}>
                <Save size={18} /> <span className="btn-text">Salvar Tudo</span>
            </Button>
        </div>
      </div>

      {/* GRID LAYOUT */}
      <div className="flow-grid">
        
        {/* COLUNA PREVIEW (IPHONE MOCKUP) */}
        <div className="preview-column">
            <div className="iphone-mockup">
                <div className="notch"></div>
                <div className="screen-content">
                    <div className="chat-header-mock">
                        <div className="bot-avatar-mock">🤖</div>
                        <div className="bot-info-mock">
                            <strong>{selectedBot?.nome || 'Meu Bot'}</strong>
                            <span>Online agora</span>
                        </div>
                    </div>
                    <div className="messages-area">
                        <div className="msg-bubble bot">
                            <p>{flow.msg_boas_vindas || 'Olá! Bem-vindo(a)!'}</p>
                        </div>
                        
                        {/* PREVIEW DOS BOTÕES DA MENSAGEM 1 */}
                        {flow.button_mode === 'custom' && flow.buttons_config && flow.buttons_config.length > 0 ? (
                            flow.buttons_config.map((btn, i) => (
                                <div key={i} className="btn-bubble">
                                    {btn.type === 'plan' && `💎 ${getPlanName(btn.plan_id)}`}
                                    {btn.type === 'link' && `🔗 ${btn.text}`}
                                </div>
                            ))
                        ) : (
                            <div className="btn-bubble">
                                {flow.btn_text_1 || '📋 Ver Planos'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* COLUNA DE CONFIGURAÇÃO */}
        <div className="config-column">
            
            {/* SELETOR DE MODO (PADRÃO vs MINI APP) */}
            <div className="mode-selector-grid">
                <div 
                    className={`mode-card ${flow.start_mode === 'padrao' ? 'selected-padrao' : ''}`}
                    onClick={() => setFlow({...flow, start_mode: 'padrao'})}
                >
                    {flow.start_mode === 'padrao' && <span className="check-badge">✓</span>}
                    <MessageSquare size={28} className="mode-icon" />
                    <div className="mode-info">
                        <h4>Modo Padrão</h4>
                        <p>Fluxo de conversa tradicional</p>
                    </div>
                </div>

                <div 
                    className={`mode-card ${flow.start_mode === 'miniapp' ? 'selected-miniapp' : ''}`}
                    onClick={() => setFlow({...flow, start_mode: 'miniapp'})}
                >
                    {flow.start_mode === 'miniapp' && <span className="check-badge">✓</span>}
                    <Smartphone size={28} className="mode-icon" />
                    <div className="mode-info">
                        <h4>Mini App</h4>
                        <p>Integra sua loja externa</p>
                    </div>
                </div>
            </div>

            {/* CONFIG MINI APP */}
            {flow.start_mode === 'miniapp' && (
                <div className="miniapp-config-box fade-in-up">
                    <p className="config-title">🌐 Configuração do Mini App</p>
                    <div className="config-group">
                        <Input 
                            label="URL da sua loja" 
                            value={flow.miniapp_url} 
                            onChange={e => setFlow({...flow, miniapp_url: e.target.value})}
                            placeholder="https://exemplo.com"
                            icon={<Globe size={16}/>}
                        />
                        <Input 
                            label="Texto do botão" 
                            value={flow.miniapp_btn_text} 
                            onChange={e => setFlow({...flow, miniapp_btn_text: e.target.value})}
                            icon={<ShoppingBag size={16}/>}
                        />
                    </div>
                </div>
            )}

            {/* PASSO 1 - MENSAGEM DE BOAS-VINDAS */}
            <Card className="step-card">
                <div className="step-badge">Passo 1 (Início)</div>
                <CardContent>
                    <div className="card-header-row">
                        <MessageSquare size={20} color="#c333ff"/>
                        <h3>Mensagem de Boas-Vindas</h3>
                    </div>
                    <div className="form-grid">
                        <RichInput 
                            label="Texto da Mensagem" 
                            value={flow.msg_boas_vindas} 
                            onChange={val => handleRichChange('msg_boas_vindas', val)} 
                        />
                        <Input 
                            label="Link da Mídia (Opcional)" 
                            value={flow.media_url} 
                            onChange={e => setFlow({...flow, media_url: e.target.value})} 
                            icon={<Video size={16}/>} 
                        />

                        {/* 🔥 SELETOR DE MODO DE BOTÃO */}
                        {flow.start_mode === 'padrao' && (
                            <div className="buttons-config">
                                <p className="config-title" style={{marginBottom: 15}}>⚙️ Configurar Botões de Ação</p>
                                
                                {/* OPÇÃO 1: Botão Próximo Passo */}
                                <div className="toggle-wrapper full-width" style={{marginBottom: 20}}>
                                    <label style={{cursor: 'pointer'}} onClick={() => setFlow({...flow, button_mode: 'next_step'})}>
                                        <input 
                                            type="radio" 
                                            name="button_mode" 
                                            checked={flow.button_mode === 'next_step'}
                                            onChange={() => setFlow({...flow, button_mode: 'next_step'})}
                                            style={{marginRight: 8}}
                                        />
                                        Botão "Próximo Passo"
                                    </label>
                                </div>

                                {/* Mostrar config do botão próximo passo */}
                                {flow.button_mode === 'next_step' && (
                                    <div className="fade-in-up" style={{marginLeft: 25, marginBottom: 20}}>
                                        <div className="toggle-wrapper full-width">
                                            <label>Mostrar botões de Planos nesta mensagem?</label>
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

                                {/* OPÇÃO 2: Botões Personalizados */}
                                <div className="toggle-wrapper full-width" style={{marginBottom: 10}}>
                                    <label style={{cursor: 'pointer'}} onClick={() => setFlow({...flow, button_mode: 'custom'})}>
                                        <input 
                                            type="radio" 
                                            name="button_mode" 
                                            checked={flow.button_mode === 'custom'}
                                            onChange={() => setFlow({...flow, button_mode: 'custom'})}
                                            style={{marginRight: 8}}
                                        />
                                        Botões Personalizados (Planos + Links)
                                    </label>
                                </div>

                                {/* Config de botões personalizados */}
                                {flow.button_mode === 'custom' && (
                                    <div className="fade-in-up" style={{marginLeft: 25, padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid #333'}}>
                                        
                                        {/* FORMULÁRIO PARA ADICIONAR BOTÃO */}
                                        <div style={{marginBottom: 20}}>
                                            <p style={{fontSize: '0.9rem', color: '#aaa', marginBottom: 10}}>➕ Adicionar Novo Botão</p>
                                            
                                            {/* Tipo de botão */}
                                            <div style={{marginBottom: 10}}>
                                                <label style={{fontSize: '0.85rem', color: '#999', marginBottom: 5, display: 'block'}}>Tipo:</label>
                                                <select 
                                                    value={newBtnData.type} 
                                                    onChange={e => setNewBtnData({...newBtnData, type: e.target.value})}
                                                    style={{width: '100%', padding: '8px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff'}}
                                                >
                                                    <option value="link">🔗 Link (URL)</option>
                                                    <option value="plan">💎 Plano (Checkout)</option>
                                                </select>
                                            </div>

                                            {/* Campo de texto */}
                                            <Input 
                                                label="Texto do Botão" 
                                                value={newBtnData.text} 
                                                onChange={e => setNewBtnData({...newBtnData, text: e.target.value})}
                                                placeholder="Ex: Canal Free"
                                            />

                                            {/* Campo específico por tipo */}
                                            {newBtnData.type === 'link' && (
                                                <Input 
                                                    label="URL" 
                                                    value={newBtnData.url} 
                                                    onChange={e => setNewBtnData({...newBtnData, url: e.target.value})}
                                                    placeholder="https://t.me/seucanal"
                                                    icon={<LinkIcon size={16}/>}
                                                />
                                            )}

                                            {newBtnData.type === 'plan' && (
                                                <div>
                                                    <label style={{fontSize: '0.85rem', color: '#999', marginBottom: 5, display: 'block'}}>Selecione o Plano:</label>
                                                    <select 
                                                        value={newBtnData.plan_id || ''} 
                                                        onChange={e => setNewBtnData({...newBtnData, plan_id: e.target.value})}
                                                        style={{width: '100%', padding: '8px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff'}}
                                                    >
                                                        <option value="">-- Escolha um plano --</option>
                                                        {availablePlans.map(plan => (
                                                            <option key={plan.id} value={plan.id}>
                                                                {plan.nome_exibicao} - R${plan.preco_atual.toFixed(2)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            <button 
                                                onClick={handleAddButton}
                                                style={{
                                                    marginTop: 10,
                                                    background: '#c333ff',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                + Adicionar
                                            </button>
                                        </div>

                                        {/* LISTA DE BOTÕES ADICIONADOS */}
                                        {flow.buttons_config && flow.buttons_config.length > 0 && (
                                            <div>
                                                <p style={{fontSize: '0.9rem', color: '#aaa', marginBottom: 10}}>📋 Botões Configurados</p>
                                                {flow.buttons_config.map((btn, index) => (
                                                    <div 
                                                        key={btn.id} 
                                                        style={{
                                                            background: '#111',
                                                            padding: '10px',
                                                            borderRadius: '6px',
                                                            marginBottom: '8px',
                                                            border: '1px solid #333',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between'
                                                        }}
                                                    >
                                                        <div style={{flex: 1}}>
                                                            <div style={{fontSize: '0.9rem', color: '#fff', marginBottom: 3}}>
                                                                {btn.type === 'link' && `🔗 ${btn.text}`}
                                                                {btn.type === 'plan' && `💎 ${getPlanName(btn.plan_id)}`}
                                                            </div>
                                                            <div style={{fontSize: '0.75rem', color: '#666'}}>
                                                                {btn.type === 'link' && btn.url}
                                                                {btn.type === 'plan' && `Plano ID: ${btn.plan_id}`}
                                                            </div>
                                                        </div>
                                                        <div style={{display: 'flex', gap: '5px'}}>
                                                            <button 
                                                                onClick={() => handleMoveButton(index, 'up')}
                                                                disabled={index === 0}
                                                                style={{background: '#222', border: '1px solid #333', padding: '4px', borderRadius: '4px', cursor: 'pointer'}}
                                                            >
                                                                <ChevronUp size={16} color={index === 0 ? '#444' : '#fff'} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleMoveButton(index, 'down')}
                                                                disabled={index === flow.buttons_config.length - 1}
                                                                style={{background: '#222', border: '1px solid #333', padding: '4px', borderRadius: '4px', cursor: 'pointer'}}
                                                            >
                                                                <ChevronDown size={16} color={index === flow.buttons_config.length - 1 ? '#444' : '#fff'} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleRemoveButton(index)}
                                                                style={{background: '#ef4444', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer'}}
                                                            >
                                                                <Trash2 size={16} color="#fff" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                    
                    {/* PASSOS EXTRAS */}
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
                    
                    {/* PASSO FINAL - OFERTA */}
                    <Card className="step-card">
                        <div className="step-badge final">Passo Final (Oferta)</div>
                        <CardContent>
                            <div className="step-header"><div className="step-title-row"><ShoppingBag size={20} color="#10b981"/><h3>Mensagem de Oferta & Checkout</h3></div></div>
                            <div className="form-grid">
                                <RichInput label="Texto da Oferta" value={flow.msg_2_texto} onChange={val => handleRichChange('msg_2_texto', val)} />
                                <Input label="Mídia da Oferta (Opcional)" value={flow.msg_2_media} onChange={e => setFlow({...flow, msg_2_media: e.target.value})} icon={<Video size={16}/>} />
                                
                                <div className="toggle-wrapper full-width">
                                    <label>Mostrar botões de Planos automaticamente?</label>
                                    <div className={`custom-toggle ${flow.mostrar_planos_2 ? 'active-green' : ''}`} onClick={() => setFlow({...flow, mostrar_planos_2: !flow.mostrar_planos_2})}>
                                        <div className="toggle-handle"></div><span className="toggle-label">{flow.mostrar_planos_2 ? 'SIM' : 'OCULTAR'}</span>
                                    </div>
                                </div>

                                {/* 🔥 BOTÕES PERSONALIZADOS MENSAGEM FINAL */}
                                <div style={{marginTop: 15, padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid #333'}}>
                                    <p style={{fontSize: '0.9rem', color: '#aaa', marginBottom: 10}}>⚙️ Botões Personalizados (Opcional)</p>
                                    
                                    <div style={{marginBottom: 15}}>
                                        <div style={{marginBottom: 10}}>
                                            <label style={{fontSize: '0.85rem', color: '#999', marginBottom: 5, display: 'block'}}>Tipo:</label>
                                            <select 
                                                value={newBtnData2.type} 
                                                onChange={e => setNewBtnData2({...newBtnData2, type: e.target.value})}
                                                style={{width: '100%', padding: '8px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff'}}
                                            >
                                                <option value="link">🔗 Link (URL)</option>
                                                <option value="plan">💎 Plano (Checkout)</option>
                                            </select>
                                        </div>

                                        <Input 
                                            label="Texto do Botão" 
                                            value={newBtnData2.text} 
                                            onChange={e => setNewBtnData2({...newBtnData2, text: e.target.value})}
                                        />

                                        {newBtnData2.type === 'link' && (
                                            <Input 
                                                label="URL" 
                                                value={newBtnData2.url} 
                                                onChange={e => setNewBtnData2({...newBtnData2, url: e.target.value})}
                                                icon={<LinkIcon size={16}/>}
                                            />
                                        )}

                                        {newBtnData2.type === 'plan' && (
                                            <div>
                                                <label style={{fontSize: '0.85rem', color: '#999', marginBottom: 5, display: 'block'}}>Selecione o Plano:</label>
                                                <select 
                                                    value={newBtnData2.plan_id || ''} 
                                                    onChange={e => setNewBtnData2({...newBtnData2, plan_id: e.target.value})}
                                                    style={{width: '100%', padding: '8px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff'}}
                                                >
                                                    <option value="">-- Escolha um plano --</option>
                                                    {availablePlans.map(plan => (
                                                        <option key={plan.id} value={plan.id}>
                                                            {plan.nome_exibicao} - R${plan.preco_atual.toFixed(2)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <button 
                                            onClick={handleAddButton2}
                                            style={{
                                                marginTop: 10,
                                                background: '#10b981',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            + Adicionar
                                        </button>
                                    </div>

                                    {/* LISTA DE BOTÕES DA MENSAGEM FINAL */}
                                    {flow.buttons_config_2 && flow.buttons_config_2.length > 0 && (
                                        <div>
                                            <p style={{fontSize: '0.9rem', color: '#aaa', marginBottom: 10}}>📋 Botões Configurados</p>
                                            {flow.buttons_config_2.map((btn, index) => (
                                                <div 
                                                    key={btn.id} 
                                                    style={{
                                                        background: '#111',
                                                        padding: '10px',
                                                        borderRadius: '6px',
                                                        marginBottom: '8px',
                                                        border: '1px solid #333',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}
                                                >
                                                    <div style={{flex: 1}}>
                                                        <div style={{fontSize: '0.9rem', color: '#fff', marginBottom: 3}}>
                                                            {btn.type === 'link' && `🔗 ${btn.text}`}
                                                            {btn.type === 'plan' && `💎 ${getPlanName(btn.plan_id)}`}
                                                        </div>
                                                        <div style={{fontSize: '0.75rem', color: '#666'}}>
                                                            {btn.type === 'link' && btn.url}
                                                            {btn.type === 'plan' && `Plano ID: ${btn.plan_id}`}
                                                        </div>
                                                    </div>
                                                    <div style={{display: 'flex', gap: '5px'}}>
                                                        <button 
                                                            onClick={() => handleMoveButton2(index, 'up')}
                                                            disabled={index === 0}
                                                            style={{background: '#222', border: '1px solid #333', padding: '4px', borderRadius: '4px', cursor: 'pointer'}}
                                                        >
                                                            <ChevronUp size={16} color={index === 0 ? '#444' : '#fff'} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleMoveButton2(index, 'down')}
                                                            disabled={index === flow.buttons_config_2.length - 1}
                                                            style={{background: '#222', border: '1px solid #333', padding: '4px', borderRadius: '4px', cursor: 'pointer'}}
                                                        >
                                                            <ChevronDown size={16} color={index === flow.buttons_config_2.length - 1 ? '#444' : '#fff'} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRemoveButton2(index)}
                                                            style={{background: '#ef4444', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer'}}
                                                        >
                                                            <Trash2 size={16} color="#fff" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* MENSAGEM DO PIX */}
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

      {/* MODAL PASSOS EXTRAS */}
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