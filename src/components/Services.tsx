import { Card } from "@/components/ui/card";
import { Sprout, FlaskConical, TrendingUp, Handshake } from "lucide-react";
import seedsVariety from "@/assets/seeds-variety.jpg";
import pastureField from "@/assets/pasture-field.png";
import corn from "@/assets/corn.jpg";

const Services = () => {
  const services = [
    {
      icon: Sprout,
      title: "Sementes Certificadas",
      description: "Variedades de milho, soja e outras culturas com alta performance e adaptabilidade.",
      image: corn,
    },
    {
      icon: FlaskConical,
      title: "Pesquisa & Desenvolvimento",
      description: "Investimento contínuo em tecnologia e inovação para criar as melhores genéticas.",
      image: seedsVariety,
    },
    {
      icon: TrendingUp,
      title: "Pastagens de Qualidade",
      description: "Sementes forrageiras para pecuária de alta produtividade e rentabilidade.",
      image: pastureField,
    },
    {
      icon: Handshake,
      title: "Consultoria Técnica",
      description: "Acompanhamento especializado do plantio à colheita para maximizar resultados.",
      image: seedsVariety,
    },
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-heading font-semibold text-sm mb-6">
            Nossos Serviços
          </div>
          
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Soluções Completas para o
            <span className="text-primary"> Campo</span>
          </h2>
          
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Oferecemos um portfólio completo de produtos e serviços para atender 
            todas as necessidades do produtor rural moderno.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 border-0 bg-card"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="bg-secondary rounded-full p-3">
                    <service.icon className="text-primary" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="font-body text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
