import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, QrCode, Banknote, Copy, CheckCircle2 } from "lucide-react";
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
  orderId?: string;
  customer?: { name: string; email?: string; phone?: string };
}

interface CardForm {
  number: string;
  holder_name: string;
  exp_month: string;
  exp_year: string;
  cvv: string;
}

interface PixData {
  qr_code_base64?: string | null;
  copy_paste?: string | null;
  expires_at?: string | null;
  payment_id?: string;
}

const StepPayment = ({ subtotal, onBack, onSubmitOrder, isSubmitting, orderId, customer }: StepPaymentProps) => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardForm, setCardForm] = useState<CardForm>({
    number: "",
    holder_name: "",
    exp_month: "",
    exp_year: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .rpc('get_payment_status')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSettings({
            gateway: data[0].gateway,
            is_active: data[0].is_active,
            config: {},
          } as unknown as PaymentSettings);
        }
        setLoading(false);
      });
  }, []);

  const gatewayActive = settings?.is_active && settings?.gateway !== "none";

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const validateCard = (): boolean => {
    const errors: Record<string, string> = {};
    const num = cardForm.number.replace(/\s/g, "");
    if (num.length < 13) errors.number = "Número do cartão inválido";
    if (!cardForm.holder_name.trim()) errors.holder_name = "Nome é obrigatório";
    if (!cardForm.exp_month || parseInt(cardForm.exp_month) < 1 || parseInt(cardForm.exp_month) > 12)
      errors.exp_month = "Mês inválido";
    if (!cardForm.exp_year || cardForm.exp_year.length < 2) errors.exp_year = "Ano inválido";
    if (cardForm.cvv.length < 3) errors.cvv = "CVV inválido";
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProcessPayment = async () => {
    if (!orderId || !customer) {
      // No order yet — submit order first, then process
      await onSubmitOrder(selectedMethod);
      return;
    }

    if (selectedMethod === "credit_card" && !validateCard()) return;

    setProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          method: selectedMethod,
          amount: subtotal,
          order_id: orderId,
          customer: {
            name: customer.name,
            email: customer.email || "",
            phone: customer.phone || "",
          },
          ...(selectedMethod === "credit_card" ? { card: cardForm } : {}),
        },
      });

      if (error) throw error;

      if (selectedMethod === "pix" && data) {
        setPixData({
          qr_code_base64: data.pix_qr_code_base64,
          copy_paste: data.pix_copy_paste,
          expires_at: data.expires_at,
          payment_id: data.payment_id,
        });
      } else if (data?.status === "approved") {
        setPaymentSuccess(true);
        toast({ title: "Pagamento aprovado!" });
        setTimeout(() => onSubmitOrder("paid"), 1500);
      } else {
        toast({
          title: "Pagamento em processamento",
          description: "Seu pagamento está sendo analisado.",
        });
        await onSubmitOrder(selectedMethod);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast({
        title: "Erro no pagamento",
        description: err?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCopyPix = async () => {
    if (pixData?.copy_paste) {
      await navigator.clipboard.writeText(pixData.copy_paste);
      setPixCopied(true);
      toast({ title: "Código PIX copiado!" });
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const handleSubmitNoGateway = async () => {
    await onSubmitOrder("pending");
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

      {/* Payment Success */}
      {paymentSuccess && (
        <div className="text-center py-10">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h3 className="font-heading font-bold text-xl text-primary">Pagamento Aprovado!</h3>
          <p className="text-muted-foreground mt-2">Redirecionando...</p>
        </div>
      )}

      {/* PIX QR Code Display */}
      {!paymentSuccess && pixData && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <QrCode className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-heading font-bold text-lg mb-4">Pague com PIX</h3>

            {pixData.qr_code_base64 && (
              <div className="flex justify-center mb-4">
                <img
                  src={pixData.qr_code_base64.startsWith("data:") ? pixData.qr_code_base64 : `data:image/png;base64,${pixData.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="w-48 h-48 rounded-lg border border-border"
                />
              </div>
            )}

            {pixData.copy_paste && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ou copie o código PIX:</p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={pixData.copy_paste}
                    className="text-xs font-mono"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyPix}>
                    {pixCopied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {pixData.expires_at && (
              <p className="text-xs text-muted-foreground mt-3">
                Válido até: {new Date(pixData.expires_at).toLocaleString("pt-BR")}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setPixData(null); setSelectedMethod(""); }} className="flex-1">
              Voltar
            </Button>
            <Button onClick={() => onSubmitOrder("pix")} className="flex-1 bg-gradient-primary font-heading font-semibold">
              Já fiz o pagamento
            </Button>
          </div>
        </div>
      )}

      {/* No Gateway Active */}
      {!paymentSuccess && !pixData && !gatewayActive && (
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
              onClick={handleSubmitNoGateway}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-primary font-heading font-semibold"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</> : "Confirmar Pedido"}
            </Button>
          </div>
        </div>
      )}

      {/* Gateway Active - Method Selection */}
      {!paymentSuccess && !pixData && gatewayActive && !selectedMethod && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">Selecione a forma de pagamento:</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedMethod("credit_card")}
              className="p-6 rounded-xl border-2 border-border hover:border-primary/50 text-center transition-all"
            >
              <CreditCard className="h-10 w-10 mx-auto mb-3 text-primary" />
              <span className="font-heading font-semibold">Cartão de Crédito</span>
            </button>
            <button
              onClick={() => setSelectedMethod("pix")}
              className="p-6 rounded-xl border-2 border-border hover:border-primary/50 text-center transition-all"
            >
              <QrCode className="h-10 w-10 mx-auto mb-3 text-primary" />
              <span className="font-heading font-semibold">PIX</span>
            </button>
          </div>
          <Button variant="outline" onClick={onBack} className="w-full">Voltar</Button>
        </div>
      )}

      {/* Credit Card Form */}
      {!paymentSuccess && !pixData && gatewayActive && selectedMethod === "credit_card" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-heading font-semibold">Dados do Cartão</h3>
            </div>

            <div>
              <Label htmlFor="card_number">Número do Cartão *</Label>
              <Input
                id="card_number"
                placeholder="0000 0000 0000 0000"
                value={cardForm.number}
                onChange={(e) => setCardForm({ ...cardForm, number: formatCardNumber(e.target.value) })}
                maxLength={19}
              />
              {cardErrors.number && <p className="text-xs text-destructive mt-1">{cardErrors.number}</p>}
            </div>

            <div>
              <Label htmlFor="card_holder">Nome no Cartão *</Label>
              <Input
                id="card_holder"
                placeholder="NOME COMO NO CARTÃO"
                value={cardForm.holder_name}
                onChange={(e) => setCardForm({ ...cardForm, holder_name: e.target.value.toUpperCase() })}
              />
              {cardErrors.holder_name && <p className="text-xs text-destructive mt-1">{cardErrors.holder_name}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="exp_month">Mês *</Label>
                <Input
                  id="exp_month"
                  placeholder="MM"
                  maxLength={2}
                  value={cardForm.exp_month}
                  onChange={(e) => setCardForm({ ...cardForm, exp_month: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                />
                {cardErrors.exp_month && <p className="text-xs text-destructive mt-1">{cardErrors.exp_month}</p>}
              </div>
              <div>
                <Label htmlFor="exp_year">Ano *</Label>
                <Input
                  id="exp_year"
                  placeholder="AA"
                  maxLength={2}
                  value={cardForm.exp_year}
                  onChange={(e) => setCardForm({ ...cardForm, exp_year: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                />
                {cardErrors.exp_year && <p className="text-xs text-destructive mt-1">{cardErrors.exp_year}</p>}
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  maxLength={4}
                  type="password"
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                />
                {cardErrors.cvv && <p className="text-xs text-destructive mt-1">{cardErrors.cvv}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSelectedMethod("")} className="flex-1">
              Voltar
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={processingPayment || isSubmitting}
              className="flex-1 bg-gradient-primary font-heading font-semibold"
            >
              {processingPayment ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processando...</>
              ) : (
                `Pagar ${formatCurrency(subtotal)}`
              )}
            </Button>
          </div>
        </div>
      )}

      {/* PIX - Trigger Payment */}
      {!paymentSuccess && !pixData && gatewayActive && selectedMethod === "pix" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-heading font-bold text-lg mb-2">Pagamento via PIX</h3>
            <p className="text-sm text-muted-foreground">
              Ao clicar em "Gerar PIX", será gerado um QR Code e um código copia e cola para você realizar o pagamento.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSelectedMethod("")} className="flex-1">
              Voltar
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={processingPayment || isSubmitting}
              className="flex-1 bg-gradient-primary font-heading font-semibold"
            >
              {processingPayment ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Gerando PIX...</>
              ) : (
                "Gerar PIX"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepPayment;
