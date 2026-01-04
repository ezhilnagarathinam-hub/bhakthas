import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold text-primary mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Bhakthas, you accept and agree to be bound by the terms and 
              provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Use of Service</h2>
            <p className="text-muted-foreground">
              You agree to use our services only for lawful purposes and in accordance with these 
              Terms. You agree not to use the services in any way that violates any applicable 
              national or international law or regulation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Products and Services</h2>
            <p className="text-muted-foreground">
              All products and services are subject to availability. We reserve the right to 
              discontinue any product or service at any time. Prices are subject to change 
              without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Darshan Bookings</h2>
            <p className="text-muted-foreground">
              Darshan bookings are subject to temple availability and confirmation. All bookings 
              require admin verification before confirmation. Cancellation and refund policies 
              apply as specified during booking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Bhakthas shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsConditions;
