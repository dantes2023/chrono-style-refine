import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import renovarLogo from "@/assets/renovar-logo.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
}

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCats = async () => {
      const [catRes, subRes] = await Promise.all([
        supabase.from("categories").select("*").order("display_order"),
        supabase.from("subcategories").select("*").order("display_order"),
      ]);
      setCategories(catRes.data || []);
      setSubcategories(subRes.data || []);
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const handleAboutClick = () => {
    if (location.pathname === "/sobre") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/sobre");
    }
    setIsMobileMenuOpen(false);
  };

  const goToStore = (category?: string, subcategoryId?: string) => {
    const params = new URLSearchParams();
    if (category) params.set("categoria", category);
    if (subcategoryId) params.set("sub", subcategoryId);
    navigate(`/loja${params.toString() ? `?${params}` : ""}`);
    setIsMobileMenuOpen(false);
  };

  const linkClass = "font-heading font-medium text-sm text-foreground hover:text-primary hover:font-bold hover:scale-110 transition-all duration-300";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background/95 backdrop-blur-md ${isScrolled ? "shadow-soft" : ""}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <img src={renovarLogo} alt="Renovar Agrobusiness" className="h-12 w-auto" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("home")} className={linkClass}>Início</button>
            <button onClick={handleAboutClick} className={linkClass}>Sobre Nós</button>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={`${linkClass} bg-transparent`}>
                    Produtos
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[260px] p-2 bg-background">
                      {categories.map((cat) => {
                        const subs = subcategories.filter((s) => s.category_id === cat.id);
                        return (
                          <div key={cat.id} className="relative group/cat">
                            <button
                              onClick={() => goToStore(cat.name)}
                              className="w-full text-left rounded-md px-3 py-2.5 font-heading text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between"
                            >
                              {cat.name}
                              {subs.length > 0 && <ChevronDown className="h-3 w-3 -rotate-90" />}
                            </button>
                            {subs.length > 0 && (
                              <div className="absolute left-full top-0 ml-1 hidden group-hover/cat:block z-50">
                                <div className="w-[220px] bg-background border rounded-md shadow-lg p-2">
                                  {subs.map((sub) => (
                                    <button
                                      key={sub.id}
                                      onClick={() => goToStore(cat.name, sub.id)}
                                      className="block w-full text-left rounded-md px-3 py-2 text-xs font-heading text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                      {sub.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <button onClick={() => scrollToSection("results")} className={linkClass}>Resultados</button>
            <button onClick={() => scrollToSection("partners")} className={linkClass}>Parceiros</button>
            <button onClick={() => navigate("/loja")} className={linkClass}>Loja Virtual</button>
            <Button onClick={() => scrollToSection("contact")} className="bg-gradient-primary font-heading font-semibold">Contato</Button>
          </nav>

          <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden pb-6 animate-fade-in">
            <div className="flex flex-col gap-4">
              <button onClick={() => scrollToSection("home")} className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2">Início</button>
              <button onClick={handleAboutClick} className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2">Sobre Nós</button>

              {/* Mobile categories */}
              {categories.map((cat) => {
                const subs = subcategories.filter((s) => s.category_id === cat.id);
                const isExpanded = expandedCat === cat.id;
                return (
                  <div key={cat.id}>
                    <button
                      onClick={() => subs.length > 0 ? setExpandedCat(isExpanded ? null : cat.id) : goToStore(cat.name)}
                      className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2 w-full flex items-center justify-between"
                    >
                      {cat.name}
                      {subs.length > 0 && <ChevronDown className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} size={20} />}
                    </button>
                    {isExpanded && subs.length > 0 && (
                      <div className="ml-4 space-y-1">
                        <button onClick={() => goToStore(cat.name)} className="block text-sm text-muted-foreground hover:text-primary py-1">Ver todos</button>
                        {subs.map((sub) => (
                          <button key={sub.id} onClick={() => goToStore(cat.name, sub.id)} className="block text-sm text-muted-foreground hover:text-primary py-1">
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <button onClick={() => scrollToSection("results")} className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2">Resultados</button>
              <button onClick={() => scrollToSection("partners")} className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2">Parceiros</button>
              <button onClick={() => { navigate("/loja"); setIsMobileMenuOpen(false); }} className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2">Loja Virtual</button>
              <Button onClick={() => scrollToSection("contact")} className="bg-gradient-primary font-heading font-semibold w-full">Contato</Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
