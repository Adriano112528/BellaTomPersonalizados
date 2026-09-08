import "./Hero.css";
import hero from "../../assets/images/hero-gatos.png";

function Hero() {
  return (
    <section className="hero">
      <img
        src={hero}
        alt="Bella Tom Personalizados"
        className="hero-image"
      />
    </section>
  );
}

export default Hero;