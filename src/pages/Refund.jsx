import React, { useLayoutEffect } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import '../styles/LandingPage.css';

// ============================================================
// COMPONENTE: POLÍTICA DE REEMBOLSO
// Página legal que explica a responsabilidade da plataforma vs cliente
// ============================================================
export function Refund() {
  
  // ============================================================
  // EFEITO: SCROLL TOP IMEDIATO
  // Garante que o usuário veja a página do topo ao entrar na rota
  // ============================================================
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="legal-page landing-page">
      
      {/* ----------------------------------------------------
          NAVBAR GLOBAL (COSMOS PURPLE)
          ---------------------------------------------------- */}
      <Navbar />
      
      {/* ----------------------------------------------------
          CONTEÚDO LEGAL: REEMBOLSO
          ---------------------------------------------------- */}
      <div className="legal-container" style={{ paddingTop: '8rem', paddingBottom: '4rem', maxWidth: '800px', margin: '0 auto', paddingInline: '2rem' }}>
        <div 
          className="legal-card"
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}
        >
          
          <div className="legal-header" style={{ marginBottom: '3rem', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2rem' }}>
            <h1 className="legal-title" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#fff', marginBottom: '1rem' }}>
              Política de <span className="text-gradient">Reembolso</span>
            </h1>
            <p className="legal-subtitle" style={{ color: 'var(--text-muted)' }}>
              Transparência sobre taxas, estornos e cancelamentos.
            </p>
          </div>
          
          <div className="legal-body" style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
            
            <h2 className="accent" style={{ color: 'var(--neon-magenta)', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '1rem' }}>
              1. Taxa de Serviço Zenyx
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              A Zenyx VIPs opera como uma intermediadora tecnológica. A taxa de <strong style={{ color: '#fff' }}>R$ 0,60 por transação</strong> refere-se ao custo de uso da nossa infraestrutura no momento da venda. Uma vez que a venda é processada com sucesso e a tecnologia foi utilizada, esta taxa específica não é passível de reembolso por parte da Zenyx VIPs.
            </p>

            <h2 className="accent" style={{ color: 'var(--neon-magenta)', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '1rem' }}>
              2. Reembolso aos Seus Clientes
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              A política de reembolso dos produtos ou serviços vendidos através dos seus bots é de sua inteira responsabilidade como vendedor. Você deve estabelecer e comunicar suas próprias regras de garantia e devolução diretamente aos seus clientes finais. A Zenyx VIPs não arbitra disputas comerciais entre usuário e consumidor final.
            </p>

            <h2 style={{ color: '#fff', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '1rem' }}>
              3. Direito de Arrependimento (Plataforma)
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Caso você venha a contratar algum plano de assinatura "Premium" pago diretamente à Zenyx VIPs no futuro, você terá o direito de arrependimento de 7 (sete) dias corridos após a contratação, conforme previsto no Código de Defesa do Consumidor, com devolução integral do valor pago pela assinatura.
            </p>
            
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
          FOOTER GLOBAL
          ---------------------------------------------------- */}
      <Footer />
      
    </div>
  );
}