import "./FeaturedProducts.css";

import {
  FaWhatsapp,
  FaMugHot,
  FaWineGlass,
  FaTshirt,
  FaThLarge,
  FaPenNib,
  FaBirthdayCake
} from "react-icons/fa";

import caneca from "../../assets/products/caneca.webp";
import copo from "../../assets/products/copo.webp";
import camiseta from "../../assets/products/camiseta.webp";
import topper from "../../assets/products/topper.webp";
import azulejo from "../../assets/products/azulejo.webp";
import laser from "../../assets/products/laser.webp";

const products = [
  {
    image: caneca,
    title: "Canecas Personalizadas",
    icon: <FaMugHot />
  },
  {
    image: copo,
    title: "Copos Personalizados",
    icon: <FaWineGlass />
  },
  {
    image: camiseta,
    title: "Camisetas Personalizadas",
    icon: <FaTshirt />
  },
  {
    image: topper,
    title: "Topper de Bolo",
    icon: <FaBirthdayCake />
  },
  {
    image: azulejo,
    title: "Azulejos Personalizados",
    icon: <FaThLarge />
  },
  {
    image: laser,
    title: "Gravação a Laser",
    icon: <FaPenNib />
  }
];

export default function FeaturedProducts() {
  return (
    <section className="featuredProducts">

      <div className="featuredTitle">
        <h2>Nossos Trabalhos</h2>
        <p>Encontre o presente perfeito para cada ocasião</p>
      </div>

      <div className="productsGrid">
        {products.map((item, index) => (
          <div
            className="productCard"
            key={index}
          >
            <div className="productImage">
              <img
                src={item.image}
                alt={item.title}
              />
            </div>

            <div className="productInfo">
              <h3>
                {item.icon}
                {item.title}
              </h3>

              <button>
                <FaWhatsapp />
                Faça seu orçamento
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="viewAll">
        <button>
          Ver todos os produtos →
        </button>
      </div>

    </section>
  );
}