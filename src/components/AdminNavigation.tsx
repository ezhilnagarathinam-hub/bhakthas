import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, Package, MapPin, BookOpen, Users, ShoppingBag, BarChart, Upload, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "Admin session ended",
    });
    navigate('/auth');
  };

  const adminNavItems = [
    { name: "Dashboard", path: "/admin", icon: BarChart },
    { name: "Products", path: "/admin?tab=products", icon: Package },
    { name: "Temples", path: "/admin?tab=temples", icon: MapPin },
    { name: "Mantras", path: "/admin?tab=mantras", icon: BookOpen },
    { name: "Orders", path: "/admin?tab=orders", icon: ShoppingBag },
    { name: "Darshan", path: "/admin?tab=darshan", icon: MapPin },
    { name: "Contributions", path: "/admin?tab=contributions", icon: Upload },
    { name: "Users", path: "/admin?tab=users", icon: Users },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-amber-500/30 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/admin" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white block">
                  Admin Portal
                </span>
                <span className="text-xs text-amber-400">
                  Management Console
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {adminNavItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname + location.search === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? "text-white bg-amber-600 shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-slate-700"
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="bg-slate-800 border-amber-500/30 text-amber-400 hover:bg-slate-700 hover:text-amber-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-amber-400"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-amber-500/20">
          <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname + location.search === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-base font-semibold transition-all ${
                    isActive
                      ? "text-white bg-amber-600"
                      : "text-gray-300 hover:text-white hover:bg-slate-700"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-slate-900 border-amber-500/30 text-amber-400"
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavigation;
