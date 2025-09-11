import Navigation from "@/components/Navigation";
import Products from "./Products";

const ProductsLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Products />
    </div>
  );
};

export default ProductsLayout;