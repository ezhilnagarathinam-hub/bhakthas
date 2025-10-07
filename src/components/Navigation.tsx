import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, ShoppingBag, Home, BookOpen, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "Come back soon for your spiritual journey!",
    });
    navigate('/');
  };

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Pooja Products", path: "/products", icon: ShoppingBag },
    { name: "Test My Bhakthi", path: "/bhakthi", icon: MapPin },
    { name: "Knowledge Hub", path: "/knowledge-hub", icon: BookOpen },
    { name: "Mantra Chanting", path: "/mantra", icon: () => <span className="text-lg">🕉️</span> },
  ];

  return (
    <nav className="bg-background/90 backdrop-blur-md border-b-2 border-primary/20 sticky top-0 z-50 shadow-sacred">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-sacred rounded-xl flex items-center justify-center shadow-divine group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">भ</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-sacred bg-clip-text text-transparent">
                Bhakthas
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-sacred ${
                      isActive
                        ? "text-white bg-gradient-sacred shadow-sacred"
                        : "text-foreground hover:text-primary hover:bg-primary/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="sacred" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="sacred" size="sm" asChild className="shadow-sacred">
                <Link to="/auth">✨ Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t-2 border-primary/20">
          <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-base font-semibold transition-sacred ${
                    isActive
                      ? "text-white bg-gradient-sacred shadow-sacred"
                      : "text-foreground hover:text-primary hover:bg-primary/10"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-2 space-y-2">
              {user ? (
                <>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="sacred" size="sm" className="w-full" onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="sacred" size="sm" className="w-full" asChild>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    ✨ Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;