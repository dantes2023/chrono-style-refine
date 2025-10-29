import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Award, Users } from "lucide-react";
import tractorSunset from "@/assets/tractor-sunset.jpg";

const Hero = () => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={tractorSunset}
          alt="Agricultura moderna"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 py-32">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Leaf className="text-secondary" size={20} />
            <span className="font-body text-sm font-semibold text-white">
              Inovação em Agronegócio
            </span>
          </div>

          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Sementes de Alta
            <span className="bg-gradient-golden bg-clip-text text-transparent"> Qualidade</span>
          </h1>

          <p className="font-body text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Líder em pesquisa e desenvolvimento de sementes. Soluções completas 
            para maximizar a produtividade do seu agronegócio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button
              size="lg"
              onClick={scrollToContact}
              className="bg-secondary hover:bg-secondary/90 text-primary font-heading font-bold text-lg group"
            >
              Compre em nossa Loja Virtual
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Button>
            <Button
              size="lg"
              variant="hero"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              className="font-heading font-bold text-lg"
            >
              Conheça Mais
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="bg-secondary rounded-full p-3">
                <Award className="text-primary" size={24} />
              </div>
              <div>
                <div className="font-heading text-2xl font-bold text-white">25+</div>
                <div className="font-body text-sm text-white/80">Anos de Experiência</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="bg-secondary rounded-full p-3">
                <Leaf className="text-primary" size={24} />
              </div>
              <div>
                <div className="font-heading text-2xl font-bold text-white">100+</div>
                <div className="font-body text-sm text-white/80">Variedades</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="bg-secondary rounded-full p-3">
                <Users className="text-primary" size={24} />
              </div>
              <div>
                <div className="font-heading text-2xl font-bold text-white">1000+</div>
                <div className="font-body text-sm text-white/80">Clientes Satisfeitos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
