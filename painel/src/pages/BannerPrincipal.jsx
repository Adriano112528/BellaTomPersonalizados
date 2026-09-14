import "./Banners.css";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  carregarBanners,
  atualizarBanner,
} from "../services/bannerService";

import { uploadBanner } from "../services/storageService";


export default function BannerPrincipal() {

  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(true);

  const [aberto, setAberto] = useState(null);

  const inputImagem = useRef(null);

  const [bannerImagem, setBannerImagem] = useState(null);

  const [enviando, setEnviando] = useState(false);


  /* =====================================================
     CARREGAR
     ===================================================== */

  useEffect(() => {
    carregar();
  }, []);


  async function carregar() {

    try {

      const dados = await carregarBanners();

      setBanners(dados);

    } catch (erro) {

      console.error("Erro ao carregar banners:", erro);

    } finally {

      setLoading(false);

    }

  }


  /* =====================================================
     ABRIR EDITOR
     ===================================================== */

  function abrirEditor(id) {

    if (aberto === id) {

      setAberto(null);

      return;

    }

    setAberto(id);

  }


  /* =====================================================
     ALTERAR CAMPO
     ===================================================== */

  function alterarCampo(id, campo, valor) {

    setBanners((old) =>

      old.map((banner) =>

        banner.id === id
          ? {
              ...banner,
              [campo]: valor,
            }
          : banner

      )

    );

  }


  /* =====================================================
     TROCAR IMAGEM
     ===================================================== */

  function trocarImagem(id) {

    setBannerImagem(id);

    inputImagem.current?.click();

  }


  /* =====================================================
     SELECIONAR IMAGEM
     ===================================================== */

  async function selecionarImagem(e) {

    const arquivo = e.target.files?.[0];

    if (!arquivo) return;


    try {

      setEnviando(true);


      const url = await uploadBanner(arquivo);


      setBanners((old) =>

        old.map((banner) =>

          banner.id === bannerImagem
            ? {
                ...banner,
                image: url,
                imagem: url,
              }
            : banner

        )

      );


    } catch (erro) {

      console.error("Erro ao enviar imagem:", erro);

      alert("Erro ao enviar imagem.");

    } finally {

      setEnviando(false);

      e.target.value = "";

    }

  }


  /* =====================================================
     SALVAR
     ===================================================== */

  async function salvarBanner(banner) {

    try {

      await atualizarBanner(
        banner.id,
        banner
      );

      alert("Banner salvo com sucesso!");

    } catch (erro) {

      console.error("Erro ao salvar banner:", erro);

      alert("Erro ao salvar banner.");

    }

  }


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {

    return (

      <div className="banners-page">

        <h2 style={{ color: "#ffffff" }}>
          Carregando...
        </h2>

      </div>

    );

  }


  /* =====================================================
     TELA
     ===================================================== */

  return (

    <div className="banners-page">


      {/* =================================================
          CABEÇALHO
          ================================================= */}

      <div className="page-header">

        <div>

          <h1>
            Banner Principal
          </h1>

          <p>
            Gerencie todos os banners do carrossel.
          </p>

        </div>


        <Link
          to="/editor"
          className="voltar-editor"
        >
          ← Voltar ao Editor
        </Link>

      </div>


      {/* =================================================
          INPUT OCULTO
          ================================================= */}

      <input
        ref={inputImagem}
        type="file"
        accept="image/*"
        style={{
          display: "none",
        }}
        onChange={selecionarImagem}
      />


      {/* =================================================
          LISTA DOS 5 BANNERS
          ================================================= */}

      <div className="banner-list">

        {banners.map((banner, index) => (

          <div
            className={`banner-card ${
              aberto === banner.id
                ? "aberto"
                : ""
            }`}
            key={banner.id}
          >


            {/* ===========================================
                PARTE SUPERIOR
                =========================================== */}

            <div className="banner-top">


              {/* IMAGEM */}

              <div className="banner-image">

                <img
                  src={
                    banner.image ||
                    banner.imagem ||
                    ""
                  }
                  alt={
                    banner.title ||
                    "Banner"
                  }
                  className="banner-thumb"
                />

              </div>


              {/* INFORMAÇÕES */}

              <div className="banner-content">

                <span className="banner-number">
                  Banner {index + 1}
                </span>


                <h2 className="banner-title">
                  {banner.title ||
                    "Banner Principal"}
                </h2>


                <p className="banner-description">
                  Clique em editar para alterar este banner.
                </p>


                <button
                  type="button"
                  className="editar-button"
                  onClick={() =>
                    abrirEditor(banner.id)
                  }
                >

                  {aberto === banner.id
                    ? "Fechar Editor"
                    : "✏️ Editar Banner"}

                </button>

              </div>

            </div>


            {/* ===========================================
                EDITOR ABERTO
                =========================================== */}

            {aberto === banner.id && (

              <div className="banner-editor">


                {/* =======================================
                    ESQUERDA
                    ======================================= */}

                <div className="editor-left">

                  <img
                    src={
                      banner.image ||
                      banner.imagem ||
                      ""
                    }
                    alt={
                      banner.title ||
                      "Banner"
                    }
                    className="preview-image"
                  />


                  <button
                    type="button"
                    className="upload-button"
                    onClick={() =>
                      trocarImagem(banner.id)
                    }
                    disabled={enviando}
                  >

                    {enviando
                      ? "Enviando..."
                      : "🖼️ Trocar Imagem"}

                  </button>

                </div>


                {/* =======================================
                    DIREITA
                    ======================================= */}

                <div className="editor-right">


                  {/* TÍTULO */}

                  <div className="campo">

                    <label>
                      Título
                    </label>

                    <input
                      type="text"
                      value={
                        banner.title || ""
                      }
                      onChange={(e) =>
                        alterarCampo(
                          banner.id,
                          "title",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* DESCRIÇÃO */}

                  <div className="campo">

                    <label>
                      Descrição
                    </label>

                    <textarea
                      rows={4}
                      value={
                        banner.subtitle || ""
                      }
                      onChange={(e) =>
                        alterarCampo(
                          banner.id,
                          "subtitle",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* PREÇOS */}

                  <div className="linha">


                    <div className="campo">

                      <label>
                        Preço Antigo
                      </label>

                      <input
                        type="text"
                        value={
                          banner.oldPrice || ""
                        }
                        onChange={(e) =>
                          alterarCampo(
                            banner.id,
                            "oldPrice",
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="campo">

                      <label>
                        Preço Promocional
                      </label>

                      <input
                        type="text"
                        value={
                          banner.newPrice || ""
                        }
                        onChange={(e) =>
                          alterarCampo(
                            banner.id,
                            "newPrice",
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>


                  {/* DESCONTO / BOTÃO */}

                  <div className="linha">


                    <div className="campo">

                      <label>
                        Desconto (%)
                      </label>

                      <input
                        type="text"
                        value={
                          banner.discount ?? ""
                        }
                        onChange={(e) =>
                          alterarCampo(
                            banner.id,
                            "discount",
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <div className="campo">

                      <label>
                        Texto do botão
                      </label>

                      <input
                        type="text"
                        value={
                          banner.button || ""
                        }
                        onChange={(e) =>
                          alterarCampo(
                            banner.id,
                            "button",
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>


                  {/* SALVAR */}

                  <button
                    type="button"
                    className="salvar-button"
                    onClick={() =>
                      salvarBanner(banner)
                    }
                  >

                    💾 Salvar Banner

                  </button>

                </div>

              </div>

            )}

          </div>

        ))}

      </div>

    </div>

  );

}