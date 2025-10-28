import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import renovarLogo from "@/assets/renovar-logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-soft" : "bg-transparent"
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
              onClick={() => scrollToSection("about")}
              className="font-heading font-medium text-foreground hover:text-primary transition-colors"
            >
              Sobre Nós
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="font-heading font-medium text-foreground hover:text-primary transition-colors"
            >
              Serviços
            </button>
            <button
              onClick={() => scrollToSection("partners")}
              className="font-heading font-medium text-foreground hover:text-primary transition-colors"
            >
              Parceiros
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
                onClick={() => scrollToSection("about")}
                className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2"
              >
                Sobre Nós
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2"
              >
                Serviços
              </button>
              <button
                onClick={() => scrollToSection("partners")}
                className="font-heading font-medium text-foreground hover:text-primary transition-colors text-left py-2"
              >
                Parceiros
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
