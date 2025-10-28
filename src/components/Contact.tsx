import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-heading font-semibold text-sm mb-6">
            Fale Conosco
          </div>
          
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Vamos Conversar sobre o seu
            <span className="text-primary"> Projeto</span>
          </h2>
          
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Entre em contato conosco e descubra como podemos ajudar a aumentar 
            a produtividade da sua lavoura.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Phone className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground text-lg mb-1">Telefone</h3>
                <p className="font-body text-muted-foreground">(11) 3456-7890</p>
                <p className="font-body text-muted-foreground">(11) 98765-4321</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Mail className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground text-lg mb-1">E-mail</h3>
                <p className="font-body text-muted-foreground">contato@renovar.agr.br</p>
                <p className="font-body text-muted-foreground">vendas@renovar.agr.br</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-full p-3">
                <MapPin className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground text-lg mb-1">Endereço</h3>
                <p className="font-body text-muted-foreground">
                  Rodovia BR-101, Km 15<br />
                  São Paulo, SP - Brasil
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                name="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
                required
                className="font-body"
              />
            </div>
            <div>
              <Input
                name="email"
                type="email"
                placeholder="Seu e-mail"
                value={formData.email}
                onChange={handleChange}
                required
                className="font-body"
              />
            </div>
            <div>
              <Input
                name="phone"
                placeholder="Seu telefone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="font-body"
              />
            </div>
            <div>
              <Textarea
                name="message"
                placeholder="Sua mensagem"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="font-body"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-primary font-heading font-bold text-lg group"
            >
              Enviar Mensagem
              <Send className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
