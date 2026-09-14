import promo01 from "../assets/promotions/promo01.webp";
import promo02 from "../assets/promotions/promo02.webp";
import promo03 from "../assets/promotions/promo03.webp";
import promo04 from "../assets/promotions/promo04.webp";
import promo05 from "../assets/promotions/promo05.webp";

const promotions = [
  {
    id: 1,
    image: promo01,
    title: "Canecas Personalizadas",
    subtitle: "Diversos modelos para todas as ocasiões.",
    oldPrice: "49,90",
    newPrice: "39,90",
    discount: "20%",
    button: "Comprar Agora",
    link: "/produtos/canecas"
  },
  {
    id: 2,
    image: promo02,
    title: "Copos Personalizados",
    subtitle: "Personalização premium para presentes.",
    oldPrice: "69,90",
    newPrice: "49,90",
    discount: "25%",
    button: "Comprar Agora",
    link: "/produtos/copos"
  },
  {
    id: 3,
    image: promo03,
    title: "Camisetas",
    subtitle: "Estampas em alta definição.",
    oldPrice: "119,90",
    newPrice: "89,90",
    discount: "30%",
    button: "Comprar Agora",
    link: "/produtos/camisetas"
  },
  {
    id: 4,
    image: promo04,
    title: "Quadros MDF",
    subtitle: "Presentes exclusivos feitos com carinho.",
    oldPrice: "89,90",
    newPrice: "69,90",
    discount: "25%",
    button: "Comprar Agora",
    link: "/produtos/quadros"
  },
  {
    id: 5,
    image: promo05,
    title: "Brindes",
    subtitle: "Produtos exclusivos para empresas.",
    oldPrice: "159,90",
    newPrice: "119,90",
    discount: "35%",
    button: "Comprar Agora",
    link: "/produtos/brindes"
  }
];

export default promotions;