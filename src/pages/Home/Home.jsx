import Hero from "../components/Hero/Hero";
import PromotionSlider from "../components/PromotionSlider/PromotionSlider";
import FeaturedProducts from "../components/FeaturedProducts/FeaturedProducts";

function Home() {
  return (
    <>
      <Hero />

      <PromotionSlider />

      <FeaturedProducts />
    </>
  );
}

export default Home;