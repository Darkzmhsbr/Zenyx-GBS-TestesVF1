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
        <div className="legal-card glass">
          <div className="legal-header">
            <h1 className="legal-title">Politica de <span className="grad-text">Reembolso</span></h1>
            <p className="legal-subtitle">Transparencia sobre taxas, estornos e cancelamentos.</p>
          </div>
          <div className="legal-body">
            <h2 className="accent">1. Taxa de Servico Zenyx</h2>
            <p>A Zenyx GBOT opera como uma intermediadora tecnologica. A taxa de <strong>R$ 0,60 por transacao</strong> refere-se ao custo de uso da nossa infraestrutura no momento da venda. Uma vez que a venda e processada com sucesso e a tecnologia foi utilizada, esta taxa especifica nao e passivel de reembolso por parte da Zenyx.</p>

            <h2 className="accent">2. Reembolso aos Seus Clientes</h2>
            <p>A politica de reembolso dos produtos ou servicos vendidos atraves dos seus bots e de sua inteira responsabilidade como vendedor. Voce deve estabelecer e comunicar suas proprias regras de garantia e devolucao diretamente aos seus clientes finais. A Zenyx GBOT nao arbitra disputas comerciais entre usuario e consumidor final.</p>

            <h2>3. Direito de Arrependimento (Plataforma)</h2>
            <p>Caso voce venha a contratar algum plano de assinatura "Premium" pago diretamente a Zenyx GBOT no futuro, voce tera o direito de arrependimento de 7 (sete) dias corridos apos a contratacao, conforme previsto no Codigo de Defesa do Consumidor, com devolucao integral do valor pago pela assinatura.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}