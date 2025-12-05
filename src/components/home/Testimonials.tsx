import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Chennai, Tamil Nadu",
    rating: 5,
    text: "Bhakthas made my Tirupati darshan booking so easy! No more waiting in long queues. The VIP darshan experience was truly divine.",
    avatar: "RK",
  },
  {
    name: "Priya Sharma",
    location: "Mumbai, Maharashtra",
    rating: 5,
    text: "I love the mantra chanting feature. It helps me maintain my daily spiritual practice. The audio quality is excellent!",
    avatar: "PS",
  },
  {
    name: "Venkatesh Iyer",
    location: "Bangalore, Karnataka",
    rating: 5,
    text: "The temple discovery feature helped me find beautiful temples near my new home. The detailed information about timings and rituals is very helpful.",
    avatar: "VI",
  },
  {
    name: "Lakshmi Devi",
    location: "Hyderabad, Telangana",
    rating: 5,
    text: "Ordered pooja items from Bhakthas and they arrived beautifully packaged. Authentic products at reasonable prices. Highly recommended!",
    avatar: "LD",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-sacred bg-clip-text text-transparent mb-4">
            What Devotees Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from our community of devotees about their spiritual journey with Bhakthas
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-sacred flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{testimonial.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
