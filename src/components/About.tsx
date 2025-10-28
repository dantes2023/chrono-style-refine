import { CheckCircle2 } from "lucide-react";
import aboutCollage from "@/assets/about-collage.png";

const About = () => {
  const features = [
    "Pesquisa e desenvolvimento de sementes certificadas",
    "Acompanhamento técnico especializado",
    "Tecnologia de ponta em melhoramento genético",
    "Compromisso com sustentabilidade",
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-heading font-semibold text-sm mb-6">
              Sobre a Renovar
            </div>
            
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Cultivando o Futuro do
              <span className="text-primary"> Agronegócio</span>
            </h2>
            
            <p className="font-body text-lg text-muted-foreground mb-6 leading-relaxed">
              A Renovar é líder em pesquisa e desenvolvimento de sementes de alta qualidade 
              para o mercado brasileiro. Com décadas de experiência, oferecemos soluções 
              completas que aumentam a produtividade e lucratividade do produtor rural.
            </p>
            
            <p className="font-body text-lg text-muted-foreground mb-8 leading-relaxed">
              Nossa missão é fornecer tecnologia de ponta em melhoramento genético, 
              garantindo sementes que se adaptam às diferentes regiões do Brasil e 
              proporcionam os melhores resultados no campo.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-1" size={24} />
                  <span className="font-body text-foreground text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={aboutCollage}
                alt="Agricultura e tecnologia"
                className="w-full h-auto"
              />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-golden rounded-full opacity-20 blur-3xl -z-10" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-primary rounded-full opacity-20 blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
