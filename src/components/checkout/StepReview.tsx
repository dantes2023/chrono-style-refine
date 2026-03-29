import { CartItem } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CustomerForm } from "./StepCustomerData";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

interface StepReviewProps {
  items: CartItem[];
  form: CustomerForm;
  subtotal: number;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const StepReview = ({ items, form, subtotal, updateQuantity, removeItem, onBack, onNext }: StepReviewProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-heading text-xl font-bold mb-6">Revisão do Pedido</h2>

      {/* Customer info summary */}
      <div className="bg-muted/50 rounded-xl p-4 mb-6">
        <h3 className="font-heading font-semibold text-sm mb-2">Dados do Cliente</h3>
        <div className="text-sm space-y-1 text-muted-foreground">
          <p><strong className="text-foreground">Nome:</strong> {form.name}</p>
          <p><strong className="text-foreground">Telefone:</strong> {form.phone}</p>
          {form.email && <p><strong className="text-foreground">Email:</strong> {form.email}</p>}
          {form.address && <p><strong className="text-foreground">Endereço:</strong> {form.address}</p>}
          {form.city && <p><strong className="text-foreground">Cidade:</strong> {form.city}</p>}
          {form.notes && <p><strong className="text-foreground">Obs:</strong> {form.notes}</p>}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 p-3 bg-card border border-border rounded-xl">
            {item.image_url && (
              <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-semibold text-sm truncate">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.category}</p>
              {item.price != null && (
                <p className="text-xs font-semibold text-primary">{formatCurrency(item.price)} /un</p>
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
      </div>

      <div className="flex justify-between items-center pt-4 border-t mb-6">
        <span className="font-heading text-lg font-bold">Total</span>
        <span className="font-heading text-2xl font-bold text-primary">{formatCurrency(subtotal)}</span>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Voltar</Button>
        <Button onClick={onNext} className="flex-1 bg-gradient-primary font-heading font-semibold">
          Ir para Pagamento
        </Button>
      </div>
    </div>
  );
};

export default StepReview;
