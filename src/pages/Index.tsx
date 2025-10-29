import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Products from "@/components/Products";
import Results from "@/components/Results";
import Partners from "@/components/Partners";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
      <About />
      <Products />
      <Results />
      <Partners />
      <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
