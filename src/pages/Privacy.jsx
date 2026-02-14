import React, { useLayoutEffect } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import '../styles/LandingPage.css';

export function Privacy() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="landing-page" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background FX */}
      <div style={{
        position: 'absolute', top: '20%', right: '-15%', width: '30rem', height: '30rem',
        background: 'rgba(6, 182, 212, 0.06)', borderRadius: '50%', filter: 'blur(150px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '-5%', width: '25rem', height: '25rem',
        background: 'rgba(16, 185, 129, 0.06)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none'
      }} />

      <Navbar />
      
      <main style={{ paddingTop: '140px', paddingBottom: '80px', minHeight: 'calc(100vh - 400px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="glass-card" style={{ padding: '3rem 4rem', maxWidth: '960px', margin: '0 auto' }}>
            
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
              <h1 className="section-title" style={{ fontSize: '2.5rem' }}>
                Política de{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Privacidade</span>
              </h1>
              <p className="section-subtitle" style={{ marginTop: '1rem' }}>
                Sua segurança e a dos seus clientes são prioridade. Entenda como tratamos os dados.
              </p>
            </header>
            
            <div style={{ color: 'var(--foreground)', lineHeight: '1.8' }}>
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#06b6d4', marginBottom: '1rem', fontSize: '1.5rem' }}>1. Coleta de Dados Essenciais</h2>
                <p>
                  Para o funcionamento do sistema, coletamos dados do administrador (Nome, E-mail, Credenciais de API) e dados transacionais dos leads (ID do Telegram, status da compra, histórico de interação com o bot). Coletamos apenas o estritamente necessário para a prestação do serviço.
                </p>
              </section>

              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#06b6d4', marginBottom: '1rem', fontSize: '1.5rem' }}>2. Segurança e Armazenamento</h2>
                <p>
                  Seguindo nossa documentação técnica, todos os dados sensíveis são armazenados em bancos de dados PostgreSQL com criptografia em repouso. Todas as comunicações entre nossos microserviços, o Telegram e o dashboard utilizam protocolo HTTPS seguro com certificados SSL atuais.
                </p>
              </section>

              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#06b6d4', marginBottom: '1rem', fontSize: '1.5rem' }}>3. Compartilhamento com Terceiros</h2>
                <p>
                  A Zenyx GBOT <strong>não vende</strong> dados. O único compartilhamento de dados financeiros ocorre estritamente com o gateway de pagamento parceiro (ex: Pushin Pay) para o processamento das vendas, conforme exigido para a conclusão da transação.
                </p>
              </section>

              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '1.5rem' }}>4. Seus Direitos (LGPD)</h2>
                <p>
                  Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de solicitar o acesso, correção ou a exclusão total dos seus dados da nossa base a qualquer momento. Solicitações devem ser enviadas através dos nossos canais de suporte oficial.
                </p>
              </section>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}