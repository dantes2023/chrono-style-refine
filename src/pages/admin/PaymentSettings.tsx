import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Save } from "lucide-react";

interface PaymentConfig {
  id: string;
  gateway: string;
  is_active: boolean;
  config: Record<string, string>;
}

const gateways = [
  { value: "none", label: "Nenhum (pagamento na entrega)" },
  { value: "mercadopago", label: "Mercado Pago" },
  { value: "gerencianet", label: "Gerencianet / Efí" },
  { value: "pagseguro", label: "PagSeguro" },
  { value: "stripe", label: "Stripe" },
  { value: "asaas", label: "Asaas" },
];

const gatewayFields: Record<string, { key: string; label: string; placeholder: string }[]> = {
  mercadopago: [
    { key: "access_token", label: "Access Token", placeholder: "APP_USR-..." },
    { key: "public_key", label: "Public Key", placeholder: "APP_USR-..." },
  ],
  gerencianet: [
    { key: "client_id", label: "Client ID", placeholder: "Client_Id_..." },
    { key: "client_secret", label: "Client Secret", placeholder: "Client_Secret_..." },
    { key: "pix_key", label: "Chave PIX", placeholder: "sua-chave-pix" },
  ],
  pagseguro: [
    { key: "token", label: "Token", placeholder: "Token de acesso" },
    { key: "email", label: "Email da conta", placeholder: "email@pagseguro.com" },
  ],
  stripe: [
    { key: "secret_key", label: "Secret Key", placeholder: "sk_live_..." },
    { key: "publishable_key", label: "Publishable Key", placeholder: "pk_live_..." },
  ],
  asaas: [
    { key: "api_key", label: "API Key", placeholder: "$aact_..." },
  ],
};

const PaymentSettingsPage = () => {
  const [settings, setSettings] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from("payment_settings")
      .select("*")
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setSettings(data as unknown as PaymentConfig);
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("payment_settings")
        .update({
          gateway: settings.gateway,
          is_active: settings.is_active,
          config: settings.config as any,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", settings.id);

      if (error) throw error;
      toast({ title: "Configurações salvas!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      config: { ...settings.config, [key]: value },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) return <p>Erro ao carregar configurações.</p>;

  const fields = gatewayFields[settings.gateway] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" /> Configurações de Pagamento
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure o gateway de pagamento para receber pagamentos online.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Pagamento Online Ativo</Label>
            <p className="text-sm text-muted-foreground">Habilita ou desabilita o pagamento online no checkout.</p>
          </div>
          <Switch
            checked={settings.is_active}
            onCheckedChange={(checked) => setSettings({ ...settings, is_active: checked })}
          />
        </div>

        <div>
          <Label>Gateway de Pagamento</Label>
          <Select
            value={settings.gateway}
            onValueChange={(val) =>
              setSettings({ ...settings, gateway: val, config: {} })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gateways.map((g) => (
                <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {fields.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-heading font-semibold">Credenciais do Gateway</h3>
            {fields.map((field) => (
              <div key={field.key}>
                <Label>{field.label}</Label>
                <Input
                  type="password"
                  placeholder={field.placeholder}
                  value={settings.config[field.key] || ""}
                  onChange={(e) => updateConfig(field.key, e.target.value)}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary font-heading font-semibold">
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : <><Save className="h-4 w-4 mr-2" />Salvar Configurações</>}
        </Button>
      </div>
    </div>
  );
};

export default PaymentSettingsPage;
