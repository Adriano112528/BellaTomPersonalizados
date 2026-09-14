import { useEffect, useState } from "react";

import "./Galeria.css";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const imagensPadrao = [
  {
    id: "padrao-1",
    titulo: "Canecas Personalizadas",
    categoria: "Canecas",
    texto: "",
    imagem: "/images/galeria/canecas.svg",
  },
  {
    id: "padrao-2",
    titulo: "Presentes Personalizados",
    categoria: "Presentes",
    texto: "",
    imagem: "/images/galeria/presentes.svg",
  },
  {
    id: "padrao-3",
    titulo: "Decoração Personalizada",
    categoria: "Decoração",
    texto: "",
    imagem: "/images/galeria/decoracao.svg",
  },
  {
    id: "padrao-4",
    titulo: "Produtos Especiais",
    categoria: "Personalizados",
    texto: "",
    imagem: "/images/galeria/personalizados.svg",
  },
];

export default function Galeria() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarGaleria() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await fetch("http://localhost:3001/api/galeria");

        if (!resposta.ok) {
          throw new Error("Erro ao buscar galeria.");
        }

        const dados = await resposta.json();

        if (Array.isArray(dados) && dados.length > 0) {
          setItens(dados);
        } else {
          setItens(imagensPadrao);
        }
      } catch (error) {
        console.error("Erro ao carregar galeria pública:", error);

        setErro("Não foi possível carregar a galeria atualizada.");
        setItens(imagensPadrao);
      } finally {
        setCarregando(false);
      }
    }

    carregarGaleria();
  }, []);

  return (
    <>
      <Header />

      <main className="galeria-page">
        <section className="galeria-hero">
          <span className="galeria-eyebrow">
            Bella Tom Personalizados
          </span>

          <h1>
            Nossa <strong>Galeria</strong>
          </h1>

          <p>
            Confira alguns dos trabalhos personalizados feitos com carinho
            para tornar cada momento ainda mais especial.
          </p>
        </section>

        <section className="galeria-grid-section">
          {carregando && (
            <p className="galeria-status">
              Carregando galeria...
            </p>
          )}

          {erro && !carregando && (
            <p className="galeria-status galeria-status-erro">
              {erro}
            </p>
          )}

          {!carregando && (
            <div className="galeria-grid">
              {itens.map((item) => (
                <article className="galeria-card" key={item.id}>
                  <div className="galeria-card-image">
                    <img
                      src={item.imagem}
                      alt={item.titulo}
                      onError={(event) => {
                        event.currentTarget.src =
                          "/images/galeria/personalizados.svg";
                      }}
                    />
                  </div>

                  <div className="galeria-card-content">
                    <span>{item.categoria || "Personalizados"}</span>

                    <h2>{item.titulo}</h2>

                    {item.texto && <p>{item.texto}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}