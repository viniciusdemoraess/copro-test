import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import StatsIndicators from "@/components/StatsIndicators";
import About from "@/components/About";
import NewsSection from "@/components/NewsSection";
import PodcastSection from "@/components/PodcastSection";
import CooperativeBenefits from "@/components/CooperativeBenefits";
import VideoSection from "@/components/VideoSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import VideoPopup from "@/components/VideoPopup";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Se houver hash na URL, faz scroll até o elemento
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        // Pequeno delay para garantir que a página carregou
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background">
      <Header onAssociateClick={() => navigate("/associacao")} />

      <main>
        <HeroCarousel />
        <StatsIndicators />
        <About />
        <NewsSection />
        <PodcastSection />
        <VideoSection />
        <CooperativeBenefits />
      </main>

      <Footer />

      <WhatsAppButton />
      <VideoPopup />
    </div>
  );
};

export default Index;