import { Card, CardContent } from "@/components/ui/card";
import { MapPin, BookOpen, ShoppingBag, Calendar, Music, Heart } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Temple Discovery",
    description: "Explore thousands of temples across India with detailed information, timings, and navigation.",
  },
  {
    icon: Calendar,
    title: "Darshan Booking",
    description: "Book your darshan slots online and skip the queues with our seamless booking system.",
  },
  {
    icon: ShoppingBag,
    title: "Sacred Products",
    description: "Shop authentic pooja items, idols, and spiritual products delivered to your doorstep.",
  },
  {
    icon: Music,
    title: "Mantra Chanting",
    description: "Practice mantra chanting with audio guides and track your spiritual progress.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Hub",
    description: "Learn about Hindu scriptures, rituals, festivals, and spiritual practices.",
  },
  {
    icon: Heart,
    title: "Bhakthi Points",
    description: "Earn rewards for temple visits and spiritual activities to unlock exclusive benefits.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-sacred bg-clip-text text-transparent mb-4">
            Our Features
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need for your spiritual journey, all in one place
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-sacred flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
