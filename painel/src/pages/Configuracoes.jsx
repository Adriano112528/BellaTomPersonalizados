import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "../firebase";
import "./Configuracoes.css";

export default function Configuracoes() {
  const navigate = useNavigate();

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const usuario = auth.currentUser;

  const nomeAdministrador =
    usuario?.displayName || "Administrador";

  const emailAdministrador =
    usuario?.email || "E-mail não identificado";

  const statusConta = usuario ? "Conta ativa" : "Desconectado";

  async function sairDaConta() {
    const confirmar = window.confirm(
      "Deseja realmente sair do painel administrativo?"
    );

    if (!confirmar) return;

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair:", error);
      alert("Não foi possível sair da conta.");
    }
  }

  async function recuperarSenha() {
    if (!usuario?.email) {
      setErro("Não foi possível identificar o e-mail do administrador.");
      return;
    }

    setMensagem("");
    setErro("");
    setEnviando(true);

    try {
      await sendPasswordResetEmail(auth, usuario.email);

      setMensagem(
        "E-mail de recuperação enviado. Verifique sua caixa de entrada."
      );
    } catch (error) {
      console.error("Erro ao enviar recuperação:", error);
      setErro("Não foi possível enviar o e-mail de recuperação.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="configuracoes-page">
      <div className="configuracoes-header">
        <button
          type="button"
          className="btn-voltar-configuracoes"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>

        <div>
          <h1>Configurações</h1>
          <p>Gerencie o perfil e a segurança do administrador.</p>
        </div>
      </div>

      <div className="perfil-admin-card">
        <div className="perfil-admin-avatar">
          BT
        </div>

        <div className="perfil-admin-info">
          <div className="perfil-admin-title">
            <div>
              <h2>{nomeAdministrador}</h2>
              <p>Administrador Master</p>
            </div>

            <span className="status-conta">
              <span className="status-ponto" />
              {statusConta}
            </span>
          </div>

          <div className="perfil-admin-email">
            📧 {emailAdministrador}
          </div>
        </div>
      </div>

      <div className="configuracoes-card">
        <div className="configuracoes-icon">⚙️</div>

        <div className="configuracoes-content">
          <h2>Configurações do sistema</h2>

          <p>
            Gerencie sua sessão administrativa e as informações de acesso
            ao painel Bella Tom.
          </p>

          <div className="configuracoes-divider" />

          <h3>Perfil do administrador</h3>

          <div className="perfil-detalhes">
            <div>
              <span>Nome</span>
              <strong>{nomeAdministrador}</strong>
            </div>

            <div>
              <span>Tipo de acesso</span>
              <strong>Master</strong>
            </div>

            <div>
              <span>Status</span>
              <strong className="texto-status">
                ● {statusConta}
              </strong>
            </div>

            <div>
              <span>E-mail</span>
              <strong>{emailAdministrador}</strong>
            </div>
          </div>

          <div className="configuracoes-divider" />

          <h3>Segurança da conta</h3>

          <p>
            Para alterar sua senha, enviaremos um link de recuperação
            para o e-mail cadastrado.
          </p>

          {mensagem && (
            <div className="configuracoes-sucesso">
              {mensagem}
            </div>
          )}

          {erro && (
            <div className="configuracoes-erro">
              {erro}
            </div>
          )}

          <button
            type="button"
            className="btn-recuperar"
            onClick={recuperarSenha}
            disabled={enviando}
          >
            {enviando
              ? "Enviando..."
              : "🔐 Enviar link para alterar senha"}
          </button>

          <button
            type="button"
            className="btn-sair"
            onClick={sairDaConta}
          >
            🚪 Sair do painel
          </button>
        </div>
      </div>
    </div>
  );
}