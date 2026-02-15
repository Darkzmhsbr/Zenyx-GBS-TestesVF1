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
    <div className="legal-page landing-page">
      <Navbar />
      <div className="legal-container">
        <div className="legal-card">
          
          <div className="legal-header">
            <h1 className="legal-title">Política de <span className="grad-text">Reembolso</span></h1>
            <p className="legal-subtitle">Transparência sobre taxas, estornos e cancelamentos.</p>
          </div>
          
          <div className="legal-body">
            <h2 className="accent">1. Taxa de Serviço Zenyx</h2>
            <p>A Zenyx VIPs opera como uma intermediadora tecnológica. A taxa de <strong>R$ 0,60 por transação</strong> refere-se ao custo de uso da nossa infraestrutura no momento da venda. Uma vez que a venda é processada com sucesso e a tecnologia foi utilizada, esta taxa específica não é passível de reembolso por parte da Zenyx VIPs.</p>

            <h2 className="accent">2. Reembolso aos Seus Clientes</h2>
            <p>A política de reembolso dos produtos ou serviços vendidos através dos seus bots é de sua inteira responsabilidade como vendedor. Você deve estabelecer e comunicar suas próprias regras de garantia e devolução diretamente aos seus clientes finais. A Zenyx VIPs não arbitra disputas comerciais entre usuário e consumidor final.</p>

            <h2>3. Direito de Arrependimento (Plataforma)</h2>
            <p>Caso você venha a contratar algum plano de assinatura "Premium" pago diretamente à Zenyx VIPs no futuro, você terá o direito de arrependimento de 7 (sete) dias corridos após a contratação, conforme previsto no Código de Defesa do Consumidor, com devolução integral do valor pago pela assinatura.</p>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}