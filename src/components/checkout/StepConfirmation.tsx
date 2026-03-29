import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const StepConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center max-w-md mx-auto py-8">
      <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
      <h1 className="font-heading text-3xl font-bold mb-2">Pedido Enviado!</h1>
      <p className="font-body text-muted-foreground mb-6">
        Seu pedido foi recebido com sucesso. Entraremos em contato em breve para confirmar os detalhes.
      </p>
      <div className="flex gap-3 justify-center">
        <Button onClick={() => navigate("/loja")} className="bg-gradient-primary font-heading font-semibold">
          Voltar à Loja
        </Button>
        <Button onClick={() => navigate("/minha-conta")} variant="outline">
          Meus Pedidos
        </Button>
      </div>
    </div>
  );
};

export default StepConfirmation;
