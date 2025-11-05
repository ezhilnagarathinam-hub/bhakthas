import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ContributeDialog from "@/components/ContributeDialog";

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
      <ContributeDialog open={showContributeDialog} onOpenChange={setShowContributeDialog} />
    </div>
  );
};

export default Index;
