import agroceresLogo from "@/assets/agroceres-logo.png";
import cultivarLogo from "@/assets/cultivar-logo.png";
import agroNorteLogo from "@/assets/agro-norte-logo.jpg";

const Partners = () => {
  const partners = [
    { name: "Agroceres", logo: agroceresLogo },
    { name: "Cultivar", logo: cultivarLogo },
    { name: "Agro Norte", logo: agroNorteLogo },
  ];

  return (
    <section id="partners" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-heading font-semibold text-sm mb-6">
            Nossos Parceiros
          </div>
          
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Parcerias que Geram
            <span className="text-primary"> Resultados</span>
          </h2>
          
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Trabalhamos com as principais marcas do agronegócio brasileiro para 
            oferecer as melhores soluções aos nossos clientes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-8 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 flex items-center justify-center"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-full h-auto max-h-20 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto bg-gradient-primary rounded-2xl p-8 md:p-12 text-center shadow-elevated">
          <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Quer se Tornar um Parceiro?
          </h3>
          <p className="font-body text-lg text-white/90 mb-6">
            Junte-se a nós e faça parte da transformação do agronegócio brasileiro.
          </p>
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-secondary hover:bg-secondary/90 text-primary font-heading font-bold px-8 py-3 rounded-full transition-all hover:scale-105"
          >
            Entre em Contato
          </button>
        </div>
      </div>
    </section>
  );
};

export default Partners;
