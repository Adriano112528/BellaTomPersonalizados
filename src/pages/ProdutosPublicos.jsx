import { useEffect, useState } from "react";
import { FaWhatsapp, FaArrowLeft, FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "./Produtos.css";
import { carregarProdutos } from "../services/produtoService";

export default function ProdutosPublicos() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await carregarProdutos();

        const produtosAtivos = dados.filter(
          (produto) => Number(produto.ativo) === 1
        );

        setProdutos(produtosAtivos);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        setErro("Não foi possível carregar os produtos.");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

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
    <main className="produtosPublicos">
      <div className="produtosPublicosHeader">
        <button
          type="button"
          className="botaoVoltar"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft />
          Voltar para o início
        </button>

        <h1>Todos os Produtos</h1>

        <p>Encontre o presente perfeito para cada ocasião.</p>
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

      <div className="produtosPublicosGrid">
        {produtos.map((produto) => {
          const preco = Number(produto.preco || 0);
          const precoPromocional = Number(
            produto.precoPromocional || 0
          );

          const temPromocao =
            precoPromocional > 0 && precoPromocional < preco;

          const precoFinal = temPromocao
            ? precoPromocional
            : preco;

          return (
            <article
              className="produtoPublicoCard"
              key={produto.id}
            >
              <div className="produtoPublicoImagem">
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

              <div className="produtoPublicoInfo">
                <span className="produtoPublicoCategoria">
                  {produto.categoria || "Personalizados"}
                </span>

                <h2>{produto.nome}</h2>

                <p className="produtoPublicoDescricao">
                  {produto.descricao ||
                    "Produto personalizado Bella Tom."}
                </p>

                <div className="produtoPublicoPrecos">
                  {temPromocao && (
                    <span className="produtoPublicoPrecoAntigo">
                      {preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                      })}
                    </span>
                  )}

                  <strong>
                    {precoFinal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    })}
                  </strong>
                </div>

                <button
                  type="button"
                  className="produtoPublicoBotao"
                  onClick={() => solicitarOrcamento(produto)}
                >
                  <FaWhatsapp />
                  Solicitar orçamento
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}