import React, { useLayoutEffect } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import '../styles/LandingPage.css';

export function Refund() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="landing-page" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background FX */}
      <div style={{
        position: 'absolute', top: '5%', right: '30%', width: '30rem', height: '30rem',
        background: 'rgba(16, 185, 129, 0.06)', borderRadius: '50%', filter: 'blur(150px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '10%', width: '25rem', height: '25rem',
        background: 'rgba(6, 182, 212, 0.06)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none'
      }} />

      <Navbar />
      
      <main style={{ paddingTop: '140px', paddingBottom: '80px', minHeight: 'calc(100vh - 400px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="glass-card" style={{ padding: '3rem 4rem', maxWidth: '960px', margin: '0 auto', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
              <h1 className="section-title" style={{ fontSize: '2.5rem' }}>
                Política de{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Reembolso</span>
              </h1>
              <p className="section-subtitle" style={{ marginTop: '1rem' }}>
                Transparência sobre taxas, estornos e cancelamentos.
              </p>
            </header>
            
            <div style={{ color: 'var(--foreground)', lineHeight: '1.8' }}>
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#06b6d4', marginBottom: '1rem', fontSize: '1.5rem' }}>1. Taxa de Serviço Zenyx</h2>
                <p>
                  A Zenyx GBOT opera como uma intermediadora tecnológica. A taxa de <strong>R$ 0,60 por transação</strong> refere-se ao custo de uso da nossa infraestrutura no momento da venda. Uma vez que a venda é processada com sucesso e a tecnologia foi utilizada, esta taxa específica não é passível de reembolso por parte da Zenyx.
                </p>
              </section>

              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#06b6d4', marginBottom: '1rem', fontSize: '1.5rem' }}>2. Reembolso aos Seus Clientes</h2>
                <p>
                  A política de reembolso dos produtos ou serviços vendidos através dos seus bots é de sua inteira responsabilidade como vendedor. Você deve estabelecer e comunicar suas próprias regras de garantia e devolução diretamente aos seus clientes finais. A Zenyx GBOT não arbitra disputas comerciais entre usuário e consumidor final.
                </p>
              </section>

              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '1.5rem' }}>3. Direito de Arrependimento (Plataforma)</h2>
                <p>
                  Caso você venha a contratar algum plano de assinatura "Premium" pago diretamente à Zenyx GBOT no futuro, você terá o direito de arrependimento de 7 (sete) dias corridos após a contratação, conforme previsto no Código de Defesa do Consumidor, com devolução integral do valor pago pela assinatura.
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