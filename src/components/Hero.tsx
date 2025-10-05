import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-temple.jpg";
import FeaturedTempleInfo from "./FeaturedTempleInfo";
const Hero = () => {
  return <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Sacred Temple" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="block text-foreground">Welcome to</span>
                <span className="block bg-gradient-sacred bg-clip-text text-transparent">
                  Bhakthas
                </span>
              </h1>
              <p className="text-xl max-w-2xl leading-relaxed text-[#727272] text-left font-normal md:text-2xl">
                Your spiritual journey begins here. Discover sacred products, test your devotion, 
                and explore temples across India with our divine platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button variant="sacred" size="lg" className="group">
                  Explore Products
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/bhakthi">
                <Button variant="outline" size="lg" className="group">
                  Test My Bhakthi
                  <MapPin className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
              <Link to="/knowledge-hub">
                <Button variant="mystic" size="lg" className="group">
                  Knowledge Hub
                  <Star className="ml-2 h-5 w-5 group-hover:rotate-180 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-accent mr-2" />
                  <span className="text-3xl font-bold text-primary">1000+</span>
                </div>
                <p className="text-sm text-muted-foreground">Sacred Products</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-6 w-6 text-accent mr-2" />
                  <span className="text-3xl font-bold text-primary">5000+</span>
                </div>
                <p className="text-sm text-muted-foreground">Temples Listed</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-accent mr-2" />
                  <span className="text-3xl font-bold text-primary">10K+</span>
                </div>
                <p className="text-sm text-muted-foreground">Devotees</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-sacred opacity-20 blur-3xl rounded-full" />
              <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-divine border border-border/50">
                <h3 className="text-2xl font-bold text-center mb-6 text-primary">
                  🕉️ Sacred Journey
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
                    <span className="text-sm font-medium">Temples Visited</span>
                    <span className="text-2xl font-bold text-primary">12/50</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
                    <span className="text-sm font-medium">Bhakthi Score</span>
                    <span className="text-2xl font-bold text-accent">1,200</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-sacred/10 rounded-xl border border-primary/20">
                    <span className="text-sm font-medium text-primary">Discount Earned</span>
                    <span className="text-2xl font-bold text-primary">25% OFF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Temple Info */}
        <div className="mt-12 max-w-3xl mx-auto">
          <FeaturedTempleInfo />
        </div>
      </div>
    </section>;
};
export default Hero;