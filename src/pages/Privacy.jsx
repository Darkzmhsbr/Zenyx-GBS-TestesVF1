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
    <div className="legal-page landing-page">
      <Navbar />
      <div className="legal-container">
        <div className="legal-card glass">
          <div className="legal-header">
            <h1 className="legal-title">Politica de <span className="grad-text">Privacidade</span></h1>
            <p className="legal-subtitle">Sua seguranca e a dos seus clientes sao prioridade. Entenda como tratamos os dados.</p>
          </div>
          <div className="legal-body">
            <h2 className="accent">1. Coleta de Dados Essenciais</h2>
            <p>Para o funcionamento do sistema, coletamos dados do administrador (Nome, E-mail, Credenciais de API) e dados transacionais dos leads (ID do Telegram, status da compra, historico de interacao com o bot). Coletamos apenas o estritamente necessario para a prestacao do servico.</p>
            <h2 className="accent">2. Seguranca e Armazenamento</h2>
            <p>Seguindo nossa documentacao tecnica, todos os dados sensiveis sao armazenados em bancos de dados PostgreSQL com criptografia em repouso. Todas as comunicacoes entre nossos microservicos, o Telegram e o dashboard utilizam protocolo HTTPS seguro com certificados SSL atuais.</p>
            <h2 className="accent">3. Compartilhamento com Terceiros</h2>
            <p>A Zenyx GBOT <strong>nao vende</strong> dados. O unico compartilhamento de dados financeiros ocorre estritamente com o gateway de pagamento parceiro (ex: Pushin Pay) para o processamento das vendas, conforme exigido para a conclusao da transacao.</p>
            <h2>4. Seus Direitos (LGPD)</h2>
            <p>Em conformidade com a Lei Geral de Protecao de Dados (LGPD), voce tem o direito de solicitar o acesso, correcao ou a exclusao total dos seus dados da nossa base a qualquer momento. Solicitacoes devem ser enviadas atraves dos nossos canais de suporte oficial.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}