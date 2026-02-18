import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { miniappService } from '../../services/api';
import { ArrowLeft, PlayCircle, Terminal, FileText, Lock, ShieldAlert, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import '../../assets/styles/CategoryPage.css';

export function MiniAppCategory() {
    const { botId, slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const carregar = async () => {
            try {
                const cats = await miniappService.listCategories(botId);
                const found = cats.find(c => c.slug === slug);
                if (found) setCategory(found);
                else navigate(`/loja/${botId}`);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        carregar();
    }, [slug, botId]);

    if (loading || !category) return <div style={{background:'#000', height:'100vh'}}></div>;

    // Estilos dinâmicos do banco para a Categoria Geral
    const bgStyle = { background: category.bg_color || '#000000' };
    const btnStyle = { backgroundColor: category.theme_color || '#E10000', color: category.theme_color === '#ffffff' ? '#000' : '#fff' };

    // 🔥 PARSE DOS ITENS DA VITRINE
    let vitrineItems = [];
    try {
        if (category.content_json) {
            vitrineItems = JSON.parse(category.content_json);
            if (!Array.isArray(vitrineItems)) vitrineItems = [];
        }
    } catch(e) {
        console.error("Erro ao ler itens da vitrine:", e);
    }

    // 📄 PAGINAÇÃO
    const itemsPerPage = category.items_per_page || null;
    const totalPages = itemsPerPage ? Math.ceil(vitrineItems.length / itemsPerPage) : 1;
    const paginatedItems = itemsPerPage 
        ? vitrineItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) 
        : vitrineItems;

    // 🔗 Helper: URL do checkout
    const getCheckoutUrl = (item) => {
        if (item.link_url) return item.link_url;
        if (category.separator_btn_url) return category.separator_btn_url;
        return null;
    };
    const handleItemClick = (item) => {
        const url = getCheckoutUrl(item);
        if (url) window.open(url, '_blank');
        else navigate(`/loja/${botId}/checkout`);
    };

    // 🖼️ Formato da foto do modelo
    const modelShape = category.model_img_shape || 'square';

    // 📐 Barra Separadora
    const SeparatorBar = () => {
        if (!category.separator_enabled) return null;
        
        // Cores com fallback
        const sepColor = category.separator_color || '#ffffff';
        // Se a cor do texto não estiver definida, calcula contraste básico
        const sepTextColor = category.separator_text_color || (sepColor.includes('gradient') ? '#fff' : '#000');
        const sepBtnTextColor = category.separator_btn_text_color || '#fff';
        
        return (
            <div className="separator-bar" style={{
                background: sepColor,
                padding: '14px 20px',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                margin: '0'
            }}>
                <div style={{display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0}}>
                    {category.separator_logo_url && (
                        <img src={category.separator_logo_url} style={{height:32, objectFit:'contain', flexShrink:0}} alt="Logo" />
                    )}
                    {category.separator_text && (
                        <span className="sep-text" style={{
                            color: sepTextColor, 
                            lineHeight: 1.3,
                            textShadow: (sepColor.includes('gradient') && sepTextColor === '#ffffff') ? '0 1px 3px rgba(0,0,0,0.3)' : 'none'
                        }}>
                            {category.separator_text}
                        </span>
                    )}
                </div>
                {category.separator_btn_text && (
                    <button 
                        className="sep-btn"
                        onClick={() => {
                            if (category.separator_btn_url) window.open(category.separator_btn_url, '_blank');
                            else navigate(`/loja/${botId}/checkout`);
                        }}
                        style={{
                            background: category.theme_color || '#000', // Fundo do botão usa Tema
                            color: sepBtnTextColor, // Texto do botão usa a cor configurada
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}
                    >
                        <Lock size={14}/> {category.separator_btn_text}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="category-page-container" style={bgStyle}>
            
            {/* 1. HEADER */}
            <div style={{position:'fixed', top:15, left:15, zIndex:100}}>
                <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft /></button>
            </div>

            {/* 2. HERO BANNER */}
            <div className="cat-hero-section">
                <img 
                    src={category.banner_mob_url || category.cover_image} 
                    className="hero-banner-img" 
                    alt={category.title} 
                />
            </div>

            {/* 3. PERFIL GERAL (TOPO) */}
            <div className="content-feed">
                {(category.model_img_url || category.model_name) && (
                    <div className="model-profile-section">
                        {category.model_img_url && (
                            <img src={category.model_img_url} className="model-avatar" alt="Modelo" />
                        )}
                        <div className="model-info">
                            <h2 style={{ color: category.model_name_color || '#ffffff' }}>
                                {category.model_name}
                            </h2>
                            <p style={{ color: category.model_desc_color || '#cccccc', whiteSpace: 'pre-wrap', textAlign: 'left', margin: '10px 0' }}>
                                {category.model_desc || category.description}
                            </p>
                        </div>
                    </div>
                )}

                {category.deco_lines_url && (
                    <img src={category.deco_lines_url} className="deco-line" alt="---" />
                )}

                {category.video_preview_url && (
                    <div className="video-preview-box">
                        <div className="video-label" style={btnStyle}>PRÉVIA GRÁTIS <PlayCircle size={14}/></div>
                        <video controls poster={category.cover_image} className="preview-player">
                            <source src={category.video_preview_url} type="video/mp4" />
                        </video>
                    </div>
                )}

                {/* 🔥 5. MEGA VITRINE DE PRODUTOS/ITENS 🔥 */}
                {vitrineItems.length > 0 && (
                    <div className="vitrine-container" style={{ padding: '0 15px', marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {paginatedItems.map((item, index) => {
                            
                            const itemBg = item.bgColor || 'rgba(255,255,255,0.05)';
                            const itemThemeColor = item.themeColor || category.theme_color || '#c333ff';
                            
                            // Arrays para modos especiais
                            let hackerArray = [];
                            if (item.isHackerMode && item.hackerFiles) {
                                try { hackerArray = JSON.parse(item.hackerFiles); } catch(e){}
                            }
                            let comicArray = [];
                            if (item.isComicMode && item.comicImages) {
                                comicArray = item.comicImages.split(',').map(url => url.trim()).filter(Boolean);
                            }

                            return (
                                <React.Fragment key={item.id || index}>
                                    <div className="vitrine-card" style={{
                                        background: itemBg,
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: `1px solid ${item.themeColor ? item.themeColor + '40' : 'rgba(255,255,255,0.1)'}`,
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginBottom: category.separator_enabled ? '0' : '30px'
                                    }}>
                                        
                                        {/* Mídia Principal */}
                                        {item.videoPreview && !item.fakeVideo ? (
                                            <div style={{position:'relative', width:'100%', background:'#000'}}>
                                                <video controls poster={item.image_url} style={{width:'100%', display:'block', maxHeight:'400px', objectFit:'cover'}}>
                                                    <source src={item.videoPreview} type="video/mp4" />
                                                </video>
                                            </div>
                                        ) : item.image_url ? (
                                            <div 
                                                style={{position:'relative', width:'100%', cursor: item.fakeVideo ? 'pointer' : 'default'}} 
                                                onClick={() => { if (item.fakeVideo) handleItemClick(item); }}
                                            >
                                                <img src={item.image_url} alt={item.title} style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', display:'block' }} />
                                                {item.fakeVideo && (
                                                    <div style={{
                                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(0,0,0,0.35)', transition: 'background 0.2s'
                                                    }}>
                                                        <div style={{
                                                            width: 70, height: 70, borderRadius: '50%',
                                                            background: 'rgba(0,0,0,0.6)', border: '3px solid rgba(255,255,255,0.9)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                                        }}>
                                                            <PlayCircle size={38} color="#fff" fill="rgba(255,255,255,0.2)" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}

                                        {/* 👩‍🎤 PERFIL DO ITEM (CORRIGIDO: USA COR DO NOME, NÃO DO TEMA) */}
                                        {(item.modelImg || item.modelName) && (
                                            <div style={{ display:'flex', alignItems:'center', gap:15, padding:'20px 20px 10px 20px' }}>
                                                {item.modelImg && (
                                                    <img 
                                                        src={item.modelImg} 
                                                        style={{
                                                            width: 60, height: 60, 
                                                            borderRadius: modelShape === 'circle' ? '50%' : '8px', 
                                                            border: `2px solid ${itemThemeColor}`, 
                                                            objectFit:'cover'
                                                        }} 
                                                        alt="Modelo" 
                                                    />
                                                )}
                                                <div>
                                                    {/* 🔥 CORREÇÃO AQUI: Usa category.model_name_color */}
                                                    <h3 style={{ margin:0, color: category.model_name_color || '#ffffff', fontSize:'1.2rem' }}>
                                                        {item.modelName}
                                                    </h3>
                                                </div>
                                            </div>
                                        )}

                                        {/* Descrição e Título */}
                                        <div style={{ padding: '0 20px 15px 20px' }}>
                                            {(!item.modelName && item.title) && (
                                                <h3 style={{ margin: '15px 0 8px 0', color: '#ffffff', fontSize: '1.4rem' }}>{item.title}</h3>
                                            )}
                                            <p style={{ 
                                                margin: (item.modelName) ? '5px 0 0 0' : '0 0 10px 0', 
                                                color: '#eaeaea', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap'
                                            }}>
                                                {item.modelDesc || item.description}
                                            </p>
                                        </div>

                                        {/* Modos Especiais (Comic/Hacker) */}
                                        {item.isComicMode && comicArray.length > 0 && (
                                            <div className="comic-gallery-mode" style={{display:'flex', flexDirection:'column', width:'100%', background:'#000'}}>
                                                <div style={{background: itemThemeColor, color:'#000', padding:'5px 15px', fontWeight:'bold', fontSize:'0.8rem', textAlign:'center', letterSpacing:'2px'}}>LEITURA EM SEQUÊNCIA</div>
                                                {comicArray.map((imgUrl, i) => (
                                                    <img key={i} src={imgUrl} style={{width:'100%', display:'block'}} alt={`Pagina ${i+1}`} />
                                                ))}
                                            </div>
                                        )}

                                        {item.isHackerMode && hackerArray.length > 0 && (
                                            <div className="hacker-terminal-mode" style={{ margin: '0 15px 15px 15px', background: '#0a0a0a', border: '1px solid #00ffcc', borderRadius: '8px', overflow:'hidden', fontFamily: 'monospace' }}>
                                                <div style={{ background: '#00ffcc', color: '#000', padding: '8px 12px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <Terminal size={16} /> system_root@vazamentos:~$ ls -la
                                                </div>
                                                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {hackerArray.map((file, i) => {
                                                        const isCritico = file.status && (file.status.toUpperCase() === 'CRÍTICO' || file.status === 'BLOQUEADO');
                                                        return (
                                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #333', paddingBottom: '8px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00ffcc', fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                                    <FileText size={14} style={{flexShrink:0}}/> 
                                                                    <span style={{overflow:'hidden', textOverflow:'ellipsis'}}>{file.name}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', flexShrink:0 }}>
                                                                    <span style={{ color: '#888' }}>[{file.size}]</span>
                                                                    {isCritico ? <ShieldAlert size={12} color="#ff3333"/> : <Lock size={12} color="#f59e0b"/>}
                                                                    <span style={{ color: isCritico ? '#ff3333' : '#f59e0b', fontWeight: 'bold' }}>{file.status}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Botão de Ação */}
                                        <div style={{ padding: '15px 20px 20px 20px', marginTop: 'auto' }}>
                                            <button 
                                                onClick={() => handleItemClick(item)}
                                                className="btn-pulse-main"
                                                style={{
                                                    backgroundColor: itemThemeColor,
                                                    color: itemThemeColor === '#ffffff' ? '#000' : '#fff',
                                                    width: '100%', padding: '16px', border: 'none', borderRadius: '10px',
                                                    fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                    boxShadow: `0 4px 15px ${itemThemeColor}60`
                                                }}
                                            >
                                                {item.isDirectCheckout ? <CheckCircle size={18}/> : <Lock size={18}/>}
                                                {item.btn_text || 'ACESSAR AGORA'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Separador */}
                                    {category.separator_enabled && index < paginatedItems.length - 1 && (
                                        <div style={{padding: '15px 0'}}>
                                            <SeparatorBar />
                                        </div>
                                    )}
                                    
                                    {!category.separator_enabled && index < paginatedItems.length - 1 && (
                                        <div style={{height: 0}}></div>
                                    )}
                                </React.Fragment>
                            );
                        })}

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 30, flexWrap: 'wrap' }}>
                                {currentPage > 1 && (
                                    <button onClick={() => { setCurrentPage(currentPage - 1); window.scrollTo({top: 300, behavior:'smooth'}); }} className="pagination-btn" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 14px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        <ChevronLeft size={18}/>
                                    </button>
                                )}
                                {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                    <button key={page} onClick={() => { setCurrentPage(page); window.scrollTo({top: 300, behavior:'smooth'}); }} style={{ background: page === currentPage ? (category.theme_color || '#c333ff') : 'rgba(255,255,255,0.1)', border: page === currentPage ? 'none' : '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: page === currentPage ? 'bold' : 'normal', fontSize: '0.95rem', minWidth: 44, boxShadow: page === currentPage ? `0 2px 10px ${category.theme_color || '#c333ff'}50` : 'none' }}>
                                        {page}
                                    </button>
                                ))}
                                {currentPage < totalPages && (
                                    <button onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo({top: 300, behavior:'smooth'}); }} className="pagination-btn" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 14px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        <ChevronRight size={18}/>
                                    </button>
                                )}
                            </div>
                        )}

                        {category.separator_enabled && <div style={{padding: '15px 0 0 0'}}><SeparatorBar /></div>}
                    </div>
                )}

                <div style={{height: 100}}></div>
            </div>

            {category.footer_banner_url && <div className="footer-banner-box"><img src={category.footer_banner_url} className="footer-img" alt="Footer" /></div>}

            {(!vitrineItems || vitrineItems.length === 0) && (
                <div className="cta-fixed-bottom">
                    <button className="btn-pulse-main" onClick={() => navigate(`/loja/${botId}/checkout`)} style={btnStyle}>ASSINE AGORA E LIBERE TUDO</button>
                </div>
            )}
        </div>
    );
}