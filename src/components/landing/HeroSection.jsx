import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, Zap, ShieldCheck } from 'lucide-react';
import '../../styles/LandingPage.css';

export function HeroSection() {
  return (
    <section className="hero-section" style={{
      position: 'relative',
      minHeight: '90vh', // Ocupa quase toda a tela
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '120px 20px 60px',
      overflow: 'hidden'
    }}>
      
      {/* 🌌 BACKGROUND DINÂMICO (GLOW ORB) */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80vw',
        height: '80vw',
        maxWidth: '800px',
        maxHeight: '800px',
        background: 'radial-gradient(circle, rgba(195, 51, 255, 0.15) 0%, rgba(10, 10, 10, 0) 70%)',
        zIndex: 0,
        pointerEvents: 'none',
        animation: 'pulseGlow 5s infinite alternate' // Cria um "respiro" na luz
      }} />

      {/* 📦 CONTEÚDO PRINCIPAL (COM ANIMAÇÃO CASCATA) */}
      <div className="hero-content" style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '1000px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '20px'
      }}>
        
        {/* LOGO ZENYX (Animação: Vem de cima suave) */}
        <div className="animate-up" style={{ marginBottom: '10px' }}>
          <h2 style={{
            fontSize: '50px',
            fontFamily: "'Inter', sans-serif",
            fontWeight: '900',
            fontStyle: 'italic',
            letterSpacing: '-2px',
            background: 'linear-gradient(180deg, #fff 0%, #c333ff 100%)', // Degradê vertical na logo
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 15px rgba(195, 51, 255, 0.4))', // Sombra neon
            margin: 0
          }}>
            ZENYX
          </h2>
        </div>

        {/* BADGE DESTAQUE (Vidro Fosco) */}
        <div className="animate-up delay-100 hero-badge glass-card" style={{
          padding: '8px 20px',
          borderRadius: '50px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#e0aaff',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(195, 51, 255, 0.3)'
        }}>
          <span style={{ position: 'relative', display: 'flex' }}>
            <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#c333ff', opacity: 0.7, animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
            <span style={{ position: 'relative', width: '8px', height: '8px', borderRadius: '50%', background: '#c333ff' }}></span>
          </span>
          MENOR TAXA DO MERCADO (R$ 0,60)
        </div>

        {/* TÍTULO IMPACTANTE */}
        <h1 className="animate-up delay-200" style={{
          fontSize: 'clamp(3rem, 6vw, 5rem)', // Gigante e responsivo
          fontWeight: '800',
          lineHeight: '1.05',
          color: '#ffffff',
          margin: '10px 0',
          letterSpacing: '-1px'
        }}>
          O Futuro das Vendas <br />
          no <span style={{ color: '#2AABEE' }}>Telegram</span> Chegou.
        </h1>

        {/* SUBTÍTULO */}
        <p className="animate-up delay-300" style={{
          fontSize: '1.25rem',
          color: '#a1a1aa',
          maxWidth: '650px',
          lineHeight: '1.6',
          margin: '0 auto'
        }}>
          Abandone o manual. A Zenyx utiliza <strong>IA Preditiva</strong> e automação de fluxo para transformar curiosos em assinantes VIPs enquanto você dorme.
        </p>

        {/* CTA BUTTONS */}
        <div className="animate-up delay-400" style={{
          display: 'flex',
          gap: '20px',
          marginTop: '30px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="btn-glow" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '18px 40px',
              background: 'linear-gradient(90deg, #c333ff 0%, #7b1fa2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 10px 30px -10px rgba(195, 51, 255, 0.6)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Criar Conta Grátis <ArrowRight size={20} />
            </button>
          </Link>

          <button className="glass-card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '18px 32px',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
          >
            <PlayCircle size={20} /> Ver Demo
          </button>
        </div>

        {/* SOCIAL PROOF / TRUST BADGES */}
        <div className="animate-up delay-400" style={{
          marginTop: '50px',
          padding: '20px 40px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
          borderRadius: '20px',
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#666', marginBottom: '15px' }}>
            CONFIADO POR +500 COMUNIDADES VIP
          </p>
          <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', opacity: 0.5, filter: 'grayscale(100%)' }}>
            {/* Ícones placeholder para dar peso visual */}
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>PAGBANK</div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>MERCADO PAGO</div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>ASAAS</div>
          </div>
        </div>

      </div>
      
      {/* CSS Inline para animação de pulso e ping */}
      <style>{`
        @keyframes pulseGlow {
          0% { opacity: 0.4; transform: translateX(-50%) scale(0.9); }
          100% { opacity: 0.8; transform: translateX(-50%) scale(1.1); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </section>
  );
}