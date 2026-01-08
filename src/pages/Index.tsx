import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ContributeDialog from "@/components/ContributeDialog";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import VisitorStats from "@/components/home/VisitorStats";
import WhyBhakthas from "@/components/home/WhyBhakthas";
import HowToNavigate from "@/components/home/HowToNavigate";
import Footer from "@/components/Footer";
import VolunteerDialog from "@/components/VolunteerDialog";
import ChallengesSection from "@/components/ChallengesSection";
import WelcomePopup from "@/components/WelcomePopup";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users } from "lucide-react";

const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/your-group-link";

const Index = () => {
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [showVolunteerDialog, setShowVolunteerDialog] = useState(false);
  const navigate = useNavigate();

  const handleJoinCommunity = () => {
    window.open(WHATSAPP_GROUP_LINK, "_blank");
  };

  const handleContributorClick = () => {
    navigate('/contribute');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <VisitorStats />
      
      {/* Volunteer Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Become a Volunteer</h2>
          <p className="text-white/90 mb-6">
            Join our team of dedicated volunteers and help spread the message of devotion. Serve temples, help devotees, and earn divine blessings.
          </p>
          <Button
            onClick={() => setShowVolunteerDialog(true)}
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100 font-semibold"
          >
            <Users className="w-5 h-5 mr-2" />
            Join as Volunteer
          </Button>
        </div>
      </section>
      
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

      {/* Challenges Section */}
      <div id="challenges-section">
        <ChallengesSection />
      </div>

      <WhyBhakthas />
      <HowToNavigate />
      <Testimonials />
      
      <ContributeDialog open={showContributeDialog} onOpenChange={setShowContributeDialog} />
      <VolunteerDialog open={showVolunteerDialog} onOpenChange={setShowVolunteerDialog} />
      <WelcomePopup 
        onVolunteerClick={() => setShowVolunteerDialog(true)} 
        onContributorClick={handleContributorClick}
      />
      <Footer />
    </div>
  );
};

export default Index;
