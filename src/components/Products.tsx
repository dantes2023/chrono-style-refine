import { Card } from "@/components/ui/card";
import { Sprout, FlaskConical, TrendingUp, Handshake } from "lucide-react";
import seedsVariety from "@/assets/seeds-variety.jpg";
import pastureField from "@/assets/pasture-field.png";
import corn from "@/assets/corn.jpg";

const Products = () => {
  const productCategories = [
    {
      icon: Sprout,
      title: "Sementes de Milho",
      description: "Híbridos de alta performance com genética superior para máxima produtividade.",
      image: corn,
      category: "milho"
    },
    {
      icon: FlaskConical,
      title: "Sementes de Soja",
      description: "Variedades adaptadas para diferentes regiões com resistência a doenças.",
      image: seedsVariety,
      category: "soja"
    },
    {
      icon: TrendingUp,
      title: "Sementes Forrageiras",
      description: "Pastagens de alta qualidade para pecuária sustentável e produtiva.",
      image: pastureField,
      category: "forrageiras"
    },
    {
      icon: Handshake,
      title: "Sementes Especiais",
      description: "Cultivares para horticultura, fruticultura e culturas alternativas.",
      image: seedsVariety,
      category: "especiais"
    },
  ];

  return (
    <section id="products" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-heading font-semibold text-sm mb-6">
            Nossos Produtos
          </div>
          
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Sementes de Alta
            <span className="text-primary"> Performance</span>
          </h2>
          
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Oferecemos um portfólio completo de sementes certificadas para atender 
            todas as necessidades do produtor rural moderno.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productCategories.map((product, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 border-0 bg-card"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="bg-secondary rounded-full p-3">
                    <product.icon className="text-primary" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                  {product.title}
                </h3>
                <p className="font-body text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
