import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "A senha deve ter no mínimo 6 caracteres", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
        emailRedirectTo: window.location.origin,
      },
    });
    setIsLoading(false);

    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cadastro realizado!", description: "Verifique seu email para confirmar a conta." });
      navigate("/entrar");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8">
          <h1 className="font-heading text-2xl font-bold text-center mb-6">Criar Conta</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary font-heading font-semibold" disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cadastrando...</> : "Cadastrar"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Já tem conta?{" "}
            <Link to="/entrar" className="text-primary font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
