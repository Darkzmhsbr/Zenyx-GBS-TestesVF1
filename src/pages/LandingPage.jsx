import React, { useEffect } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesGrid } from '../components/landing/FeaturesGrid';
import { ActivityFeed } from '../components/landing/ActivityFeed';
import { MoreFeatures } from '../components/landing/MoreFeatures';
import { TutorialsSection } from '../components/landing/TutorialsSection';
import { FAQSection } from '../components/landing/FAQSection';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';

// O motor visual definitivo Cosmos Purple
import '../styles/LandingPage.css';

// ============================================================
// NOVO COMPONENTE: Vitrine (Criaremos nos próximos arquivos)
// ============================================================
import { VitrineSection } from '../components/landing/VitrineSection'; 

export function LandingPage() {
  useEffect(() => {
    // Garante que a página sempre inicie no topo e sem margens ao carregar
    window.scrollTo(0, 0);
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Adiciona a classe global que ativa o background base do CSS
    document.body.classList.add('landing-body');
    
    // Limpeza de segurança ao desmontar o componente para evitar vazamento de estilos
    return () => {
      document.body.classList.remove('landing-body');
    };
  }, []);

  return (
    <div className="landing-page">
      
      {/* ============================================================
          BACKGROUND CÓSMICO (INJETADO GLOBALMENTE)
          Estes elementos criam a atmosfera roxa, as estrelas e a malha
          para o site inteiro, mantendo a performance impecável.
          ============================================================ */}
      <div className="bg-cosmos"></div>
      
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>
      
      <div className="stars"></div>
      
      <div className="bg-grid"></div>

      {/* ============================================================
          SEÇÕES DA PLATAFORMA (NOVA ORDEM ARQUITETURAL)
          ============================================================ */}
          
      {/* 1. Navegação Frosted Cyber Blindada */}
      <Navbar />
      
      {/* 2. Topo Perfeito: Texto à Esquerda + Monitor 3D à Direita */}
      <HeroSection />

      {/* 3. A Jornada: O Retorno do Circuito Pulsante da Linha do Tempo */}
      <MoreFeatures />
      
      {/* 4. Engenharia de Conversão (Novo Bento Grid Premium) */}
      <FeaturesGrid />
      
      {/* 5. A GRANDE NOVIDADE: A Seção da Vitrine Mini-App */}
      <VitrineSection />
      
      {/* 6. Renderiza "A Vantagem Desleal" e o "Hall da Fama Original 3D" */}
      <ActivityFeed />
      
      {/* 7. Command Center: Acordeão Sleek Magenta */}
      <TutorialsSection />
      
      {/* 8. FAQ com efeito Reveal Glow (Para matar objeções finais) */}
      <FAQSection />
      
      {/* 9. Chamada Final de Ação (CTA Banner) */}
      <CTASection />
      
      {/* 10. Rodapé Limpo e 100% Responsivo */}
      <Footer />
      
    </div>
  );
}