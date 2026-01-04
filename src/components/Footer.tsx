import { Link } from "react-router-dom";
import { MessageCircle, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/your-group-link";

const Footer = () => {
  const handleJoinCommunity = () => {
    window.open(WHATSAPP_GROUP_LINK, "_blank");
  };

  return (
    <footer className="bg-primary/10 border-t">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">🕉️ Bhakthas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your spiritual companion for temple discovery, darshan booking, and sacred products. 
              Connect with the divine through our platform.
            </p>
            <button
              onClick={handleJoinCommunity}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Join Our Community
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">Products</Link></li>
              <li><Link to="/darshan-services" className="text-muted-foreground hover:text-primary transition-colors">Darshan Services</Link></li>
              <li><Link to="/mantra-chanting" className="text-muted-foreground hover:text-primary transition-colors">Mantra Chanting</Link></li>
              <li><Link to="/knowledge-hub" className="text-muted-foreground hover:text-primary transition-colors">Knowledge Hub</Link></li>
              <li><Link to="/bhakthi" className="text-muted-foreground hover:text-primary transition-colors">Bhakthi Points</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/delivery-returns" className="text-muted-foreground hover:text-primary transition-colors">Delivery & Returns</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/help-centre" className="text-muted-foreground hover:text-primary transition-colors">Help Centre</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                support@bhakthas.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <span>123 Temple Street, Chennai, Tamil Nadu, India - 600001</span>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="mt-4">
              <h5 className="text-sm font-medium text-foreground mb-2">Follow Us</h5>
              <div className="flex gap-3">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Bhakthas. All rights reserved. Made with 🙏 in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
