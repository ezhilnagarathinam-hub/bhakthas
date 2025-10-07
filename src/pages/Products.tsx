import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import poojaImage from "@/assets/pooja-products.jpg";

const Products = () => {
  const { addToCart } = useCart();
  
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
      category: "Lamps & Diyas"
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
      category: "Incense"
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
      category: "Idols"
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
      category: "Malas"
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
      category: "Vessels"
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
      category: "Accessories"
    }
  ];

  const categories = ["All", "Lamps & Diyas", "Incense", "Idols", "Malas", "Vessels", "Accessories"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-sacred/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-sacred bg-clip-text text-transparent">
              Pooja Products
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover authentic sacred items for your spiritual practices
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-primary font-semibold">
                🎯 Earn 1000 Bhakthi points for 25% discount!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search sacred products..." 
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-sacred transition-divine overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-divine"
                  />
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 left-2 bg-primary text-primary-foreground"
                  >
                    {product.discount}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                  >
                    {product.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2 group-hover:text-primary transition-sacred">
                  {product.name}
                </CardTitle>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm font-medium ml-1">{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.originalPrice}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  variant="sacred" 
                  className="w-full group"
                  onClick={() => addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  })}
                >
                  <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Products;