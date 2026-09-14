import { useEffect, useState } from "react";
import "./Footer.css";

import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaCreditCard,
  FaMoneyBillWave,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobeAmericas,
  FaClock,
} from "react-icons/fa";

import { SiPix } from "react-icons/si";

const contatoPadrao = {
  telefone: "(54) 99180-5078",
  whatsapp: "(54) 99180-5078",
  whatsappSecundario: "(54) 99272-4941",
  email: "contato@bellatompersonalizados.com.br",
  endereco: "Caxias do Sul - RS",
  horario: "Segunda a sexta, das 8h às 18h",
};

const redesSociaisPadrao = {
  instagram: "https://www.instagram.com/bellatompersonalizados/",
  facebook: "https://www.facebook.com/share/1DVuoG1Nci/",
  whatsappNumbers: [
    {
      id: 1,
      nome: "WhatsApp principal",
      numero: "5554991805078",
    },
    {
      id: 2,
      nome: "WhatsApp secundário",
      numero: "5554992724941",
    },
  ],
};

function criarLinkWhatsApp(numero, mensagem) {
  const numeroLimpo = String(numero || "").replace(/\D/g, "");

  const numeroCompleto = numeroLimpo.startsWith("55")
    ? numeroLimpo
    : `55${numeroLimpo}`;

  return `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(
    mensagem
  )}`;
}

export default function Footer() {
  const [contato, setContato] = useState(contatoPadrao);
  const [redesSociais, setRedesSociais] = useState(
    redesSociaisPadrao
  );

  useEffect(() => {
    async function carregarDados() {
      try {
        const [respostaContato, respostaRedes] = await Promise.all([
          fetch("http://localhost:3001/api/contato"),
          fetch("http://localhost:3001/api/redes-sociais"),
        ]);

        if (respostaContato.ok) {
          const dadosContato = await respostaContato.json();

          setContato({
            telefone:
              dadosContato.telefone || contatoPadrao.telefone,
            whatsapp:
              dadosContato.whatsapp || contatoPadrao.whatsapp,
            whatsappSecundario:
              dadosContato.whatsappSecundario ||
              contatoPadrao.whatsappSecundario,
            email: dadosContato.email || contatoPadrao.email,
            endereco:
              dadosContato.endereco || contatoPadrao.endereco,
            horario:
              dadosContato.horario || contatoPadrao.horario,
          });
        }

        if (respostaRedes.ok) {
          const dadosRedes = await respostaRedes.json();

          setRedesSociais({
            instagram:
              dadosRedes.instagram || redesSociaisPadrao.instagram,
            facebook:
              dadosRedes.facebook || redesSociaisPadrao.facebook,
            whatsappNumbers:
              dadosRedes.whatsappNumbers?.length > 0
                ? dadosRedes.whatsappNumbers
                : redesSociaisPadrao.whatsappNumbers,
          });
        }
      } catch (erro) {
        console.error(
          "Erro ao carregar dados do Footer:",
          erro
        );
      }
    }

    carregarDados();
  }, []);

  const whatsappMessage = `
Olá, Bellatom! 🐾🐱

Visitei o site da Bellatom Personalizados e gostaria de solicitar um orçamento.

Poderia me ajudar?
  `.trim();

  const whatsappPrincipal =
    redesSociais.whatsappNumbers[0]?.numero ||
    contato.whatsapp;

  const whatsappSecundario =
    redesSociais.whatsappNumbers[1]?.numero ||
    contato.whatsappSecundario;

  const linkWhatsApp = criarLinkWhatsApp(
    whatsappPrincipal,
    whatsappMessage
  );

  const linkWhatsAppSecundario = criarLinkWhatsApp(
    whatsappSecundario,
    whatsappMessage
  );

  return (
    <footer className="footer">
      <div className="footerContainer">
        {/* LOGO */}

        <div className="footerLogo borderRight">
          <h2>
            <span className="bella">Bellatom</span>
          </h2>

          <span className="subtitle">PERSONALIZADOS</span>

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
            href={linkWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="footerItem"
          >
            <FaWhatsapp />
            <span>{contato.whatsapp}</span>
          </a>

          <a
            href={linkWhatsAppSecundario}
            target="_blank"
            rel="noopener noreferrer"
            className="footerItem"
          >
            <FaWhatsapp />
            <span>{contato.whatsappSecundario}</span>
          </a>

          <div className="footerItemStatic">
            <FaMapMarkerAlt />
            <span>{contato.endereco}</span>
          </div>

          <div className="footerItemStatic">
            <FaClock />
            <span>{contato.horario}</span>
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
            href={`mailto:${contato.email}`}
            className="footerEmail"
          >
            <FaEnvelope />
            <span>{contato.email}</span>
          </a>

          <div className="footerHeart">❤</div>

          <p>
            Será um prazer
            <br />
            atender você!
          </p>
        </div>

        {/* REDES SOCIAIS */}

        <div className="footerColumn borderRight">
          <h3>Siga-nos</h3>

          <div className="footerSocial">
            <a
              href={redesSociais.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da Bellatom"
            >
              <FaInstagram />
            </a>

            <a
              href={redesSociais.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook da Bellatom"
            >
              <FaFacebookF />
            </a>

            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp da Bellatom"
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
          <h3 className="footerPayTitle">Pagamentos</h3>

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
          © 2026 Bellatom Personalizados. Todos os direitos reservados.
        </span>

        <span>
          Desenvolvido por <strong>ARS Tecnologia</strong>
        </span>
      </div>
    </footer>
  );
}