import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Package, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  full_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_title: string;
  quantity: number;
  unit_price: number;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  delivered: { label: "Entregue", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const MyAccountPage = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({ full_name: "", phone: "", email: "", address: "", city: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderItems, setSelectedOrderItems] = useState<{ orderId: string; items: OrderItem[] } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (profileRes.data) {
        setProfile({
          full_name: profileRes.data.full_name || "",
          phone: profileRes.data.phone || "",
          email: profileRes.data.email || "",
          address: profileRes.data.address || "",
          city: profileRes.data.city || "",
        });
      }
      setOrders(ordersRes.data || []);
      setLoadingProfile(false);
    };
    fetchData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
    }).eq("user_id", user.id);
    setIsSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado!" });
    }
  };

  const viewOrderItems = async (orderId: string) => {
    if (selectedOrderItems?.orderId === orderId) {
      setSelectedOrderItems(null);
      return;
    }
    const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    setSelectedOrderItems({ orderId, items: data || [] });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setIsLoginLoading(false);
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Login realizado com sucesso!" });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8">
            <h1 className="font-heading text-2xl font-bold text-center mb-6">Entrar na sua conta</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="login-password">Senha</Label>
                <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary font-heading font-semibold" disabled={isLoginLoading}>
                {isLoginLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Entrando...</> : "Entrar"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Não tem conta?{" "}
              <Link to="/cadastro" className="text-primary font-semibold hover:underline">Cadastre-se</Link>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="bg-gradient-primary py-10 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground">Minha Conta</h1>
        </section>

        <div className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile" className="font-heading gap-2"><User className="h-4 w-4" />Perfil</TabsTrigger>
              <TabsTrigger value="orders" className="font-heading gap-2"><Package className="h-4 w-4" />Meus Pedidos</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Nome completo</Label>
                    <Input id="full_name" value={profile.full_name || ""} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" value={profile.phone || ""} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email || ""} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" value={profile.city || ""} onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" value={profile.address || ""} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveProfile} className="bg-gradient-primary font-heading font-semibold" disabled={isSaving}>
                    {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar Alterações"}
                  </Button>
                  <Button variant="outline" onClick={handleSignOut} className="font-heading gap-2">
                    <LogOut className="h-4 w-4" />Sair
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-body">Você ainda não fez nenhum pedido.</p>
                  <Button onClick={() => navigate("/loja")} variant="outline" className="mt-4 font-heading">Ir para a Loja</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const s = statusMap[order.status] || statusMap.pending;
                    const isExpanded = selectedOrderItems?.orderId === order.id;
                    return (
                      <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
                        <button
                          onClick={() => viewOrderItems(order.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-4 text-left">
                            <div>
                              <p className="font-heading font-semibold text-sm">
                                {new Date(order.created_at).toLocaleDateString("pt-BR")}
                              </p>
                              <p className="text-xs text-muted-foreground">Pedido #{order.id.slice(0, 8)}</p>
                            </div>
                            <Badge variant={s.variant}>{s.label}</Badge>
                          </div>
                          <span className="font-heading font-bold text-primary">{formatCurrency(order.total)}</span>
                        </button>
                        {isExpanded && selectedOrderItems && (
                          <div className="border-t px-4 py-3 space-y-2 bg-muted/20">
                            {selectedOrderItems.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.product_title} x{item.quantity}</span>
                                <span className="font-medium">{formatCurrency(item.unit_price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyAccountPage;
