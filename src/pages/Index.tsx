import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ContributeDialog from "@/components/ContributeDialog";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import VisitorStats from "@/components/home/VisitorStats";
import WhyBhakthas from "@/components/home/WhyBhakthas";
import HowToNavigate from "@/components/home/HowToNavigate";

const Index = () => {
  const [showContributeDialog, setShowContributeDialog] = useState(false);

  useEffect(() => {
    const hasSeenDialog = localStorage.getItem('hasSeenContributeDialog');
    if (!hasSeenDialog) {
      const timer = setTimeout(() => {
        setShowContributeDialog(true);
        localStorage.setItem('hasSeenContributeDialog', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <VisitorStats />
      <WhyBhakthas />
      <HowToNavigate />
      <Testimonials />
      <ContributeDialog open={showContributeDialog} onOpenChange={setShowContributeDialog} />
    </div>
  );
};

export default Index;
