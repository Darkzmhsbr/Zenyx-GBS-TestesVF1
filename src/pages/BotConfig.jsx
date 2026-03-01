import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import { 
  Save, ArrowLeft, MessageSquare, Key, Headphones, 
  Smartphone, Layout, PlayCircle, Type, Plus, Trash2, Edit, Image as ImageIcon, Link, User, Palette, Shield, Radio, Wifi, CheckCircle, XCircle, AlertTriangle, Bell, ShoppingBag, Layers, Grid, Square, Circle
} from 'lucide-react'; 
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService, miniappService, planService } from '../services/api'; 
import { MediaUploader } from '../components/MediaUploader'; // 🔥 COMPONENTE DE UPLOAD
import Swal from 'sweetalert2';
import './Bots.css';

// 🎨 COMPONENTE: Preview de Cor (Suporta hex E gradientes CSS)
const ColorPreview = ({ value, onChange, label }) => {
    const isGradient = value && value.includes('gradient');
    const isValidHex = value && /^#[0-9A-Fa-f]{3,8}$/.test(value);
    return (
        <div className="form-group">
            <label><Palette size={16}/> {label}</label>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <div style={{
                    width: 44, height: 44, minWidth: 44,
                    borderRadius: 6,
                    border: '2px solid #444',
                    background: value || '#000',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Input color nativo só funciona com hex puro, esconde se for gradient */}
                    {!isGradient && (
                        <input 
                            type="color" 
                            value={isValidHex ? value : '#000000'} 
                            onChange={(e) => onChange(e.target.value)} 
                            style={{
                                position:'absolute', top:0, left:0, 
                                width:'100%', height:'100%', 
                                opacity: 0, cursor:'pointer'
                            }} 
                        />
                    )}
                </div>
                <input 
                    className="input-field" 
                    value={value || ''} 
                    onChange={(e) => onChange(e.target.value)} 
                    placeholder="Ex: #ff0000 ou linear-gradient(...)"
                    style={{flex:1}}
                />
            </div>
            {isGradient && <small style={{color:'#10b981', marginTop:4, display:'block'}}>✓ Gradiente detectado</small>}
        </div>
    );
};

export function BotConfig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('geral');
  
  // --- CONFIGURAÇÃO GERAL ---
  const [config, setConfig] = useState({
    nome: '', 
    token: '', 
    id_canal_vip: '', 
    admin_principal_id: '',
    suporte_username: '', 
    id_canal_notificacao: '',  // ✅ Canal de Notificações
    protect_content: false,    // 🔒 Proteção de Conteúdo
    notificar_no_bot: true,    // 🔔 Notificação no bot
    status: 'desconectado'
  });

  // --- PLANOS DO BOT (PARA LISTAGEM DE CANAIS) ---
  const [botPlans, setBotPlans] = useState([]);
  const [testResults, setTestResults] = useState({}); // Armazena resultado dos testes { channel_id: { status: 'ok', msg: '...' } }

  // --- CONFIGURAÇÃO MINI APP (COMPLETA) ---
  const [miniAppConfig, setMiniAppConfig] = useState({
    hero_title: 'ACERVO PREMIUM',
    hero_subtitle: 'O maior acervo da internet.',
    hero_btn_text: 'LIBERAR CONTEÚDO 🔓',
    hero_video_url: '',
    background_value: '#000000',
    background_type: 'solid',
    enable_popup: false,
    popup_text: 'VOCÊ GANHOU UM PRESENTE!',
    popup_video_url: '',
    footer_text: '© 2026 Premium Club.'
  });

  // --- CATEGORIAS ---
  const [categories, setCategories] = useState([]);
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [currentCat, setCurrentCat] = useState(null);

  useEffect(() => {
    if (location.state?.initialTab) {
        setActiveTab(location.state.initialTab);
        window.history.replaceState({}, document.title);
    }
    carregarDados();
  }, [id, location.state]); 

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // 1. Carrega Dados do Bot
      const bots = await botService.listBots();
      const currentBot = bots.find(b => b.id === parseInt(id)); 
      
      if (currentBot) {
        setConfig({
          nome: currentBot.nome || '',
          token: currentBot.token || '',
          id_canal_vip: currentBot.id_canal_vip || '',
          admin_principal_id: currentBot.admin_principal_id || '',
          suporte_username: currentBot.suporte_username || '', 
          id_canal_notificacao: currentBot.id_canal_notificacao || '',  // ✅ Canal de Notificações
          protect_content: currentBot.protect_content || false,         // 🔒 Proteção de Conteúdo
          notificar_no_bot: currentBot.notificar_no_bot !== undefined ? currentBot.notificar_no_bot : true, // 🔔 Notificação no bot
          status: currentBot.status || 'desconectado'
        });

        // 1.1 Carrega Planos para listar canais extras
        try {
            const plans = await planService.listPlans(currentBot.id);
            setBotPlans(plans);
        } catch (err) {
            console.error("Erro ao carregar planos", err);
        }
      }

      // 2. Carrega Dados da Loja (MiniApp)
      try {
        const appData = await miniappService.getPublicData(id);
        if (appData) {
            if (appData.config) setMiniAppConfig(prev => ({ ...prev, ...appData.config }));
            if (appData.categories) setCategories(appData.categories);
        }
      } catch (e) { console.log("Loja ainda não configurada."); }

    } catch (error) {
      console.error("Erro ao carregar:", error);
      Swal.fire('Erro', 'Falha ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÃO DE TESTE DE CANAL (GENÉRICA) ---
  const handleTestChannel = async (channelId, contextKey) => {
    if (!config.token || !channelId) {
      return Swal.fire('Atenção', 'Token ou ID do Canal ausente.', 'warning');
    }
    
    // Define estado de carregamento local
    setTestResults(prev => ({
        ...prev,
        [contextKey]: { loading: true }
    }));
    
    try {
      const res = await botService.testChannel(config.token, channelId);
      
      setTestResults(prev => ({
        ...prev,
        [contextKey]: { 
            status: 'success', 
            msg: res.message, 
            chatTitle: res.chat_title 
        }
      }));

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [contextKey]: { 
            status: 'error', 
            msg: error.detail || error.message || 'Falha ao conectar.' 
        }
      }));
    }
  };

  // --- SALVAR GERAL ---
  const handleSaveGeral = async () => {
    try {
      await botService.updateBot(id, config);
      Swal.fire({
        title: '✅ Salvo!',
        text: 'Configurações gerais salvas!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#151515', color: '#fff',
        toast: true,
        position: 'top-end',
        customClass: { popup: 'swal-toast-zenyx' }
      });
    } catch (error) {
      Swal.fire('Erro', 'Falha ao salvar config geral', 'error');
    }
  };

  // --- SALVAR MINI APP ---
  const handleSaveMiniApp = async () => {
      try {
          await miniappService.saveConfig(id, miniAppConfig);
          Swal.fire({
            title: '✅ Loja Atualizada!',
            text: 'Configurações visuais salvas!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#151515', color: '#fff',
            toast: true,
            position: 'top-end',
            customClass: { popup: 'swal-toast-zenyx' }
          });
      } catch (error) {
          Swal.fire('Erro', 'Falha ao salvar loja', 'error');
      }
  };

  // --- CATEGORIAS (COMPLETA) ---
  const openNewCategory = () => {
      setCurrentCat({
          id: null, 
          bot_id: id,
          title: '', slug: '', description: '', 
          cover_image: '', 
          banner_mob_url: '', banner_desk_url: '',
          bg_color: '#000000', theme_color: '#ffffff',
          video_preview_url: '',
          model_img_url: '', model_name: '', model_desc: '',
          // 🔥 GARANTINDO VALORES PADRÃO PARA AS CORES 🔥
          model_name_color: '#ffffff', 
          model_desc_color: '#cccccc', 
          footer_banner_url: '', deco_lines_url: '',
          is_direct_checkout: false, content_json: '[]',
          // Mini App V2
          items_per_page: null,
          separator_enabled: false,
          separator_color: '#ffffff',
          separator_text: '',
          separator_btn_text: '',
          separator_btn_url: '',
          separator_logo_url: '',
          model_img_shape: 'square',
          // 🆕 CORES NOVAS DO SEPARADOR (Default)
          separator_text_color: '#ffffff',
          separator_btn_text_color: '#ffffff',
          // ✨ NEON GLOW
          separator_is_neon: false,
          separator_neon_color: ''
      });
      setIsEditingCat(true);
  };

  const handleEditCategory = (cat) => {
      // 🔥 CORREÇÃO: Garante que campos novos existam mesmo em categorias antigas
      // Isso resolve o problema de "não salvar" porque o campo vinha undefined
      setCurrentCat({ 
          ...cat,
          separator_text_color: cat.separator_text_color || '#ffffff',
          separator_btn_text_color: cat.separator_btn_text_color || '#ffffff',
          model_name_color: cat.model_name_color || '#ffffff',
          model_desc_color: cat.model_desc_color || '#cccccc',
          separator_is_neon: cat.separator_is_neon || false,
          separator_neon_color: cat.separator_neon_color || ''
      }); 
      setIsEditingCat(true);
  };

  const handleSaveCategory = async () => {
      if (!currentCat.title) return Swal.fire('Erro', 'Digite um título', 'warning');

      try {
          // 🔥 DEBUG: Verifique no console do navegador se as cores estão aqui
          console.log("Enviando Categoria:", currentCat);

          let contentJsonParsed = [];
          if (typeof currentCat.content_json === 'string') {
              try {
                  contentJsonParsed = JSON.parse(currentCat.content_json);
              } catch (e) {
                  contentJsonParsed = [];
              }
          } else {
              contentJsonParsed = currentCat.content_json;
          }

          const payload = {
              ...currentCat,
              bot_id: id,
              content_json: contentJsonParsed,
              // Força o envio das cores caso o spread operator (...) tenha falhado
              separator_text_color: currentCat.separator_text_color,
              separator_btn_text_color: currentCat.separator_btn_text_color,
              separator_is_neon: currentCat.separator_is_neon || false,
              separator_neon_color: currentCat.separator_neon_color || null
          };

          await miniappService.createCategory(payload);
          setIsEditingCat(false);
          setCurrentCat(null);
          
          const appData = await miniappService.getPublicData(id);
          setCategories(appData.categories || []);
          
          Swal.fire('Sucesso', 'Categoria salva!', 'success');
      } catch (error) {
          console.error(error);
          Swal.fire('Erro', 'Erro ao salvar categoria', 'error');
      }
  };

  const handleDeleteCategory = async (catId) => {
      const res = await Swal.fire({
          title: 'Tem certeza?', text: "Isso apagará a categoria.",
          icon: 'warning', showCancelButton: true,
          background: '#151515', color: '#fff', confirmButtonColor: '#d33'
      });
      if (res.isConfirmed) {
          try {
            await miniappService.deleteCategory(catId);
            setCategories(prev => prev.filter(c => c.id !== catId));
            Swal.fire('Sucesso', 'Categoria removida.', 'success');
          } catch (e) {
            Swal.fire('Erro', 'Erro ao excluir', 'error');
          }
      }
  };

  // 🔥 ================= LÓGICA DA VITRINE (MÚLTIPLOS ITENS AVANÇADOS) ================= 🔥
  const getVitrineItems = () => {
      try {
          const parsed = JSON.parse(currentCat.content_json || '[]');
          return Array.isArray(parsed) ? parsed : [];
      } catch(e) { return []; }
  };

  const handleAddVitrineItem = () => {
      const items = getVitrineItems();
      items.push({ 
          id: Date.now(), 
          title: '', 
          description: '', 
          image_url: '', 
          link_url: '', 
          btn_text: 'Acessar',
          // 🔥 NOVAS OPÇÕES INJETADAS DO SEU SCRIPT
          bgColor: '',
          themeColor: '',
          videoPreview: '',
          modelImg: '',
          modelName: '',
          modelDesc: '',
          isDirectCheckout: false,
          isComicMode: false,
          isHackerMode: false,
          comicImages: '',
          hackerFiles: '',
          // Mini App V2
          fakeVideo: false,  // Simula botão de play na imagem principal
          hideMainButton: false // ✅ NOVO: Ocultar botão principal
      });
      setCurrentCat({...currentCat, content_json: JSON.stringify(items)});
  };

  const handleUpdateVitrineItem = (index, field, value) => {
      const items = getVitrineItems();
      items[index][field] = value;
      setCurrentCat({...currentCat, content_json: JSON.stringify(items)});
  };

  const handleRemoveVitrineItem = (index) => {
      const items = getVitrineItems();
      items.splice(index, 1);
      setCurrentCat({...currentCat, content_json: JSON.stringify(items)});
  };

  const handleMoveVitrineItem = (index, direction) => {
      const items = getVitrineItems();
      if (direction === 'up' && index > 0) {
          [items[index], items[index - 1]] = [items[index - 1], items[index]];
      } else if (direction === 'down' && index < items.length - 1) {
          [items[index], items[index + 1]] = [items[index + 1], items[index]];
      }
      setCurrentCat({...currentCat, content_json: JSON.stringify(items)});
  };
  // 🔥 ========================================================================= 🔥

  const copyStoreLink = () => {
      const link = `${window.location.origin}/loja/${id}`;
      navigator.clipboard.writeText(link);
      Swal.fire({title:'Copiado!', text: link, icon:'success', timer: 1000, showConfirmButton: false, toast:true, position:'top-end'});
  };

  if (loading) return <div className="loading-screen">Carregando...</div>;

  // Filtra planos que têm canal específico configurado
  const plansWithChannel = botPlans.filter(p => p.id_canal_destino && p.id_canal_destino.trim() !== '');

  return (
    <div className="bot-config-container">
      
      {/* HEADER */}
      <div className="config-header-bar">
        <div style={{display:'flex', alignItems:'center', gap: 15}}>
            <Button variant="ghost" onClick={() => navigate('/bots')}>
            <ArrowLeft size={20} />
            </Button>
            <h1>Configurar: <span className="highlight">{config.nome}</span></h1>
        </div>
      </div>

      {/* ABAS */}
      <div className="config-tabs-wrapper">
        <button 
            className={`config-tab-btn ${activeTab === 'geral' ? 'active' : ''}`}
            onClick={() => setActiveTab('geral')}
        >
            <MessageSquare size={18} /> Geral & Chat
        </button>
        <button 
            className={`config-tab-btn ${activeTab === 'miniapp' ? 'active' : ''}`}
            onClick={() => setActiveTab('miniapp')}
        >
            <Smartphone size={18} /> Mini App / Loja
        </button>
      </div>

      <div className="config-content-area">
        
        {/* ================= ABA GERAL ================= */}
        {activeTab === 'geral' && (
            <div className="config-grid-layout">
                <Card>
                  <CardContent>
                    <div className="card-header-line"><Key size={20} color="#c333ff" /><h3>Credenciais</h3></div>
                    
                    <div className="form-group">
                      <label>Nome do Bot</label>
                      <input 
                        className="input-field" 
                        value={config.nome} 
                        onChange={(e) => setConfig({...config, nome: e.target.value})} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Token do Bot (Telegram API)</label>
                      <input 
                        className="input-field" 
                        value={config.token} 
                        onChange={(e) => setConfig({...config, token: e.target.value})} 
                        placeholder="Cole o novo token aqui se necessário..."
                      />
                      <small style={{color:'#ffffff'}}>*Se o bot foi banido, cole o token do novo bot aqui para manter os dados.</small>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="card-header-line"><Shield size={20} color="#10b981" /><h3>Permissões & IDs</h3></div>

                    <div className="form-group">
                      <label>ID do Admin Principal</label>
                      <input 
                        className="input-field" 
                        value={config.admin_principal_id} 
                        onChange={(e) => setConfig({...config, admin_principal_id: e.target.value})} 
                      />
                    </div>

                    <div className="form-group">
                        <label><Headphones size={16} style={{verticalAlign:'middle', marginRight:'5px'}}/> Username do Suporte</label>
                        <input 
                            className="input-field" 
                            value={config.suporte_username} 
                            onChange={(e) => setConfig({...config, suporte_username: e.target.value})} 
                            placeholder="@seu_suporte" 
                        />
                    </div>

                    <div className="form-group">
                      <label>ID do Canal VIP (Padrão)</label>
                      <input 
                        className="input-field" 
                        value={config.id_canal_vip} 
                        onChange={(e) => setConfig({...config, id_canal_vip: e.target.value})} 
                        placeholder="-100..."
                      />
                      <small style={{color:'#ff1616'}}>O bot precisa ser ADMIN do canal para funcionar.</small>
                    </div>

                    {/* ✅ NOVO: CANAL DE NOTIFICAÇÕES */}
                    <div className="form-group">
                      <label><Bell size={16} style={{verticalAlign:'middle', marginRight:'5px', color:'#f59e0b'}}/> Canal de Notificações</label>
                      <input 
                        className="input-field" 
                        value={config.id_canal_notificacao} 
                        onChange={(e) => setConfig({...config, id_canal_notificacao: e.target.value})} 
                        placeholder="-100... (opcional)"
                      />
                      <small style={{color:'#888'}}>
                        ID do canal onde o bot enviará avisos de vendas, alterações de status e notificações.
                        O bot precisa ser <b style={{color:'#f59e0b'}}>ADMIN</b> deste canal.
                      </small>
                    </div>

                    {/* 🔒 PROTEÇÃO DE CONTEÚDO */}
                    <div style={{
                      marginTop: 20,
                      padding: '16px 20px',
                      background: config.protect_content ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${config.protect_content ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s ease'
                    }}>
                      <div>
                        <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 4}}>
                          <Shield size={18} color={config.protect_content ? '#10b981' : '#888'}/>
                          <span style={{fontWeight: 600, color: '#fff', fontSize: '0.95rem'}}>Proteger Conteúdo</span>
                        </div>
                        <small style={{color:'#888', lineHeight: 1.4, display:'block', maxWidth: 400}}>
                          Quando ativo, todas as mídias e mensagens enviadas pelo bot ficam protegidas — 
                          não podem ser encaminhadas, salvas ou copiadas pelo usuário.
                        </small>
                      </div>
                      <label style={{position:'relative', display:'inline-block', width: 50, height: 26, cursor:'pointer', flexShrink: 0, marginLeft: 15}}>
                        <input 
                          type="checkbox" 
                          checked={config.protect_content} 
                          onChange={(e) => setConfig({...config, protect_content: e.target.checked})}
                          style={{opacity: 0, width: 0, height: 0}}
                        />
                        <span style={{
                          position:'absolute', top:0, left:0, right:0, bottom:0,
                          background: config.protect_content ? '#10b981' : '#333',
                          borderRadius: 26, transition: 'all 0.3s ease'
                        }}>
                          <span style={{
                            position:'absolute', left: config.protect_content ? 26 : 3, top: 3,
                            width: 20, height: 20, background: '#fff', borderRadius: '50%',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                          }}/>
                        </span>
                      </label>
                    </div>

                    {/* 🔔 NOTIFICAÇÃO NO BOT */}
                    <div style={{
                      marginTop: 15,
                      padding: '16px 20px',
                      background: config.notificar_no_bot ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${config.notificar_no_bot ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s ease'
                    }}>
                      <div>
                        <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 4}}>
                          <Bell size={18} color={config.notificar_no_bot ? '#3b82f6' : '#888'}/>
                          <span style={{fontWeight: 600, color: '#fff', fontSize: '0.95rem'}}>Notificações no Bot</span>
                        </div>
                        <small style={{color:'#888', lineHeight: 1.4, display:'block', maxWidth: 400}}>
                          Quando ativo, o bot envia avisos de vendas e alertas diretamente 
                          via DM para o admin. Desative se preferir receber apenas no canal de notificações.
                        </small>
                      </div>
                      <label style={{position:'relative', display:'inline-block', width: 50, height: 26, cursor:'pointer', flexShrink: 0, marginLeft: 15}}>
                        <input 
                          type="checkbox" 
                          checked={config.notificar_no_bot} 
                          onChange={(e) => setConfig({...config, notificar_no_bot: e.target.checked})}
                          style={{opacity: 0, width: 0, height: 0}}
                        />
                        <span style={{
                          position:'absolute', top:0, left:0, right:0, bottom:0,
                          background: config.notificar_no_bot ? '#3b82f6' : '#333',
                          borderRadius: 26, transition: 'all 0.3s ease'
                        }}>
                          <span style={{
                            position:'absolute', left: config.notificar_no_bot ? 26 : 3, top: 3,
                            width: 20, height: 20, background: '#fff', borderRadius: '50%',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                          }}/>
                        </span>
                      </label>
                    </div>

                    {/* 🔥 SEÇÃO NOVA: CENTRAL DE CONEXÕES */}
                    <div style={{marginTop: 30, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20}}>
                        <div className="card-header-line"><Wifi size={20} color="#3b82f6" /><h3>Central de Conexões</h3></div>
                        <p style={{fontSize:'0.85rem', color:'#888', marginBottom: 15}}>
                            Teste o acesso do bot em todos os canais configurados (Principal + Planos).
                        </p>

                        <div className="channels-test-list" style={{display:'flex', flexDirection:'column', gap: 10}}>
                            
                            {/* 1. CANAL PRINCIPAL */}
                            <div className="channel-test-item" style={{background:'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                                <div>
                                    <div style={{fontWeight:'bold', fontSize:'0.9rem', color:'#fff'}}>Canal Principal (Padrão)</div>
                                    <div style={{fontSize:'0.8rem', color:'#888'}}>{config.id_canal_vip || 'Não configurado'}</div>
                                    
                                    {/* Resultado do Teste */}
                                    {testResults['main'] && (
                                        <div style={{marginTop: 5, fontSize: '0.85rem', display:'flex', alignItems:'center', gap:5, 
                                            color: testResults['main'].status === 'success' ? '#10b981' : '#ef4444'}}>
                                            {testResults['main'].status === 'success' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                                            {testResults['main'].chatTitle ? 
                                                <span>Conectado: <b>{testResults['main'].chatTitle}</b></span> : 
                                                <span>{testResults['main'].msg}</span>
                                            }
                                        </div>
                                    )}
                                </div>
                                <Button 
                                    size="sm" 
                                    onClick={() => handleTestChannel(config.id_canal_vip, 'main')}
                                    disabled={!config.id_canal_vip || testResults['main']?.loading}
                                    style={{background: '#333', border: '1px solid #444'}}
                                >
                                    {testResults['main']?.loading ? '...' : 'Testar'}
                                </Button>
                            </div>

                            {/* 2. CANAIS DE PLANOS (SE HOUVER) */}
                            {plansWithChannel.map(plan => (
                                <div key={plan.id} className="channel-test-item" style={{background:'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                                    <div>
                                        <div style={{fontWeight:'bold', fontSize:'0.9rem', color:'#c333ff'}}>Plano: {plan.nome_exibicao}</div>
                                        <div style={{fontSize:'0.8rem', color:'#888'}}>ID: {plan.id_canal_destino}</div>
                                        
                                        {/* Resultado do Teste */}
                                        {testResults[`plan_${plan.id}`] && (
                                            <div style={{marginTop: 5, fontSize: '0.85rem', display:'flex', alignItems:'center', gap:5, 
                                                color: testResults[`plan_${plan.id}`].status === 'success' ? '#10b981' : '#ef4444'}}>
                                                {testResults[`plan_${plan.id}`].status === 'success' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                                                {testResults[`plan_${plan.id}`].chatTitle ? 
                                                    <span>Conectado: <b>{testResults[`plan_${plan.id}`].chatTitle}</b></span> : 
                                                    <span>{testResults[`plan_${plan.id}`].msg}</span>
                                                }
                                            </div>
                                        )}
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={() => handleTestChannel(plan.id_canal_destino, `plan_${plan.id}`)}
                                        disabled={testResults[`plan_${plan.id}`]?.loading}
                                        style={{background: '#333', border: '1px solid #444'}}
                                    >
                                        {testResults[`plan_${plan.id}`]?.loading ? '...' : 'Testar'}
                                    </Button>
                                </div>
                            ))}

                            {plansWithChannel.length === 0 && (
                                <div style={{fontSize:'0.8rem', color:'#ffffff', fontStyle:'italic', padding: 5}}>
                                    Nenhum plano com canal extra configurado.
                                </div>
                            )}

                            {/* ✅ CANAL DE NOTIFICAÇÕES */}
                            {config.id_canal_notificacao && (
                                <div className="channel-test-item" style={{background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.2)', padding: 12, borderRadius: 8, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                                    <div>
                                        <div style={{fontWeight:'bold', fontSize:'0.9rem', color:'#f59e0b'}}>
                                            <Bell size={14} style={{verticalAlign:'middle', marginRight:4}}/> Canal de Notificações
                                        </div>
                                        <div style={{fontSize:'0.8rem', color:'#888'}}>{config.id_canal_notificacao}</div>
                                        
                                        {testResults['notif'] && (
                                            <div style={{marginTop: 5, fontSize: '0.85rem', display:'flex', alignItems:'center', gap:5, 
                                                color: testResults['notif'].status === 'success' ? '#10b981' : '#ef4444'}}>
                                                {testResults['notif'].status === 'success' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                                                {testResults['notif'].chatTitle ? 
                                                    <span>Conectado: <b>{testResults['notif'].chatTitle}</b></span> : 
                                                    <span>{testResults['notif'].msg}</span>
                                                }
                                            </div>
                                        )}
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={() => handleTestChannel(config.id_canal_notificacao, 'notif')}
                                        disabled={testResults['notif']?.loading}
                                        style={{background: '#333', border: '1px solid rgba(245,158,11,0.3)'}}
                                    >
                                        {testResults['notif']?.loading ? '...' : 'Testar'}
                                    </Button>
                                </div>
                            )}

                        </div>
                    </div>

                    <div style={{marginTop: 20}}>
                        <Button onClick={handleSaveGeral} style={{width:'100%'}}>
                            <Save size={18} style={{marginRight: 8}}/> SALVAR CONFIGURAÇÕES
                        </Button>
                    </div>

                  </CardContent>
                </Card>
            </div>
        )}

        {/* ================= ABA MINI APP (LOJA) ================= */}
        {activeTab === 'miniapp' && (
            <div className="miniapp-layout">
                {/* 1. CONFIGURAÇÃO VISUAL GLOBAL */}
                <div className="config-grid-layout" style={{marginBottom: 30}}>
                    <Card>
                        <CardContent>
                            <div className="section-title"><Layout size={20}/> Aparência da Home</div>
                            <div className="form-group">
                                <label>Cor de Fundo Global</label>
                                <div style={{display:'flex', gap:10}}>
                                    <input type="color" value={miniAppConfig.background_value} onChange={(e) => setMiniAppConfig({...miniAppConfig, background_value: e.target.value})} style={{height:42, width:50, padding:0, border:'none', background:'none', cursor:'pointer'}} />
                                    <input className="input-field" value={miniAppConfig.background_value} onChange={(e) => setMiniAppConfig({...miniAppConfig, background_value: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label><Type size={16}/> Título Hero</label>
                                <input className="input-field" value={miniAppConfig.hero_title} onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_title: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Subtítulo</label>
                                <input className="input-field" value={miniAppConfig.hero_subtitle} onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_subtitle: e.target.value})} />
                            </div>
                            
                            <div className="form-group">
                                <MediaUploader 
                                    label="Vídeo Hero (URL .mp4)" 
                                    value={miniAppConfig.hero_video_url} 
                                    onChange={(url) => setMiniAppConfig({...miniAppConfig, hero_video_url: url})} 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Texto do Botão</label>
                                <input className="input-field" value={miniAppConfig.hero_btn_text} onChange={(e) => setMiniAppConfig({...miniAppConfig, hero_btn_text: e.target.value})}/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="section-title"><Smartphone size={20}/> Extras (Popup & Footer)</div>
                            <div className="form-group checkbox-row" style={{display:'flex', alignItems:'center', gap:10, marginBottom:15}}>
                                <input type="checkbox" id="chk_popup" checked={miniAppConfig.enable_popup} onChange={(e) => setMiniAppConfig({...miniAppConfig, enable_popup: e.target.checked})} style={{width:20, height:20}}/>
                                <label htmlFor="chk_popup" style={{marginBottom:0, cursor:'pointer'}}>Ativar Popup Promo</label>
                            </div>
                            {miniAppConfig.enable_popup && (
                                <div className="sub-config-box" style={{background:'rgba(255,255,255,0.05)', padding:15, borderRadius:8, marginBottom:15}}>
                                    <div className="form-group"><label>Texto Popup</label><input className="input-field" value={miniAppConfig.popup_text} onChange={(e) => setMiniAppConfig({...miniAppConfig, popup_text: e.target.value})} /></div>
                                    
                                    <div className="form-group">
                                        <MediaUploader 
                                            label="Vídeo Popup" 
                                            value={miniAppConfig.popup_video_url} 
                                            onChange={(url) => setMiniAppConfig({...miniAppConfig, popup_video_url: url})} 
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="form-group"><label>Rodapé</label><input className="input-field" value={miniAppConfig.footer_text} onChange={(e) => setMiniAppConfig({...miniAppConfig, footer_text: e.target.value})} /></div>
                            <div style={{marginTop: 20}}>
                                <Button onClick={handleSaveMiniApp} style={{width: '100%'}}><Save size={18} style={{marginRight: 8}}/> Salvar Aparência</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 2. GESTÃO DE CATEGORIAS */}
                <div className="categories-section">
                    <div className="section-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
                        <h2>📂 Gestão de Categorias</h2>
                        {!isEditingCat && (
                            <Button onClick={openNewCategory} style={{background: '#10b981'}}>
                                <Plus size={18} style={{marginRight:5}}/> Nova Categoria
                            </Button>
                        )}
                    </div>

                    {isEditingCat ? (
                        <Card style={{border: '1px solid #c333ff'}}>
                            <CardContent>
                                <h3>{currentCat.id ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                                <div className="config-grid-layout">
                                    {/* 1. BÁSICO */}
                                    <div className="form-group">
                                        <label>Título da Categoria</label>
                                        <input className="input-field" value={currentCat.title} onChange={(e) => setCurrentCat({...currentCat, title: e.target.value})} placeholder="Ex: Packs Premium" />
                                    </div>
                                    <div className="form-group">
                                        <label>Slug (URL Amigável)</label>
                                        <input className="input-field" value={currentCat.slug} onChange={(e) => setCurrentCat({...currentCat, slug: e.target.value})} placeholder="ex: praia-de-nudismo" />
                                        <small style={{color:'#ffffff'}}>Deixe vazio para gerar automático</small>
                                    </div>
                                    <div className="form-group" style={{gridColumn:'span 2'}}>
                                        <label>Descrição SEO (Opcional)</label>
                                        <input className="input-field" value={currentCat.description} onChange={(e) => setCurrentCat({...currentCat, description: e.target.value})} placeholder="Descrição curta para o Google..." />
                                    </div>
                                    
                                    {/* 2. VISUAL E CORES */}
                                    <ColorPreview 
                                        label="Cor de Fundo (Página)" 
                                        value={currentCat.bg_color} 
                                        onChange={(val) => setCurrentCat({...currentCat, bg_color: val})} 
                                    />
                                    <ColorPreview 
                                        label="Cor do Tema (Botões Gerais)" 
                                        value={currentCat.theme_color} 
                                        onChange={(val) => setCurrentCat({...currentCat, theme_color: val})} 
                                    />

                                    {/* 3. IMAGENS GERAIS */}
                                    <div className="form-group" style={{gridColumn:'span 2'}}>
                                        <MediaUploader label="Imagem Card (Home)" value={currentCat.cover_image} onChange={(url) => setCurrentCat({...currentCat, cover_image: url})} />
                                    </div>
                                    <div className="form-group">
                                        <MediaUploader label="Banner Mobile (Topo)" value={currentCat.banner_mob_url} onChange={(url) => setCurrentCat({...currentCat, banner_mob_url: url})} />
                                    </div>
                                    <div className="form-group">
                                        <MediaUploader label="Banner Desktop" value={currentCat.banner_desk_url} onChange={(url) => setCurrentCat({...currentCat, banner_desk_url: url})} />
                                    </div>

                                    {/* 3.1 FORMATO DA FOTO DO MODELO + CORES DO NOME */}
                                    <div className="form-group" style={{gridColumn:'span 2', background:'#0d0d0d', padding:15, borderRadius:10}}>
                                        <label style={{marginBottom:10, display:'block'}}><User size={16}/> Configurações do Ator/Modelo</label>
                                        
                                        <div style={{display:'flex', gap:12, flexWrap:'wrap', marginBottom:15}}>
                                            <button 
                                                type="button" 
                                                onClick={() => setCurrentCat({...currentCat, model_img_shape: 'square'})}
                                                style={{
                                                    flex:1, minWidth:140, padding:'14px 20px',
                                                    background: currentCat.model_img_shape === 'square' ? 'rgba(195,51,255,0.15)' : '#0a0a0a',
                                                    border: currentCat.model_img_shape === 'square' ? '2px solid #c333ff' : '2px solid #333',
                                                    borderRadius:8, color: currentCat.model_img_shape === 'square' ? '#c333ff' : '#888',
                                                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontWeight:600, fontSize:'0.9rem'
                                                }}
                                            >
                                                <Square size={18}/> Quadrado
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setCurrentCat({...currentCat, model_img_shape: 'circle'})}
                                                style={{
                                                    flex:1, minWidth:140, padding:'14px 20px',
                                                    background: currentCat.model_img_shape === 'circle' ? 'rgba(195,51,255,0.15)' : '#0a0a0a',
                                                    border: currentCat.model_img_shape === 'circle' ? '2px solid #c333ff' : '2px solid #333',
                                                    borderRadius:8, color: currentCat.model_img_shape === 'circle' ? '#c333ff' : '#888',
                                                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontWeight:600, fontSize:'0.9rem'
                                                }}
                                            >
                                                <Circle size={18}/> Círculo
                                            </button>
                                        </div>

                                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15}}>
                                            <ColorPreview 
                                                label="Cor do Nome" 
                                                value={currentCat.model_name_color} 
                                                onChange={(val) => setCurrentCat({...currentCat, model_name_color: val})} 
                                            />
                                            <ColorPreview 
                                                label="Cor da Descrição" 
                                                value={currentCat.model_desc_color} 
                                                onChange={(val) => setCurrentCat({...currentCat, model_desc_color: val})} 
                                            />
                                        </div>
                                    </div>

                                    {/* 3.2 PAGINAÇÃO */}
                                    <div className="form-group" style={{gridColumn:'span 2'}}>
                                        <label><Grid size={16}/> Paginação (Itens por Página)</label>
                                        <div style={{display:'flex', gap:10, alignItems:'center'}}>
                                            <input 
                                                className="input-field" 
                                                type="number" 
                                                min="1" 
                                                max="50"
                                                value={currentCat.items_per_page || ''} 
                                                onChange={(e) => setCurrentCat({...currentCat, items_per_page: e.target.value ? parseInt(e.target.value) : null})} 
                                                placeholder="Deixe vazio = sem paginação (todos na mesma página)"
                                                style={{flex:1}}
                                            />
                                            {currentCat.items_per_page && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setCurrentCat({...currentCat, items_per_page: null})}
                                                    style={{background:'#333', border:'none', color:'#ef4444', padding:'10px 14px', borderRadius:6, cursor:'pointer', fontSize:'0.85rem'}}
                                                >
                                                    Desativar
                                                </button>
                                            )}
                                        </div>
                                        <small style={{color:'#888'}}>Ex: 5 = exibe 5 itens por página com navegação (1, 2, 3...).</small>
                                    </div>

                                    {/* 3.3 BARRA SEPARADORA ENTRE ITENS */}
                                    <div className="form-group" style={{gridColumn:'span 2', background:'#0d0d0d', border:'1px solid #222', borderRadius:10, padding:20}}>
                                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:15}}>
                                            <label style={{margin:0, display:'flex', alignItems:'center', gap:8, fontSize:'1rem', color:'#fff'}}>
                                                <Layers size={18} color="#c333ff"/> Barra Separadora entre Itens
                                            </label>
                                            <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', margin:0}}>
                                                <input 
                                                    type="checkbox" 
                                                    style={{width:20, height:20, accentColor:'#c333ff'}} 
                                                    checked={currentCat.separator_enabled || false} 
                                                    onChange={(e) => setCurrentCat({...currentCat, separator_enabled: e.target.checked})} 
                                                />
                                                <span style={{color: currentCat.separator_enabled ? '#10b981' : '#888', fontWeight:600}}>
                                                    {currentCat.separator_enabled ? 'Ativada' : 'Desativada'}
                                                </span>
                                            </label>
                                        </div>
                                        
                                        {currentCat.separator_enabled && (
                                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15}}>
                                                <div className="form-group">
                                                    <label>Texto da Barra</label>
                                                    <input className="input-field" value={currentCat.separator_text || ''} onChange={(e) => setCurrentCat({...currentCat, separator_text: e.target.value})} placeholder="Ex: QUER VER O CONTEÚDO COMPLETO?" />
                                                </div>
                                                
                                                <ColorPreview 
                                                    label="Cor do Texto da Barra" 
                                                    value={currentCat.separator_text_color} 
                                                    onChange={(val) => setCurrentCat({...currentCat, separator_text_color: val})} 
                                                />

                                                <div className="form-group">
                                                    <label>Texto do Botão CTA</label>
                                                    <input className="input-field" value={currentCat.separator_btn_text || ''} onChange={(e) => setCurrentCat({...currentCat, separator_btn_text: e.target.value})} placeholder="Ex: ASSINE AGORA" />
                                                </div>
                                                
                                                <ColorPreview 
                                                    label="Cor do Texto do Botão" 
                                                    value={currentCat.separator_btn_text_color} 
                                                    onChange={(val) => setCurrentCat({...currentCat, separator_btn_text_color: val})} 
                                                />

                                                <div className="form-group">
                                                    <label>Link do Botão (Opcional)</label>
                                                    <input className="input-field" value={currentCat.separator_btn_url || ''} onChange={(e) => setCurrentCat({...currentCat, separator_btn_url: e.target.value})} placeholder="https://... (vazio = checkout do bot)" />
                                                </div>
                                                
                                                <ColorPreview 
                                                    label="Cor da Barra (Fundo)" 
                                                    value={currentCat.separator_color} 
                                                    onChange={(val) => setCurrentCat({...currentCat, separator_color: val})} 
                                                />
                                                
                                                <div className="form-group" style={{gridColumn:'span 2'}}>
                                                    <MediaUploader label="Logo da Barra (Opcional)" value={currentCat.separator_logo_url} onChange={(url) => setCurrentCat({...currentCat, separator_logo_url: url})} />
                                                </div>

                                                {/* ✨ CHECKBOX NEON GLOW */}
                                                <div className="form-group" style={{gridColumn:'span 2', background:'rgba(0,0,0,0.3)', padding:15, borderRadius:8, border:'1px solid #333'}}>
                                                    <label style={{display:'flex', alignItems:'center', gap:10, cursor:'pointer', color:'#fff', margin:0}}>
                                                        <input 
                                                            type="checkbox" 
                                                            style={{width:20, height:20, accentColor:'#c333ff'}} 
                                                            checked={currentCat.separator_is_neon || false} 
                                                            onChange={(e) => setCurrentCat({...currentCat, separator_is_neon: e.target.checked})} 
                                                        />
                                                        <span style={{fontWeight:600, fontSize:'0.95rem'}}>
                                                            ✨ Ativar Efeito Neon/Glow
                                                        </span>
                                                    </label>
                                                    <small style={{color:'#888', marginTop:6, display:'block', marginLeft:30}}>
                                                        Adiciona um brilho neon personalizado ao redor da barra separadora.
                                                    </small>

                                                    {/* Cor do Neon (só aparece quando ativado) */}
                                                    {currentCat.separator_is_neon && (
                                                        <div style={{marginTop:12, marginLeft:30}}>
                                                            <ColorPreview 
                                                                label="Cor do Brilho Neon" 
                                                                value={currentCat.separator_neon_color} 
                                                                onChange={(val) => setCurrentCat({...currentCat, separator_neon_color: val})} 
                                                            />
                                                            <small style={{color:'#888', marginTop:4, display:'block'}}>
                                                                Escolha uma cor vibrante para o efeito glow. Se vazio, usa a cor da barra.
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Preview da Barra */}
                                                <div style={{gridColumn:'span 2', borderRadius:10, overflow:'hidden', border:'1px solid #333'}}>
                                                    <small style={{color:'#888', display:'block', marginBottom:8}}>👁️ Preview:</small>
                                                    <div style={{
                                                        background: currentCat.separator_color || '#ffffff',
                                                        padding:'16px 24px',
                                                        display:'flex', alignItems:'center', justifyContent:'space-between',
                                                        gap:15, flexWrap:'wrap', borderRadius:8,
                                                        ...(currentCat.separator_is_neon ? {
                                                            boxShadow: `0 0 15px ${currentCat.separator_neon_color || currentCat.separator_color || '#ffffff'}, 0 0 30px ${currentCat.separator_neon_color || currentCat.separator_color || '#ffffff'}50`
                                                        } : {})
                                                    }}>
                                                        <div style={{display:'flex', alignItems:'center', gap:12, flex:1}}>
                                                            {currentCat.separator_logo_url && (
                                                                <img src={currentCat.separator_logo_url} style={{height:36, objectFit:'contain'}} alt="Logo" />
                                                            )}
                                                            <span style={{fontWeight:'bold', color: currentCat.separator_text_color || '#000', fontSize:'0.9rem'}}>
                                                                {currentCat.separator_text || 'TEXTO DA BARRA'}
                                                            </span>
                                                        </div>
                                                        {currentCat.separator_btn_text && (
                                                            <div style={{
                                                                background: currentCat.theme_color || '#000',
                                                                color: currentCat.separator_btn_text_color || '#fff', 
                                                                padding:'10px 20px', borderRadius:6,
                                                                fontWeight:'bold', fontSize:'0.85rem', whiteSpace:'nowrap'
                                                            }}>
                                                                🔒 {currentCat.separator_btn_text}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 🔥 4. CONSTRUTOR DE ITENS DA VITRINE (AVANÇADO) 🔥 */}
                                    <div className="form-group" style={{gridColumn:'span 2', marginTop: 10, background: '#0a0a0a', padding: 20, borderRadius: 12, border: '1px solid #222'}}>
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 15, borderBottom:'1px solid #333', paddingBottom:10}}>
                                            <h4 style={{margin:0, display:'flex', alignItems:'center', gap:8, color: '#c333ff'}}><ShoppingBag size={18}/> Construtor de Produtos/Itens</h4>
                                            <Button type="button" size="sm" onClick={handleAddVitrineItem} style={{background: '#c333ff'}}>+ Adicionar Produto</Button>
                                        </div>
                                        
                                        {getVitrineItems().length === 0 && (
                                            <div style={{padding:20, textAlign:'center', border:'1px dashed #444', borderRadius:8, color:'#888'}}>
                                                Nenhum produto adicionado nesta vitrine.
                                            </div>
                                        )}

                                        <div style={{display:'flex', flexDirection:'column', gap: 20}}>
                                            {getVitrineItems().map((item, index) => (
                                                <div key={item.id || index} style={{background:'#151515', border:'1px solid #333', borderRadius:8, padding:20, position:'relative'}}>
                                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:20, borderBottom:'1px dashed #333', paddingBottom:10}}>
                                                        <strong style={{color:'#fff', fontSize:'1.1rem'}}>Produto #{index + 1}</strong>
                                                        <div style={{display:'flex', gap:5}}>
                                                            <button type="button" onClick={() => handleMoveVitrineItem(index, 'up')} disabled={index===0} style={{background:'#222', border:'none', color:'#fff', padding:'4px 8px', borderRadius:4, cursor:'pointer'}}>⬆</button>
                                                            <button type="button" onClick={() => handleMoveVitrineItem(index, 'down')} disabled={index===getVitrineItems().length-1} style={{background:'#222', border:'none', color:'#fff', padding:'4px 8px', borderRadius:4, cursor:'pointer'}}>⬇</button>
                                                            <button type="button" onClick={() => handleRemoveVitrineItem(index)} style={{background:'#ef4444', border:'none', color:'#fff', padding:'4px 8px', borderRadius:4, cursor:'pointer'}}><Trash2 size={14}/></button>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* GRID DO ITEM AVANÇADO */}
                                                    <div className="config-grid-layout" style={{gap:15}}>
                                                        
                                                        {/* Básico */}
                                                        <div className="form-group" style={{gridColumn:'span 2'}}>
                                                            <label>Título do Produto / Série</label>
                                                            <input className="input-field" value={item.title || ''} onChange={e => handleUpdateVitrineItem(index, 'title', e.target.value)} placeholder="Ex: Flagras Reais" />
                                                        </div>
                                                        <div className="form-group" style={{gridColumn:'span 2'}}>
                                                            <label>Descrição Curta</label>
                                                            <input className="input-field" value={item.description || ''} onChange={e => handleUpdateVitrineItem(index, 'description', e.target.value)} placeholder="Ex: Flagras naturais no litoral..." />
                                                        </div>
                                                        
                                                        {/* Cores (Aceita Gradiente) - COM PREVIEW */}
                                                        <ColorPreview 
                                                            label="Cor de Fundo (Hex ou Gradiente)" 
                                                            value={item.bgColor || ''} 
                                                            onChange={val => handleUpdateVitrineItem(index, 'bgColor', val)} 
                                                        />
                                                        <ColorPreview 
                                                            label="Cor do Tema / Botão" 
                                                            value={item.themeColor || ''} 
                                                            onChange={val => handleUpdateVitrineItem(index, 'themeColor', val)} 
                                                        />

                                                        {/* Imagens do Produto */}
                                                        <div className="form-group">
                                                            <MediaUploader label="Imagem Principal do Card" value={item.image_url || ''} onChange={url => handleUpdateVitrineItem(index, 'image_url', url)} type="photo" />
                                                            <div style={{marginTop:8}}>
                                                                <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'#fff', margin:0, fontSize:'0.85rem'}}>
                                                                    <input type="checkbox" style={{width:18, height:18, accentColor:'#c333ff'}} checked={item.fakeVideo || false} onChange={e => handleUpdateVitrineItem(index, 'fakeVideo', e.target.checked)} />
                                                                    <PlayCircle size={16} color="#c333ff"/> Simular Vídeo (botão Play sobre a imagem)
                                                                </label>
                                                                <small style={{color:'#888', marginLeft:26, display:'block'}}>Ao clicar, direciona pro checkout ao invés de reproduzir.</small>
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <MediaUploader label="Vídeo Preview (.mp4)" value={item.videoPreview || ''} onChange={url => handleUpdateVitrineItem(index, 'videoPreview', url)} type="video" />
                                                        </div>
                                                        
                                                        <div className="form-group">
                                                            <MediaUploader label="Imagem do Ator/Modelo" value={item.modelImg || ''} onChange={url => handleUpdateVitrineItem(index, 'modelImg', url)} type="photo" />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Nome Ator/Modelo</label>
                                                            <input className="input-field" value={item.modelName || ''} onChange={e => handleUpdateVitrineItem(index, 'modelName', e.target.value)} placeholder="Ex: Sayuri Sakai" />
                                                        </div>
                                                        <div className="form-group" style={{gridColumn:'span 2'}}>
                                                            <label>Descrição Completa da Cena/Filme</label>
                                                            <textarea className="input-field" rows={3} value={item.modelDesc || ''} onChange={e => handleUpdateVitrineItem(index, 'modelDesc', e.target.value)} placeholder="Detalhes do episódio ou cena..." />
                                                        </div>

                                                        {/* Checkboxes de Configuração (Modos Especiais) */}
                                                        <div className="form-group toggle-group" style={{gridColumn:'span 2', display:'flex', gap: 20, flexWrap:'wrap', background:'rgba(0,0,0,0.3)', padding:15, borderRadius:8, border:'1px solid #333'}}>
                                                            <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'#fff', margin:0}}>
                                                                <input type="checkbox" style={{width:18, height:18, accentColor:'#c333ff'}} checked={item.isDirectCheckout || false} onChange={e => handleUpdateVitrineItem(index, 'isDirectCheckout', e.target.checked)} /> 
                                                                Pular Detalhes (Direto pro Checkout)
                                                            </label>
                                                            <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'#fff', margin:0}}>
                                                                <input type="checkbox" style={{width:18, height:18, accentColor:'#c333ff'}} checked={item.isComicMode || false} onChange={e => handleUpdateVitrineItem(index, 'isComicMode', e.target.checked)} /> 
                                                                Ativar Modo Comic/Mangá (Fotos em sequência)
                                                            </label>
                                                            <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'#fff', margin:0}}>
                                                                <input type="checkbox" style={{width:18, height:18, accentColor:'#c333ff'}} checked={item.isHackerMode || false} onChange={e => handleUpdateVitrineItem(index, 'isHackerMode', e.target.checked)} /> 
                                                                Ativar Modo Hacker (Terminal/Arquivos)
                                                            </label>
                                                        </div>

                                                        {/* Campos Condicionais (Modos) */}
                                                        {item.isComicMode && (
                                                            <div className="form-group" style={{gridColumn:'span 2', borderLeft:'3px solid #c333ff', paddingLeft:10}}>
                                                                <label>URLs das Imagens Comic (Separe por VÍRGULA)</label>
                                                                <textarea className="input-field" rows={3} value={item.comicImages || ''} onChange={e => handleUpdateVitrineItem(index, 'comicImages', e.target.value)} placeholder="https://img1.jpg, https://img2.jpg..." />
                                                            </div>
                                                        )}
                                                        
                                                        {item.isHackerMode && (
                                                            <div className="form-group" style={{gridColumn:'span 2', borderLeft:'3px solid #00ff00', paddingLeft:10}}>
                                                                <label>Arquivos Hacker (Cole o Array JSON)</label>
                                                                <textarea className="input-field" rows={4} value={item.hackerFiles || ''} onChange={e => handleUpdateVitrineItem(index, 'hackerFiles', e.target.value)} placeholder='[{"name": "vazamento.mp4", "size": "450MB"}]' style={{fontFamily:'monospace', color:'#00ff00'}} />
                                                            </div>
                                                        )}

                                                        {/* TRECHO ATUALIZADO: Botão de Compra com Opção de Ocultar */}
                                                        <div className="form-group">
                                                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5}}>
                                                                <label>Texto do Botão de Compra</label>
                                                                <label style={{display:'flex', alignItems:'center', gap:6, cursor:'pointer', color:'#ef4444', fontSize:'0.85rem'}}>
                                                                    <input 
                                                                        type="checkbox" 
                                                                        style={{width:16, height:16, accentColor:'#ef4444'}} 
                                                                        checked={item.hideMainButton || false} 
                                                                        onChange={e => handleUpdateVitrineItem(index, 'hideMainButton', e.target.checked)} 
                                                                    /> 
                                                                    Ocultar Botão Principal
                                                                </label>
                                                            </div>
                                                            <input 
                                                                className="input-field" 
                                                                value={item.btn_text || ''} 
                                                                onChange={e => handleUpdateVitrineItem(index, 'btn_text', e.target.value)} 
                                                                placeholder="Ex: ASSINAR AGORA" 
                                                                disabled={item.hideMainButton} // Desabilita input se estiver oculto
                                                                style={{opacity: item.hideMainButton ? 0.5 : 1}}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Link Checkout Personalizado (Opcional)</label>
                                                            <input className="input-field" value={item.link_url || ''} onChange={e => handleUpdateVitrineItem(index, 'link_url', e.target.value)} placeholder="Se vazio, usa o checkout do Bot" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 5. EXTRAS DA CATEGORIA (RODAPÉ) */}
                                    <div className="form-group">
                                        <MediaUploader label="Linhas Decorativas (URL)" value={currentCat.deco_lines_url} onChange={(url) => setCurrentCat({...currentCat, deco_lines_url: url})} />
                                    </div>
                                    <div className="form-group">
                                        <MediaUploader label="Banner Rodapé" value={currentCat.footer_banner_url} onChange={(url) => setCurrentCat({...currentCat, footer_banner_url: url})} />
                                    </div>
                                </div>

                                <div style={{display:'flex', gap: 10, marginTop: 20}}>
                                    <Button onClick={handleSaveCategory} style={{background: '#c333ff'}}>Salvar Categoria / Vitrine</Button>
                                    <Button variant="ghost" onClick={() => setIsEditingCat(false)}>Cancelar</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="categories-list-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 15}}>
                            {categories.map(cat => (
                                <div key={cat.id} className="category-admin-card" style={{background: '#151515', border: '1px solid #333', borderRadius: 8, padding: 15}}>
                                    <div style={{height: 120, background: '#000', borderRadius: 4, marginBottom: 10, overflow:'hidden'}}>
                                        {cat.cover_image ? <img src={cat.cover_image} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#333'}}>Sem Imagem</div>}
                                    </div>
                                    <h4 style={{margin:'0 0 5px 0'}}>{cat.title}</h4>
                                    <p style={{fontSize:'0.8rem', color:'#888', margin:0}}>{cat.description || 'Sem descrição'}</p>
                                    
                                    <div style={{display:'flex', gap: 10, marginTop: 15}}>
                                        <button onClick={() => handleEditCategory(cat)} style={{flex:1, background: '#333', border:'none', color:'#fff', padding: 8, borderRadius: 4, cursor:'pointer'}}><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteCategory(cat.id)} style={{flex:1, background: '#3f1111', border:'none', color:'#ef4444', padding: 8, borderRadius: 4, cursor:'pointer'}}><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                            {categories.length === 0 && <p style={{color:'#ffffff'}}>Nenhuma categoria criada.</p>}
                        </div>
                    )}
                </div>

                <div className="link-copy-box" style={{marginTop: 40}}>
                    <span>Link da Loja:</span>
                    <code onClick={copyStoreLink}>{window.location.origin}/loja/{id}</code>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}