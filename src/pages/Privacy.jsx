import React, { useLayoutEffect } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import '../styles/LandingPage.css';

// ============================================================
// COMPONENTE: POLÍTICA DE PRIVACIDADE
// Detalha a LGPD e o tratamento de dados (Criptografia)
// ============================================================
export function Privacy() {
  
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
          CONTEÚDO LEGAL: PRIVACIDADE E LGPD
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
              Política de <span className="text-gradient">Privacidade</span>
            </h1>
            <p className="legal-subtitle" style={{ color: 'var(--text-muted)' }}>
              Sua segurança e a dos seus clientes são prioridade. Entenda como tratamos os dados.
            </p>
          </div>
          
          <div className="legal-body" style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
            
            <h2 className="accent" style={{ color: 'var(--neon-magenta)', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '1rem' }}>
              1. Coleta de Dados Essenciais
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Para o funcionamento do sistema, coletamos dados do administrador (Nome, E-mail, Credenciais de API) e dados transacionais dos leads (ID do Telegram, status da compra, histórico de interação com o bot). Coletamos apenas o estritamente necessário para a prestação do serviço.
            </p>
            
            <h2 className="accent" style={{ color: 'var(--neon-magenta)', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '1rem' }}>
              2. Segurança e Armazenamento
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Seguindo nossa documentação técnica, todos os dados sensíveis são armazenados em bancos de dados PostgreSQL com criptografia em repouso. Todas as comunicações entre nossos microserviços, o Telegram e o dashboard utilizam protocolo HTTPS seguro com certificados SSL atuais.
            </p>
            
            <h2 className="accent" style={{ color: 'var(--neon-magenta)', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '1rem' }}>
              3. Compartilhamento com Terceiros
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              A Zenyx VIPs <strong style={{ color: '#fff' }}>não vende</strong> dados. O único compartilhamento de dados financeiros ocorre estritamente com o gateway de pagamento parceiro (ex: Pushin Pay) para o processamento das vendas, conforme exigido para a conclusão da transação.
            </p>
            
            <h2 style={{ color: '#fff', fontFamily: 'var(--font-display)', marginTop: '2rem', marginBottom: '1rem' }}>
              4. Seus Direitos (LGPD)
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de solicitar o acesso, correção ou a exclusão total dos seus dados da nossa base a qualquer momento. Solicitações devem ser enviadas através dos nossos canais de suporte oficial.
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