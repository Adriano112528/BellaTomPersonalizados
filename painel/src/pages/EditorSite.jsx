import {
  Globe,
  Image,
  Package,
  Images,
  Phone,
  Share2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./EditorSite.css";

const cards = [
  {
    icon: <Image size={42} strokeWidth={1.8} />,
    title: "Banner Principal",
    text: "Gerencie os 5 banners do carrossel da página inicial.",
    link: "/editor/banner",
    active: true,
    featured: true,
    image: "/images/editor/banner-principal.jpg",
  },

  {
    icon: <Package size={42} strokeWidth={1.8} />,
    title: "Produtos",
    text: "Cadastre, edite e organize os produtos do site.",
    link: "/produtos",
    active: true,
    image: "/images/editor/produtos.jpg",
  },

  {
    icon: <Images size={42} strokeWidth={1.8} />,
    title: "Galeria",
    text: "Edite imagens, títulos, categorias e textos da galeria.",
    link: "/editor/galeria",
    active: true,
    image: "/images/editor/galeria.jpg",
  },

  {
    icon: <Phone size={42} strokeWidth={1.8} />,
    title: "Contato",
    text: "Edite telefone, WhatsApp, e-mail e endereço.",
    link: "/editor/contato",
    active: true,
    image: "/images/editor/contato.jpg",
  },

  {
    icon: <Share2 size={42} strokeWidth={1.8} />,
    title: "Redes Sociais",
    text: "Edite os links e ícones das suas redes sociais.",
    link: "/editor/redes-sociais",
    active: true,
    image: "/images/editor/redes-sociais.jpg",
  },
];

export default function EditorSite() {
  return (
    <div className="editor-page">
      <div className="editor-header">
        <div className="editor-header-icon">
          <Globe size={48} strokeWidth={1.7} />
        </div>

        <div className="editor-header-content">
          <h1>Editor do Site</h1>

          <p>Escolha o módulo que deseja editar.</p>
        </div>

        <div className="editor-header-badge">
          <Sparkles size={23} strokeWidth={1.8} />

          <div>
            <strong>Personalize sua loja</strong>

            <span>De forma simples e rápida.</span>
          </div>
        </div>
      </div>

      <div className="editor-grid">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`
              editor-card
              ${card.featured ? "featured" : ""}
              ${!card.active ? "disabled-card" : ""}
            `}
            style={{
              "--card-image": `url("${card.image}")`,
            }}
          >
            <div className="card-overlay"></div>

            <div className="editor-card-content">
              <div className="editor-icon">{card.icon}</div>

              {card.featured && (
                <div className="featured-tag">
                  <span>★</span>
                  Diretor
                </div>
              )}

              <h2>{card.title}</h2>

              <p>{card.text}</p>

              <div className="card-action-row">
                {card.active ? (
                  <Link
                    to={card.link}
                    className="card-action-arrow"
                    aria-label={`Abrir ${card.title}`}
                  >
                    <ArrowRight size={21} strokeWidth={2} />
                  </Link>
                ) : null}
              </div>

              {card.active ? (
                <Link to={card.link} className="module-button">
                  <span>Abrir módulo</span>

                  <ArrowRight size={21} strokeWidth={2} />
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}