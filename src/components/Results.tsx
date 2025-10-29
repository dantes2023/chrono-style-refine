import corn from "@/assets/corn.jpg";
import seedsVariety from "@/assets/seeds-variety.jpg";
import pastureField from "@/assets/pasture-field.png";
import tractorSunset from "@/assets/tractor-sunset.jpg";

const Results = () => {
  const workImages = [
    { image: corn, alt: "Cultivo de milho" },
    { image: seedsVariety, alt: "Variedades de sementes" },
    { image: pastureField, alt: "Pastagem de qualidade" },
    { image: tractorSunset, alt: "Trabalho no campo" },
    { image: corn, alt: "Agricultura moderna" },
    { image: seedsVariety, alt: "Sementes certificadas" },
    { image: pastureField, alt: "Pecuária sustentável" },
    { image: tractorSunset, alt: "Produtividade agrícola" },
  ];

  return (
    <section id="results" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-heading font-semibold text-sm mb-6">
            Trabalho de Campo
          </div>
          
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Nossos
            <span className="text-primary"> Resultados</span>
          </h2>
          
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            As principais notícias, eventos e temas do Agronegócio você encontra aqui!
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {workImages.map((item, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={item.image}
                alt={item.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold px-8 py-3 rounded-full transition-all hover:scale-105"
          >
            Faça Parte dos Resultados
          </button>
        </div>
      </div>
    </section>
  );
};

export default Results;
