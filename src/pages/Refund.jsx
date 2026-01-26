import React, { useEffect } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import '../styles/LandingPage.css';

export function Refund() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-page relative overflow-hidden">
       {/* Background FX - Variação de posição para não ficar repetitivo */}
      <div className="bg-blob blob-2" style={{ top: '5%', right: '30%', opacity: 0.3, transform: 'scale(1.5)' }}></div>
      <div className="bg-blob blob-3" style={{ bottom: '-10%', left: '10%', opacity: 0.4 }}></div>

      <Navbar />
      
      <main style={{ paddingTop: '140px', paddingBottom: '80px', minHeight: 'calc(100vh - 400px)' }}>
        <div className="container">
          {/* Container Glassmorphism Premium */}
          <div className="glass-card" style={{ padding: '3rem 4rem', maxWidth: '960px', margin: '0 auto', border: '1px solid var(--secondary)' }}>
            
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
              <h1 className="section-title" style={{ fontSize: '2.5rem' }}>
                Política de <span className="neon-text" style={{ color: 'var(--secondary)' }}>Reembolso</span>
              </h1>
              <p className="section-subtitle" style={{ marginTop: '1rem' }}>
                Transparência sobre taxas, estornos e cancelamentos.
              </p>
            </header>
            
            <div className="legal-content" style={{ color: 'var(--foreground)', lineHeight: '1.8' }}>
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '1.5rem' }}>1. Taxa de Serviço Zenyx</h2>
                <p>
                  A Zenyx GBOT opera como uma intermediadora tecnológica. A taxa de <strong>R$ 0,60 por transação</strong> refere-se ao custo de uso da nossa infraestrutura no momento da venda. Uma vez que a venda é processada com sucesso e a tecnologia foi utilizada, esta taxa específica não é passível de reembolso por parte da Zenyx.
                </p>
              </section>

              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '1.5rem' }}>2. Reembolso aos Seus Clientes</h2>
                <p>
                  A política de reembolso dos produtos ou serviços vendidos através dos seus bots é de sua inteira responsabilidade como vendedor. Você deve estabelecer e comunicar suas próprias regras de garantia e devolução diretamente aos seus clientes finais. A Zenyx GBOT não arbitra disputas comerciais entre usuário e consumidor final.
                </p>
              </section>

              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>3. Direito de Arrependimento (Plataforma)</h2>
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