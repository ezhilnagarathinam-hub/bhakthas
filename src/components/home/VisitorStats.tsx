import { useEffect, useState } from "react";
import { Users, MapPin, ShoppingBag, Calendar } from "lucide-react";

const stats = [
  { icon: Users, label: "Happy Devotees", value: 50000, suffix: "+" },
  { icon: MapPin, label: "Temples Listed", value: 5000, suffix: "+" },
  { icon: Calendar, label: "Darshan Bookings", value: 25000, suffix: "+" },
  { icon: ShoppingBag, label: "Products Delivered", value: 15000, suffix: "+" },
];

const VisitorStats = () => {
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("visitor-stats");
      if (element && !hasAnimated) {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setHasAnimated(true);
          animateCounters();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasAnimated]);

  const animateCounters = () => {
    stats.forEach((stat, index) => {
      const duration = 2000;
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(interval);
        }
        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[index] = Math.floor(current);
          return newCounts;
        });
      }, duration / steps);
    });
  };

  return (
    <section id="visitor-stats" className="py-16 bg-gradient-sacred">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 mb-4">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {counts[index].toLocaleString()}{stat.suffix}
              </div>
              <p className="text-white/80 text-sm md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VisitorStats;
