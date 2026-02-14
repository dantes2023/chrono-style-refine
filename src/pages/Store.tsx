import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  icon_name: string;
}

const categories = [
  "Todos",
  "Sementes",
  "Fertilizantes",
  "Defensivos",
  "Corretivos de Solo",
  "Pastagens em geral",
];

const Store = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const { addItem, totalItems, setIsOpen } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      setProducts(data || []);
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchCategory = activeCategory === "Todos" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="bg-gradient-primary py-16 text-center">
          <div className="container mx-auto px-4">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Loja Virtual
            </h1>
            <p className="font-body text-lg text-white/90 max-w-2xl mx-auto">
              Explore nosso catálogo de produtos e monte seu pedido.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 py-12">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full font-heading text-sm font-semibold transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                className="relative"
                onClick={() => setIsOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-body text-lg">
                Nenhum produto encontrado.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingCart className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-xs font-heading font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full self-start mb-3">
                      {product.category}
                    </span>
                    <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                      {product.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground flex-1 line-clamp-3">
                      {product.description}
                    </p>
                    <Button
                      className="mt-4 w-full bg-gradient-primary font-heading font-semibold"
                      onClick={() =>
                        addItem({
                          id: product.id,
                          title: product.title,
                          category: product.category,
                          image_url: product.image_url,
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Store;
