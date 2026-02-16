import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import { 
  Save, ArrowLeft, MessageSquare, Key, Headphones, 
  Smartphone, Layout, PlayCircle, Type, Plus, Trash2, Edit, Image as ImageIcon, Link, User, Palette, Shield, Radio, Wifi, CheckCircle, XCircle, AlertTriangle, Bell, ShoppingBag
} from 'lucide-react'; 
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { botService, miniappService, planService } from '../services/api'; 
import { MediaUploader } from '../components/MediaUploader'; // 🔥 NOVO COMPONENTE DE UPLOAD
import Swal from 'sweetalert2';
import './Bots.css';

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
        title: 'Sucesso',
        text: 'Configurações gerais salvas!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#151515', color: '#fff'
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
            title: 'Loja Atualizada',
            text: 'Configurações visuais salvas!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: '#151515', color: '#fff'
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
          model_name_color: '#ffffff', model_desc_color: '#cccccc', 
          footer_banner_url: '', deco_lines_url: '',
          is_direct_checkout: false, content_json: '[]'
      });
      setIsEditingCat(true);
  };

  const handleEditCategory = (cat) => {
      setCurrentCat({ ...cat }); 
      setIsEditingCat(true);
  };

  const handleSaveCategory = async () => {
      if (!currentCat.title) return Swal.fire('Erro', 'Digite um título', 'warning');

      try {
          await miniappService.createCategory({ ...currentCat, bot_id: id });
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

  // 🔥 ================= LÓGICA DA VITRINE (MÚLTIPLOS ITENS) ================= 🔥
  const getVitrineItems = () => {
      try {
          const parsed = JSON.parse(currentCat.content_json || '[]');
          return Array.isArray(parsed) ? parsed : [];
      } catch(e) { return []; }
  };

  const handleAddVitrineItem = () => {
      const items = getVitrineItems();
      items.push({ id: Date.now(), title: '', description: '', image_url: '', link_url: '', btn_text: 'Acessar' });
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
                            
                            {/* 🔥 ATUALIZADO: UPLOAD DE VÍDEO HERO */}
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
                                    
                                    {/* 🔥 ATUALIZADO: UPLOAD DE VÍDEO POPUP */}
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
                                    <div className="form-group">
                                        <label><Palette size={16}/> Cor de Fundo (Página)</label>
                                        <div style={{display:'flex', gap:5}}>
                                            <input type="color" value={currentCat.bg_color || '#000000'} onChange={(e) => setCurrentCat({...currentCat, bg_color: e.target.value})} style={{height:40}} />
                                            <input className="input-field" value={currentCat.bg_color} onChange={(e) => setCurrentCat({...currentCat, bg_color: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label><Palette size={16}/> Cor do Tema (Botões)</label>
                                        <div style={{display:'flex', gap:5}}>
                                            <input type="color" value={currentCat.theme_color || '#ffffff'} onChange={(e) => setCurrentCat({...currentCat, theme_color: e.target.value})} style={{height:40}} />
                                            <input className="input-field" value={currentCat.theme_color} onChange={(e) => setCurrentCat({...currentCat, theme_color: e.target.value})} />
                                        </div>
                                    </div>

                                    {/* 3. IMAGENS (🔥 ATUALIZADO PARA MEDIA UPLOADER) */}
                                    <div className="form-group" style={{gridColumn:'span 2'}}>
                                        <MediaUploader label="Imagem Card (Home)" value={currentCat.cover_image} onChange={(url) => setCurrentCat({...currentCat, cover_image: url})} />
                                    </div>
                                    <div className="form-group">
                                        <MediaUploader label="Banner Mobile (Topo)" value={currentCat.banner_mob_url} onChange={(url) => setCurrentCat({...currentCat, banner_mob_url: url})} />
                                    </div>
                                    <div className="form-group">
                                        <MediaUploader label="Banner Desktop" value={currentCat.banner_desk_url} onChange={(url) => setCurrentCat({...currentCat, banner_desk_url: url})} />
                                    </div>

                                    {/* 4. ITENS DA VITRINE (MÚLTIPLOS PRODUTOS) */}
                                    <div className="form-group" style={{gridColumn:'span 2', marginTop: 10}}>
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 15, borderBottom:'1px solid #333', paddingBottom:10}}>
                                            <h4 style={{margin:0, display:'flex', alignItems:'center', gap:8}}><ShoppingBag size={18}/> Itens da Vitrine</h4>
                                            <Button type="button" size="sm" onClick={handleAddVitrineItem} style={{background: '#c333ff'}}>+ Adicionar Item</Button>
                                        </div>
                                        
                                        {getVitrineItems().length === 0 && (
                                            <div style={{padding:20, textAlign:'center', border:'1px dashed #444', borderRadius:8, color:'#888'}}>
                                                Nenhum item adicionado nesta categoria. Clique no botão acima para começar.
                                            </div>
                                        )}

                                        <div style={{display:'flex', flexDirection:'column', gap: 15}}>
                                            {getVitrineItems().map((item, index) => (
                                                <div key={item.id || index} style={{background:'rgba(255,255,255,0.02)', border:'1px solid #333', borderRadius:8, padding:15}}>
                                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}>
                                                        <strong style={{color:'#10b981'}}>Item {index + 1}</strong>
                                                        <div style={{display:'flex', gap:5}}>
                                                            <button type="button" onClick={() => handleMoveVitrineItem(index, 'up')} disabled={index===0} style={{background:'#222', border:'none', color:'#fff', padding:'4px 8px', borderRadius:4, cursor:'pointer'}}>⬆</button>
                                                            <button type="button" onClick={() => handleMoveVitrineItem(index, 'down')} disabled={index===getVitrineItems().length-1} style={{background:'#222', border:'none', color:'#fff', padding:'4px 8px', borderRadius:4, cursor:'pointer'}}>⬇</button>
                                                            <button type="button" onClick={() => handleRemoveVitrineItem(index)} style={{background:'#ef4444', border:'none', color:'#fff', padding:'4px 8px', borderRadius:4, cursor:'pointer'}}><Trash2 size={14}/></button>
                                                        </div>
                                                    </div>
                                                    <div className="config-grid-layout" style={{gap:10}}>
                                                        <div className="form-group">
                                                            <label>Título do Item</label>
                                                            <input className="input-field" value={item.title || ''} onChange={e => handleUpdateVitrineItem(index, 'title', e.target.value)} placeholder="Ex: Netflix" />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Texto do Botão</label>
                                                            <input className="input-field" value={item.btn_text || ''} onChange={e => handleUpdateVitrineItem(index, 'btn_text', e.target.value)} placeholder="Ex: Acessar" />
                                                        </div>
                                                        <div className="form-group" style={{gridColumn:'span 2'}}>
                                                            <label>Descrição</label>
                                                            <input className="input-field" value={item.description || ''} onChange={e => handleUpdateVitrineItem(index, 'description', e.target.value)} placeholder="Ex: Acesso 30 dias..." />
                                                        </div>
                                                        <div className="form-group" style={{gridColumn:'span 2'}}>
                                                            <label>Link de Destino</label>
                                                            <input className="input-field" value={item.link_url || ''} onChange={e => handleUpdateVitrineItem(index, 'link_url', e.target.value)} placeholder="https://..." />
                                                        </div>
                                                        <div className="form-group" style={{gridColumn:'span 2'}}>
                                                            <MediaUploader label="Imagem do Item (Card)" value={item.image_url || ''} onChange={url => handleUpdateVitrineItem(index, 'image_url', url)} type="photo" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Cor do Nome (Itens)</label>
                                        <div style={{display:'flex', gap:5}}>
                                            <input type="color" value={currentCat.model_name_color || '#ffffff'} onChange={(e) => setCurrentCat({...currentCat, model_name_color: e.target.value})} style={{height:40}} />
                                            <input className="input-field" value={currentCat.model_name_color} onChange={(e) => setCurrentCat({...currentCat, model_name_color: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Cor da Descrição (Itens)</label>
                                        <div style={{display:'flex', gap:5}}>
                                            <input type="color" value={currentCat.model_desc_color || '#cccccc'} onChange={(e) => setCurrentCat({...currentCat, model_desc_color: e.target.value})} style={{height:40}} />
                                            <input className="input-field" value={currentCat.model_desc_color} onChange={(e) => setCurrentCat({...currentCat, model_desc_color: e.target.value})} />
                                        </div>
                                    </div>

                                    {/* 5. EXTRAS */}
                                    <div className="form-group" style={{gridColumn:'span 2'}}>
                                        <MediaUploader label="Vídeo Preview (.mp4)" value={currentCat.video_preview_url} onChange={(url) => setCurrentCat({...currentCat, video_preview_url: url})} />
                                    </div>
                                    <div className="form-group">
                                        <MediaUploader label="Linhas Decorativas (URL)" value={currentCat.deco_lines_url} onChange={(url) => setCurrentCat({...currentCat, deco_lines_url: url})} />
                                    </div>
                                    <div className="form-group">
                                        <MediaUploader label="Banner Rodapé" value={currentCat.footer_banner_url} onChange={(url) => setCurrentCat({...currentCat, footer_banner_url: url})} />
                                    </div>
                                </div>

                                <div style={{display:'flex', gap: 10, marginTop: 20}}>
                                    <Button onClick={handleSaveCategory} style={{background: '#c333ff'}}>Salvar Categoria</Button>
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