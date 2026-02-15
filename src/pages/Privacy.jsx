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
        <div className="legal-card">
          
          <div className="legal-header">
            <h1 className="legal-title">Política de <span className="grad-text">Privacidade</span></h1>
            <p className="legal-subtitle">Sua segurança e a dos seus clientes são prioridade. Entenda como tratamos os dados.</p>
          </div>
          
          <div className="legal-body">
            <h2 className="accent">1. Coleta de Dados Essenciais</h2>
            <p>Para o funcionamento do sistema, coletamos dados do administrador (Nome, E-mail, Credenciais de API) e dados transacionais dos leads (ID do Telegram, status da compra, histórico de interação com o bot). Coletamos apenas o estritamente necessário para a prestação do serviço.</p>
            
            <h2 className="accent">2. Segurança e Armazenamento</h2>
            <p>Seguindo nossa documentação técnica, todos os dados sensíveis são armazenados em bancos de dados PostgreSQL com criptografia em repouso. Todas as comunicações entre nossos microserviços, o Telegram e o dashboard utilizam protocolo HTTPS seguro com certificados SSL atuais.</p>
            
            <h2 className="accent">3. Compartilhamento com Terceiros</h2>
            <p>A Zenyx VIPs <strong>não vende</strong> dados. O único compartilhamento de dados financeiros ocorre estritamente com o gateway de pagamento parceiro (ex: Pushin Pay) para o processamento das vendas, conforme exigido para a conclusão da transação.</p>
            
            <h2>4. Seus Direitos (LGPD)</h2>
            <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de solicitar o acesso, correção ou a exclusão total dos seus dados da nossa base a qualquer momento. Solicitações devem ser enviadas através dos nossos canais de suporte oficial.</p>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}