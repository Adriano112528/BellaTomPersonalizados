import "./Header.css";

import { FiSearch, FiInstagram } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi";

function Header() {
  return (
    <header className="header">
      <div className="header-container">

        {/* ================= LOGO ================= */}
        <div className="header-logo">

          <h1>
            <span className="bella">Bella</span>
            <span className="tom">Tom</span>
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

          <a href="#" className="social-link">
            <FiInstagram className="icon" />
          </a>

          <a href="#" className="social-link">
            <FaWhatsapp className="icon" />
          </a>

          <button className="btnBudget">
            Solicitar orçamento
          </button>

          <HiOutlineShoppingBag className="cart" />

        </div>

      </div>
    </header>
  );
}

export default Header;