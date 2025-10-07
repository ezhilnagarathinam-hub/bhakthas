import Navigation from "@/components/Navigation";
import Cart from "./Cart";

const CartLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Cart />
    </div>
  );
};

export default CartLayout;
