import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ProductsLayout from "./pages/ProductsLayout";
import ProductDetailLayout from "./pages/ProductDetailLayout";
import CartLayout from "./pages/CartLayout";
import CheckoutLayout from "./pages/CheckoutLayout";
import DarshanServicesLayout from "./pages/DarshanServicesLayout";
import DarshanBookingLayout from "./pages/DarshanBookingLayout";
import DarshanPaymentLayout from "./pages/DarshanPaymentLayout";
import DarshanTicketLayout from "./pages/DarshanTicketLayout";
import BhakthiLayout from "./pages/BhakthiLayout";
import MantraLayout from "./pages/MantraLayout";
import KnowledgeHubLayout from "./pages/KnowledgeHubLayout";
import TempleDetailLayout from "./pages/TempleDetailLayout";
import AdminLayout from "./pages/AdminLayout";
import AuthLayout from "./pages/AuthLayout";
import UserDashboardLayout from "./pages/UserDashboardLayout";
import ContributeLayout from "./pages/ContributeLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<ProductsLayout />} />
            <Route path="/products/:productId" element={<ProductDetailLayout />} />
            <Route path="/cart" element={<CartLayout />} />
            <Route path="/checkout" element={<CheckoutLayout />} />
            <Route path="/darshan" element={<DarshanServicesLayout />} />
            <Route path="/darshan/book/:templeId" element={<DarshanBookingLayout />} />
            <Route path="/darshan/payment/:bookingId" element={<DarshanPaymentLayout />} />
            <Route path="/darshan/ticket/:bookingId" element={<DarshanTicketLayout />} />
            <Route path="/bhakthi" element={<BhakthiLayout />} />
            <Route path="/mantra" element={<MantraLayout />} />
            <Route path="/knowledge-hub" element={<KnowledgeHubLayout />} />
            <Route path="/knowledge-hub/:templeId" element={<TempleDetailLayout />} />
            <Route path="/dashboard" element={<UserDashboardLayout />} />
            <Route path="/contribute" element={<ContributeLayout />} />
            <Route path="/admin" element={<AdminLayout />} />
            <Route path="/auth" element={<AuthLayout />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
