import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./TopBar.css";

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [mostrarMensagens, setMostrarMensagens] = useState(false);

  const titulos = {
    "/": {
      titulo: "Dashboard",
      subtitulo: "Visão geral do painel Bella Tom",
    },
    "/editor": {
      titulo: "Editor do Site",
      subtitulo: "Personalize e gerencie sua loja",
    },
    "/banner": {
      titulo: "Banner Principal",
      subtitulo: "Gerencie os banners do carrossel",
    },
    "/produtos": {
      titulo: "Produtos",
      subtitulo: "Cadastre e organize os produtos da loja",
    },
    "/pedidos": {
      titulo: "Pedidos",
      subtitulo: "Acompanhe e gerencie os pedidos",
    },
    "/clientes": {
      titulo: "Clientes",
      subtitulo: "Gerencie os clientes cadastrados",
    },
    "/estoque": {
      titulo: "Estoque",
      subtitulo: "Controle os produtos disponíveis",
    },
    "/financeiro": {
      titulo: "Financeiro",
      subtitulo: "Acompanhe as movimentações financeiras",
    },
    "/relatorios": {
      titulo: "Relatórios",
      subtitulo: "Analise os resultados da sua loja",
    },
    "/bellaia": {
      titulo: "Bella IA",
      subtitulo: "Assistente inteligente da Bella Tom",
    },
    "/configuracoes": {
      titulo: "Configurações",
      subtitulo: "Gerencie as configurações do painel",
    },
  };

  const paginaAtual = titulos[location.pathname] || {
    titulo: "Bella Tom",
    subtitulo: "Painel administrativo",
  };

  function abrirNotificacoes() {
    setMostrarNotificacoes(!mostrarNotificacoes);
    setMostrarMensagens(false);
  }

  function abrirMensagens() {
    setMostrarMensagens(!mostrarMensagens);
    setMostrarNotificacoes(false);
  }

  function abrirConfiguracoes() {
    navigate("/configuracoes");
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="page-title">
          <h2>{paginaAtual.titulo}</h2>
          <span>{paginaAtual.subtitulo}</span>
        </div>
      </div>

      <div className="topbar-center">
        <input
          type="text"
          placeholder="Pesquisar pedidos, clientes, produtos..."
        />
      </div>

      <div className="topbar-right">
        <div className="topbar-action">
          <button
            type="button"
            className="icon-button"
            onClick={abrirNotificacoes}
            title="Notificações"
          >
            🔔
            <span className="badge">3</span>
          </button>

          {mostrarNotificacoes && (
            <div className="topbar-dropdown">
              <h4>Notificações</h4>
              <p>Você possui 3 notificações pendentes.</p>

              <button
                type="button"
                onClick={() => setMostrarNotificacoes(false)}
              >
                Fechar
              </button>
            </div>
          )}
        </div>

        <div className="topbar-action">
          <button
            type="button"
            className="icon-button"
            onClick={abrirMensagens}
            title="Mensagens"
          >
            💬
          </button>

          {mostrarMensagens && (
            <div className="topbar-dropdown">
              <h4>Mensagens</h4>
              <p>Nenhuma mensagem nova no momento.</p>

              <button
                type="button"
                onClick={() => setMostrarMensagens(false)}
              >
                Fechar
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={abrirConfiguracoes}
          title="Configurações do administrador"
        >
          ⚙️
        </button>

        <button
          type="button"
          className="user"
          onClick={abrirConfiguracoes}
          title="Abrir configurações do administrador"
        >
          <div className="avatar">BT</div>

          <div className="user-info">
            <strong>Administrador</strong>
            <small>Master</small>
          </div>
        </button>
      </div>
    </header>
  );
}