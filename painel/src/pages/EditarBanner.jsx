import "./EditarBanner.css";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import {
  carregarBanners,
  atualizarBanner,
} from "../services/bannerService";

import { uploadBanner } from "../services/storageService";

export default function EditarBanner() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  const inputFile = useRef(null);

  useEffect(() => {

    async function carregar() {

      try {

        const banners = await carregarBanners();

        const banner = banners.find((b) => b.id === id);

        if (banner) {

          setForm(banner);

        }

      } catch (erro) {

        console.error(erro);

      }

    }

    carregar();

  }, [id]);

  function alterarCampo(e) {

    setForm((old) => ({
      ...old,
      [e.target.name]: e.target.value,
    }));

  }

  function abrirSeletorImagem() {

    inputFile.current.click();

  }

  async function alterarImagem(e) {

    const arquivo = e.target.files[0];

    if (!arquivo) return;

    try {

      setEnviandoImagem(true);

      const url = await uploadBanner(arquivo);

      setForm((old) => ({
        ...old,
        image: url,
        imagem: url,
      }));

      alert("Imagem enviada com sucesso!");

    } catch (erro) {

      console.error(erro);

      alert("Erro ao enviar imagem.");

    } finally {

      setEnviandoImagem(false);

    }

  }

  async function salvar() {

    try {

      await atualizarBanner(id, form);

      alert("Banner atualizado com sucesso!");

      navigate("/editor");

    } catch (erro) {

      console.error(erro);

      alert("Erro ao salvar.");

    }

  }

  if (!form) {

    return <h2>Carregando banner...</h2>;

  }

  return (

    <div className="editarBanner">

      <div className="editarHeader">

        <div>

          <span className="bannerTag">
            Banner do Carrossel
          </span>

          <h1>
            {form.title || "Editar Banner"}
          </h1>

          <p>
            Altere imagem, textos, preços e botão deste banner.
            As alterações serão exibidas automaticamente no site.
          </p>

        </div>

      </div>

      <div className="editarGrid">

        <div className="previewCard">

          <h2>
            Imagem do Banner
          </h2>

          <p className="previewText">
            Esta imagem será exibida no carrossel da página inicial.
          </p>

          <div className="previewImage">

            <img
              src={form.image || form.imagem}
              alt={form.title || form.titulo}
              className="previewBanner"
            />

          </div>

          <input
            ref={inputFile}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={alterarImagem}
          />

          <button
            type="button"
            className="upload"
            onClick={abrirSeletorImagem}
            disabled={enviandoImagem}
          >

            {enviandoImagem
              ? "Enviando..."
              : "Trocar Imagem"}

          </button>

        </div>

        <div className="formCard">

          <label>Título</label>

          <input
            name="title"
            value={form.title || ""}
            onChange={alterarCampo}
          />

          <label>Descrição</label>

          <textarea
            rows={3}
            name="subtitle"
            value={form.subtitle || ""}
            onChange={alterarCampo}
          />

          <label>Preço Antigo</label>

          <input
            name="oldPrice"
            value={form.oldPrice || ""}
            onChange={alterarCampo}
          />

          <label>Preço Promocional</label>

          <input
            name="newPrice"
            value={form.newPrice || ""}
            onChange={alterarCampo}
          />

          <label>Desconto</label>

          <input
            name="discount"
            value={form.discount || ""}
            onChange={alterarCampo}
          />

          <label>Texto do botão</label>

          <input
            name="button"
            value={form.button || ""}
            onChange={alterarCampo}
          />

          <button
            type="button"
            className="salvar"
            onClick={salvar}
          >

            Salvar Alterações

          </button>

          <button
            type="button"
            className="voltar"
            onClick={() => navigate("/editor")}
          >
            ← Voltar ao Editor do Site
          </button>

        </div>

      </div>

    </div>

  );

}