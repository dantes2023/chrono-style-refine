import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const HeroSlider = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["active-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

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
    } else if (link.startsWith("/")) {
      window.location.href = link;
    } else {
      window.location.href = link;
    }
  };

  if (isLoading) {
    return (
      <section id="home" className="relative min-h-screen bg-primary flex items-center justify-center">
        <div className="container mx-auto px-4 lg:px-8">
          <Skeleton className="h-16 w-2/3 mb-6 bg-white/10" />
          <Skeleton className="h-8 w-1/2 mb-8 bg-white/10" />
          <Skeleton className="h-12 w-48 bg-white/10" />
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-background">
      <div className="max-w-[1920px] mx-auto relative min-h-screen">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0 relative min-h-screen"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
              </div>

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
                    onClick={() => handleButtonClick(slide.button_link)}
                    className="bg-secondary hover:bg-secondary/90 text-primary font-heading font-bold text-lg group"
                  >
                    {slide.button_text}
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
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

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
      </div>
    </section>
  );
};

export default HeroSlider;
