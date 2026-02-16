import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { miniappService } from '../../services/api';
import { ArrowLeft, PlayCircle, Terminal, FileText, Lock, ShieldAlert, CheckCircle } from 'lucide-react';
import '../../assets/styles/CategoryPage.css';

export function MiniAppCategory() {
    const { botId, slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(null);

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

    // 🔥 PARSE DOS ITENS DA VITRINE (Desempacotando o conteúdo avançado)
    let vitrineItems = [];
    try {
        if (category.content_json) {
            vitrineItems = JSON.parse(category.content_json);
            if (!Array.isArray(vitrineItems)) vitrineItems = [];
        }
    } catch(e) {
        console.error("Erro ao ler itens da vitrine:", e);
    }

    return (
        <div className="category-page-container" style={bgStyle}>
            
            {/* 1. HEADER (Voltar) */}
            <div style={{position:'fixed', top:15, left:15, zIndex:100}}>
                <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft /></button>
            </div>

            {/* 2. HERO BANNER (Topo) */}
            <div className="cat-hero-section">
                {/* Lógica: Se tiver banner mob, usa. Senão, usa cover. */}
                <img 
                    src={category.banner_mob_url || category.cover_image} 
                    className="hero-banner-img" 
                    alt={category.title} 
                />
            </div>

            {/* 3. CONTEÚDO RICO GERAL DA CATEGORIA (Opcional) */}
            <div className="content-feed">
                
                {/* Bloco da Modelo Geral da Categoria */}
                {(category.model_img_url || category.model_name) && (
                    <div className="model-profile-section">
                        {category.model_img_url && (
                            <img src={category.model_img_url} className="model-avatar" alt="Modelo" />
                        )}
                        <div className="model-info">
                            <h2 style={{ color: category.model_name_color || '#ffffff' }}>
                                {category.model_name}
                            </h2>
                            <p style={{ 
                                color: category.model_desc_color || '#cccccc', 
                                whiteSpace: 'pre-wrap', 
                                textAlign: 'left',
                                margin: '10px 0'
                            }}>
                                {category.model_desc || category.description}
                            </p>
                        </div>
                    </div>
                )}

                {/* Linha Decorativa (Se houver) */}
                {category.deco_lines_url && (
                    <img src={category.deco_lines_url} className="deco-line" alt="---" />
                )}

                {/* 4. VÍDEO PREVIEW GERAL (Se houver) */}
                {category.video_preview_url && (
                    <div className="video-preview-box">
                        <div className="video-label" style={btnStyle}>PRÉVIA GRÁTIS <PlayCircle size={14}/></div>
                        <video controls poster={category.cover_image} className="preview-player">
                            <source src={category.video_preview_url} type="video/mp4" />
                        </video>
                    </div>
                )}

                {/* 🔥 5. MEGA VITRINE DE PRODUTOS/ITENS AVANÇADA 🔥 */}
                {vitrineItems.length > 0 && (
                    <div className="vitrine-container" style={{ padding: '0 15px', marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {vitrineItems.map((item, index) => {
                            
                            // Cores individuais do Item
                            const itemBg = item.bgColor || 'rgba(255,255,255,0.05)';
                            const itemThemeColor = item.themeColor || category.theme_color || '#c333ff';
                            
                            // Processamento de Arrays (Hacker e Comic)
                            let hackerArray = [];
                            if (item.isHackerMode && item.hackerFiles) {
                                try { hackerArray = JSON.parse(item.hackerFiles); } catch(e){}
                            }

                            let comicArray = [];
                            if (item.isComicMode && item.comicImages) {
                                comicArray = item.comicImages.split(',').map(url => url.trim()).filter(Boolean);
                            }

                            return (
                                <div key={item.id || index} className="vitrine-card" style={{
                                    background: itemBg, // Suporta linear-gradient nativamente!
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    border: `1px solid ${item.themeColor ? item.themeColor + '40' : 'rgba(255,255,255,0.1)'}`,
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    
                                    {/* 🎬 1. MIDIA PRINCIPAL (Vídeo ou Imagem do Item) */}
                                    {item.videoPreview ? (
                                        <div style={{position:'relative', width:'100%', background:'#000'}}>
                                            <video controls poster={item.image_url} style={{width:'100%', display:'block', maxHeight:'400px', objectFit:'cover'}}>
                                                <source src={item.videoPreview} type="video/mp4" />
                                            </video>
                                        </div>
                                    ) : item.image_url ? (
                                        <img src={item.image_url} alt={item.title} style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', display:'block' }} />
                                    ) : null}

                                    {/* 👩‍🎤 2. PERFIL DO ATOR/MODELO DO ITEM */}
                                    {(item.modelImg || item.modelName) && (
                                        <div style={{ display:'flex', alignItems:'center', gap:15, padding:'20px 20px 10px 20px' }}>
                                            {item.modelImg && (
                                                <img src={item.modelImg} style={{width: 60, height: 60, borderRadius: '50%', border: `2px solid ${itemThemeColor}`, objectFit:'cover'}} alt="Modelo" />
                                            )}
                                            <div>
                                                <h3 style={{ margin:0, color: itemThemeColor, fontSize:'1.2rem' }}>{item.modelName}</h3>
                                            </div>
                                        </div>
                                    )}

                                    {/* 📝 3. DESCRIÇÃO E TÍTULO (Fallback ou Descrição do Modelo) */}
                                    <div style={{ padding: '0 20px 15px 20px' }}>
                                        {(!item.modelName && item.title) && (
                                            <h3 style={{ margin: '15px 0 8px 0', color: '#ffffff', fontSize: '1.4rem' }}>{item.title}</h3>
                                        )}
                                        <p style={{ 
                                            margin: (item.modelName) ? '5px 0 0 0' : '0 0 10px 0', 
                                            color: '#eaeaea', 
                                            fontSize: '0.95rem', 
                                            lineHeight: '1.5',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {item.modelDesc || item.description}
                                        </p>
                                    </div>

                                    {/* 📚 4. MODO COMIC / MANGÁ */}
                                    {item.isComicMode && comicArray.length > 0 && (
                                        <div className="comic-gallery-mode" style={{display:'flex', flexDirection:'column', width:'100%', background:'#000'}}>
                                            <div style={{background: itemThemeColor, color:'#000', padding:'5px 15px', fontWeight:'bold', fontSize:'0.8rem', textAlign:'center', letterSpacing:'2px'}}>LEITURA EM SEQUÊNCIA</div>
                                            {comicArray.map((imgUrl, i) => (
                                                <img key={i} src={imgUrl} style={{width:'100%', display:'block'}} alt={`Pagina ${i+1}`} />
                                            ))}
                                        </div>
                                    )}

                                    {/* 💻 5. MODO HACKER / ARQUIVOS VAZADOS */}
                                    {item.isHackerMode && hackerArray.length > 0 && (
                                        <div className="hacker-terminal-mode" style={{ margin: '0 15px 15px 15px', background: '#0a0a0a', border: '1px solid #00ffcc', borderRadius: '8px', overflow:'hidden', fontFamily: 'monospace' }}>
                                            <div style={{ background: '#00ffcc', color: '#000', padding: '8px 12px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Terminal size={16} /> system_root@vazamentos:~$ ls -la
                                            </div>
                                            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {hackerArray.map((file, i) => {
                                                    const isCritico = file.status && file.status.toUpperCase() === 'CRÍTICO' || file.status === 'BLOQUEADO';
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

                                    {/* 🛒 6. BOTÃO DE AÇÃO DO ITEM */}
                                    <div style={{ padding: '15px 20px 20px 20px', marginTop: 'auto' }}>
                                        <button 
                                            onClick={() => {
                                                if (item.link_url) {
                                                    window.open(item.link_url, '_blank');
                                                } else if (item.isDirectCheckout) {
                                                    // Modo pular detalhes direto pro checkout
                                                    navigate(`/loja/${botId}/checkout`);
                                                } else {
                                                    navigate(`/loja/${botId}/checkout`);
                                                }
                                            }}
                                            className="btn-pulse-main"
                                            style={{
                                                backgroundColor: itemThemeColor,
                                                color: itemThemeColor === '#ffffff' ? '#000' : '#fff',
                                                width: '100%',
                                                padding: '16px',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontSize: '1.05rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                textTransform: 'uppercase',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 8,
                                                boxShadow: `0 4px 15px ${itemThemeColor}60`
                                            }}
                                        >
                                            {item.isDirectCheckout ? <CheckCircle size={18}/> : <Lock size={18}/>}
                                            {item.btn_text || 'ACESSAR AGORA'}
                                        </button>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={{height: 100}}></div> {/* Espaço para o botão flutuante */}
            </div>

            {/* 6. FOOTER BANNER (Se houver) */}
            {category.footer_banner_url && (
                <div className="footer-banner-box">
                    <img src={category.footer_banner_url} className="footer-img" alt="Footer" />
                </div>
            )}

            {/* 7. BOTÃO DE AÇÃO FLUTUANTE (Fallback da categoria) */}
            {(!vitrineItems || vitrineItems.length === 0) && (
                <div className="cta-fixed-bottom">
                    <button 
                        className="btn-pulse-main"
                        onClick={() => navigate(`/loja/${botId}/checkout`)}
                        style={btnStyle}
                    >
                        ASSINE AGORA E LIBERE TUDO
                    </button>
                </div>
            )}
        </div>
    );
}