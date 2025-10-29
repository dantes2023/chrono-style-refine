import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sprout, Target, Users, Heart, Award } from "lucide-react";
import aboutCollage from "@/assets/about-collage.png";

const AboutPage = () => {
  const sections = [
    {
      icon: Sprout,
      title: "Raízes",
      content: [
        "Em 20 de Julho de 2005, em busca de um futuro melhor, Rosimar F. Oliveira e seu irmão Guilemar F. Oliveira, partiram de Goiás em direção ao Piauí, deixando para trás parentes e amigos. Na bagagem algumas experiências de vida e um sonho: o crescimento econômico, social e cultural, com muita determinação, encarando novos desafios e galgando novas oportunidades.",
        "Trabalhou em várias empresas, enfrentou a crise no setor e dificuldades profissionais, nesse período seu irmão Guilemar retornou para Goiás, onde permaneceu com a família para dar o suporte necessário. Enquanto Rosimar continuou com muita perseverança, e acreditando no potencial agrícola da região.",
        "Em 09 de maio de 2010 conheceu sua esposa, um ano depois, realizou um grande sonho a abertura da sua própria empresa: Cultivar Agrobusiness, tornado realidade todo o projeto de vida no Piauí."
      ]
    },
    {
      icon: Award,
      title: "Histórico",
      content: [
        "Fundada em 03 de Maio de 2011, por Rosimar Ferreira de Oliveira, Técnico Agrícola e sua esposa Déssica Waneza de Sousa Nunes na cidade de Bom Jesus – Piauí, embora seja uma empresa jovem, sua origem se deu com muitos esforços e dedicação, temos orgulho da nossa conquista.",
        "Nosso futuro começa na evolução de novas idéias, garra e determinação."
      ]
    },
    {
      icon: Target,
      title: "Visão",
      content: [
        "Ser uma empresa líder no fornecimento de insumos, pela excelência operacional, conveniência e solidez nos relacionamentos, visando maior rentabilidade e o crescimento sustentável do agronegócio."
      ]
    },
    {
      icon: Users,
      title: "Pessoas",
      content: [
        "O objetivo é intensificar esforços para que nossos profissionais entendam a contribuição significativa aos clientes e parceiros, expandindo nossos valores, encarando novos desafios e fazendo a diferença na sociedade."
      ]
    },
    {
      icon: Heart,
      title: "Missão e Valores",
      content: [
        "Atender de forma diferenciada, oferecendo produtos e serviços de excelência, tornando mais competitiva, preservando altos padrões éticos e respeitando o meio ambiente."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%,transparent_100%)] bg-[length:250px_250px] animate-[slide_20s_linear_infinite]" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-heading font-semibold text-sm mb-6 text-white">
              Nossa História
            </div>
            
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Sobre a
              <span className="text-secondary"> Renovar</span>
            </h1>
            
            <p className="font-body text-xl text-white/90 leading-relaxed">
              Uma história de determinação, perseverança e crescimento no coração do agronegócio brasileiro.
            </p>
          </div>
        </div>
      </section>

      {/* Company Image */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <img 
              src={aboutCollage} 
              alt="Renovar Agrobusiness" 
              className="w-full rounded-2xl shadow-elevated"
            />
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-16">
            {sections.map((section, index) => (
              <div 
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 rounded-2xl p-4">
                      <section.icon className="text-primary" size={32} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
                      {section.title}
                    </h2>
                    
                    <div className="space-y-4">
                      {section.content.map((paragraph, pIndex) => (
                        <p 
                          key={pIndex}
                          className="font-body text-lg text-muted-foreground leading-relaxed"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                
                {index < sections.length - 1 && (
                  <div className="mt-12 border-b border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-primary rounded-2xl p-12 text-center shadow-elevated">
            <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Faça Parte da Nossa História
            </h3>
            <p className="font-body text-lg text-white/90 mb-8">
              Junte-se a nós e faça parte da transformação do agronegócio brasileiro.
            </p>
            <button
              onClick={() => window.location.href = "/#contact"}
              className="bg-secondary hover:bg-secondary/90 text-primary font-heading font-bold px-8 py-3 rounded-full transition-all hover:scale-105"
            >
              Entre em Contato
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
