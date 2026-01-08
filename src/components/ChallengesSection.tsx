import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Calendar, Gift } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string | null;
  deadline: string | null;
  is_active: boolean;
}

const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/your-challenge-group-link";

const ChallengesSection = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setChallenges(data);
    }
  };

  const handleAcceptChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.from('challenge_submissions').insert({
        challenge_id: selectedChallenge.id,
        user_id: user?.id || null,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Challenge Accepted!",
        description: "You've successfully registered. Redirecting to WhatsApp group...",
      });

      setFormOpen(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setSelectedChallenge(null);
      
      // Redirect to WhatsApp group
      setTimeout(() => {
        window.open(WHATSAPP_GROUP_LINK, "_blank");
      }, 1500);
    } catch (error) {
      console.error('Error submitting challenge:', error);
      toast({
        title: "Error",
        description: "Failed to submit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (challenges.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-sacred bg-clip-text text-transparent mb-4">
            🏆 Bhakthi Challenges
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take on spiritual challenges, earn rewards, and grow in your devotional journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="hover:shadow-lg transition-shadow border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  {challenge.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">{challenge.description}</p>
                
                {challenge.reward && (
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-green-500" />
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Reward: {challenge.reward}
                    </Badge>
                  </div>
                )}
                
                {challenge.deadline && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {new Date(challenge.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                
                <Button 
                  onClick={() => handleAcceptChallenge(challenge)}
                  className="w-full bg-gradient-sacred"
                >
                  Accept Challenge
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-sacred bg-clip-text text-transparent">
              🏆 Accept Challenge
            </DialogTitle>
            {selectedChallenge && (
              <p className="text-muted-foreground">{selectedChallenge.title}</p>
            )}
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="challenge-name">Full Name *</Label>
              <Input
                id="challenge-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenge-email">Email *</Label>
              <Input
                id="challenge-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenge-phone">Phone *</Label>
              <Input
                id="challenge-phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenge-message">Message</Label>
              <Textarea
                id="challenge-message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Any message for us..."
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-sacred" disabled={loading}>
              {loading ? "Submitting..." : "Submit & Join Challenge Group"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ChallengesSection;
