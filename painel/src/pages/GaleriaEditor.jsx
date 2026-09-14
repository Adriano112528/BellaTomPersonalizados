import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GaleriaEditor.css";

const API_URL = "http://localhost:3001/api/galeria";

const formularioInicial = {
  titulo: "",
  categoria: "",
  texto: "",
  imagem: "",
};

export default function GaleriaEditor() {
  const navigate = useNavigate();

  const [itens, setItens] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [itemEditando, setItemEditando] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  // ========================================
  // CARREGAR GALERIA
  // ========================================

  async function carregarGaleria() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch(API_URL);

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar a galeria.");
      }

      const dados = await resposta.json();

      setItens(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar galeria:", error);
      setErro("Erro ao carregar os itens da galeria.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarGaleria();
  }, []);

  // ========================================
  // ALTERAR CAMPOS
  // ========================================

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));
  }

  // ========================================
  // CONVERTER IMAGEM PARA BASE64
  // ========================================

  function selecionarImagem(event) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      setFormulario((estadoAnterior) => ({
        ...estadoAnterior,
        imagem: leitor.result,
      }));
    };

    leitor.onerror = () => {
      setErro("Não foi possível carregar a imagem.");
    };

    leitor.readAsDataURL(arquivo);
  }

  // ========================================
  // NOVO ITEM
  // ========================================

  function novoItem() {
    setItemEditando(null);
    setFormulario(formularioInicial);
    setMensagem("");
    setErro("");
  }

  // ========================================
  // EDITAR ITEM
  // ========================================

  function editarItem(item) {
    setItemEditando(item.id);

    setFormulario({
      titulo: item.titulo || "",
      categoria: item.categoria || "",
      texto: item.texto || "",
      imagem: item.imagem || "",
    });

    setMensagem("");
    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ========================================
  // SALVAR ITEM
  // ========================================

  async function salvarItem(event) {
    event.preventDefault();

    if (!formulario.titulo.trim()) {
      setErro("Informe o título da galeria.");
      return;
    }

    try {
      setSalvando(true);
      setMensagem("");
      setErro("");

      const metodo = itemEditando ? "PUT" : "POST";

      const url = itemEditando
        ? `${API_URL}/${itemEditando}`
        : API_URL;

      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível salvar o item."
        );
      }

      setMensagem(
        itemEditando
          ? "Item atualizado com sucesso!"
          : "Item cadastrado com sucesso!"
      );

      setFormulario(formularioInicial);
      setItemEditando(null);

      await carregarGaleria();
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      setErro(error.message || "Erro ao salvar item.");
    } finally {
      setSalvando(false);
    }
  }

  // ========================================
  // EXCLUIR ITEM
  // ========================================

  async function excluirItem(id) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este item da galeria?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro("");
      setMensagem("");

      const resposta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível excluir o item."
        );
      }

      setMensagem("Item excluído com sucesso!");

      if (itemEditando === id) {
        novoItem();
      }

      await carregarGaleria();
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      setErro(error.message || "Erro ao excluir item.");
    }
  }

  return (
    <div className="galeria-editor-page">
      <div className="galeria-editor-header">
        <button
          type="button"
          className="galeria-editor-back-button"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>

        <span>EDITOR DO SITE</span>

        <h1>Editar Galeria</h1>

        <p>
          Cadastre, edite e exclua imagens, títulos, categorias e
          textos da galeria pública.
        </p>
      </div>

      {mensagem && (
        <div className="galeria-editor-message success">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="galeria-editor-message error">
          {erro}
        </div>
      )}

      <form
        className="galeria-editor-form"
        onSubmit={salvarItem}
      >
        <div className="galeria-editor-form-header">
          <div>
            <h2>
              {itemEditando
                ? "Editar item"
                : "Novo item da galeria"}
            </h2>

            <p>
              Preencha os campos abaixo para atualizar a galeria.
            </p>
          </div>

          {itemEditando && (
            <button
              type="button"
              className="galeria-editor-button secondary"
              onClick={novoItem}
            >
              Cancelar edição
            </button>
          )}
        </div>

        <div className="galeria-editor-grid">
          <div className="galeria-editor-field">
            <label htmlFor="titulo">Título</label>

            <input
              id="titulo"
              name="titulo"
              type="text"
              value={formulario.titulo}
              onChange={alterarCampo}
              placeholder="Ex.: Canecas Personalizadas"
              required
            />
          </div>

          <div className="galeria-editor-field">
            <label htmlFor="categoria">Categoria</label>

            <input
              id="categoria"
              name="categoria"
              type="text"
              value={formulario.categoria}
              onChange={alterarCampo}
              placeholder="Ex.: Canecas"
            />
          </div>

          <div className="galeria-editor-field full">
            <label htmlFor="texto">Texto</label>

            <textarea
              id="texto"
              name="texto"
              value={formulario.texto}
              onChange={alterarCampo}
              placeholder="Descrição do item da galeria"
              rows={4}
            />
          </div>

          <div className="galeria-editor-field full">
            <label htmlFor="imagem">Imagem</label>

            <input
              id="imagem"
              type="file"
              accept="image/*"
              onChange={selecionarImagem}
            />

            <small>
              Selecione uma imagem para salvar no banco de dados.
            </small>
          </div>
        </div>

        {formulario.imagem && (
          <div className="galeria-editor-preview">
            <p>Pré-visualização</p>

            <img
              src={formulario.imagem}
              alt="Pré-visualização da galeria"
            />
          </div>
        )}

        <button
          type="submit"
          className="galeria-editor-button primary"
          disabled={salvando}
        >
          {salvando
            ? "Salvando..."
            : itemEditando
              ? "Atualizar item"
              : "Cadastrar item"}
        </button>
      </form>

      <section className="galeria-editor-lista">
        <div className="galeria-editor-lista-header">
          <div>
            <h2>Itens cadastrados</h2>

            <p>
              {itens.length} item(ns) encontrado(s).
            </p>
          </div>

          <button
            type="button"
            className="galeria-editor-button secondary"
            onClick={novoItem}
          >
            + Novo item
          </button>
        </div>

        {carregando ? (
          <div className="galeria-editor-empty">
            Carregando itens da galeria...
          </div>
        ) : itens.length === 0 ? (
          <div className="galeria-editor-empty">
            <h3>Nenhum item cadastrado</h3>

            <p>
              Cadastre o primeiro item usando o formulário acima.
            </p>
          </div>
        ) : (
          <div className="galeria-editor-cards">
            {itens.map((item) => (
              <article
                className="galeria-editor-card"
                key={item.id}
              >
                <div className="galeria-editor-card-image">
                  {item.imagem ? (
                    <img
                      src={item.imagem}
                      alt={item.titulo}
                    />
                  ) : (
                    <span>Sem imagem</span>
                  )}
                </div>

                <div className="galeria-editor-card-content">
                  <span>
                    {item.categoria || "Sem categoria"}
                  </span>

                  <h3>{item.titulo}</h3>

                  <p>
                    {item.texto || "Sem descrição cadastrada."}
                  </p>

                  <div className="galeria-editor-card-actions">
                    <button
                      type="button"
                      className="galeria-editor-button secondary"
                      onClick={() => editarItem(item)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="galeria-editor-button danger"
                      onClick={() => excluirItem(item.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}