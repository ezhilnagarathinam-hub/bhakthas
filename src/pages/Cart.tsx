import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [bhakthiDiscount, setBhakthiDiscount] = useState(0);
  
  useEffect(() => {
    if (user) {
      fetchBhakthiDiscount();
    }
  }, [user]);

  const fetchBhakthiDiscount = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_bhakthi_points')
        .select('current_discount_percent')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setBhakthiDiscount(data.current_discount_percent);
      }
    } catch (error) {
      console.error('Error fetching discount:', error);
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Invalid Code",
          description: "This promo code is not valid or has expired",
          variant: "destructive",
        });
        return;
      }

      // Check if code has reached max uses
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast({
          title: "Code Expired",
          description: "This promo code has reached its maximum number of uses",
          variant: "destructive",
        });
        return;
      }

      setAppliedPromo({ code: data.code, discount: data.discount_percent });
      toast({
        title: "Promo Applied!",
        description: `${data.discount_percent}% discount has been applied`,
      });
    } catch (error) {
      console.error('Error applying promo:', error);
      toast({
        title: "Error",
        description: "Failed to apply promo code",
        variant: "destructive",
      });
    }
  };

  const calculateFinalPrice = () => {
    let price = totalPrice;
    
    // Apply promo code discount
    if (appliedPromo) {
      price = price * (1 - appliedPromo.discount / 100);
    }
    
    // Apply Bhakthi points discount (these don't stack, use the best)
    if (bhakthiDiscount > 0 && !appliedPromo) {
      price = price * (1 - bhakthiDiscount / 100);
    }
    
    return Math.round(price);
  };

  const totalDiscount = appliedPromo ? appliedPromo.discount : bhakthiDiscount;
  const finalPrice = calculateFinalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
            <h2 className="text-3xl font-bold">Your cart is empty</h2>
            <p className="text-muted-foreground">
              Add some sacred items to your cart to continue shopping
            </p>
            <Button onClick={() => navigate("/products")} variant="sacred">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-sacred/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-sacred bg-clip-text text-transparent">
            Shopping Cart
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      <p className="text-2xl font-bold text-primary mb-4">
                        ₹{item.price}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Order Summary</h3>
                
                {/* Promo Code Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      disabled={!!appliedPromo}
                    />
                    <Button
                      onClick={appliedPromo ? () => setAppliedPromo(null) : applyPromoCode}
                      variant="outline"
                      size="sm"
                    >
                      {appliedPromo ? "Remove" : "Apply"}
                    </Button>
                  </div>
                  {appliedPromo && (
                    <p className="text-sm text-accent">✓ {appliedPromo.code} applied ({appliedPromo.discount}% off)</p>
                  )}
                  {bhakthiDiscount > 0 && !appliedPromo && (
                    <p className="text-sm text-accent">✓ Bhakthi Discount: {bhakthiDiscount}% off</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">₹{totalPrice}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span className="text-muted-foreground">Discount ({totalDiscount}%)</span>
                      <span className="font-semibold">-₹{totalPrice - finalPrice}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold text-accent">FREE</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-primary">₹{finalPrice}</span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full"
                  variant="sacred"
                  size="lg"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
