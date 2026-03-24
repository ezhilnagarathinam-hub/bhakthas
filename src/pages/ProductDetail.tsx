import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, ArrowLeft, Package, Truck, ShieldCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import poojaImage from "@/assets/pooja-products.jpg";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string | null;
  description: string | null;
  image_url: string | null;
  stock: number | null;
}

interface ProductVariant {
  id: string;
  variant_name: string;
  variant_type: string;
  price: number;
  stock: number;
}

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const [productRes, variantsRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', productId).maybeSingle(),
        supabase.from('product_variants').select('*').eq('product_id', productId).order('created_at'),
      ]);

      if (productRes.error) throw productRes.error;
      if (!productRes.data) {
        toast({ title: "Product not found", variant: "destructive" });
        return;
      }

      setProduct(productRes.data);
      const v = (variantsRes.data || []) as ProductVariant[];
      setVariants(v);

      // Compute available stock for base product
      if (productRes.data.stock !== null) {
        try {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('quantity')
            .eq('product_id', productRes.data.id)
            .neq('status', 'cancelled');
          const purchased = (ordersData || []).reduce((s: number, o: any) => s + (o.quantity || 0), 0);
          setAvailableStock((productRes.data.stock ?? 0) - purchased);
        } catch {
          setAvailableStock(null);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({ title: "Error", description: "Failed to load product", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const activePrice = selectedVariant ? selectedVariant.price : product?.price || 0;
  const activeStock = selectedVariant ? selectedVariant.stock : availableStock;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate('/products')}>Back to Products</Button>
        </Card>
      </div>
    );
  }

  const handleAddToCart = () => {
    const variantLabel = selectedVariant ? ` (${selectedVariant.variant_name})` : '';
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: selectedVariant ? `${product.id}_${selectedVariant.id}` : product.id,
        name: product.name + variantLabel,
        price: activePrice,
        image: product.image_url || poojaImage,
      });
    }
    toast({ title: "Added to cart", description: `${quantity} ${product.name}${variantLabel} added` });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  // Group variants by type
  const variantsByType: Record<string, ProductVariant[]> = {};
  variants.forEach(v => {
    if (!variantsByType[v.variant_type]) variantsByType[v.variant_type] = [];
    variantsByType[v.variant_type].push(v);
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate('/products')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="w-full h-96 flex items-center justify-center bg-muted">
                <img 
                  src={product.image_url || poojaImage} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain" 
                />
              </div>
            </Card>
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

          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">{product.category}</Badge>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-bold text-primary">₹{activePrice}</span>
                {activeStock !== null && activeStock !== undefined && (
                  activeStock > 0
                    ? <Badge variant="secondary">In Stock</Badge>
                    : <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
            </div>

            {/* Variant Selection */}
            {Object.keys(variantsByType).length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Select Variant</h3>
                {Object.entries(variantsByType).map(([type, typeVariants]) => (
                  <div key={type} className="mb-3">
                    <p className="text-sm text-muted-foreground capitalize mb-2">{type}</p>
                    <div className="flex flex-wrap gap-2">
                      {typeVariants.map(v => (
                        <Button
                          key={v.id}
                          variant={selectedVariant?.id === v.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                          className="min-w-[80px]"
                        >
                          {v.variant_name} — ₹{v.price}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {product.description && (
              <Card className="p-4 bg-primary/5">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
              </Card>
            )}

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-semibold">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>+</Button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="sacred" size="lg" className="flex-1" onClick={handleBuyNow}
                  disabled={activeStock !== null && activeStock !== undefined ? activeStock === 0 : false}>
                  Buy Now
                </Button>
                <Button variant="outline" size="lg" className="flex-1" onClick={handleAddToCart}
                  disabled={activeStock !== null && activeStock !== undefined ? activeStock === 0 : false}>
                  <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
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
