import { Card } from "@/components/ui/card";
import { Sprout, FlaskConical, TrendingUp, Handshake, Leaf, Wheat, TreePine, LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, LucideIcon> = {
  Sprout,
  FlaskConical,
  TrendingUp,
  Handshake,
  Leaf,
  Wheat,
  TreePine,
};

const Products = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["homepage-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

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

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden border-0 bg-card">
                <Skeleton className="h-48 w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const IconComponent = iconMap[product.icon_name] || Sprout;
              return (
                <Card
                  key={product.id}
                  className="group overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 border-0 bg-card"
                >
                  <div className="relative h-48 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <IconComponent className="text-muted-foreground" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-secondary rounded-full p-3">
                        <IconComponent className="text-primary" size={24} />
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
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;
