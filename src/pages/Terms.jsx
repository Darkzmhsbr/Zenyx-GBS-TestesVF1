import React, { useLayoutEffect } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import '../styles/LandingPage.css';

// ============================================================
// COMPONENTE: TERMOS DE USO
// O Contrato Base entre o Cliente e a Plataforma Zenyx VIPs
// ============================================================
export function Terms() {
  
  // ============================================================
  // EFEITO: SCROLL TOP IMEDIATO
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
          CONTEÚDO LEGAL: TERMOS E REGRAS DE USO
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
              Termos de <span className="text-gradient">Uso</span>
            </h1>
            <p className="legal-subtitle" style={{ color: 'var(--text-muted)' }}>
              Última atualização: 2026. Leia com atenção as regras da nossa parceria.
            </p>
          </div>
          
          <div className="legal-body" style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
            
            <h2 style={{ color: '#fff', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '1rem' }}>
              1. Objeto e Aceite
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              A Zenyx VIPs é uma plataforma tecnológica (SaaS) focada em automação de vendas para o ecossistema Telegram. Ao criar uma conta, você concorda integralmente com estes termos. Nossos serviços incluem a integração com gateways de pagamento (como Pushin Pay) e ferramentas de gestão de leads (CRM).
            </p>
            
            <h2 style={{ color: '#fff', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '1rem' }}>
              2. Responsabilidades do Usuário
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Você reconhece ser o único e exclusivo responsável pelo conteúdo, produtos ou serviços comercializados através dos bots criados em nossa plataforma. A Zenyx VIPs fornece apenas a infraestrutura tecnológica ("meio"), não tendo qualquer responsabilidade sobre a entrega final ao seu cliente ("fim").
            </p>
            
            <h2 style={{ color: '#fff', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '1rem' }}>
              3. Modelo de Cobrança (v6.0)
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Conforme nossa documentação técnica, operamos em um modelo de taxa por sucesso absoluto. O usuário concorda com a taxa fixa de <strong style={{ color: '#fff' }}>R$ 0,60 (sessenta centavos)</strong> por cada transação de venda processada e aprovada com sucesso através da nossa infraestrutura.
            </p>
            
            <h2 className="accent" style={{ color: 'var(--neon-magenta)', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '1rem' }}>
              4. Uso Aceitável e Proibições
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              É estritamente proibido utilizar a Zenyx VIPs para: (a) comercializar produtos ilegais ou fraudulentos; (b) realizar spam massivo ou violar as políticas da plataforma Telegram; (c) tentar realizar engenharia reversa de nossa tecnologia de automação. A violação resultará no banimento permanente e imediato da conta.
            </p>
            
            <h2 className="accent" style={{ color: 'var(--neon-magenta)', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '1rem' }}>
              5. Limitação de Responsabilidade
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Devido à natureza de integrações com terceiros (APIs do Telegram e Gateways de Pagamento via Webhooks), a Zenyx VIPs não garante 100% de uptime ininterrupto e não se responsabiliza por perdas financeiras decorrentes de instabilidades extremas nessas plataformas parceiras, embora empreguemos nossos melhores esforços de redundância para manter a estabilidade.
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