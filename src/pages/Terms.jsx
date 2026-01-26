import React, { useEffect } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
// Importamos o CSS global da landing page para garantir que todas as variáveis e classes estejam disponíveis
import '../styles/LandingPage.css';

export function Terms() {
  // Efeito para garantir que a página abra no topo e com o fundo correto
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-page relative overflow-hidden">
      {/* Adicionamos os efeitos de fundo (blobs) para manter a consistência visual */}
      <div className="bg-blob blob-1" style={{ top: '10%', left: '-10%', opacity: 0.4 }}></div>
      <div className="bg-blob blob-2" style={{ bottom: '20%', right: '-10%', opacity: 0.4 }}></div>

      <Navbar />
      
      <main style={{ paddingTop: '140px', paddingBottom: '80px', minHeight: 'calc(100vh - 400px)' }}>
        <div className="container">
          {/* Usamos a classe 'glass-card' do seu CSS para o container principal do texto */}
          <div className="glass-card" style={{ padding: '3rem 4rem', maxWidth: '960px', margin: '0 auto' }}>
            
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
              <h1 className="section-title" style={{ fontSize: '2.5rem' }}>
                Termos de <span className="neon-text">Uso</span>
              </h1>
              <p className="section-subtitle" style={{ marginTop: '1rem' }}>
                Última atualização: Outubro de 2023. Leia com atenção as regras da nossa parceria.
              </p>
            </header>
            
            <div className="legal-content" style={{ color: 'var(--foreground)', lineHeight: '1.8' }}>
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>1. Objeto e Aceite</h2>
                <p>
                  A Zenyx GBOT é uma plataforma tecnológica (SaaS) focada em automação de vendas para o ecossistema Telegram. Ao criar uma conta, você concorda integralmente com estes termos. Nossos serviços incluem a integração com gateways de pagamento (como Pushin Pay) e ferramentas de gestão de leads (CRM).
                </p>
              </section>

              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>2. Responsabilidades do Usuário</h2>
                <p>
                  Você reconhece ser o único e exclusivo responsável pelo conteúdo, produtos ou serviços comercializados através dos bots criados em nossa plataforma. A Zenyx GBOT fornece apenas a infraestrutura tecnológica ("meio"), não tendo qualquer responsabilidade sobre a entrega final ao seu cliente ("fim").
                </p>
              </section>

              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>3. Modelo de Cobrança (v3.0)</h2>
                <p>
                  Conforme nossa documentação técnica v3.0, operamos em um modelo de taxa por sucesso. O usuário concorda com a taxa fixa de <strong>R$ 0,60 (sessenta centavos)</strong> por cada transação de venda processada com sucesso através da nossa infraestrutura.
                </p>
              </section>

              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '1.5rem' }}>4. Uso Aceitável e Proibições</h2>
                <p>
                  É estritamente proibido utilizar a Zenyx GBOT para: (a) comercializar produtos ilegais ou fraudulentos; (b) realizar spam massivo ou violar as políticas do Telegram; (c) tentar realizar engenharia reversa de nossa tecnologia. A violação resultará no banimento imediato da conta.
                </p>
              </section>

              <section>
                <h2 style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '1.5rem' }}>5. Limitação de Responsabilidade</h2>
                <p>
                  Devido à natureza de integrações com terceiros (APIs do Telegram e Gateways de Pagamento), a Zenyx GBOT não garante 100% de uptime e não se responsabiliza por perdas decorrentes de instabilidades nessas plataformas parceiras, embora empreguemos nossos melhores esforços para manter a estabilidade.
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