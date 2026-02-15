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
import '../styles/LandingPage.css';

export function LandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.classList.add('landing-body');
    return () => {
      document.body.classList.remove('landing-body');
    };
  }, []);

  return (
    <div className="landing-page">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <ActivityFeed />
      <MoreFeatures />
      <TutorialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}