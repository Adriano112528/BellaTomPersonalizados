import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./RedesSociaisEditor.css";

const API_URL = "http://localhost:3001/api/redes-sociais";

function RedesSociaisEditor() {
  const navigate = useNavigate();

  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [whatsappNumbers, setWhatsappNumbers] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarRedesSociais() {
      try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
          throw new Error("Erro ao carregar redes sociais.");
        }

        const dados = await resposta.json();

        setInstagram(dados.instagram || "");
        setFacebook(dados.facebook || "");
        setWhatsappNumbers(dados.whatsappNumbers || []);
      } catch (erro) {
        console.error("Erro ao carregar redes sociais:", erro);
        alert("Não foi possível carregar os dados das redes sociais.");
      } finally {
        setCarregando(false);
      }
    }

    carregarRedesSociais();
  }, []);

  function adicionarWhatsApp() {
    const novoId =
      whatsappNumbers.length > 0
        ? Math.max(...whatsappNumbers.map((item) => item.id)) + 1
        : 1;

    setWhatsappNumbers([
      ...whatsappNumbers,
      {
        id: novoId,
        nome: "",
        numero: "",
      },
    ]);
  }

  function removerWhatsApp(id) {
    if (whatsappNumbers.length === 1) {
      alert("É necessário manter pelo menos um número de WhatsApp.");
      return;
    }

    setWhatsappNumbers(
      whatsappNumbers.filter((item) => item.id !== id)
    );
  }

  function atualizarWhatsApp(id, campo, valor) {
    setWhatsappNumbers(
      whatsappNumbers.map((item) =>
        item.id === id
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!instagram.trim() || !facebook.trim()) {
      alert("Preencha os links do Instagram e Facebook.");
      return;
    }

    if (whatsappNumbers.length === 0) {
      alert("Cadastre pelo menos um número de WhatsApp.");
      return;
    }

    const numeroInvalido = whatsappNumbers.some(
      (item) => !item.nome.trim() || !item.numero.trim()
    );

    if (numeroInvalido) {
      alert("Preencha o nome e o número de todos os WhatsApps.");
      return;
    }

    try {
      setSalvando(true);

      const resposta = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instagram,
          facebook,
          whatsappNumbers,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível salvar as redes sociais."
        );
      }

      setInstagram(dados.instagram || "");
      setFacebook(dados.facebook || "");
      setWhatsappNumbers(dados.whatsappNumbers || []);

      alert("Redes sociais salvas com sucesso!");
    } catch (erro) {
      console.error("Erro ao salvar redes sociais:", erro);

      alert(erro.message || "Erro ao salvar as redes sociais.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="redes-editor">
        <div className="redes-editor-header">
          <button
            type="button"
            className="redes-editor-back-button"
            onClick={() => navigate(-1)}
          >
            ← Voltar
          </button>

          <span className="redes-editor-label">EDITOR DO SITE</span>

          <h1>Redes Sociais</h1>

          <p>Carregando dados das redes sociais...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="redes-editor">
      <div className="redes-editor-header">
        <button
          type="button"
          className="redes-editor-back-button"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>

        <span className="redes-editor-label">EDITOR DO SITE</span>

        <h1>Redes Sociais</h1>

        <p>
          Configure os links das redes sociais e os números de WhatsApp da
          Bellatom.
        </p>
      </div>

      <form className="redes-editor-card" onSubmit={handleSubmit}>
        <div className="redes-editor-field">
          <label htmlFor="instagram">Instagram</label>

          <input
            id="instagram"
            type="url"
            value={instagram}
            onChange={(event) => setInstagram(event.target.value)}
            placeholder="https://www.instagram.com/..."
            required
          />
        </div>

        <div className="redes-editor-field">
          <label htmlFor="facebook">Facebook</label>

          <input
            id="facebook"
            type="url"
            value={facebook}
            onChange={(event) => setFacebook(event.target.value)}
            placeholder="https://www.facebook.com/..."
            required
          />
        </div>

        <div className="whatsapp-section">
          <div className="whatsapp-section-header">
            <div>
              <h2>WhatsApp</h2>

              <p>Cadastre um ou vários números para atendimento.</p>
            </div>

            <button
              type="button"
              className="whatsapp-add-button"
              onClick={adicionarWhatsApp}
            >
              + Adicionar número
            </button>
          </div>

          {whatsappNumbers.map((item, index) => (
            <div className="whatsapp-item" key={item.id}>
              <div className="whatsapp-item-header">
                <strong>WhatsApp {index + 1}</strong>

                <button
                  type="button"
                  className="whatsapp-remove-button"
                  onClick={() => removerWhatsApp(item.id)}
                >
                  Remover
                </button>
              </div>

              <div className="redes-editor-field">
                <label htmlFor={`nome-whatsapp-${item.id}`}>
                  Nome ou identificação
                </label>

                <input
                  id={`nome-whatsapp-${item.id}`}
                  type="text"
                  value={item.nome}
                  onChange={(event) =>
                    atualizarWhatsApp(
                      item.id,
                      "nome",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Atendimento, Vendas ou Suporte"
                  required
                />
              </div>

              <div className="redes-editor-field">
                <label htmlFor={`numero-whatsapp-${item.id}`}>
                  Número do WhatsApp
                </label>

                <input
                  id={`numero-whatsapp-${item.id}`}
                  type="text"
                  value={item.numero}
                  onChange={(event) =>
                    atualizarWhatsApp(
                      item.id,
                      "numero",
                      event.target.value
                    )
                  }
                  placeholder="5554991805078"
                  required
                />

                <small>
                  Informe com código do país e DDD, sem espaços ou símbolos.
                </small>
              </div>
            </div>
          ))}
        </div>

        <button
          className="redes-editor-button"
          type="submit"
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Salvar redes sociais"}
        </button>
      </form>
    </main>
  );
}

export default RedesSociaisEditor;