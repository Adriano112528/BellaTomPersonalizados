import { useEffect, useRef, useState } from "react";

import {
  carregarEstoque,
  carregarMovimentacoes,
  buscarProdutoPorCodigo,
  registrarEntrada,
  registrarSaida,
} from "../services/estoqueService";

export default function Estoque() {
  const [estoque, setEstoque] = useState([]);
  const [movimentacoes, setMovimentacoes] =
    useState([]);

  const [carregando, setCarregando] = useState(false);
  const [processando, setProcessando] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [busca, setBusca] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] =
    useState(null);

  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");

  const [tipoMovimentacao, setTipoMovimentacao] =
    useState("entrada");

  const campoCodigoRef = useRef(null);

  // ========================================
  // CARREGAR DADOS
  // ========================================

  async function carregarDados() {
    setErro("");
    setCarregando(true);

    try {
      const estoqueAtual = await carregarEstoque();
      const movimentacoesAtual =
        await carregarMovimentacoes();

      let listaProdutos = estoqueAtual;
      if (estoqueAtual && !Array.isArray(estoqueAtual)) {
        listaProdutos = estoqueAtual.data || estoqueAtual.produtos || [];
      }

      if (Array.isArray(listaProdutos)) {
        setEstoque(listaProdutos);
      } else {
        setEstoque([]);
      }

      let listaMov = movimentacoesAtual;
      if (movimentacoesAtual && !Array.isArray(movimentacoesAtual)) {
        listaMov = movimentacoesAtual.data || movimentacoesAtual.movimentacoes || [];
      }

      if (Array.isArray(listaMov)) {
        setMovimentacoes(listaMov);
      } else {
        setMovimentacoes([]);
      }
    } catch (error) {
      console.error(
        "ERRO AO CARREGAR ESTOQUE:",
        error
      );

      setErro(
        error?.message ||
          "Não foi possível carregar o estoque."
      );

      setEstoque([]);
      setMovimentacoes([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // ========================================
  // FUNÇÕES DE APOIO
  // ========================================

  function obterEstoqueProduto(produto) {
    return Number(produto?.estoque ?? produto?.Estoque ?? produto?.quantidade ?? 0);
  }

  function obterMinimoProduto(produto) {
    return Number(produto?.estoqueMinimo ?? produto?.EstoqueMinimo ?? produto?.minimo ?? 0);
  }

  // ========================================
  // FOCO NO LEITOR
  // ========================================

  useEffect(() => {
    if (!produtoSelecionado) {
      setTimeout(() => {
        campoCodigoRef.current?.focus();
      }, 100);
    }
  }, [produtoSelecionado]);

  // ========================================
  // BUSCAR PRODUTO PELO CÓDIGO
  // ========================================

  async function procurarProduto(codigoInformado) {
    const codigo = String(
      codigoInformado || ""
    ).trim();

    if (!codigo) {
      return;
    }

    try {
      setErro("");
      setMensagem("");

      const produto =
        await buscarProdutoPorCodigo(codigo);

      setProdutoSelecionado(produto);
      setCodigoBarras(
        produto?.codigoBarras || codigo
      );

      setQuantidade("");
      setMotivo("");

      setTimeout(() => {
        document
          .getElementById("campo-quantidade-estoque")
          ?.focus();
      }, 100);
    } catch (error) {
      console.error(
        "Erro ao procurar produto:",
        error
      );

      setProdutoSelecionado(null);

      setErro(
        error?.message ||
          "Produto não encontrado pelo código de barras."
      );

      setTimeout(() => {
        campoCodigoRef.current?.focus();
        campoCodigoRef.current?.select();
      }, 100);
    }
  }

  // ========================================
  // LEITOR DE CÓDIGO DE BARRAS
  // ========================================

  function handleCodigoChange(event) {
    setCodigoBarras(event.target.value);
    setErro("");
    setMensagem("");
  }

  function handleCodigoKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();

      procurarProduto(
        event.currentTarget.value
      );
    }
  }

  // ========================================
  // LIMPAR OPERAÇÃO
  // ========================================

  function limparOperacao() {
    setProdutoSelecionado(null);
    setCodigoBarras("");
    setQuantidade("");
    setMotivo("");
    setErro("");
    setMensagem("");

    setTimeout(() => {
      campoCodigoRef.current?.focus();
    }, 100);
  }

  // ========================================
  // REGISTRAR MOVIMENTAÇÃO
  // ========================================

  async function executarMovimentacao() {
    if (!produtoSelecionado) {
      setErro(
        "Primeiro informe ou leia o código de barras do produto."
      );
      return;
    }

    const quantidadeTexto = String(quantidade ?? "").trim();

    if (!/^\d+$/.test(quantidadeTexto)) {
      setErro("A quantidade deve conter somente números inteiros.");
      return;
    }

    const quantidadeNumerica = Number(quantidadeTexto);

    if (
      !Number.isSafeInteger(quantidadeNumerica) ||
      quantidadeNumerica <= 0 ||
      quantidadeNumerica > 9999
    ) {
      setErro(
        "Quantidade inválida. Informe uma quantidade inteira entre 1 e 9.999."
      );
      return;
    }

    const estoqueAtual = obterEstoqueProduto(produtoSelecionado);

    if (
      tipoMovimentacao === "saida" &&
      quantidadeNumerica > estoqueAtual
    ) {
      setErro(
        `Estoque insuficiente. Estoque atual: ${estoqueAtual}.`
      );
      return;
    }

    try {
      setProcessando(true);
      setErro("");
      setMensagem("");

      if (tipoMovimentacao === "entrada") {
        await registrarEntrada(
          produtoSelecionado.id,
          quantidadeNumerica,
          motivo
        );
      } else {
        await registrarSaida(
          produtoSelecionado.id,
          quantidadeNumerica,
          motivo
        );
      }

      setMensagem(
        tipoMovimentacao === "entrada"
          ? `Entrada de ${quantidadeNumerica} unidade(s) registrada com sucesso.`
          : `Saída de ${quantidadeNumerica} unidade(s) registrada com sucesso.`
      );

      limparOperacao();
      await carregarDados();
    } catch (error) {
      console.error(
        "Erro ao registrar movimentação:",
        error
      );

      setErro(
        error?.message ||
          "Não foi possível registrar a movimentação."
      );
    } finally {
      setProcessando(false);
    }
  }

  // ========================================
  // FILTRAR ESTOQUE
  // ========================================

  const estoqueFiltrado = Array.isArray(estoque)
    ? estoque.filter((produto) => {
        const termo = String(
          busca || ""
        )
          .trim()
          .toLowerCase();

        if (!termo) {
          return true;
        }

        return (
          String(produto.nome || "")
            .toLowerCase()
            .includes(termo) ||
          String(produto.codigoBarras || "")
            .toLowerCase()
            .includes(termo) ||
          String(produto.categoria || "")
            .toLowerCase()
            .includes(termo)
        );
      })
    : [];

  // ========================================
  // RESUMO DOS CARDS NO TOPO
  // ========================================

  const totalProdutos = Array.isArray(estoqueFiltrado)
    ? estoqueFiltrado.length
    : 0;

  const estoqueZerado = Array.isArray(estoque)
    ? estoque.filter((produto) => obterEstoqueProduto(produto) <= 0).length
    : 0;

  const estoqueBaixo = Array.isArray(estoque)
    ? estoque.filter((produto) => {
        const qtd = obterEstoqueProduto(produto);
        const min = obterMinimoProduto(produto);
        return qtd > 0 && qtd <= min;
      }).length
    : 0;

  const estoqueNormal = Array.isArray(estoque)
    ? estoque.filter((produto) => {
        const qtd = obterEstoqueProduto(produto);
        const min = obterMinimoProduto(produto);
        return qtd > min;
      }).length
    : 0;

  // ========================================
  // STATUS
  // ========================================

  function obterStatus(produto) {
    const quantidadeProduto = obterEstoqueProduto(produto);
    const minimo = obterMinimoProduto(produto);

    if (quantidadeProduto <= 0) {
      return {
        texto: "ZERADO",
        classe: "zerado",
      };
    }

    if (quantidadeProduto <= minimo) {
      return {
        texto: "BAIXO",
        classe: "baixo",
      };
    }

    return {
      texto: "NORMAL",
      classe: "normal",
    };
  }

  // ========================================
  // DATA
  // ========================================

  function formatarData(data) {
    if (!data) {
      return "-";
    }

    try {
      return new Date(data).toLocaleString(
        "pt-BR"
      );
    } catch {
      return data;
    }
  }

  // ========================================
  // TIPO DA MOVIMENTAÇÃO
  // ========================================

  function obterTipoMovimentacao(
    movimentacao
  ) {
    const tipo = String(
      movimentacao.tipo ||
        movimentacao.tipoMovimentacao ||
        ""
    ).toLowerCase();

    if (tipo.includes("entrada")) {
      return {
        texto: "ENTRADA",
        classe: "entrada",
      };
    }

    if (tipo.includes("saida")) {
      return {
        texto: "SAÍDA",
        classe: "saida",
      };
    }

    if (tipo.includes("ajuste")) {
      return {
        texto: "AJUSTE",
        classe: "ajuste",
      };
    }

    return {
      texto:
        movimentacao.tipo ||
        "MOVIMENTAÇÃO",
      classe: "ajuste",
    };
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="estoque-page">
      <style>{`
        .estoque-page {
          min-height: 100%;
          padding: 30px;
          color: #ffffff;
          background: #0b0b0b;
          box-sizing: border-box;
        }

        .estoque-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .estoque-titulo h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 700;
          color: #ffffff;
        }

        .estoque-titulo p {
          margin: 7px 0 0;
          color: #999999;
          font-size: 14px;
        }

        .botao-atualizar {
          border: 1px solid #3a3a3a;
          background: #151515;
          color: #ffffff;
          padding: 11px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          transition: 0.2s;
        }

        .botao-atualizar:hover {
          border-color: #d4af37;
          color: #d4af37;
        }

        .botao-atualizar:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .resumo-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 18px;
          margin-bottom: 25px;
        }

        .resumo-card {
          background: #151515;
          border: 1px solid #252525;
          border-radius: 16px;
          padding: 20px;
          box-sizing: border-box;
        }

        .resumo-label {
          color: #888888;
          font-size: 13px;
          margin-bottom: 10px;
        }

        .resumo-valor {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
        }

        .resumo-card.destaque {
          border-color: rgba(
            212,
            175,
            55,
            0.35
          );
        }

        .resumo-card.destaque
          .resumo-valor {
          color: #d4af37;
        }

        .resumo-card.alerta {
          border-color: rgba(
            255,
            180,
            0,
            0.35
          );
        }

        .resumo-card.alerta
          .resumo-valor {
          color: #ffb400;
        }

        .resumo-card.perigo {
          border-color: rgba(
            255,
            80,
            80,
            0.35
          );
        }

        .resumo-card.perigo
          .resumo-valor {
          color: #ff5f5f;
        }

        .operacao-card {
          background: #111111;
          border: 1px solid #292929;
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 25px;
        }

        .operacao-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .operacao-header h2 {
          margin: 0;
          font-size: 19px;
          color: #ffffff;
        }

        .operacao-header span {
          color: #777777;
          font-size: 13px;
        }

        .tipo-botoes {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
        }

        .tipo-botao {
          flex: 1;
          border: 1px solid #333333;
          background: #171717;
          color: #aaaaaa;
          padding: 13px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          transition: 0.2s;
        }

        .tipo-botao:hover {
          border-color: #555555;
        }

        .tipo-botao.ativo-entrada {
          border-color: #65d68a;
          background: rgba(
            101,
            214,
            138,
            0.08
          );
          color: #65d68a;
        }

        .tipo-botao.ativo-saida {
          border-color: #ff5f5f;
          background: rgba(
            255,
            95,
            95,
            0.08
          );
          color: #ff5f5f;
        }

        .campo-leitor {
          width: 100%;
          box-sizing: border-box;
          background: #080808;
          border: 2px solid #333333;
          color: #ffffff;
          border-radius: 12px;
          padding: 16px 18px;
          outline: none;
          font-size: 18px;
          font-family: monospace;
          transition: 0.2s;
        }

        .campo-leitor:focus {
          border-color: #d4af37;
          box-shadow:
            0 0 0 3px
            rgba(212, 175, 55, 0.08);
        }

        .leitor-ajuda {
          margin-top: 8px;
          color: #777777;
          font-size: 12px;
        }

        .produto-selecionado {
          margin-top: 20px;
          padding: 18px;
          border: 1px solid #333333;
          background: #171717;
          border-radius: 14px;
        }

        .produto-selecionado-topo {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
        }

        .produto-selecionado-nome {
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
        }

        .produto-selecionado-categoria {
          color: #888888;
          font-size: 12px;
          margin-top: 4px;
        }

        .estoque-atual {
          text-align: right;
        }

        .estoque-atual-label {
          color: #777777;
          font-size: 11px;
          text-transform: uppercase;
        }

        .estoque-atual-numero {
          color: #d4af37;
          font-size: 25px;
          font-weight: 700;
        }

        .campos-operacao {
          display: grid;
          grid-template-columns:
            minmax(150px, 180px)
            1fr;
          gap: 12px;
          margin-top: 18px;
        }

        .campo-grupo {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .campo-grupo label {
          color: #999999;
          font-size: 12px;
          font-weight: 600;
        }

        .campo-operacao {
          width: 100%;
          box-sizing: border-box;
          background: #0b0b0b;
          border: 1px solid #333333;
          color: #ffffff;
          border-radius: 9px;
          padding: 12px;
          outline: none;
          font-size: 14px;
        }

        .campo-operacao:focus {
          border-color: #d4af37;
        }

        .botoes-operacao {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        .botao-confirmar {
          flex: 1;
          border: none;
          border-radius: 10px;
          padding: 13px 18px;
          font-weight: 700;
          cursor: pointer;
          color: #ffffff;
        }

        .botao-confirmar.entrada {
          background: #276b3f;
        }

        .botao-confirmar.saida {
          background: #8c3030;
        }

        .botao-confirmar:hover {
          opacity: 0.88;
        }

        .botao-confirmar:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .botao-cancelar {
          border: 1px solid #333333;
          background: #171717;
          color: #aaaaaa;
          border-radius: 10px;
          padding: 13px 18px;
          cursor: pointer;
        }

        .mensagem-sucesso {
          background: rgba(
            101,
            214,
            138,
            0.08
          );
          border: 1px solid rgba(
            101,
            214,
            138,
            0.3
          );
          color: #65d68a;
          border-radius: 10px;
          padding: 13px 16px;
          margin-bottom: 18px;
        }

        .mensagem-erro {
          background: rgba(
            255,
            80,
            80,
            0.08
          );
          border: 1px solid rgba(
            255,
            80,
            80,
            0.3
          );
          color: #ff8585;
          border-radius: 10px;
          padding: 13px 16px;
          margin-bottom: 18px;
        }

        .ferramentas-estoque {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .campo-busca {
          flex: 1;
          min-width: 260px;
          background: #151515;
          border: 1px solid #2c2c2c;
          border-radius: 11px;
          padding: 13px 16px;
          color: #ffffff;
          outline: none;
          font-size: 14px;
          box-sizing: border-box;
        }

        .campo-busca:focus {
          border-color: #d4af37;
        }

        .estoque-card {
          background: #111111;
          border: 1px solid #242424;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 25px;
        }

        .estoque-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 20px;
          border-bottom: 1px solid #242424;
        }

        .estoque-card-header h2 {
          margin: 0;
          font-size: 18px;
          color: #ffffff;
        }

        .contador-produtos {
          color: #888888;
          font-size: 13px;
        }

        .tabela-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .estoque-tabela {
          width: 100%;
          border-collapse: collapse;
          min-width: 850px;
        }

        .estoque-tabela th {
          text-align: left;
          padding: 15px;
          color: #888888;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          border-bottom: 1px solid #242424;
          background: #0e0e0e;
        }

        .estoque-tabela td {
          padding: 16px 15px;
          border-bottom: 1px solid #1e1e1e;
          font-size: 14px;
          color: #dddddd;
        }

        .estoque-tabela tbody tr:hover {
          background: #171717;
        }

        .produto-nome {
          color: #ffffff;
          font-weight: 600;
        }

        .produto-categoria {
          color: #888888;
          font-size: 12px;
          margin-top: 4px;
        }

        .codigo-barras {
          color: #999999;
          font-family: monospace;
          font-size: 13px;
        }

        .estoque-numero {
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
        }

        .estoque-minimo {
          color: #888888;
        }

        .status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .status.normal {
          color: #65d68a;
          background: rgba(
            101,
            214,
            138,
            0.1
          );
        }

        .status.baixo {
          color: #ffb400;
          background: rgba(
            255,
            180,
            0,
            0.1
          );
        }

        .status.zerado {
          color: #ff5f5f;
          background: rgba(
            255,
            95,
            95,
            0.1
          );
        }

        .movimentacao-tipo {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 15px;
          font-size: 10px;
          font-weight: 700;
        }

        .movimentacao-tipo.entrada {
          color: #65d68a;
          background: rgba(
            101,
            214,
            138,
            0.1
          );
        }

        .movimentacao-tipo.saida {
          color: #ff5f5f;
          background: rgba(
            255,
            95,
            95,
            0.1
          );
        }

        .movimentacao-tipo.ajuste {
          color: #d4af37;
          background: rgba(
            212,
            175,
            55,
            0.1
          );
        }

        .quantidade-entrada {
          color: #65d68a;
          font-weight: 700;
        }

        .quantidade-saida {
          color: #ff5f5f;
          font-weight: 700;
        }

        .sem-dados {
          padding: 45px 20px;
          text-align: center;
          color: #777777;
        }

        .carregando {
          padding: 50px 20px;
          text-align: center;
          color: #999999;
        }

        .historico-motivo {
          color: #999999;
          font-size: 12px;
        }

        @media (max-width: 1000px) {
          .resumo-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }
        }

        @media (max-width: 700px) {
          .campos-operacao {
            grid-template-columns: 1fr;
          }

          .tipo-botoes {
            flex-direction: column;
          }
        }

        @media (max-width: 600px) {
          .estoque-page {
            padding: 20px;
          }

          .resumo-grid {
            grid-template-columns: 1fr;
          }

          .estoque-titulo h1 {
            font-size: 25px;
          }

          .botoes-operacao {
            flex-direction: column;
          }
        }
      `}</style>

      {/* ========================================
          CABEÇALHO
          ======================================== */}

      <div className="estoque-header">
        <div className="estoque-titulo">
          <h1>Estoque</h1>

          <p>
            Controle interno de produtos e
            movimentações
          </p>
        </div>

        <button
          className="botao-atualizar"
          onClick={carregarDados}
          disabled={carregando}
        >
          ↻ Atualizar estoque
        </button>
      </div>

      {/* ========================================
          MENSAGENS
          ======================================== */}

      {mensagem && (
        <div className="mensagem-sucesso">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="mensagem-erro">
          {erro}
        </div>
      )}

      {/* ========================================
          RESUMO
          ======================================== */}

      <div className="resumo-grid">
        <div className="resumo-card destaque">
          <div className="resumo-label">
            Total de produtos
          </div>

          <div className="resumo-valor">
            {totalProdutos}
          </div>
        </div>

        <div className="resumo-card">
          <div className="resumo-label">
            Estoque normal
          </div>

          <div className="resumo-valor">
            {estoqueNormal}
          </div>
        </div>

        <div className="resumo-card alerta">
          <div className="resumo-label">
            Estoque baixo
          </div>

          <div className="resumo-valor">
            {estoqueBaixo}
          </div>
        </div>

        <div className="resumo-card perigo">
          <div className="resumo-label">
            Estoque zerado
          </div>

          <div className="resumo-valor">
            {estoqueZerado}
          </div>
        </div>
      </div>

      {/* ========================================
          OPERAÇÃO DE ESTOQUE
          ======================================== */}

      <div className="operacao-card">
        <div className="operacao-header">
          <h2>
            📦 Movimentar estoque
          </h2>

          <span>
            Use o leitor de código de barras
          </span>
        </div>

        <div className="tipo-botoes">
          <button
            type="button"
            className={`tipo-botao ${
              tipoMovimentacao === "entrada"
                ? "ativo-entrada"
                : ""
            }`}
            onClick={() => {
              setTipoMovimentacao("entrada");
              setErro("");
              setMensagem("");
            }}
          >
            🟢 ENTRADA
          </button>

          <button
            type="button"
            className={`tipo-botao ${
              tipoMovimentacao === "saida"
                ? "ativo-saida"
                : ""
            }`}
            onClick={() => {
              setTipoMovimentacao("saida");
              setErro("");
              setMensagem("");
            }}
          >
            🔴 SAÍDA
          </button>
        </div>

        <input
          ref={campoCodigoRef}
          className="campo-leitor"
          type="text"
          value={codigoBarras}
          onChange={handleCodigoChange}
          onKeyDown={handleCodigoKeyDown}
          placeholder="🔎 Passe o código de barras no leitor..."
          autoComplete="off"
        />

        <div className="leitor-ajuda">
          Passe o produto no leitor e pressione
          ENTER. A maioria dos leitores USB funciona
          como teclado.
        </div>

        {produtoSelecionado && (
          <div className="produto-selecionado">
            <div className="produto-selecionado-topo">
              <div>
                <div className="produto-selecionado-nome">
                  {produtoSelecionado.nome}
                </div>

                <div className="produto-selecionado-categoria">
                  {produtoSelecionado.categoria ||
                    "Sem categoria"}
                  {" • "}
                  Código:{" "}
                  {produtoSelecionado.codigoBarras ||
                    codigoBarras}
                </div>
              </div>

              <div className="estoque-atual">
                <div className="estoque-atual-label">
                  Estoque atual
                </div>

                <div className="estoque-atual-numero">
                  {obterEstoqueProduto(produtoSelecionado)}
                </div>
              </div>
            </div>

            <div className="campos-operacao">
              <div className="campo-grupo">
                <label>
                  Quantidade
                </label>

                                <input
                  id="campo-quantidade-estoque"
                  className="campo-operacao"
                  type="number"
                  min="1"
                  max="9999"
                  step="1"
                  inputMode="numeric"
                  value={quantidade}
                  onChange={(event) => {
                    const valor = event.target.value;

                    if (/^\d*$/.test(valor)) {
                      setQuantidade(valor);
                    }

                    setErro("");
                    setMensagem("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      executarMovimentacao();
                    }
                  }}
                />
              </div>

              <div className="campo-grupo">
                <label>
                  Motivo
                </label>

                <input
                  className="campo-operacao"
                  type="text"
                  value={motivo}
                  onChange={(event) =>
                    setMotivo(
                      event.target.value
                    )
                  }
                  placeholder={
                    tipoMovimentacao ===
                    "entrada"
                      ? "Ex.: Compra / reposição"
                      : "Ex.: Venda / retirada"
                  }
                />
              </div>
            </div>

            <div className="botoes-operacao">
              <button
                type="button"
                className={`botao-confirmar ${
                  tipoMovimentacao
                }`}
                onClick={
                  executarMovimentacao
                }
                disabled={processando}
              >
                {processando
                  ? "Processando..."
                  : tipoMovimentacao ===
                    "entrada"
                  ? "✓ Registrar entrada"
                  : "✓ Registrar saída"}
              </button>

              <button
                type="button"
                className="botao-cancelar"
                onClick={limparOperacao}
                disabled={processando}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================
          BUSCA
          ======================================== */}

      <div className="ferramentas-estoque">
        <input
          className="campo-busca"
          type="text"
          placeholder="Buscar por produto, categoria ou código de barras..."
          value={busca}
          onChange={(event) =>
            setBusca(event.target.value)
          }
        />
      </div>

      {/* ========================================
          PRODUTOS
          ======================================== */}

      <div className="estoque-card">
        <div className="estoque-card-header">
          <h2>
            Produtos em estoque
          </h2>

          <span className="contador-produtos">
            {estoqueFiltrado.length} produto(s)
          </span>
        </div>

        {carregando ? (
          <div className="carregando">
            Carregando estoque...
          </div>
        ) : estoqueFiltrado.length === 0 ? (
          <div className="sem-dados">
            {busca
              ? "Nenhum produto encontrado para essa busca."
              : "Nenhum produto cadastrado no estoque."}
          </div>
        ) : (
          <div className="tabela-wrapper">
            <table className="estoque-tabela">
              <thead>
                <tr>
                  <th>
                    Produto
                  </th>

                  <th>
                    Código de barras
                  </th>

                  <th>
                    Estoque
                  </th>

                  <th>
                    Mínimo
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {estoqueFiltrado.map(
                  (produto) => {
                    const status =
                      obterStatus(produto);

                    const qtdExibida = obterEstoqueProduto(produto);
                    const minimoExibido = obterMinimoProduto(produto);

                    return (
                      <tr
                        key={produto.id}
                      >
                        <td>
                          <div className="produto-nome">
                            {produto.nome}
                          </div>

                          <div className="produto-categoria">
                            {produto.categoria ||
                              "Sem categoria"}
                          </div>
                        </td>

                        <td>
                          <span className="codigo-barras">
                            {produto.codigoBarras ||
                              "Não cadastrado"}
                          </span>
                        </td>

                        <td>
                          <span className="estoque-numero">
                            {qtdExibida}
                          </span>
                        </td>

                        <td>
                          <span className="estoque-minimo">
                            {minimoExibido}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status ${status.classe}`}
                          >
                            {status.texto}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================
          HISTÓRICO
          ======================================== */}

      <div className="estoque-card">
        <div className="estoque-card-header">
          <h2>
            Histórico de movimentações
          </h2>

          <span className="contador-produtos">
            {movimentacoes.length} movimentação(ões)
          </span>
        </div>

        {movimentacoes.length === 0 ? (
          <div className="sem-dados">
            Nenhuma movimentação registrada.
          </div>
        ) : (
          <div className="tabela-wrapper">
            <table className="estoque-tabela">
              <thead>
                <tr>
                  <th>
                    Dados
                  </th>

                  <th>
                    Produto
                  </th>

                  <th>
                    Tipo
                  </th>

                  <th>
                    Quantidade
                  </th>

                  <th>
                    Antes
                  </th>

                  <th>
                    Depois
                  </th>

                  <th>
                    Motivo
                  </th>
                </tr>
              </thead>

              <tbody>
                {movimentacoes.map(
                  (movimentacao, index) => {
                    const tipo =
                      obterTipoMovimentacao(
                        movimentacao
                      );

                    const quantidadeMov =
                      Number(
                        movimentacao.quantidade ||
                          movimentacao.qtd ||
                          0
                      );

                    const produtoNome =
                      movimentacao.produtoNome ||
                      movimentacao.nomeProduto ||
                      movimentacao.produto?.nome ||
                      `Produto #${
                        movimentacao.produtoId ||
                        "-"
                      }`;

                    const estoqueAnterior =
                      movimentacao.estoqueAnterior ??
                      movimentacao.antes ??
                      "-";

                    const estoqueAtual =
                      movimentacao.estoquePosterior ??
                      movimentacao.estoqueAtual ??
                      movimentacao.depois ??
                      "-";

                    const motivoMov =
                      movimentacao.motivo ||
                      movimentacao.descricao ||
                      "-";

                    const dataMov =
                      movimentacao.criadoEm ||
                      movimentacao.createdAt ||
                      movimentacao.data ||
                      movimentacao.dataMovimentacao;

                    return (
                      <tr
                        key={
                          movimentacao.id ||
                          index
                        }
                      >
                        <td>
                          {formatarData(
                            dataMov
                          )}
                        </td>

                        <td>
                          <div className="produto-nome">
                            {produtoNome}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`movimentacao-tipo ${tipo.classe}`}
                          >
                            {tipo.texto}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              tipo.classe ===
                              "entrada"
                                ? "quantidade-entrada"
                                : tipo.classe ===
                                  "saida"
                                ? "quantidade-saida"
                                : ""
                            }
                          >
                            {tipo.classe ===
                            "saida"
                              ? "-"
                              : tipo.classe ===
                                "entrada"
                              ? "+"
                              : ""}
                            {quantidadeMov}
                          </span>
                        </td>

                        <td>
                          {estoqueAnterior}
                        </td>

                        <td>
                          {estoqueAtual}
                        </td>

                        <td>
                          <span className="historico-motivo">
                            {motivoMov}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}