import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import AboutPage from "./pages/About";
import StorePage from "./pages/Store";
import ProductDetailPage from "./pages/ProductDetail";
import CheckoutPage from "./pages/Checkout";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import BannersPage from "./pages/admin/Banners";
import ProductsPage from "./pages/admin/Products";
import PartnersPage from "./pages/admin/Partners";
import NewsPage from "./pages/admin/News";
import CategoriesPage from "./pages/admin/Categories";
import OrdersPage from "./pages/admin/Orders";
import CustomerLogin from "./pages/auth/Login";
import CustomerRegister from "./pages/auth/Register";
import MyAccountPage from "./pages/customer/MyAccount";

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
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/loja" element={<StorePage />} />
              <Route path="/loja/produto/:id" element={<ProductDetailPage />} />
              <Route path="/loja/checkout" element={<CheckoutPage />} />
              
              {/* Customer auth */}
              <Route path="/entrar" element={<CustomerLogin />} />
              <Route path="/cadastro" element={<CustomerRegister />} />
              <Route path="/minha-conta" element={<MyAccountPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
              <Route path="/admin/banners" element={<AdminLayout><BannersPage /></AdminLayout>} />
              <Route path="/admin/categorias" element={<AdminLayout><CategoriesPage /></AdminLayout>} />
              <Route path="/admin/produtos" element={<AdminLayout><ProductsPage /></AdminLayout>} />
              <Route path="/admin/parceiros" element={<AdminLayout><PartnersPage /></AdminLayout>} />
              <Route path="/admin/noticias" element={<AdminLayout><NewsPage /></AdminLayout>} />
              <Route path="/admin/pedidos" element={<AdminLayout><OrdersPage /></AdminLayout>} />
              
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
