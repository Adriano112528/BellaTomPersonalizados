import "./PromotionSlider.css";

import { useEffect, useState } from "react";

import {
  FaArrowLeft,
  FaArrowRight,
  FaShoppingCart,
  FaFire,
  FaImage,
} from "react-icons/fa";

import { carregarBanners } from "../../services/bannerService";

export default function PromotionSlider() {
  const [promotions, setPromotions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await carregarBanners();

        console.log("========== BANNERS DO CARROSSEL ==========");
        console.table(dados);

        const bannersAtivos = dados
          .filter((banner) => banner.ativo !== false)
          .map((banner) => {
            let imagem = banner.image || banner.imagem || "";

            // Remove espaços acidentais
            imagem = String(imagem).trim();

            // Garante que caminhos locais com / funcionem corretamente
            if (
              imagem &&
              !imagem.startsWith("/") &&
              !imagem.startsWith("http://") &&
              !imagem.startsWith("https://")
            ) {
              imagem = `/${imagem}`;
            }

            return {
              id: `banner-${banner.id}`,
              tipo: "banner",
              image: imagem,

              title:
                banner.title ||
                banner.titulo ||
                "Bella Tom",

              subtitle:
                banner.subtitle ||
                "Produtos personalizados Bella Tom.",

              oldPrice: Number(
                String(banner.oldPrice || 0).replace(",", ".")
              ),

              newPrice: Number(
                String(banner.newPrice || 0).replace(",", ".")
              ),

              discount: banner.discount || 0,

              button:
                banner.button ||
                "Comprar Agora",
            };
          });

        console.log("🖼️ BANNERS ATIVOS:", bannersAtivos);

        setPromotions(bannersAtivos);
      } catch (error) {
        console.error(
          "Erro ao carregar banners do carrossel:",
          error
        );

        setPromotions([]);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  useEffect(() => {
    if (promotions.length <= 1) return undefined;

    const timer = setInterval(() => {
      setCurrent((old) =>
        old === promotions.length - 1
          ? 0
          : old + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [promotions.length]);

  useEffect(() => {
    if (
      promotions.length > 0 &&
      current >= promotions.length
    ) {
      setCurrent(0);
    }
  }, [current, promotions.length]);

  function next() {
    if (promotions.length === 0) return;

    setCurrent((old) =>
      old === promotions.length - 1
        ? 0
        : old + 1
    );
  }

  function prev() {
    if (promotions.length === 0) return;

    setCurrent((old) =>
      old === 0
        ? promotions.length - 1
        : old - 1
    );
  }

  function comprarAgora(item) {
    const mensagem = encodeURIComponent(
      `Olá! Gostaria de comprar ou solicitar um orçamento para: ${item.title}`
    );

    window.open(
      `https://wa.me/5554999999999?text=${mensagem}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function imagemFalhou(event, item) {
    console.error(
      "❌ Erro ao carregar imagem do banner:",
      item.image
    );

    // Segunda tentativa usando somente o nome do arquivo
    const nomeArquivo = item.image.split("/").pop();

    if (
      nomeArquivo &&
      event.currentTarget.dataset.fallback !== "true"
    ) {
      event.currentTarget.dataset.fallback = "true";
      event.currentTarget.src = `/images/${nomeArquivo}`;
    }
  }

  if (carregando) {
    return (
      <section className="promotionSlider loading">
        <div className="promoContent">
          <div className="fire">
            <FaFire />
          </div>

          <h2>
            PROMOÇÕES
            <br />
            DA SEMANA
          </h2>

          <p>Carregando ofertas especiais...</p>
        </div>
      </section>
    );
  }

  if (promotions.length === 0) {
    return null;
  }

  const item = promotions[current];

  return (
    <section className="promotionSlider">
      <div className="promoContainer">

        {/* IMAGEM DO BANNER */}
        {item.image ? (
          <div className="promoImageWrapper">
            <img
              src={item.image}
              alt={item.title}
              className="promoImage"
              onError={(event) =>
                imagemFalhou(event, item)
              }
            />
          </div>
        ) : (
          <div className="promoImagePlaceholder">
            <FaImage />
          </div>
        )}

        {/* SETA ESQUERDA */}
        {promotions.length > 1 && (
          <button
            type="button"
            className="nav left"
            onClick={prev}
            aria-label="Banner anterior"
          >
            <FaArrowLeft />
          </button>
        )}

        {/* LADO ESQUERDO */}
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
            Qualidade e preços especiais para
            tornar seus momentos ainda mais únicos.
          </p>

          <button
            type="button"
            className="btnLeft"
            onClick={() => comprarAgora(item)}
          >
            {item.button}
          </button>
        </div>

        {/* DESCONTO */}
        {item.discount && (
          <div className="badge">
            {item.discount}
            <span>OFF</span>
          </div>
        )}

        {/* LADO DIREITO */}
        <div className="promoRight">
          <h3>{item.title}</h3>

          <p>{item.subtitle}</p>

          {item.oldPrice > 0 && (
            <small>
              De{" "}
              {item.oldPrice.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </small>
          )}

          {item.newPrice > 0 && (
            <h4>
              Por{" "}
              {item.newPrice.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </h4>
          )}

          <button
            type="button"
            onClick={() => comprarAgora(item)}
          >
            {item.button}
            <FaShoppingCart />
          </button>
        </div>

        {/* SETA DIREITA */}
        {promotions.length > 1 && (
          <button
            type="button"
            className="nav right"
            onClick={next}
            aria-label="Próximo banner"
          >
            <FaArrowRight />
          </button>
        )}
      </div>

      {/* INDICADORES */}
      {promotions.length > 1 && (
        <div className="dots">
          {promotions.map((bannerItem, index) => (
            <button
              type="button"
              key={bannerItem.id}
              className={
                current === index ? "active" : ""
              }
              onClick={() => setCurrent(index)}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}