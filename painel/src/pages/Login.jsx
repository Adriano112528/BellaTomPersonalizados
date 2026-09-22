import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      onLogin();
    } catch (error) {
      console.error(error);
      setErro("E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-logo">
          <span>Bellatom</span>
          <small>Painel Administrativo</small>
        </div>

        <h1>Acesso restrito</h1>
        <p>Entre com seu e-mail e senha para continuar.</p>

        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        {erro && <div className="login-erro">{erro}</div>}

        <button type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar no painel"}
        </button>
      </form>
    </main>
  );
}