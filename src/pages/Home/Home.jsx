import Header from "../../components/Header/Header";
import Hero from "../../components/Hero/Hero";
import PromotionSlider from "../../components/PromotionSlider/PromotionSlider";
import FeaturedProducts from "../../components/FeaturedProducts/FeaturedProducts";
import Footer from "../../components/Footer/Footer";

function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />

        <PromotionSlider />

        <FeaturedProducts />
      </main>

      <Footer />
    </>
  );
}

export default Home;