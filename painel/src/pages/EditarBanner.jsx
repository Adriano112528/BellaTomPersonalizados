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
  const [salvando, setSalvando] = useState(false);

  const inputFile = useRef(null);

  // ==========================================
  // CARREGAR BANNER
  // ==========================================

  useEffect(() => {
    async function carregar() {
      try {
        const banners = await carregarBanners();

        const banner = banners.find(
          (b) => b.id === id
        );

        if (banner) {
          setForm(banner);
        }
      } catch (erro) {
        console.error(
          "Erro ao carregar banner:",
          erro
        );
      }
    }

    carregar();
  }, [id]);

  // ==========================================
  // ALTERAR CAMPO
  // ==========================================

  function alterarCampo(e) {
    setForm((old) => ({
      ...old,
      [e.target.name]: e.target.value,
    }));
  }

  // ==========================================
  // ABRIR SELETOR DE IMAGEM
  // ==========================================

  function abrirSeletorImagem() {
    inputFile.current.click();
  }

  // ==========================================
  // ALTERAR IMAGEM
  // ==========================================

  async function alterarImagem(e) {
    const arquivo = e.target.files[0];

    if (!arquivo) {
      return;
    }

    try {
      setEnviandoImagem(true);

      console.log(
        "🟡 Enviando nova imagem..."
      );

      const url =
        await uploadBanner(arquivo);

      console.log(
        "🟢 Imagem enviada:",
        url
      );

      setForm((old) => ({
        ...old,
        image: url,
        imagem: url,
      }));

      alert(
        "Imagem enviada com sucesso!"
      );

    } catch (erro) {
      console.error(
        "🔴 Erro ao enviar imagem:",
        erro
      );

      alert(
        "Erro ao enviar imagem."
      );

    } finally {
      setEnviandoImagem(false);

      // Permite selecionar novamente
      // a mesma imagem se necessário
      e.target.value = "";
    }
  }

  // ==========================================
  // SALVAR BANNER
  // ==========================================

  async function salvar() {
    if (salvando) {
      return;
    }

    try {
      setSalvando(true);

      console.log(
        "🟡 Iniciando salvamento do banner..."
      );

      console.log(
        "ID do banner:",
        id
      );

      const dadosParaSalvar = {
        title: form.title || "",
        subtitle: form.subtitle || "",
        oldPrice: form.oldPrice || "",
        newPrice: form.newPrice || "",
        discount: form.discount || 0,
        button:
          form.button ||
          "Comprar Agora",
        ativo:
          form.ativo ?? true,
        image:
          form.image ||
          form.imagem ||
          "",
      };

      console.log(
        "📦 Dados que serão salvos:",
        dadosParaSalvar
      );

      await atualizarBanner(
        id,
        dadosParaSalvar
      );

      console.log(
        "🟢 Banner atualizado no Firestore!"
      );

      alert(
        "Banner atualizado com sucesso!"
      );

      navigate("/editor");

    } catch (erro) {
      console.error(
        "🔴 Erro ao salvar banner:",
        erro
      );

      console.error(
        "Código do erro:",
        erro?.code
      );

      console.error(
        "Mensagem:",
        erro?.message
      );

      alert(
        `Erro ao salvar banner: ${
          erro?.message ||
          "Erro desconhecido"
        }`
      );

    } finally {
      setSalvando(false);
    }
  }

  // ==========================================
  // CARREGANDO BANNER
  // ==========================================

  if (!form) {
    return (
      <h2>
        Carregando banner...
      </h2>
    );
  }

  // ==========================================
  // TELA
  // ==========================================

  return (
    <div className="editarBanner">

      <div className="editarHeader">

        <div>

          <span className="bannerTag">
            Banner do Carrossel
          </span>

          <h1>
            {form.title ||
              "Editar Banner"}
          </h1>

          <p>
            Altere imagem, textos,
            preços e botão deste
            banner. As alterações
            serão exibidas
            automaticamente no site.
          </p>

        </div>

      </div>

      <div className="editarGrid">

        {/* =====================================
            IMAGEM
        ====================================== */}

        <div className="previewCard">

          <h2>
            Imagem do Banner
          </h2>

          <p className="previewText">
            Esta imagem será exibida
            no carrossel da página
            inicial.
          </p>

          <div className="previewImage">

            <img
              src={
                form.image ||
                form.imagem
              }
              alt={
                form.title ||
                form.titulo ||
                "Banner Bella Tom"
              }
              className="previewBanner"
            />

          </div>

          <input
            ref={inputFile}
            type="file"
            accept="image/*"
            style={{
              display: "none",
            }}
            onChange={alterarImagem}
          />

          <button
            type="button"
            className="upload"
            onClick={
              abrirSeletorImagem
            }
            disabled={
              enviandoImagem ||
              salvando
            }
          >
            {enviandoImagem
              ? "Enviando..."
              : "Trocar Imagem"}
          </button>

        </div>

        {/* =====================================
            FORMULÁRIO
        ====================================== */}

        <div className="formCard">

          <label>
            Título
          </label>

          <input
            name="title"
            value={
              form.title || ""
            }
            onChange={
              alterarCampo
            }
          />

          <label>
            Descrição
          </label>

          <textarea
            rows={3}
            name="subtitle"
            value={
              form.subtitle || ""
            }
            onChange={
              alterarCampo
            }
          />

          <label>
            Preço Antigo
          </label>

          <input
            name="oldPrice"
            value={
              form.oldPrice || ""
            }
            onChange={
              alterarCampo
            }
          />

          <label>
            Preço Promocional
          </label>

          <input
            name="newPrice"
            value={
              form.newPrice || ""
            }
            onChange={
              alterarCampo
            }
          />

          <label>
            Desconto
          </label>

          <input
            name="discount"
            value={
              form.discount || ""
            }
            onChange={
              alterarCampo
            }
          />

          <label>
            Texto do botão
          </label>

          <input
            name="button"
            value={
              form.button || ""
            }
            onChange={
              alterarCampo
            }
          />

          {/* =====================================
              SALVAR
          ====================================== */}

          <button
            type="button"
            className="salvar"
            onClick={salvar}
            disabled={
              salvando ||
              enviandoImagem
            }
          >
            {salvando
              ? "Salvando..."
              : "Salvar Alterações"}
          </button>

          <button
            type="button"
            className="voltar"
            onClick={() =>
              navigate("/editor")
            }
            disabled={salvando}
          >
            ← Voltar ao Editor
            do Site
          </button>

        </div>

      </div>

    </div>
  );
}