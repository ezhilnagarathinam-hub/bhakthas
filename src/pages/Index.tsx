import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ContributeDialog from "@/components/ContributeDialog";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import VisitorStats from "@/components/home/VisitorStats";
import WhyBhakthas from "@/components/home/WhyBhakthas";
import HowToNavigate from "@/components/home/HowToNavigate";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/your-group-link";

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

  const handleJoinCommunity = () => {
    window.open(WHATSAPP_GROUP_LINK, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <VisitorStats />
      
      {/* Join Community Section */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Spiritual Community</h2>
          <p className="text-white/90 mb-6">
            Connect with thousands of devotees, share experiences, and stay updated with the latest temple news and spiritual events.
          </p>
          <Button
            onClick={handleJoinCommunity}
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Join WhatsApp Community
          </Button>
        </div>
      </section>

      <WhyBhakthas />
      <HowToNavigate />
      <Testimonials />
      <ContributeDialog open={showContributeDialog} onOpenChange={setShowContributeDialog} />
      <Footer />
    </div>
  );
};

export default Index;
