import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";

import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import EditorSite from "./pages/EditorSite";
import BannerPrincipal from "./pages/BannerPrincipal";
import EditarBanner from "./pages/EditarBanner";
import GaleriaEditor from "./pages/GaleriaEditor";
import ContatoEditor from "./pages/ContatoEditor";
import RedesSociaisEditor from "./pages/RedesSociaisEditor";

import Pedidos from "./pages/Pedidos";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Estoque from "./pages/Estoque";
import Etiquetas from "./pages/Etiquetas";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Orcamentos from "./pages/Orcamentos";
import BellaIA from "./pages/BellaIA";
import Configuracoes from "./pages/Configuracoes";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cancelarObservador = onAuthStateChanged(
      auth,
      (usuarioAtual) => {
        setUsuario(usuarioAtual);
        setCarregando(false);
      }
    );

    return () => cancelarObservador();
  }, []);

  if (carregando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080d16",
          color: "#00c3ff",
          fontSize: "18px",
          fontWeight: "700",
        }}
      >
        Carregando painel...
      </div>
    );
  }

  if (!usuario) {
    return (
      <Login
        onLogin={() =>
          setUsuario(auth.currentUser)
        }
      />
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<MainLayout />}
      >
        <Route
          index
          element={<Dashboard />}
        />

        <Route
          path="editor"
          element={<EditorSite />}
        />

        <Route
          path="editor/banner"
          element={<BannerPrincipal />}
        />

        <Route
          path="editor/galeria"
          element={<GaleriaEditor />}
        />

        <Route
          path="editor/contato"
          element={<ContatoEditor />}
        />

        <Route
          path="editor/redes-sociais"
          element={<RedesSociaisEditor />}
        />

        <Route
          path="banner/:id"
          element={<EditarBanner />}
        />

        <Route
          path="pedidos"
          element={<Pedidos />}
        />

        <Route
          path="clientes"
          element={<Clientes />}
        />

        <Route
          path="produtos"
          element={<Produtos />}
        />

        <Route
          path="estoque"
          element={<Estoque />}
        />

        <Route
          path="etiquetas"
          element={<Etiquetas />}
        />

        <Route
          path="financeiro"
          element={<Financeiro />}
        />

        <Route
          path="relatorios"
          element={<Relatorios />}
        />

        <Route
          path="orcamentos"
          element={<Orcamentos />}
        />

        <Route
          path="bellaia"
          element={<BellaIA />}
        />

        <Route
          path="configuracoes"
          element={<Configuracoes />}
        />
      </Route>
    </Routes>
  );
}