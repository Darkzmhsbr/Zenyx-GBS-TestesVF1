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

// O nosso novo motor visual Neon Cyber-Architect
import '../styles/LandingPage.css';

export function LandingPage() {
  useEffect(() => {
    // Garante que a página sempre inicie no topo e sem margens
    window.scrollTo(0, 0);
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Adiciona a classe global que ativa o background espacial do CSS
    document.body.classList.add('landing-body');
    
    // Limpeza ao desmontar o componente
    return () => {
      document.body.classList.remove('landing-body');
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Navegação Frosted Cyber */}
      <Navbar />
      
      {/* Topo com o Smartphone 3D Holográfico */}
      <HeroSection />
      
      {/* O Ecossistema e a Infraestrutura Sólida (Grid Perfeito) */}
      <FeaturesGrid />
      
      {/* Como o Feed Ao Vivo foi para o Celular, usaremos este componente para 
          renderizar a seção "A Vantagem Desleal (Taxas)" e "Hall da Fama" */}
      <ActivityFeed />
      
      {/* A Jornada (Circuito Pulsante) e Recursos Avançados */}
      <MoreFeatures />
      
      {/* Command Center (HUD Interface) */}
      <TutorialsSection />
      
      {/* FAQ com efeito Reveal Glow */}
      <FAQSection />
      
      {/* Chamada Final com Estatísticas */}
      <CTASection />
      
      {/* Rodapé Limpo */}
      <Footer />
    </div>
  );
}