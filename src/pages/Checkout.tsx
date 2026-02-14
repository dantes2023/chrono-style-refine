import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Nome é obrigatório").max(100),
  phone: z.string().trim().min(10, "Telefone inválido").max(20),
  email: z.string().trim().email("Email inválido").max(255).or(z.literal("")),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const Checkout = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill form from profile if logged in
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setForm((f) => ({
          ...f,
          name: data.full_name || f.name,
          phone: data.phone || f.phone,
          email: data.email || f.email,
          address: data.address || f.address,
          city: data.city || f.city,
        }));
      }
    });
  }, [user]);

  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: form.name.trim(),
          customer_phone: form.phone.trim(),
          customer_email: form.email.trim() || null,
          customer_address: form.address?.trim() || null,
          customer_city: form.city?.trim() || null,
          customer_notes: form.notes?.trim() || null,
          total: subtotal,
          user_id: user?.id || null,
        } as any)
        .select("id")
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_title: item.title,
        quantity: item.quantity,
        unit_price: item.price || 0,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      setOrderPlaced(true);
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao enviar pedido", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-heading text-3xl font-bold mb-2">Pedido Enviado!</h1>
            <p className="font-body text-muted-foreground mb-6">
              Seu pedido foi recebido com sucesso. Entraremos em contato em breve para confirmar os detalhes.
            </p>
            <Button onClick={() => navigate("/loja")} className="bg-gradient-primary font-heading font-semibold">
              Voltar à Loja
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="bg-gradient-primary py-12 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Finalizar Pedido</h1>
        </section>

        <div className="container mx-auto px-4 lg:px-8 py-10">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-body text-lg mb-4">Seu carrinho está vazio.</p>
              <Button onClick={() => navigate("/loja")} variant="outline">Voltar à Loja</Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Order Summary */}
              <div className="lg:col-span-3 space-y-4">
                <h2 className="font-heading text-xl font-bold mb-4">Resumo do Pedido</h2>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-4 bg-card border border-border rounded-xl">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="w-20 h-20 object-cover rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-semibold truncate">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      {item.price != null && (
                        <p className="text-sm font-semibold text-primary mt-1">{formatCurrency(item.price)} /un</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-destructive" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        {item.price != null && (
                          <span className="font-heading font-bold text-sm">{formatCurrency(item.price * item.quantity)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-heading text-lg font-bold">Total</span>
                  <span className="font-heading text-2xl font-bold text-primary">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              {/* Customer Form */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                  <h2 className="font-heading text-xl font-bold mb-4">Seus Dados</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                      <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                      {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input id="city" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea id="notes" value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-primary font-heading font-semibold" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</> : "Enviar Pedido"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
