import "./FeaturedProducts.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaWhatsapp,
  FaMugHot,
  FaWineGlass,
  FaTshirt,
  FaThLarge,
  FaPenNib,
  FaBirthdayCake,
  FaImage
} from "react-icons/fa";

import { carregarProdutos } from "../../services/produtoService";

function produtoEstaAtivo(produto) {
  return (
    produto.ativo === true ||
    produto.ativo === "true" ||
    produto.ativo === 1 ||
    produto.ativo === "1"
  );
}

function escolherIcone(categoria = "", nome = "") {
  const texto = `${categoria} ${nome}`.toLowerCase();

  if (texto.includes("caneca")) {
    return <FaMugHot />;
  }

  if (
    texto.includes("copo") ||
    texto.includes("taça") ||
    texto.includes("taca")
  ) {
    return <FaWineGlass />;
  }

  if (
    texto.includes("camiseta") ||
    texto.includes("camisa")
  ) {
    return <FaTshirt />;
  }

  if (
    texto.includes("topper") ||
    texto.includes("bolo")
  ) {
    return <FaBirthdayCake />;
  }

  if (
    texto.includes("azulejo") ||
    texto.includes("mdf")
  ) {
    return <FaThLarge />;
  }

  if (
    texto.includes("laser") ||
    texto.includes("gravação") ||
    texto.includes("gravacao")
  ) {
    return <FaPenNib />;
  }

  return <FaThLarge />;
}

export default function FeaturedProducts() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await carregarProdutos();

        console.log("Produtos recebidos da API:", dados);

        const produtosAtivos = dados
          .filter((produto) => produtoEstaAtivo(produto))
          .slice(0, 6);

        console.log("Produtos ativos exibidos:", produtosAtivos);

        setProdutos(produtosAtivos);
      } catch (error) {
        console.error(
          "Erro ao carregar produtos em destaque:",
          error
        );

        setErro("Não foi possível carregar os produtos.");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  function abrirProdutos() {
    navigate("/produtos");
  }

  function solicitarOrcamento(produto) {
    const mensagem = encodeURIComponent(
      `Olá! Gostaria de solicitar um orçamento para: ${produto.nome}`
    );

    window.open(
      `https://wa.me/5554999999999?text=${mensagem}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <section className="featuredProducts">
      <div className="featuredTitle">
        <h2>Nossos Trabalhos</h2>

        <p>
          Encontre o presente perfeito para cada ocasião
        </p>
      </div>

      {carregando && (
        <p className="mensagemProdutos">
          Carregando produtos...
        </p>
      )}

      {erro && (
        <p className="mensagemProdutos erro">
          {erro}
        </p>
      )}

      {!carregando && !erro && produtos.length === 0 && (
        <p className="mensagemProdutos">
          Nenhum produto disponível no momento.
        </p>
      )}

      <div className="productsGrid">
        {produtos.map((produto) => (
          <article
            className="productCard"
            key={produto.id}
          >
            <div className="productImage">
              {produto.imagem ? (
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                />
              ) : (
                <div className="produtoSemImagem">
                  <FaImage />
                  <span>Sem imagem</span>
                </div>
              )}
            </div>

            <div className="productInfo">
              <h3>
                {escolherIcone(
                  produto.categoria,
                  produto.nome
                )}

                {produto.nome}
              </h3>

              <button
                type="button"
                onClick={() => solicitarOrcamento(produto)}
              >
                <FaWhatsapp />
                Faça seu orçamento
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="viewAll">
        <button
          type="button"
          onClick={abrirProdutos}
        >
          Ver todos os produtos →
        </button>
      </div>
    </section>
  );
}