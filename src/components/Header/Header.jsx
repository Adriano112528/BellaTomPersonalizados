import "./Header.css";

import { FiSearch, FiInstagram } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi";

function Header() {
  const numeroWhatsApp = "5554991805078";

  const mensagemWhatsApp = encodeURIComponent(
    "Olá, Bellatom! 🐾🐱 Gostaria de solicitar um orçamento."
  );

  const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemWhatsApp}`;

  return (
    <header className="header">
      <div className="header-container">
        {/* ================= LOGO ================= */}
        <div className="header-logo">
          <h1>
            <span className="bella">Bellatom</span>
          </h1>

          <p>
            PERSONALIZADOS
            <span className="paw">🐾</span>
          </p>
        </div>

        {/* ================= MENU ================= */}
        <nav className="header-menu">
          <a href="/">Início</a>
          <a href="/produtos">Produtos</a>
          <a href="/galeria">Galeria</a>
          <a href="/estudio">Estúdio</a>
          <a href="/sobre">Sobre</a>
          <a href="/contato">Contato</a>
        </nav>

        {/* ================= DIREITA ================= */}
        <div className="header-actions">
          <div className="search">
            <FiSearch className="search-icon" />

            <input
              type="text"
              placeholder="O que você procura?"
            />
          </div>

          <a
            href="https://www.instagram.com/bellatompersonalizados/"
            className="social-link"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram da Bellatom"
          >
            <FiInstagram className="icon" />
          </a>

          <a
            href={linkWhatsApp}
            className="social-link"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp da Bellatom"
          >
            <FaWhatsapp className="icon" />
          </a>

          <a
            href={linkWhatsApp}
            className="btnBudget"
            target="_blank"
            rel="noreferrer"
          >
            Solicitar orçamento
          </a>

          <HiOutlineShoppingBag
            className="cart"
            aria-label="Carrinho de compras"
          />
        </div>
      </div>
    </header>
  );
}

export default Header;