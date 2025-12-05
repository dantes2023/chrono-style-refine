import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import tractorSunset from "@/assets/tractor-sunset.jpg";
import cornField from "@/assets/corn.jpg";
import pastureField from "@/assets/pasture-field.png";
import seedsVariety from "@/assets/seeds-variety.jpg";

interface Slide {
  id: number;
  image: string;
  title: string;
  highlight: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: tractorSunset,
    title: "Sementes de Alta",
    highlight: "Qualidade",
    description: "Líder em pesquisa e desenvolvimento de sementes. Soluções completas para maximizar a produtividade do seu agronegócio.",
    buttonText: "Compre em nossa Loja Virtual",
    buttonLink: "#contact",
  },
  {
    id: 2,
    image: cornField,
    title: "Tecnologia e",
    highlight: "Inovação",
    description: "Variedades desenvolvidas com a mais alta tecnologia para garantir os melhores resultados na sua lavoura.",
    buttonText: "Conheça Nossos Produtos",
    buttonLink: "#products",
  },
  {
    id: 3,
    image: pastureField,
    title: "Pastagens de",
    highlight: "Alta Performance",
    description: "Sementes forrageiras selecionadas para maximizar a produtividade do seu rebanho.",
    buttonText: "Saiba Mais",
    buttonLink: "#about",
  },
  {
    id: 4,
    image: seedsVariety,
    title: "Variedades",
    highlight: "Premium",
    description: "Amplo portfólio de sementes para atender todas as necessidades do produtor rural.",
    buttonText: "Ver Catálogo",
    buttonLink: "#products",
  },
  {
    id: 5,
    image: tractorSunset,
    title: "Parceria que",
    highlight: "Gera Resultados",
    description: "Mais de 25 anos de experiência no mercado agrícola, sempre ao lado do produtor.",
    buttonText: "Fale Conosco",
    buttonLink: "#contact",
  },
];

const HeroSlider = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const autoplayPlugin = Autoplay({
    delay: 5000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [autoplayPlugin]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    if (isPlaying) {
      autoplay.stop();
    } else {
      autoplay.play();
    }
    setIsPlaying(!isPlaying);
  }, [emblaApi, isPlaying]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleButtonClick = (link: string) => {
    if (link.startsWith("#")) {
      document.getElementById(link.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = link;
    }
  };

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0 relative min-h-screen"
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
              </div>

              {/* Content */}
              <div className="container mx-auto px-4 lg:px-8 relative z-10 py-32 h-full flex items-center">
                <div className="max-w-3xl animate-fade-in-up">
                  <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                    {slide.title}
                    <span className="bg-gradient-golden bg-clip-text text-transparent"> {slide.highlight}</span>
                  </h1>

                  <p className="font-body text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                    {slide.description}
                  </p>

                  <Button
                    size="lg"
                    onClick={() => handleButtonClick(slide.buttonLink)}
                    className="bg-secondary hover:bg-secondary/90 text-primary font-heading font-bold text-lg group"
                  >
                    {slide.buttonText}
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? "bg-secondary w-8"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleAutoplay}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            aria-label="Próximo slide"
          >
            <ChevronRight size={20} />
          </Button>
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

export default HeroSlider;
