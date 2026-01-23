import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, Zap } from 'lucide-react';
import '../../styles/LandingPage.css'; // Garantindo que puxe os estilos globais

export function HeroSection() {
  return (
    <section className="hero-section" style={{
      position: 'relative',
      padding: '140px 20px 80px', // Padding top maior para compensar navbar fixa
      background: 'radial-gradient(circle at 50% 10%, rgba(123, 31, 162, 0.15) 0%, rgba(10, 10, 10, 1) 70%)',
      overflow: 'hidden',
      display: 'flex',            // 🔥 FLEXBOX PARA CENTRALIZAR TUDO
      flexDirection: 'column',    // 🔥 UM ITEM EMBAIXO DO OUTRO
      alignItems: 'center',       // 🔥 ALINHAMENTO HORIZONTAL PERFEITO
      textAlign: 'center'         // 🔥 TEXTO CENTRALIZADO
    }}>
      
      {/* Efeito de brilho de fundo (Glow) */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(195, 51, 255, 0.2) 0%, rgba(0,0,0,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="hero-content" style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '900px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // 🎯 O SEGREDO DO ALINHAMENTO DA LOGO
        gap: '24px'
      }}>
        
        {/* 1. LOGO CENTRALIZADA 🎯 */}
        <div className="hero-logo-wrapper" style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '10px'
        }}>
          {/* Se você tiver uma imagem, substitua o texto abaixo pela tag <img> */}
          {/* <img src="/logo-full.png" alt="Zenyx" style={{ height: '50px' }} /> */}
          
          {/* Placeholder Visual da Logo (Estilo da sua imagem) */}
          <h2 style={{
            fontSize: '40px',
            fontFamily: "'Inter', sans-serif", // Ou a fonte do seu projeto
            fontWeight: '900',
            fontStyle: 'italic',
            background: 'linear-gradient(135deg, #d88aff 0%, #9d4edd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            padding: 0,
            letterSpacing: '-1px',
            textShadow: '0px 0px 20px rgba(157, 78, 221, 0.3)'
          }}>
            ZENYX
          </h2>
        </div>

        {/* 2. BADGE (Menor Taxa) */}
        <div className="hero-badge" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(195, 51, 255, 0.1)',
          border: '1px solid rgba(195, 51, 255, 0.2)',
          borderRadius: '50px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#e0aaff',
          boxShadow: '0 0 15px rgba(195, 51, 255, 0.1)'
        }}>
          <Zap size={14} fill="#e0aaff" />
          ✨ MENOR TAXA DO MERCADO
        </div>

        {/* 3. TÍTULO PRINCIPAL */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', // Responsivo
          fontWeight: '800',
          lineHeight: '1.1',
          color: '#ffffff',
          margin: 0
        }}>
          Automatize seu Telegram e <br />
          <span style={{ 
            background: 'linear-gradient(90deg, #c333ff 0%, #ff66c4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Escale suas Vendas com IA
          </span>
        </h1>

        {/* 4. SUBTÍTULO */}
        <p style={{
          fontSize: '18px',
          color: '#a1a1aa',
          maxWidth: '600px',
          lineHeight: '1.6',
          margin: '0 auto'
        }}>
          Gerencie assinaturas, pagamentos e automações para seus grupos e canais VIPs com a 
          <strong style={{ color: '#e0aaff' }}> menor taxa do mercado: apenas R$ 0,60 por venda!</strong>
        </p>

        {/* 5. BOTÕES DE AÇÃO (CTA) */}
        <div className="hero-buttons" style={{
          display: 'flex',
          gap: '16px',
          marginTop: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 32px',
              background: '#c333ff',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 20px rgba(195, 51, 255, 0.4)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(195, 51, 255, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(195, 51, 255, 0.4)';
            }}
            >
              Começar Agora Grátis <ArrowRight size={18} />
            </button>
          </Link>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 32px',
            background: 'transparent',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <PlayCircle size={18} /> Ver Demonstração
          </button>
        </div>
        
        {/* Informação extra (Checkmarks) */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginTop: '30px',
          fontSize: '14px',
          color: '#a1a1aa',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }} /> Sem cartão de crédito
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }} /> Setup em 2 minutos
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }} /> Cancelamento grátis
          </span>
        </div>

      </div>
    </section>
  );
}