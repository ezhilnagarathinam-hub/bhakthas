import { CheckCircle, Shield, Clock, Sparkles } from "lucide-react";

const reasons = [
  {
    icon: Shield,
    title: "Trusted & Authentic",
    description: "We work directly with temples and verified vendors to ensure authenticity of all services and products.",
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Skip long queues with online darshan booking. Get temple information instantly without searching multiple sources.",
  },
  {
    icon: Sparkles,
    title: "Spiritual Growth",
    description: "Track your spiritual journey with Bhakthi points. Access mantras, knowledge resources, and grow in your practice.",
  },
  {
    icon: CheckCircle,
    title: "All-in-One Platform",
    description: "Temple discovery, darshan booking, sacred products, mantra chanting - everything for your spiritual needs in one app.",
  },
];

const WhyBhakthas = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-sacred bg-clip-text text-transparent mb-6">
              Why Choose Bhakthas?
            </h2>
            <p className="text-muted-foreground mb-8">
              Bhakthas is India's premier spiritual platform, connecting devotees with temples, 
              sacred products, and spiritual resources. We make your devotional journey seamless and meaningful.
            </p>
            
            <div className="space-y-6">
              {reasons.map((reason, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-sacred flex items-center justify-center">
                    <reason.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{reason.title}</h4>
                    <p className="text-sm text-muted-foreground">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-sacred/10 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4">🙏</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Join Our Community</h3>
                <p className="text-muted-foreground">50,000+ devotees trust Bhakthas for their spiritual journey</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-sacred/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyBhakthas;
