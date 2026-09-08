import "./Footer.css";

import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaCreditCard,
  FaMoneyBillWave,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobeAmericas
} from "react-icons/fa";

import { SiPix } from "react-icons/si";

export default function Footer() {

  const whatsappMessage = encodeURIComponent(
`Olá!

Visitei o site da BellaTom Personalizados e gostaria de solicitar um orçamento.

Poderia me ajudar?`
  );

  return (
    <footer className="footer">

      <div className="footerContainer">

        {/* LOGO */}

        <div className="footerLogo borderRight">

          <h2>
            <span className="bella">Bella</span>
            <span className="tom">Tom</span>
          </h2>

          <span className="subtitle">
            PERSONALIZADOS
          </span>

          <div className="footerLine"></div>

          <p className="footerPhrase">
            Transformando momentos
            <br />
            em lembranças especiais.
          </p>

        </div>

        {/* CONTATO */}

        <div className="footerColumn borderRight">

          <h3>Contato</h3>

          <a
            href={`https://wa.me/5554991805078?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="footerItem"
          >
            <FaWhatsapp />
            <span>(54) 99180-5078</span>
          </a>

          <a
            href={`https://wa.me/5554992724941?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="footerItem"
          >
            <FaWhatsapp />
            <span>(54) 99272-4941</span>
          </a>

          <div className="footerItemStatic">
            <FaMapMarkerAlt />
            <span>Caxias do Sul - RS</span>
          </div>

        </div>

        {/* SITE / EMAIL */}

        <div className="footerColumn emailColumn borderRight">

          <a
            href="https://www.bellatompersonalizados.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="footerWebsite"
          >
            <FaGlobeAmericas />
            <span>www.bellatompersonalizados.com.br</span>
          </a>

          <a
            href="mailto:contato@bellatompersonalizados.com.br"
            className="footerEmail"
          >
            <FaEnvelope />
            <span>contato@bellatompersonalizados.com.br</span>
          </a>

          <div className="footerHeart">
            ❤
          </div>

          <p>
            Será um prazer
            <br />
            atender você!
          </p>

        </div>

        {/* REDES */}

        <div className="footerColumn borderRight">

          <h3>Siga-nos</h3>

          <div className="footerSocial">

            <a
              href="https://instagram.com/SEU_INSTAGRAM"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>

            <a
              href="https://facebook.com/SEU_FACEBOOK"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>

            <a
              href={`https://wa.me/5554991805078?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>

          </div>

          <p className="socialText">
            Acompanhe nossas novidades
            <br />
            e inspirações!
          </p>

        </div>

        {/* PAGAMENTOS */}

        <div className="footerColumn">

          <h3 className="footerPayTitle">
            Pagamentos
          </h3>

          <div className="paymentItem">
            <SiPix />
            <span>PIX</span>
          </div>

          <div className="paymentItem">
            <FaMoneyBillWave />
            <span>Dinheiro</span>
          </div>

          <div className="paymentItem">
            <FaCreditCard />
            <span>Cartões de Crédito e Débito</span>
          </div>

          <p className="socialText">
            Mais praticidade para você!
          </p>

        </div>

      </div>

      <div className="footerBottom">

        <span>
          © 2026 Bella Tom Personalizados. Todos os direitos reservados.
        </span>

        <span>
          Desenvolvido por <strong>ARS Tecnologia</strong>
        </span>

      </div>

    </footer>
  );
}