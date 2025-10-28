import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";
import renovarLogo from "@/assets/renovar-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <img src={renovarLogo} alt="Renovar" className="h-12 mb-4 brightness-0 invert" />
            <p className="font-body text-white/80 mb-4">
              Líder em pesquisa e desenvolvimento de sementes de alta qualidade. 
              Soluções completas para o agronegócio brasileiro.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="bg-white/10 hover:bg-secondary hover:text-primary p-2 rounded-full transition-all"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-secondary hover:text-primary p-2 rounded-full transition-all"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-secondary hover:text-primary p-2 rounded-full transition-all"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-secondary hover:text-primary p-2 rounded-full transition-all"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2 font-body">
              <li>
                <button
                  onClick={() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })}
                  className="hover:text-secondary transition-colors"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                  className="hover:text-secondary transition-colors"
                >
                  Sobre Nós
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                  className="hover:text-secondary transition-colors"
                >
                  Serviços
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById("partners")?.scrollIntoView({ behavior: "smooth" })}
                  className="hover:text-secondary transition-colors"
                >
                  Parceiros
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Contato</h3>
            <ul className="space-y-2 font-body text-white/80">
              <li>(11) 3456-7890</li>
              <li>contato@renovar.agr.br</li>
              <li>Rodovia BR-101, Km 15<br />São Paulo, SP</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center font-body text-white/60">
          <p>&copy; {currentYear} Renovar Agrobusiness. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
