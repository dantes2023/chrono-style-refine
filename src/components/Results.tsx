import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Result {
  id: string;
  title: string;
  description: string;
  detailed_description: string | null;
  image_url: string | null;
}

const Results = () => {
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const { data: results, isLoading } = useQuery({
    queryKey: ["results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Result[];
    },
  });

  if (!isLoading && (!results || results.length === 0)) return null;

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
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))
            : results?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedResult(item)}
                  className="group relative aspect-square overflow-hidden rounded-xl shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-primary-foreground font-heading font-semibold text-sm">
                      {item.title}
                    </span>
                  </div>
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

      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">{selectedResult?.title}</DialogTitle>
            <DialogDescription>{selectedResult?.description}</DialogDescription>
          </DialogHeader>
          {selectedResult?.image_url && (
            <img
              src={selectedResult.image_url}
              alt={selectedResult.title}
              className="w-full rounded-lg object-cover max-h-96"
            />
          )}
          {selectedResult?.detailed_description && (
            <div
              className="prose prose-sm max-w-none text-muted-foreground mt-2"
              dangerouslySetInnerHTML={{ __html: selectedResult.detailed_description }}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Results;
