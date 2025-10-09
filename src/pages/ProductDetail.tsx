import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, ArrowLeft, Package, Truck, ShieldCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import poojaImage from "@/assets/pooja-products.jpg";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  // Mock product data - in real app, fetch from Supabase
  const products = [
    {
      id: 1,
      name: "Sacred Brass Diya Set",
      price: 299,
      originalPrice: 399,
      discount: "25% OFF",
      rating: 4.8,
      reviews: 124,
      image: poojaImage,
      category: "Lamps & Diyas",
      description: "Premium quality brass diya set perfect for daily puja and special occasions. Handcrafted by skilled artisans with intricate designs.",
      features: [
        "Made from pure brass",
        "Set of 5 diyas",
        "Traditional handcrafted design",
        "Easy to clean and maintain",
        "Perfect for festivals and daily worship"
      ]
    },
    {
      id: 2,
      name: "Premium Incense Collection",
      price: 199,
      originalPrice: 249,
      discount: "20% OFF",
      rating: 4.9,
      reviews: 89,
      image: poojaImage,
      category: "Incense",
      description: "A divine collection of premium incense sticks with authentic fragrances. Made from natural ingredients for a pure spiritual experience.",
      features: [
        "100% natural ingredients",
        "Pack of 12 boxes",
        "Long-lasting fragrance",
        "Traditional Indian scents",
        "Ideal for meditation and prayer"
      ]
    },
    {
      id: 3,
      name: "Ganesh Idol - Pure Brass",
      price: 1299,
      originalPrice: 1599,
      discount: "19% OFF",
      rating: 4.7,
      reviews: 56,
      image: poojaImage,
      category: "Idols",
      description: "Beautiful Lord Ganesh idol crafted from pure brass. Perfect for home temple or as a spiritual gift.",
      features: [
        "Pure brass construction",
        "Height: 6 inches",
        "Detailed craftsmanship",
        "Comes with blessing instructions",
        "Perfect for home and office"
      ]
    },
    {
      id: 4,
      name: "Rudraksha Mala - Original",
      price: 899,
      originalPrice: 1199,
      discount: "25% OFF",
      rating: 4.9,
      reviews: 203,
      image: poojaImage,
      category: "Malas",
      description: "Authentic Rudraksha mala with 108 beads. Sourced directly from Nepal, perfect for meditation and chanting.",
      features: [
        "108 genuine Rudraksha beads",
        "5 Mukhi beads",
        "Blessed and energized",
        "Comes with authenticity certificate",
        "Traditional thread design"
      ]
    },
    {
      id: 5,
      name: "Copper Kalash Set",
      price: 699,
      originalPrice: 899,
      discount: "22% OFF",
      rating: 4.6,
      reviews: 78,
      image: poojaImage,
      category: "Vessels",
      description: "Traditional copper kalash set for puja ceremonies. Includes kalash, coconut holder, and decorative elements.",
      features: [
        "Pure copper material",
        "Complete puja set",
        "Traditional design",
        "Easy to maintain",
        "Perfect for all rituals"
      ]
    },
    {
      id: 6,
      name: "Sacred Thread - Cotton",
      price: 99,
      originalPrice: 149,
      discount: "34% OFF",
      rating: 4.8,
      reviews: 145,
      image: poojaImage,
      category: "Accessories",
      description: "Premium quality sacred thread made from pure cotton. Essential for daily puja and religious ceremonies.",
      features: [
        "100% pure cotton",
        "Pack of 10 threads",
        "Traditional preparation",
        "Soft and comfortable",
        "Suitable for all occasions"
      ]
    }
  ];

  const product = products.find(p => p.id === Number(productId));

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </Card>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </Card>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Authentic Products</p>
              </Card>
              <Card className="p-4 text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Fast Delivery</p>
              </Card>
              <Card className="p-4 text-center">
                <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Secure Payment</p>
              </Card>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="text-lg font-medium ml-1">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  ({product.reviews} reviews)
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-bold text-primary">₹{product.price}</span>
                <span className="text-2xl text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
                <Badge className="bg-accent text-accent-foreground">
                  {product.discount}
                </Badge>
              </div>
            </div>

            <Card className="p-4 bg-primary/5">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-semibold">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="sacred"
                  size="lg"
                  className="flex-1"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
