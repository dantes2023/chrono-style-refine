import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, QrCode, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

interface PaymentSettings {
  gateway: string;
  is_active: boolean;
  config: Record<string, any>;
}

interface StepPaymentProps {
  subtotal: number;
  onBack: () => void;
  onSubmitOrder: (paymentMethod: string) => Promise<void>;
  isSubmitting: boolean;
}

const StepPayment = ({ subtotal, onBack, onSubmitOrder, isSubmitting }: StepPaymentProps) => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>("pending");
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from("payment_settings")
      .select("*")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setSettings(data as unknown as PaymentSettings);
        }
        setLoading(false);
      });
  }, []);

  const gatewayActive = settings?.is_active && settings?.gateway !== "none";

  const handleSubmit = async () => {
    try {
      if (gatewayActive) {
        // In future, integrate with the configured gateway
        // For now, submit order with payment method info
        await onSubmitOrder(selectedMethod);
      } else {
        // No payment gateway – just submit the order
        await onSubmitOrder("pending");
      }
    } catch {
      toast({ title: "Erro no pagamento", description: "Tente novamente.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="font-heading text-xl font-bold mb-6">Pagamento</h2>

      <div className="bg-muted/50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-heading font-semibold">Total do Pedido</span>
          <span className="font-heading text-2xl font-bold text-primary">{formatCurrency(subtotal)}</span>
        </div>
      </div>

      {!gatewayActive ? (
        <div className="space-y-4">
          <div className="bg-accent/30 rounded-xl p-6 text-center">
            <Banknote className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-heading font-bold text-lg mb-2">Pagamento na Entrega</h3>
            <p className="text-sm text-muted-foreground">
              O pagamento será combinado diretamente com a equipe após a confirmação do pedido.
              Aceitamos PIX, dinheiro e cartão.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">Voltar</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-primary font-heading font-semibold"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</> : "Confirmar Pedido"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">Selecione a forma de pagamento:</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedMethod("credit_card")}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                selectedMethod === "credit_card"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
              <span className="font-heading font-semibold text-sm">Cartão</span>
            </button>
            <button
              onClick={() => setSelectedMethod("pix")}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                selectedMethod === "pix"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <QrCode className="h-8 w-8 mx-auto mb-2 text-primary" />
              <span className="font-heading font-semibold text-sm">PIX</span>
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onBack} className="flex-1">Voltar</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedMethod === "pending"}
              className="flex-1 bg-gradient-primary font-heading font-semibold"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processando...</> : "Pagar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepPayment;
