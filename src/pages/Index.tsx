import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import About from "@/components/About";
import Products from "@/components/Products";
import Results from "@/components/Results";
import Partners from "@/components/Partners";
import Contact from "@/components/Contact";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSlider />
      <About />
      <Products />
      <Results />
      <NewsSection />
      <Partners />
      <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
