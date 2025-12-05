import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calendar, ShoppingBag, BookOpen, Music, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    step: 1,
    icon: MapPin,
    title: "Explore Temples",
    description: "Browse our extensive database of temples. Use the map or search to find temples near you or plan pilgrimages.",
    link: "/bhakthi",
    linkText: "Find Temples",
  },
  {
    step: 2,
    icon: Calendar,
    title: "Book Darshan",
    description: "Select your preferred temple and book darshan slots. Choose from free, standard, or VIP packages.",
    link: "/darshan-services",
    linkText: "Book Now",
  },
  {
    step: 3,
    icon: ShoppingBag,
    title: "Shop Sacred Items",
    description: "Browse authentic pooja items, idols, and spiritual products. Secure checkout with multiple payment options.",
    link: "/products",
    linkText: "Shop Now",
  },
  {
    step: 4,
    icon: Music,
    title: "Chant Mantras",
    description: "Practice daily mantra chanting with our audio guides. Track your progress and build consistency.",
    link: "/mantra-chanting",
    linkText: "Start Chanting",
  },
  {
    step: 5,
    icon: BookOpen,
    title: "Learn & Grow",
    description: "Explore our knowledge hub for articles on rituals, festivals, scriptures, and spiritual practices.",
    link: "/knowledge-hub",
    linkText: "Explore",
  },
  {
    step: 6,
    icon: Trophy,
    title: "Earn Rewards",
    description: "Earn Bhakthi points for temple visits and activities. Unlock discounts and exclusive benefits.",
    link: "/dashboard",
    linkText: "View Rewards",
  },
];

const HowToNavigate = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-sacred bg-clip-text text-transparent mb-4">
            How to Use Bhakthas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your complete guide to navigating the Bhakthas platform and making the most of your spiritual journey
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((item) => (
            <Card key={item.step} className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10">
                  {item.step}
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-sacred flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                <Link to={item.link}>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-primary hover:text-primary/80">
                    {item.linkText}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToNavigate;
