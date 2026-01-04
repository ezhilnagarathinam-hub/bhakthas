import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const DeliveryReturns = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold text-primary mb-8">Delivery & Returns Policy</h1>
        
        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Delivery Information</h2>
            <p className="text-muted-foreground">
              We deliver across India. Standard delivery takes 5-7 business days. Express delivery 
              is available for select locations and takes 2-3 business days.
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Free shipping on orders above ₹999</li>
              <li>Standard shipping: ₹49</li>
              <li>Express shipping: ₹99</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Returns Policy</h2>
            <p className="text-muted-foreground">
              We accept returns within 7 days of delivery for most products. Items must be unused, 
              in original packaging, and with all tags attached.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Non-Returnable Items</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Puja items that have been opened</li>
              <li>Prasad and food items</li>
              <li>Customized or personalized items</li>
              <li>Digital downloads and darshan bookings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Refund Process</h2>
            <p className="text-muted-foreground">
              Once we receive your return, we will inspect it and notify you of the approval or 
              rejection of your refund. If approved, your refund will be processed within 5-7 
              business days to your original payment method.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DeliveryReturns;
