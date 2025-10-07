import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import ProductsLayout from "./pages/ProductsLayout";
import CartLayout from "./pages/CartLayout";
import CheckoutLayout from "./pages/CheckoutLayout";
import BhakthiLayout from "./pages/BhakthiLayout";
import MantraLayout from "./pages/MantraLayout";
import KnowledgeHubLayout from "./pages/KnowledgeHubLayout";
import TempleDetailLayout from "./pages/TempleDetailLayout";
import AdminLayout from "./pages/AdminLayout";
import AuthLayout from "./pages/AuthLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<ProductsLayout />} />
            <Route path="/cart" element={<CartLayout />} />
            <Route path="/checkout" element={<CheckoutLayout />} />
            <Route path="/bhakthi" element={<BhakthiLayout />} />
            <Route path="/mantra" element={<MantraLayout />} />
            <Route path="/knowledge-hub" element={<KnowledgeHubLayout />} />
            <Route path="/knowledge-hub/:templeId" element={<TempleDetailLayout />} />
            <Route path="/admin" element={<AdminLayout />} />
            <Route path="/auth" element={<AuthLayout />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
