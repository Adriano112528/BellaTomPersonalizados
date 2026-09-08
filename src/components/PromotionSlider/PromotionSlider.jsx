import "./PromotionSlider.css";
import { useEffect, useState } from "react";

import {
  FaArrowLeft,
  FaArrowRight,
  FaShoppingCart,
  FaFire
} from "react-icons/fa";

import promo01 from "../../assets/promotions/promo01.webp";
import promo02 from "../../assets/promotions/promo02.webp";
import promo03 from "../../assets/promotions/promo03.webp";
import promo04 from "../../assets/promotions/promo04.webp";
import promo05 from "../../assets/promotions/promo05.webp";

const promotions = [
  {
    image: promo01,
    title: "Canecas Personalizadas",
    subtitle: "Diversos modelos para todas as ocasiões.",
    oldPrice: "49,90",
    newPrice: "39,90",
    discount: "20%"
  },
  {
    image: promo02,
    title: "Copos Personalizados",
    subtitle: "Personalização premium para presentes.",
    oldPrice: "69,90",
    newPrice: "49,90",
    discount: "25%"
  },
  {
    image: promo03,
    title: "Camisetas",
    subtitle: "Estampas em alta definição.",
    oldPrice: "119,90",
    newPrice: "89,90",
    discount: "30%"
  },
  {
    image: promo04,
    title: "Quadros MDF",
    subtitle: "Presentes exclusivos feitos com carinho.",
    oldPrice: "89,90",
    newPrice: "69,90",
    discount: "25%"
  },
  {
    image: promo05,
    title: "Brindes",
    subtitle: "Produtos exclusivos para empresas.",
    oldPrice: "159,90",
    newPrice: "119,90",
    discount: "35%"
  }
];

export default function PromotionSlider() {

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(old =>
        old === promotions.length - 1 ? 0 : old + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const next = () => {
    setCurrent(old =>
      old === promotions.length - 1 ? 0 : old + 1
    );
  };

  const prev = () => {
    setCurrent(old =>
      old === 0 ? promotions.length - 1 : old - 1
    );
  };

  const item = promotions[current];

  return (

    <section className="promo">

      <div className="promoCard">

        {/* IMAGEM DE FUNDO */}
        <img
          className="bg-image"
          src={item.image}
          alt={item.title}
        />

        <button className="nav left" onClick={prev}>
          <FaArrowLeft />
        </button>

        <div className="promoLeft">

          <div className="fire">
            <FaFire />
          </div>

          <h2>
            PROMOÇÕES
            <br />
            DA SEMANA
          </h2>

          <p>
            Qualidade e preços especiais
            para tornar seus momentos
            ainda mais únicos.
          </p>

          <button className="btnLeft">
            Aproveite Agora
          </button>

        </div>

        <div className="badge">
          {item.discount}
          <span>OFF</span>
        </div>

        <div className="promoRight">

          <h3>{item.title}</h3>

          <p>{item.subtitle}</p>

          <small>
            De R$ {item.oldPrice}
          </small>

          <h4>
            Por R$ {item.newPrice}
          </h4>

          <button>
            Comprar Agora
            <FaShoppingCart />
          </button>

        </div>

        <button className="nav right" onClick={next}>
          <FaArrowRight />
        </button>

      </div>

      <div className="dots">

        {promotions.map((_, i) => (

          <span
            key={i}
            className={current === i ? "active" : ""}
            onClick={() => setCurrent(i)}
          />

        ))}

      </div>

    </section>

  );

}