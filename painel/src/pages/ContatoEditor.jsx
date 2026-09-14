import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ContatoEditor.css";

const contatoInicial = {
  telefone: "",
  whatsapp: "",
  whatsappSecundario: "",
  email: "",
  endereco: "",
  horario: "",
};

export default function ContatoEditor() {
  const navigate = useNavigate();

  const [form, setForm] = useState(contatoInicial);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarContato() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await fetch(
          "https://bellatompersonalizados.onrender.com/api/contato"
        );

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os dados.");
        }

        const dados = await resposta.json();

        setForm({
          telefone: dados.telefone || "",
          whatsapp: dados.whatsapp || "",
          whatsappSecundario: dados.whatsappSecundario || "",
          email: dados.email || "",
          endereco: dados.endereco || "",
          horario: dados.horario || "",
        });
      } catch (error) {
        console.error("Erro ao carregar contato:", error);

        setErro("Não foi possível carregar os dados de contato.");
      } finally {
        setCarregando(false);
      }
    }

    carregarContato();
  }, []);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setForm((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));

    setMensagem("");
    setErro("");
  }

  async function salvarAlteracoes(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setMensagem("");
      setErro("");

      const resposta = await fetch(
        "https://bellatompersonalizados.onrender.com/api/contato",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Erro ao salvar os dados."
        );
      }

      setForm({
        telefone: dados.telefone || "",
        whatsapp: dados.whatsapp || "",
        whatsappSecundario: dados.whatsappSecundario || "",
        email: dados.email || "",
        endereco: dados.endereco || "",
        horario: dados.horario || "",
      });

      setMensagem("Dados de contato salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar contato:", error);

      setErro(error.message || "Não foi possível salvar os dados.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="contato-editor">
        <div className="contato-editor-header">
          <button
            type="button"
            className="contato-editor-back-button"
            onClick={() => navigate(-1)}
          >
            ← Voltar
          </button>

          <span className="contato-editor-eyebrow">
            EDITOR DO SITE
          </span>

          <h1>Contato</h1>

          <p>Carregando informações de contato...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="contato-editor">
      <div className="contato-editor-header">
        <button
          type="button"
          className="contato-editor-back-button"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>

        <div>
          <span className="contato-editor-eyebrow">
            EDITOR DO SITE
          </span>

          <h1>Contato</h1>

          <p>
            Edite as informações de contato exibidas no site público.
          </p>
        </div>
      </div>

      <form
        className="contato-editor-card"
        onSubmit={salvarAlteracoes}
      >
        <div className="contato-editor-section">
          <h2>Informações principais</h2>

          <p>
            Esses dados serão utilizados na página de contato e nos
            botões de atendimento da Bellatom.
          </p>
        </div>

        <div className="contato-editor-grid">
          <div className="contato-editor-field">
            <label htmlFor="telefone">Telefone</label>

            <input
              id="telefone"
              name="telefone"
              type="text"
              value={form.telefone}
              onChange={alterarCampo}
              placeholder="Digite o telefone"
            />
          </div>

          <div className="contato-editor-field">
            <label htmlFor="whatsapp">WhatsApp principal</label>

            <input
              id="whatsapp"
              name="whatsapp"
              type="text"
              value={form.whatsapp}
              onChange={alterarCampo}
              placeholder="Digite o WhatsApp principal"
            />
          </div>

          <div className="contato-editor-field">
            <label htmlFor="whatsappSecundario">
              WhatsApp secundário
            </label>

            <input
              id="whatsappSecundario"
              name="whatsappSecundario"
              type="text"
              value={form.whatsappSecundario}
              onChange={alterarCampo}
              placeholder="Digite o WhatsApp secundário"
            />
          </div>

          <div className="contato-editor-field">
            <label htmlFor="email">E-mail</label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={alterarCampo}
              placeholder="Digite o e-mail"
            />
          </div>

          <div className="contato-editor-field contato-editor-field-full">
            <label htmlFor="endereco">Endereço</label>

            <input
              id="endereco"
              name="endereco"
              type="text"
              value={form.endereco}
              onChange={alterarCampo}
              placeholder="Digite o endereço"
            />
          </div>

          <div className="contato-editor-field contato-editor-field-full">
            <label htmlFor="horario">Horário de atendimento</label>

            <input
              id="horario"
              name="horario"
              type="text"
              value={form.horario}
              onChange={alterarCampo}
              placeholder="Digite o horário de atendimento"
            />
          </div>
        </div>

        {mensagem && (
          <div className="contato-editor-message">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="contato-editor-message contato-editor-error">
            {erro}
          </div>
        )}

        <div className="contato-editor-actions">
          <button type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </main>
  );
}