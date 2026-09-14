import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Contato.css";

const contatoPadrao = {
  telefone: "(54) 99180-5078",
  whatsapp: "(54) 99180-5078",
  whatsappSecundario: "(54) 99272-4941",
  email: "contato@bellatompersonalizados.com.br",
  endereco: "Caxias do Sul - RS",
  horario: "Segunda a sexta, das 8h às 18h",
};

export default function Contato() {
  const [contato, setContato] = useState(contatoPadrao);

  const [formulario, setFormulario] = useState({
    nome: "",
    telefone: "",
    mensagem: "",
  });

  useEffect(() => {
    async function carregarContato() {
      try {
        const resposta = await fetch(
          "https://bellatompersonalizados.onrender.com/api/contato"
        );

        if (!resposta.ok) {
          throw new Error("Erro ao carregar contato.");
        }

        const dados = await resposta.json();

        setContato({
          telefone: dados.telefone || contatoPadrao.telefone,
          whatsapp: dados.whatsapp || contatoPadrao.whatsapp,
          whatsappSecundario:
            dados.whatsappSecundario ||
            contatoPadrao.whatsappSecundario,
          email: dados.email || contatoPadrao.email,
          endereco: dados.endereco || contatoPadrao.endereco,
          horario: dados.horario || contatoPadrao.horario,
        });
      } catch (erro) {
        console.error("Erro ao carregar dados de contato:", erro);
      }
    }

    carregarContato();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));
  }

  function enviarWhatsApp(event) {
    event.preventDefault();

    const mensagem = `
Olá, Bellatom! 🐾🐱

Meu nome é ${formulario.nome}.
Telefone: ${formulario.telefone}

Gostaria de solicitar um orçamento para um produto personalizado. 🐾

Minha ideia:
${formulario.mensagem}

Aguardo o retorno de vocês.
Obrigado! ❤️
    `.trim();

    const numeroWhatsApp = contato.whatsapp.replace(/\D/g, "");

    const url = `https://wa.me/55${numeroWhatsApp}?text=${encodeURIComponent(
      mensagem
    )}`;

    window.open(url, "_blank");
  }

  return (
    <>
      <Header />

      <main className="contato-page">
        <section className="contato-hero">
          <div className="contato-hero-conteudo">
            <span className="contato-tag">Fale com a Bellatom</span>

            <h1>
              Vamos transformar sua ideia em algo
              <strong> especial?</strong>
            </h1>

            <p>
              Entre em contato conosco e solicite um orçamento para
              produtos personalizados, presentes e projetos exclusivos.
            </p>
          </div>
        </section>

        <section className="contato-section">
          <div className="contato-grid">
            <div className="contato-informacoes">
              <span className="contato-subtitulo">Entre em contato</span>

              <h2>Estamos prontos para atender você</h2>

              <p>
                Conte um pouco sobre o que você precisa. Nossa equipe
                entrará em contato para entender sua ideia e preparar
                uma proposta.
              </p>

              <div className="contato-info-lista">
                <div className="contato-info-item">
                  <span className="contato-info-icone">📱</span>

                  <div>
                    <h3>WhatsApp</h3>
                    <p>{contato.whatsapp}</p>
                  </div>
                </div>

                <div className="contato-info-item">
                  <span className="contato-info-icone">📞</span>

                  <div>
                    <h3>Telefone</h3>
                    <p>{contato.telefone}</p>
                  </div>
                </div>

                <div className="contato-info-item">
                  <span className="contato-info-icone">📧</span>

                  <div>
                    <h3>E-mail</h3>
                    <p>{contato.email}</p>
                  </div>
                </div>

                <div className="contato-info-item">
                  <span className="contato-info-icone">📍</span>

                  <div>
                    <h3>Localização</h3>
                    <p>{contato.endereco}</p>
                  </div>
                </div>

                <div className="contato-info-item">
                  <span className="contato-info-icone">🕒</span>

                  <div>
                    <h3>Horário de atendimento</h3>
                    <p>{contato.horario}</p>
                  </div>
                </div>

                <div className="contato-info-item">
                  <span className="contato-info-icone">📸</span>

                  <div>
                    <h3>Instagram</h3>
                    <p>@bellatompersonalizados</p>
                  </div>
                </div>
              </div>
            </div>

            <form
              className="contato-formulario"
              onSubmit={enviarWhatsApp}
            >
              <div className="contato-form-header">
                <span>Solicite seu orçamento</span>
                <h2>Conte sua ideia para nós 🐾</h2>
              </div>

              <label htmlFor="nome">Nome</label>

              <input
                id="nome"
                name="nome"
                type="text"
                placeholder="Digite seu nome"
                value={formulario.nome}
                onChange={handleChange}
                required
              />

              <label htmlFor="telefone">Telefone</label>

              <input
                id="telefone"
                name="telefone"
                type="tel"
                placeholder="(54) 99999-9999"
                value={formulario.telefone}
                onChange={handleChange}
                required
              />

              <label htmlFor="mensagem">Mensagem</label>

              <textarea
                id="mensagem"
                name="mensagem"
                placeholder="Descreva o produto ou projeto que você deseja..."
                rows="6"
                value={formulario.mensagem}
                onChange={handleChange}
                required
              />

              <button type="submit" className="contato-botao">
                Enviar pelo WhatsApp 🐾
                <span>↗</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}