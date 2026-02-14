import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, ShoppingCart, Loader2 } from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  detailed_description: string | null;
  characteristics: unknown;
  technical_sheet: unknown;
  category: string;
  image_url: string | null;
  icon_name: string;
  price: number | null;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, totalItems, setIsOpen } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      setProduct(data);
      setIsLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center pt-20 gap-4">
          <p className="text-muted-foreground font-body text-lg">Produto não encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/loja")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à Loja
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <button
              onClick={() => navigate("/loja")}
              className="text-primary hover:underline font-heading text-sm flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar à Loja
            </button>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-muted-foreground text-sm">{product.category}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Image */}
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden shadow-soft">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ShoppingCart className="h-20 w-20" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <span className="text-sm font-heading font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full self-start mb-4">
                {product.category}
              </span>

              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                {product.title}
              </h1>

              {product.price != null && (
                <p className="font-heading text-2xl font-bold text-primary mb-4">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
                </p>
              )}

              <p className="font-body text-muted-foreground text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="bg-gradient-primary font-heading font-semibold"
                  onClick={() =>
                    addItem({
                      id: product.id,
                      title: product.title,
                      category: product.category,
                      image_url: product.image_url,
                      price: product.price ?? null,
                    })
                  }
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar ao Carrinho
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="relative"
                  onClick={() => setIsOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Ver Carrinho
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Detailed sections */}
          <div className="mt-16 space-y-12">
            {/* Descrição Geral */}
            {product.detailed_description && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">
                  Descrição Geral
                </h2>
                <p className="font-body text-muted-foreground leading-relaxed text-base">
                  {product.detailed_description}
                </p>
              </div>
            )}

            {/* Características */}
            {product.characteristics && typeof product.characteristics === "object" && !Array.isArray(product.characteristics) && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">
                  Características
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(product.characteristics as Record<string, string>).map(([key, value]) => (
                    <div key={key} className="flex justify-between bg-muted/50 rounded-xl px-4 py-3">
                      <span className="font-heading font-semibold text-sm text-foreground">{key}</span>
                      <span className="font-body text-sm text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ficha Técnica */}
            {product.technical_sheet && typeof product.technical_sheet === "object" && !Array.isArray(product.technical_sheet) && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">
                  Ficha Técnica
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(product.technical_sheet as Record<string, string>).map(([key, value]) => (
                    <div key={key} className="flex justify-between bg-muted/50 rounded-xl px-4 py-3">
                      <span className="font-heading font-semibold text-sm text-foreground">{key}</span>
                      <span className="font-body text-sm text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
