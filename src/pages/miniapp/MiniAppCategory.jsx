import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { miniappService } from '../../services/api';
import { ArrowLeft, PlayCircle } from 'lucide-react';
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

    // Estilos dinâmicos do banco
    const bgStyle = { backgroundColor: category.bg_color || '#000000' };
    const btnStyle = { backgroundColor: category.theme_color || '#E10000', color: category.theme_color === '#ffffff' ? '#000' : '#fff' };

    // 🔥 PARSE DOS ITENS DA VITRINE (Desempacotando o conteúdo salvo)
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

            {/* 3. CONTEÚDO RICO (Dados da Modelo) */}
            <div className="content-feed">
                
                {/* Bloco da Modelo (Se houver foto ou nome) */}
                {(category.model_img_url || category.model_name) && (
                    <div className="model-profile-section">
                        {category.model_img_url && (
                            <img src={category.model_img_url} className="model-avatar" alt="Modelo" />
                        )}
                        <div className="model-info">
                            {/* APLICANDO AS CORES PERSONALIZADAS AQUI 👇 */}
                            <h2 style={{ color: category.model_name_color || '#ffffff' }}>
                                {category.model_name}
                            </h2>
                            <p style={{ 
                                color: category.model_desc_color || '#cccccc', 
                                whiteSpace: 'pre-wrap',  // ✅ FORÇA A QUEBRA DE LINHA
                                textAlign: 'left',       // ✅ MUDE AQUI: 'left', 'center' ou 'right'
                                margin: '10px 0'         // Um respiro para o texto não colar no título
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

                {/* 4. VÍDEO PREVIEW (Se houver) */}
                {category.video_preview_url && (
                    <div className="video-preview-box">
                        <div className="video-label" style={btnStyle}>PRÉVIA GRÁTIS <PlayCircle size={14}/></div>
                        <video controls poster={category.cover_image} className="preview-player">
                            <source src={category.video_preview_url} type="video/mp4" />
                        </video>
                    </div>
                )}

                {/* 🔥 5. NOVA SEÇÃO: VITRINE DE PRODUTOS/ITENS 🔥 */}
                {vitrineItems.length > 0 && (
                    <div className="vitrine-container" style={{ padding: '0 15px', marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {vitrineItems.map((item, index) => (
                            <div key={item.id || index} className="vitrine-card" style={{
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                            }}>
                                {item.image_url && (
                                    <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                )}
                                <div style={{ padding: '20px' }}>
                                    {item.title && (
                                        <h3 style={{ margin: '0 0 8px 0', color: category.model_name_color || '#ffffff', fontSize: '1.3rem' }}>
                                            {item.title}
                                        </h3>
                                    )}
                                    {item.description && (
                                        <p style={{ margin: '0 0 20px 0', color: category.model_desc_color || '#cccccc', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                            {item.description}
                                        </p>
                                    )}
                                    <button 
                                        onClick={() => {
                                            // Se o item tem um link específico, abre ele. Se não, manda pro checkout geral da loja.
                                            if (item.link_url) {
                                                window.open(item.link_url, '_blank');
                                            } else {
                                                navigate(`/loja/${botId}/checkout`);
                                            }
                                        }}
                                        style={{
                                            ...btnStyle,
                                            width: '100%',
                                            padding: '14px',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {item.btn_text || 'Acessar'}
                                    </button>
                                </div>
                            </div>
                        ))}
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

            {/* 7. BOTÃO DE AÇÃO FLUTUANTE */}
            <div className="cta-fixed-bottom">
                <button 
                    className="btn-pulse-main"
                    onClick={() => navigate(`/loja/${botId}/checkout`)}
                    style={btnStyle}
                >
                    ASSINE AGORA E LIBERE TUDO
                </button>
            </div>
        </div>
    );
}