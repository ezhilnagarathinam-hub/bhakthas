import Navigation from "@/components/Navigation";
import Checkout from "./Checkout";

const CheckoutLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Checkout />
    </div>
  );
};

export default CheckoutLayout;
