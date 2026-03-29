import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Partners = () => {
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["active-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

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

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[100px] rounded-2xl" />
            ))}
          </div>
        ) : partners.length === 0 ? null : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {partners.map((partner) => (
              <a
                key={partner.id}
                href={partner.website_url || undefined}
                target={partner.website_url ? "_blank" : undefined}
                rel={partner.website_url ? "noopener noreferrer" : undefined}
                className="group bg-card rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 flex items-center justify-center min-h-[100px]"
              >
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="w-full h-auto max-h-20 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        )}

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
