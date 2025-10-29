import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import renovarLogo from "@/assets/renovar-logo.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const productCategories = [
    { name: "Sementes de Milho", id: "products", category: "milho" },
    { name: "Sementes de Soja", id: "products", category: "soja" },
    { name: "Sementes Forrageiras", id: "products", category: "forrageiras" },
    { name: "Sementes Especiais", id: "products", category: "especiais" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background/95 backdrop-blur-md ${
        isScrolled ? "shadow-soft" : ""
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <img 
            src={renovarLogo} 
            alt="Renovar Agrobusiness" 
            className="h-12 w-auto"
          />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className="font-heading font-medium text-foreground hover:text-primary transition-colors"
            >
              Início
            </button>
            <button
              onClick={handleAboutClick}
              className="font-heading font-medium text-foreground hover:text-primary transition-colors"
            >
              Sobre Nós
            </button>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="font-heading font-medium text-foreground hover:text-primary bg-transparent">
                    Produtos
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4 bg-background">
                      <div className="grid gap-3">
                        {productCategories.map((product) => (
                          <button
                            key={product.category}
                            onClick={() => scrollToSection(product.id)}
                            className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left"
                          >
                            <div className="font-heading text-sm font-medium leading-none">
                              {product.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <button
              onClick={() => scrollToSection("results")}
              className="font-heading font-medium text-foreground hover:text-primary transition-colors"
            >
              Resultados
            </button>
            <button
              onClick={() => scrollToSection("partners")}
              className="font-heading font-medium text-foreground hover:text-primary transition-colors"
            >
              Parceiros
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="font-heading font-medium text-foreground hover:text-primary transition-colors"
            >
              Loja Virtual
            </button>
            <Button
              onClick={() => scrollToSection("contact")}
              className="bg-gradient-primary font-heading font-semibold"
            >
              Contato
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden pb-6 animate-fade-in">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("home")}
                className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2"
              >
                Início
              </button>
              <button
                onClick={handleAboutClick}
                className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2"
              >
                Sobre Nós
              </button>
              
              <div>
                <button
                  onClick={() => setIsProductsOpen(!isProductsOpen)}
                  className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2 w-full flex items-center justify-between"
                >
                  Produtos
                  <ChevronDown className={`transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} size={20} />
                </button>
                {isProductsOpen && (
                  <div className="ml-4 mt-2 space-y-2">
                    {productCategories.map((product) => (
                      <button
                        key={product.category}
                        onClick={() => scrollToSection(product.id)}
                        className="block font-body text-sm text-muted-foreground hover:text-primary transition-colors text-left py-2"
                      >
                        {product.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => scrollToSection("results")}
                className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2"
              >
                Resultados
              </button>
              <button
                onClick={() => scrollToSection("partners")}
                className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2"
              >
                Parceiros
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2"
              >
                Loja Virtual
              </button>
              <Button
                onClick={() => scrollToSection("contact")}
                className="bg-gradient-primary font-heading font-semibold w-full"
              >
                Contato
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
