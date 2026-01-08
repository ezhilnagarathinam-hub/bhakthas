import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Heart, Trophy, MessageCircle } from "lucide-react";

const WHATSAPP_LINKS = {
  volunteer: "https://chat.whatsapp.com/your-volunteer-group-link",
  contributor: "https://chat.whatsapp.com/your-contributor-group-link",
  challenger: "https://chat.whatsapp.com/your-challenger-group-link",
  bhakthas: "https://chat.whatsapp.com/your-bhakthas-group-link"
};

interface WelcomePopupProps {
  onVolunteerClick: () => void;
  onContributorClick: () => void;
}

const WelcomePopup = ({ onVolunteerClick, onContributorClick }: WelcomePopupProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem('hasSeenWelcomePopup', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAction = (action: string) => {
    setOpen(false);
    if (action === 'volunteer') {
      onVolunteerClick();
    } else if (action === 'contributor') {
      onContributorClick();
    } else if (action === 'challenger') {
      // Scroll to challenges section
      const challengesSection = document.getElementById('challenges-section');
      if (challengesSection) {
        challengesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action === 'bhakthas') {
      window.open(WHATSAPP_LINKS.bhakthas, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center bg-gradient-sacred bg-clip-text text-transparent">
            🙏 Join Our Spiritual Community
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-950/30"
            onClick={() => handleAction('volunteer')}
          >
            <Users className="w-8 h-8 text-orange-500" />
            <span className="font-semibold">Volunteer</span>
            <span className="text-xs text-muted-foreground">Serve the community</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/30"
            onClick={() => handleAction('contributor')}
          >
            <Heart className="w-8 h-8 text-blue-500" />
            <span className="font-semibold">Contributor</span>
            <span className="text-xs text-muted-foreground">Add temple info</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950/30"
            onClick={() => handleAction('challenger')}
          >
            <Trophy className="w-8 h-8 text-purple-500" />
            <span className="font-semibold">Challenger</span>
            <span className="text-xs text-muted-foreground">Take challenges</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950/30"
            onClick={() => handleAction('bhakthas')}
          >
            <MessageCircle className="w-8 h-8 text-green-500" />
            <span className="font-semibold">Bhakthas</span>
            <span className="text-xs text-muted-foreground">Join WhatsApp group</span>
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Choose how you'd like to be part of our divine journey
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
