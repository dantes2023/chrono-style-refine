import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import StepCustomerData, { type CustomerForm } from "@/components/checkout/StepCustomerData";
import StepReview from "@/components/checkout/StepReview";
import StepPayment from "@/components/checkout/StepPayment";
import StepConfirmation from "@/components/checkout/StepConfirmation";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Nome é obrigatório").max(100),
  phone: z.string().trim().min(10, "Telefone inválido").max(20),
  email: z.string().trim().email("Email inválido").max(255).or(z.literal("")),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});

const Checkout = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CustomerForm>({ name: "", phone: "", email: "", address: "", city: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        const updatedForm = {
          name: data.full_name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          notes: "",
        };
        setForm(updatedForm);
        // Skip step 1 if name and phone are filled
        if (updatedForm.name && updatedForm.phone) {
          setStep(2);
        }
      }
    });
  }, [user]);

  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateAndNext = () => {
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setStep(2);
  };

  const handleSubmitOrder = async (paymentMethod: string) => {
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
          status: paymentMethod === "pending" ? "pending" : "awaiting_payment",
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
      setStep(4);
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao enviar pedido", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step < 4) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body text-lg mb-4">Seu carrinho está vazio.</p>
            <button onClick={() => navigate("/loja")} className="text-primary underline font-heading font-semibold">
              Voltar à Loja
            </button>
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
        <section className="bg-gradient-primary py-10 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Finalizar Pedido</h1>
        </section>

        <div className="container mx-auto px-4 lg:px-8 py-10">
          <CheckoutSteps currentStep={step} />

          {step === 1 && (
            <StepCustomerData form={form} errors={errors} onChange={handleChange} onNext={validateAndNext} />
          )}
          {step === 2 && (
            <StepReview
              items={items}
              form={form}
              subtotal={subtotal}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepPayment
              subtotal={subtotal}
              onBack={() => setStep(2)}
              onSubmitOrder={handleSubmitOrder}
              isSubmitting={isSubmitting}
            />
          )}
          {step === 4 && <StepConfirmation />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
