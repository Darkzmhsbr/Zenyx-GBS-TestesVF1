import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, Link as LinkIcon, Trash2, ArrowLeft, Copy, 
  BarChart2, PieChart, DollarSign, MousePointer, Users,
  Facebook, Instagram, Youtube, MessageCircle, Globe, Share2, Send,
  TrendingUp, ChevronDown, ChevronUp, Percent, ShoppingBag, Rocket, ArrowDownCircle, Megaphone, Zap, Gift
} from 'lucide-react';
import { 
  PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';
import { trackingService, botService } from '../services/api';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import Swal from 'sweetalert2';
import './Tracking.css';

// Cores para os Gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#c333ff', '#ef4444', '#229ED9'];

export function Tracking() {
  // Estados de Navegação
  const [view, setView] = useState('dashboard'); // 'dashboard' ou 'folder'
  const [loading, setLoading] = useState(false);
  
  // Dados
  const [folders, setFolders] = useState([]);
  const [currentLinks, setCurrentLinks] = useState([]);
  const [bots, setBots] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  
  // Dados Gráficos Reais
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  
  // 📊 NOVOS: Dados avançados
  const [chartData, setChartData] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [expandedLinkId, setExpandedLinkId] = useState(null);
  const [linkMetrics, setLinkMetrics] = useState({});
  
  // Modais
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  // Forms
  const [newFolder, setNewFolder] = useState({ nome: '', plataforma: 'instagram' });
  const [newLink, setNewLink] = useState({ nome: '', origem: 'stories', bot_id: '', codigo: '' });
  const [customOrigem, setCustomOrigem] = useState('');

  // Load Inicial
  useEffect(() => {
    loadDashboard();
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const data = await botService.listBots();
      setBots(data.map(b => ({ label: b.nome, value: b.id, username: b.username })));
    } catch (error) {
      console.error("Erro ao carregar bots", error);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await trackingService.listFolders();
      setFolders(data);
      processCharts(data);
      
      // 📊 Carrega dados avançados em paralelo
      try {
        const [chartRes, rankRes] = await Promise.all([
          trackingService.getChart(7),
          trackingService.getRanking(10)
        ]);
        
        // Transforma chartData para formato Recharts
        if (chartRes && chartRes.labels && chartRes.datasets) {
          const formatted = chartRes.labels.map((label, i) => {
            const point = { dia: label };
            chartRes.datasets.forEach(ds => {
              point[ds.codigo] = ds.data[i] || 0;
            });
            return point;
          });
          setChartData(formatted);
        }
        
        if (rankRes) setRankingData(rankRes);
      } catch (e) {
        console.error("Erro dados avançados:", e);
      }
    } catch (error) {
      console.error("Erro ao carregar pastas", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 PROCESSAMENTO DE DADOS REAIS PARA OS GRÁFICOS
  const processCharts = (foldersData) => {
    // 1. Gráfico de Pizza (Agrupar cliques por Plataforma)
    const platformMap = {};
    
    foldersData.forEach(folder => {
        const plat = folder.plataforma || 'outros';
        // Normaliza nomes para o gráfico (Capitalize)
        const label = plat.charAt(0).toUpperCase() + plat.slice(1);
        
        if (!platformMap[label]) platformMap[label] = 0;
        // O backend deve retornar 'total_clicks', se não vier, assume 0
        platformMap[label] += (folder.total_clicks || 0);
    });

    const newPieData = Object.keys(platformMap).map(key => ({
        name: key,
        value: platformMap[key]
    })).filter(item => item.value > 0); // Só mostra fatias > 0

    // Se estiver tudo zerado, mostra um placeholder cinza para não ficar vazio
    if (newPieData.length === 0) {
        setPieData([{ name: 'Sem dados', value: 1, color: '#333' }]);
    } else {
        setPieData(newPieData);
    }

    // 2. Gráfico de Barras (Pastas Individuais: Cliques x Vendas)
    // Filtra apenas pastas que tem alguma atividade para não poluir o gráfico
    const activeFolders = foldersData.filter(f => (f.total_clicks > 0 || f.total_vendas > 0));
    
    const newBarData = activeFolders.map(f => ({
        name: f.nome,
        clicks: f.total_clicks || 0,
        vendas: f.total_vendas || 0
    }));

    setBarData(newBarData);
  };

  const openFolder = async (folder) => {
    setSelectedFolder(folder);
    setLoading(true);
    try {
      const links = await trackingService.listLinks(folder.id);
      setCurrentLinks(links);
      setView('folder');
    } catch (error) {
      Swal.fire('Erro', 'Falha ao abrir pasta.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- CRIAÇÃO ---
  const handleCreateFolder = async () => {
    if (!newFolder.nome) return Swal.fire('Atenção', 'Nome é obrigatório', 'warning');
    try {
      await trackingService.createFolder(newFolder);
      setShowFolderModal(false);
      setNewFolder({ nome: '', plataforma: 'instagram' });
      loadDashboard();
      Swal.fire({
        title: 'Sucesso',
        text: 'Pasta criada!',
        icon: 'success',
        background: '#151515', color: '#fff'
      });
    } catch (error) {
      Swal.fire('Erro', 'Falha ao criar pasta.', 'error');
    }
  };

  const handleCreateLink = async () => {
    if (!newLink.nome || !newLink.bot_id) return Swal.fire('Atenção', 'Preencha Nome e Bot', 'warning');
    
    // Resolve a origem final
    const origemFinal = newLink.origem === 'custom' ? customOrigem.trim() : newLink.origem;
    if (!origemFinal) return Swal.fire('Atenção', 'Defina o nome da origem personalizada', 'warning');
    
    try {
      await trackingService.createLink({
        ...newLink,
        origem: origemFinal,
        folder_id: selectedFolder.id
      });
      setShowLinkModal(false);
      // Recarrega links da pasta atual
      const links = await trackingService.listLinks(selectedFolder.id);
      setCurrentLinks(links);
      
      // Reseta form
      setNewLink({ nome: '', origem: 'stories', bot_id: '', codigo: '' });
      setCustomOrigem('');
      
      Swal.fire({
        title: 'Sucesso',
        text: 'Link rastreável gerado!',
        icon: 'success',
        background: '#151515', color: '#fff'
      });
    } catch (error) {
        // Se der erro de duplicidade (código já existe)
        if (error.response && error.response.status === 400) {
            Swal.fire('Erro', 'Este código personalizado já existe. Tente outro.', 'error');
        } else {
            Swal.fire('Erro', 'Falha ao criar link.', 'error');
        }
    }
  };

  const handleDeleteLink = async (id) => {
    const result = await Swal.fire({
        title: 'Excluir Link?',
        text: "Os dados estatísticos dele serão perdidos.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        background: '#151515', color: '#fff'
    });

    if (result.isConfirmed) {
        try {
            await trackingService.deleteLink(id);
            const links = await trackingService.listLinks(selectedFolder.id);
            setCurrentLinks(links);
        } catch (error) {
            Swal.fire('Erro', 'Falha ao deletar.', 'error');
        }
    }
  };

  const handleDeleteFolder = async (e, id) => {
    e.stopPropagation(); // Evita abrir a pasta ao clicar no lixo
    const result = await Swal.fire({
        title: 'Excluir Pasta?',
        text: "Todos os links dentro dela também serão apagados!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        background: '#151515', color: '#fff'
    });

    if (result.isConfirmed) {
        try {
            await trackingService.deleteFolder(id);
            loadDashboard();
        } catch (error) {
            Swal.fire('Erro', 'Falha ao deletar pasta.', 'error');
        }
    }
  };

  // --- UTILITÁRIOS ---
  const toggleLinkExpand = async (linkId) => {
    if (expandedLinkId === linkId) {
      setExpandedLinkId(null);
      return;
    }
    setExpandedLinkId(linkId);
    if (!linkMetrics[linkId]) {
      try {
        const metrics = await trackingService.getLinkMetrics(linkId);
        setLinkMetrics(prev => ({ ...prev, [linkId]: metrics }));
      } catch (e) {
        console.error("Erro métricas:", e);
      }
    }
  };

  const copyLink = (linkData) => {
    const bot = bots.find(b => b.value === linkData.bot_id);
    const username = bot ? bot.username : 'SeuBot';
    const finalLink = `https://t.me/${username}?start=${linkData.codigo}`;
    
    navigator.clipboard.writeText(finalLink);
    Swal.fire({
        icon: 'success',
        title: 'Copiado!',
        text: finalLink,
        toast: true, position: 'top-end', timer: 3000, showConfirmButton: false,
        background: '#151515', color: '#fff'
    });
  };

  const getPlatformIcon = (plat) => {
    switch(plat) {
        case 'facebook': return <Facebook color="#1877F2" />;
        case 'instagram': return <Instagram color="#E4405F" />;
        case 'youtube': return <Youtube color="#FF0000" />;
        case 'whatsapp': return <MessageCircle color="#25D366" />;
        case 'tiktok': return <Share2 color="#000" />;
        case 'telegram': return <Send color="#229ED9" />;
        default: return <Globe color="#ccc" />;
    }
  };

  return (
    <div className="tracking-container">
        
        {/* --- CABEÇALHO --- */}
        <div className="page-header">
            <div>
                <h1>Rastreamento de Links</h1>
                <p style={{color: 'var(--muted-foreground)'}}>Gerencie suas campanhas e saiba de onde vêm suas vendas.</p>
            </div>
            {view === 'dashboard' ? (
                <Button onClick={() => setShowFolderModal(true)}>
                    <FolderPlus size={18} style={{marginRight:8}}/> Nova Pasta
                </Button>
            ) : (
                <Button onClick={() => setShowLinkModal(true)}>
                    <LinkIcon size={18} style={{marginRight:8}}/> Novo Link
                </Button>
            )}
        </div>

        {view === 'dashboard' ? (
            <>
                {/* --- ÁREA DE GRÁFICOS (DASHBOARD) --- */}
                <div className="charts-grid">
                    {/* 📈 GRÁFICO DE DESEMPENHO TEMPORAL (7 DIAS) */}
                    <Card>
                        <CardContent>
                            <h3 className="chart-title"><TrendingUp size={16} style={{verticalAlign:'middle', marginRight:6}}/> Desempenho dos códigos (7 dias)</h3>
                            {chartData.length > 0 ? (
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="dia" stroke="#888" fontSize={12} />
                                            <YAxis stroke="#888" allowDecimals={false} />
                                            <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} />
                                            <Legend />
                                            {chartData.length > 0 && Object.keys(chartData[0]).filter(k => k !== 'dia').map((key, i) => (
                                                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div style={{height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', flexDirection: 'column'}}>
                                    <TrendingUp size={48} style={{opacity:0.2, marginBottom: 10}}/>
                                    <p>Sem dados de vendas nos últimos 7 dias</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 📊 CONVERSÃO POR CAMPANHA (CLIQUES x VENDAS) */}
                    <Card>
                        <CardContent>
                            <h3 className="chart-title">Conversão por Campanha (Cliques x Vendas)</h3>
                            {barData.length > 0 ? (
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={barData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="name" stroke="#888" />
                                            <YAxis stroke="#888" />
                                            <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} />
                                            <Legend />
                                            <Bar dataKey="clicks" name="Cliques" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="vendas" name="Vendas" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div style={{height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', flexDirection: 'column'}}>
                                    <BarChart2 size={48} style={{opacity:0.2, marginBottom: 10}}/>
                                    <p>Sem dados de campanhas ativas</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* 🏆 RANKING TOP CÓDIGOS POR FATURAMENTO */}
                {rankingData.length > 0 && (
                    <div style={{marginBottom: 30}}>
                        <h3 style={{marginBottom: 15}}><DollarSign size={18} style={{verticalAlign:'middle', marginRight:6}}/> Códigos com maior valor arrecadado</h3>
                        <div className="charts-grid">
                            <Card>
                                <CardContent>
                                    <div style={{ width: '100%', height: 280 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={rankingData.slice(0, 5)} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                <XAxis type="number" stroke="#888" tickFormatter={v => `R$${v}`} />
                                                <YAxis type="category" dataKey="codigo" stroke="#888" width={100} fontSize={12} />
                                                <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} formatter={v => `R$ ${v.toFixed(2)}`} />
                                                <Bar dataKey="faturamento_total" name="Faturamento" fill="#fbbf24" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <h3 className="chart-title">Origem do Tráfego (Cliques)</h3>
                                    <div style={{ width: '100%', height: 250 }}>
                                        <ResponsiveContainer>
                                            <RePieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} />
                                                <Legend />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                <h3 style={{marginTop: '30px', marginBottom: '15px'}}>Suas Pastas</h3>
                
                {/* --- GRID DE PASTAS --- */}
                <div className="folders-grid">
                    {folders.map(folder => (
                        <div key={folder.id} className="folder-card" onClick={() => openFolder(folder)}>
                            <div className="folder-icon">
                                {getPlatformIcon(folder.plataforma)}
                            </div>
                            <div className="folder-info">
                                <h4>{folder.nome}</h4>
                                <span>{folder.link_count || 0} links • {folder.total_clicks || 0} cliques</span>
                            </div>
                            <button className="delete-folder-btn" onClick={(e) => handleDeleteFolder(e, folder.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    
                    {folders.length === 0 && (
                        <div className="empty-folders">
                            <p>Nenhuma pasta criada. Crie uma para começar.</p>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <>
                {/* --- VIEW: DENTRO DA PASTA (LISTA DE LINKS) --- */}
                <div className="folder-header-bar">
                    <button className="back-btn" onClick={() => { setView('dashboard'); setSelectedFolder(null); loadDashboard(); }}>
                        <ArrowLeft size={20} /> Voltar
                    </button>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        {getPlatformIcon(selectedFolder?.plataforma)}
                        <h2>{selectedFolder?.nome}</h2>
                    </div>
                </div>

                <div className="links-list">
                    {currentLinks.map(link => (
                        <div key={link.id} className={`link-item-wrapper ${expandedLinkId === link.id ? 'expanded' : ''}`}>
                            <div className="link-item" onClick={() => toggleLinkExpand(link.id)} style={{cursor:'pointer'}}>
                                <div className="link-main-info">
                                    <div className="link-icon-wrapper">
                                        <LinkIcon size={20} color="#c333ff" />
                                    </div>
                                    <div>
                                        <div className="link-name">{link.nome}</div>
                                        <div className="link-code">Código: <code>{link.codigo}</code> • Origem: {link.origem}</div>
                                    </div>
                                </div>

                                <div className="link-stats">
                                    <div className="stat-box">
                                        <MousePointer size={14} />
                                        <span>{link.clicks} <small>Cliques</small></span>
                                    </div>
                                    <div className="stat-box highlight">
                                        <Users size={14} />
                                        <span>{link.leads} <small>Leads</small></span>
                                    </div>
                                    <div className="stat-box success">
                                        <DollarSign size={14} />
                                        <span>{link.vendas} <small>Vendas</small></span>
                                    </div>
                                    <div className="stat-box money">
                                        <span>R$ {link.faturamento?.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="link-actions">
                                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); toggleLinkExpand(link.id); }} title="Detalhes">
                                        {expandedLinkId === link.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                                    </button>
                                    <button className="action-btn copy" onClick={(e) => { e.stopPropagation(); copyLink(link); }} title="Copiar Link">
                                        <Copy size={18} />
                                    </button>
                                    <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); handleDeleteLink(link.id); }} title="Excluir">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* 📊 PAINEL EXPANDIDO COM BREAKDOWN */}
                            {expandedLinkId === link.id && (
                                <div className="link-expanded-panel">
                                    {linkMetrics[link.id] ? (
                                        <>
                                            <div className="metrics-summary">
                                                <div className="metric-card">
                                                    <small>Faturamento Total</small>
                                                    <strong style={{color:'#fbbf24'}}>R$ {linkMetrics[link.id].faturamento_total?.toFixed(2)}</strong>
                                                </div>
                                                <div className="metric-card">
                                                    <small>Total Vendas</small>
                                                    <strong style={{color:'#10b981'}}>{linkMetrics[link.id].vendas_total}</strong>
                                                </div>
                                                <div className="metric-card">
                                                    <small>Leads</small>
                                                    <strong style={{color:'#3b82f6'}}>{linkMetrics[link.id].leads}</strong>
                                                </div>
                                                <div className="metric-card">
                                                    <small>Conversão</small>
                                                    <strong style={{color:'#c333ff'}}>{linkMetrics[link.id].conversao}%</strong>
                                                </div>
                                            </div>
                                            <div className="breakdown-bars">
                                                <div className="breakdown-item">
                                                    <div className="breakdown-label">
                                                        <ShoppingBag size={14} color="#3b82f6"/>
                                                        <span>Normais</span>
                                                    </div>
                                                    <div className="breakdown-values">
                                                        <span>R$ {linkMetrics[link.id].breakdown.normais.faturamento.toFixed(2)}</span>
                                                        <small>{linkMetrics[link.id].breakdown.normais.vendas} vendas</small>
                                                    </div>
                                                    <div className="breakdown-bar-track">
                                                        <div className="breakdown-bar-fill normal" style={{width: `${linkMetrics[link.id].faturamento_total > 0 ? (linkMetrics[link.id].breakdown.normais.faturamento / linkMetrics[link.id].faturamento_total * 100) : 0}%`}}/>
                                                    </div>
                                                </div>
                                                <div className="breakdown-item">
                                                    <div className="breakdown-label">
                                                        <Rocket size={14} color="#10b981"/>
                                                        <span>Upsell</span>
                                                    </div>
                                                    <div className="breakdown-values">
                                                        <span>R$ {linkMetrics[link.id].breakdown.upsell.faturamento.toFixed(2)}</span>
                                                        <small>{linkMetrics[link.id].breakdown.upsell.vendas} vendas</small>
                                                    </div>
                                                    <div className="breakdown-bar-track">
                                                        <div className="breakdown-bar-fill upsell" style={{width: `${linkMetrics[link.id].faturamento_total > 0 ? (linkMetrics[link.id].breakdown.upsell.faturamento / linkMetrics[link.id].faturamento_total * 100) : 0}%`}}/>
                                                    </div>
                                                </div>
                                                <div className="breakdown-item">
                                                    <div className="breakdown-label">
                                                        <ArrowDownCircle size={14} color="#ef4444"/>
                                                        <span>Downsell</span>
                                                    </div>
                                                    <div className="breakdown-values">
                                                        <span>R$ {linkMetrics[link.id].breakdown.downsell.faturamento.toFixed(2)}</span>
                                                        <small>{linkMetrics[link.id].breakdown.downsell.vendas} vendas</small>
                                                    </div>
                                                    <div className="breakdown-bar-track">
                                                        <div className="breakdown-bar-fill downsell" style={{width: `${linkMetrics[link.id].faturamento_total > 0 ? (linkMetrics[link.id].breakdown.downsell.faturamento / linkMetrics[link.id].faturamento_total * 100) : 0}%`}}/>
                                                    </div>
                                                </div>
                                                {linkMetrics[link.id].breakdown.remarketing && (
                                                <div className="breakdown-item">
                                                    <div className="breakdown-label">
                                                        <Megaphone size={14} color="#f59e0b"/>
                                                        <span>Remarketing</span>
                                                    </div>
                                                    <div className="breakdown-values">
                                                        <span>R$ {linkMetrics[link.id].breakdown.remarketing.faturamento.toFixed(2)}</span>
                                                        <small>{linkMetrics[link.id].breakdown.remarketing.vendas} vendas</small>
                                                    </div>
                                                    <div className="breakdown-bar-track">
                                                        <div className="breakdown-bar-fill remarketing" style={{width: `${linkMetrics[link.id].faturamento_total > 0 ? (linkMetrics[link.id].breakdown.remarketing.faturamento / linkMetrics[link.id].faturamento_total * 100) : 0}%`}}/>
                                                    </div>
                                                </div>
                                                )}
                                                {linkMetrics[link.id].breakdown.disparo_auto && (
                                                <div className="breakdown-item">
                                                    <div className="breakdown-label">
                                                        <Zap size={14} color="#8b5cf6"/>
                                                        <span>Disparo Auto</span>
                                                    </div>
                                                    <div className="breakdown-values">
                                                        <span>R$ {linkMetrics[link.id].breakdown.disparo_auto.faturamento.toFixed(2)}</span>
                                                        <small>{linkMetrics[link.id].breakdown.disparo_auto.vendas} vendas</small>
                                                    </div>
                                                    <div className="breakdown-bar-track">
                                                        <div className="breakdown-bar-fill disparo_auto" style={{width: `${linkMetrics[link.id].faturamento_total > 0 ? (linkMetrics[link.id].breakdown.disparo_auto.faturamento / linkMetrics[link.id].faturamento_total * 100) : 0}%`}}/>
                                                    </div>
                                                </div>
                                                )}
                                                {linkMetrics[link.id].breakdown.order_bump && (
                                                <div className="breakdown-item">
                                                    <div className="breakdown-label">
                                                        <Gift size={14} color="#ec4899"/>
                                                        <span>Order Bump</span>
                                                    </div>
                                                    <div className="breakdown-values">
                                                        <span>R$ {linkMetrics[link.id].breakdown.order_bump.faturamento.toFixed(2)}</span>
                                                        <small>{linkMetrics[link.id].breakdown.order_bump.vendas} vendas</small>
                                                    </div>
                                                    <div className="breakdown-bar-track">
                                                        <div className="breakdown-bar-fill order_bump" style={{width: `${linkMetrics[link.id].faturamento_total > 0 ? (linkMetrics[link.id].breakdown.order_bump.faturamento / linkMetrics[link.id].faturamento_total * 100) : 0}%`}}/>
                                                    </div>
                                                </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <p style={{color:'#666', textAlign:'center', padding:'20px'}}>Carregando métricas...</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {currentLinks.length === 0 && (
                        <div className="empty-state-links">
                            <p>Esta pasta está vazia. Crie seu primeiro link rastreável.</p>
                        </div>
                    )}
                </div>
            </>
        )}

        {/* --- MODAL NOVA PASTA --- */}
        {showFolderModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Nova Pasta de Rastreamento</h3>
                    <div className="form-group" style={{marginBottom:15}}>
                        <Input 
                            label="Nome da Campanha/Pasta"
                            placeholder="Ex: Facebook Ads Black Friday"
                            value={newFolder.nome}
                            onChange={e => setNewFolder({...newFolder, nome: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <Select 
                            label="Plataforma (Ícone)"
                            options={[
                                {label: 'Facebook', value: 'facebook'},
                                {label: 'Instagram', value: 'instagram'},
                                {label: 'YouTube', value: 'youtube'},
                                {label: 'TikTok', value: 'tiktok'},
                                {label: 'WhatsApp', value: 'whatsapp'},
                                {label: 'Telegram', value: 'telegram'}, // 🔥 Ícone do Telegram
                                {label: 'Outros / Site', value: 'site'}
                            ]}
                            value={newFolder.plataforma}
                            onChange={e => setNewFolder({...newFolder, plataforma: e.target.value})}
                        />
                    </div>
                    <div className="modal-actions">
                        <Button variant="ghost" onClick={() => setShowFolderModal(false)}>Cancelar</Button>
                        <Button onClick={handleCreateFolder}>Criar Pasta</Button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL NOVO LINK --- */}
        {showLinkModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Novo Link Rastreável</h3>
                    <div className="form-group" style={{marginBottom:15}}>
                        <Input 
                            label="Nome de Identificação"
                            placeholder="Ex: Stories Manhã (Promo 1)"
                            value={newLink.nome}
                            onChange={e => setNewLink({...newLink, nome: e.target.value})}
                        />
                    </div>
                    
                    <div className="form-group" style={{marginBottom:15}}>
                        <label className="input-label">Qual Bot vai responder?</label>
                        <select 
                            className="input-field"
                            value={newLink.bot_id}
                            onChange={e => setNewLink({...newLink, bot_id: e.target.value})}
                        >
                            <option value="">Selecione um bot...</option>
                            {bots.map(b => (
                                <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{marginBottom:15}}>
                        <label className="input-label">Origem Específica (Tag)</label>
                        <div className="origem-grid">
                            {[
                                { value: 'stories', label: 'Stories', icon: '📱' },
                                { value: 'feed', label: 'Feed / Post', icon: '📰' },
                                { value: 'reels', label: 'Reels / Shorts', icon: '🎬' },
                                { value: 'bio', label: 'Bio / Perfil', icon: '👤' },
                                { value: 'ads', label: 'Anúncio (Ads)', icon: '💰' },
                                { value: 'grupo', label: 'Grupo / Canal', icon: '👥' },
                                { value: 'remarketing', label: 'Remarketing', icon: '📢' },
                                { value: 'disparo_auto', label: 'Disparo Auto', icon: '🚀' },
                                { value: 'email', label: 'E-mail', icon: '📧' },
                                { value: 'custom', label: 'Personalizado', icon: '✏️' }
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`origem-chip ${newLink.origem === opt.value ? 'selected' : ''}`}
                                    onClick={() => {
                                        setNewLink({...newLink, origem: opt.value});
                                        if (opt.value !== 'custom') setCustomOrigem('');
                                    }}
                                >
                                    <span className="origem-chip-icon">{opt.icon}</span>
                                    <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        
                        {newLink.origem === 'custom' && (
                            <div style={{marginTop: 10}}>
                                <Input
                                    label="Nome da Origem Personalizada"
                                    placeholder="Ex: YouTube Shorts, TikTok Ads, Parceiro X..."
                                    value={customOrigem}
                                    onChange={e => setCustomOrigem(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <Input 
                            label="Código Personalizado (Opcional)"
                            placeholder="Deixe vazio para gerar aleatório"
                            value={newLink.codigo}
                            onChange={e => setNewLink({...newLink, codigo: e.target.value})}
                        />
                        <small style={{color:'#666'}}>Ex: <code>promonatal</code> (mínimo 3 letras)</small>
                    </div>

                    <div className="modal-actions">
                        <Button variant="ghost" onClick={() => { setShowLinkModal(false); setCustomOrigem(''); }}>Cancelar</Button>
                        <Button onClick={handleCreateLink}>Gerar Link</Button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}