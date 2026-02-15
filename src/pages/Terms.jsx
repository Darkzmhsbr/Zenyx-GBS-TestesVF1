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
        <div className="legal-card glass">
          <div className="legal-header">
            <h1 className="legal-title">Termos de <span className="grad-text">Uso</span></h1>
            <p className="legal-subtitle">Ultima atualizacao: Outubro de 2023. Leia com atencao as regras da nossa parceria.</p>
          </div>
          <div className="legal-body">
            <h2>1. Objeto e Aceite</h2>
            <p>A Zenyx GBOT e uma plataforma tecnologica (SaaS) focada em automacao de vendas para o ecossistema Telegram. Ao criar uma conta, voce concorda integralmente com estes termos. Nossos servicos incluem a integracao com gateways de pagamento (como Pushin Pay) e ferramentas de gestao de leads (CRM).</p>
            <h2>2. Responsabilidades do Usuario</h2>
            <p>Voce reconhece ser o unico e exclusivo responsavel pelo conteudo, produtos ou servicos comercializados atraves dos bots criados em nossa plataforma. A Zenyx GBOT fornece apenas a infraestrutura tecnologica ("meio"), nao tendo qualquer responsabilidade sobre a entrega final ao seu cliente ("fim").</p>
            <h2>3. Modelo de Cobranca (v3.0)</h2>
            <p>Conforme nossa documentacao tecnica v3.0, operamos em um modelo de taxa por sucesso. O usuario concorda com a taxa fixa de <strong>R$ 0,60 (sessenta centavos)</strong> por cada transacao de venda processada com sucesso atraves da nossa infraestrutura.</p>
            <h2 className="accent">4. Uso Aceitavel e Proibicoes</h2>
            <p>E estritamente proibido utilizar a Zenyx GBOT para: (a) comercializar produtos ilegais ou fraudulentos; (b) realizar spam massivo ou violar as politicas do Telegram; (c) tentar realizar engenharia reversa de nossa tecnologia. A violacao resultara no banimento imediato da conta.</p>
            <h2 className="accent">5. Limitacao de Responsabilidade</h2>
            <p>Devido a natureza de integracoes com terceiros (APIs do Telegram e Gateways de Pagamento), a Zenyx GBOT nao garante 100% de uptime e nao se responsabiliza por perdas decorrentes de instabilidades nessas plataformas parceiras, embora empreguemos nossos melhores esforcos para manter a estabilidade.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}