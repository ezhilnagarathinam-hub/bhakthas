import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MessageCircle, Clock } from "lucide-react";

const HelpCentre = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold text-primary mb-8">Help Centre</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Send us an email and we'll respond within 24 hours</p>
              <a href="mailto:support@bhakthas.com" className="text-primary font-medium hover:underline">
                support@bhakthas.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Phone Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Call us during business hours</p>
              <a href="tel:+919876543210" className="text-primary font-medium hover:underline">
                +91 98765 43210
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                WhatsApp Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Chat with us on WhatsApp</p>
              <a 
                href="https://wa.me/919876543210" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                Start Chat
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Monday - Saturday</p>
              <p className="text-primary font-medium">9:00 AM - 6:00 PM IST</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Common Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="text-muted-foreground hover:text-primary cursor-pointer">• How to track my order?</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer">• Darshan booking not confirmed</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer">• Payment failed but money deducted</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer">• How to earn Bhakthi Points?</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer">• Return and refund process</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default HelpCentre;
