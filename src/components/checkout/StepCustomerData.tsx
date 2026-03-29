import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

interface StepCustomerDataProps {
  form: CustomerForm;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

const StepCustomerData = ({ form, errors, onChange, onNext }: StepCustomerDataProps) => {
  return (
    <div className="max-w-lg mx-auto">
      <h2 className="font-heading text-xl font-bold mb-6">Seus Dados</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome completo *</Label>
          <Input id="name" value={form.name} onChange={(e) => onChange("name", e.target.value)} />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Telefone / WhatsApp *</Label>
          <Input id="phone" value={form.phone} onChange={(e) => onChange("phone", e.target.value)} />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input id="address" value={form.address} onChange={(e) => onChange("address", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" value={form.city} onChange={(e) => onChange("city", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" value={form.notes} onChange={(e) => onChange("notes", e.target.value)} rows={3} />
        </div>
        <Button onClick={onNext} className="w-full bg-gradient-primary font-heading font-semibold">
          Continuar para Revisão
        </Button>
      </div>
    </div>
  );
};

export default StepCustomerData;
