import React, { useLayoutEffect } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import '../styles/LandingPage.css';

export function Terms() {
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
            <h1 className="legal-title">Termos de <span className="grad-text">Uso</span></h1>
            <p className="legal-subtitle">Última atualização: Outubro de 2023. Leia com atenção as regras da nossa parceria.</p>
          </div>
          
          <div className="legal-body">
            <h2>1. Objeto e Aceite</h2>
            <p>A Zenyx VIPs é uma plataforma tecnológica (SaaS) focada em automação de vendas para o ecossistema Telegram. Ao criar uma conta, você concorda integralmente com estes termos. Nossos serviços incluem a integração com gateways de pagamento (como Pushin Pay) e ferramentas de gestão de leads (CRM).</p>
            
            <h2>2. Responsabilidades do Usuário</h2>
            <p>Você reconhece ser o único e exclusivo responsável pelo conteúdo, produtos ou serviços comercializados através dos bots criados em nossa plataforma. A Zenyx VIPs fornece apenas a infraestrutura tecnológica ("meio"), não tendo qualquer responsabilidade sobre a entrega final ao seu cliente ("fim").</p>
            
            <h2>3. Modelo de Cobrança (v3.0)</h2>
            <p>Conforme nossa documentação técnica v3.0, operamos em um modelo de taxa por sucesso. O usuário concorda com a taxa fixa de <strong>R$ 0,60 (sessenta centavos)</strong> por cada transação de venda processada com sucesso através da nossa infraestrutura.</p>
            
            <h2 className="accent">4. Uso Aceitável e Proibições</h2>
            <p>É estritamente proibido utilizar a Zenyx VIPs para: (a) comercializar produtos ilegais ou fraudulentos; (b) realizar spam massivo ou violar as políticas do Telegram; (c) tentar realizar engenharia reversa de nossa tecnologia. A violação resultará no banimento imediato da conta.</p>
            
            <h2 className="accent">5. Limitação de Responsabilidade</h2>
            <p>Devido à natureza de integrações com terceiros (APIs do Telegram e Gateways de Pagamento), a Zenyx VIPs não garante 100% de uptime e não se responsabiliza por perdas decorrentes de instabilidades nessas plataformas parceiras, embora empreguemos nossos melhores esforços para manter a estabilidade.</p>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}