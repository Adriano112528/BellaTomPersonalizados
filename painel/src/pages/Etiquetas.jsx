import { useEffect, useState } from "react";
import JsBarcode from "jsbarcode";
import {
  ArrowLeft,
  Barcode,
  Package,
  Printer,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { carregarProdutos } from "../services/produtoService";

export default function Etiquetas() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState(null);

  const [quantidade, setQuantidade] = useState(1);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState("");

  const quantidadeFinal = Math.max(
    1,
    Math.min(100, Number(quantidade) || 1)
  );

  // =====================================================
  // CARREGAR PRODUTOS
  // =====================================================

  async function carregarListaProdutos() {
    setCarregando(true);
    setErro("");

    try {
      const dados = await carregarProdutos();

      const lista = Array.isArray(dados)
        ? dados
        : [];

      setProdutos(lista);

      if (lista.length > 0) {
        const primeiroComCodigo =
          lista.find(
            (item) =>
              item.codigoBarras &&
              String(item.codigoBarras).trim() !== ""
          );

        setProdutoSelecionado(
          primeiroComCodigo || lista[0]
        );
      } else {
        setProdutoSelecionado(null);
      }
    } catch (error) {
      console.error(
        "Erro ao carregar produtos:",
        error
      );

      setErro(
        "Não foi possível carregar os produtos."
      );

      setProdutos([]);
      setProdutoSelecionado(null);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarListaProdutos();
  }, []);

  // =====================================================
  // GERAR CÓDIGO DE BARRAS
  // =====================================================

  useEffect(() => {
    if (
      !produtoSelecionado?.codigoBarras
    ) {
      return;
    }

    const codigo = String(
      produtoSelecionado.codigoBarras
    ).trim();

    if (!codigo) {
      return;
    }

    const elementos =
      document.querySelectorAll(
        ".etiqueta-codigo-svg"
      );

    elementos.forEach((elemento) => {
      try {
        JsBarcode(elemento, codigo, {
          format: "CODE128",
          width: 1.4,
          height: 32,
          displayValue: false,
          margin: 0,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch (error) {
        console.error(
          "Erro ao gerar código de barras:",
          error
        );
      }
    });
  }, [
    produtoSelecionado,
    quantidadeFinal,
  ]);

  // =====================================================
  // SELECIONAR PRODUTO
  // =====================================================

  function selecionarProduto(event) {
    const id = Number(
      event.target.value
    );

    const produtoEncontrado =
      produtos.find(
        (item) =>
          Number(item.id) === id
      );

    setProdutoSelecionado(
      produtoEncontrado || null
    );
  }

  // =====================================================
  // QUANTIDADE
  // =====================================================

  function alterarQuantidade(event) {
    const valor = Number(
      event.target.value
    );

    if (!Number.isFinite(valor)) {
      setQuantidade(1);
      return;
    }

    const valorLimitado =
      Math.max(
        1,
        Math.min(
          100,
          Math.floor(valor)
        )
      );

    setQuantidade(valorLimitado);
  }

  // =====================================================
  // IMPRIMIR
  // =====================================================

  function imprimirEtiquetas() {
    if (!produtoSelecionado) {
      alert(
        "Selecione um produto."
      );
      return;
    }

    if (
      !produtoSelecionado.codigoBarras ||
      String(
        produtoSelecionado.codigoBarras
      ).trim() === ""
    ) {
      alert(
        "Este produto não possui código de barras."
      );
      return;
    }

    window.print();
  }

  // =====================================================
  // ATUALIZAR
  // =====================================================

  async function atualizarProdutos() {
    await carregarListaProdutos();
  }

  // =====================================================
  // TELA
  // =====================================================

  return (
    <div className="etiquetas-page">

      <style>{`

        * {
          box-sizing: border-box;
        }

        /* =================================================
           PÁGINA
        ================================================= */

        .etiquetas-page {
          min-height: 100vh;

          padding: 30px;

          background: #0d0d0f;

          color: #ffffff;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        /* =================================================
           CABEÇALHO
        ================================================= */

        .etiquetas-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          margin-bottom: 30px;
        }

        .etiquetas-header-left {
          display: flex;

          align-items: center;

          gap: 15px;
        }

        .etiquetas-voltar {
          width: 44px;

          height: 44px;

          border-radius: 10px;

          border: 1px solid #303035;

          background: #17171b;

          color: #ffffff;

          display: flex;

          align-items: center;

          justify-content: center;

          cursor: pointer;

          transition: 0.2s;
        }

        .etiquetas-voltar:hover {
          border-color: #d4af37;

          color: #d4af37;
        }

        .etiquetas-icon {
          width: 48px;

          height: 48px;

          border-radius: 12px;

          background:
            rgba(212, 175, 55, 0.10);

          border:
            1px solid
            rgba(212, 175, 55, 0.30);

          color: #d4af37;

          display: flex;

          align-items: center;

          justify-content: center;
        }

        .etiquetas-header h1 {
          margin: 0;

          font-size: 28px;

          font-weight: 700;
        }

        .etiquetas-header p {
          margin: 5px 0 0;

          color: #85858d;

          font-size: 14px;
        }

        /* =================================================
           LAYOUT
        ================================================= */

        .etiquetas-layout {
          display: grid;

          grid-template-columns:
            360px minmax(0, 1fr);

          gap: 25px;

          align-items: start;
        }

        .etiquetas-config {
          background: #151518;

          border:
            1px solid #29292f;

          border-radius: 18px;

          padding: 24px;
        }

        .etiquetas-config h2 {
          margin:
            0 0 22px;

          font-size: 18px;
        }

        /* =================================================
           CAMPOS
        ================================================= */

        .campo-etiqueta {
          margin-bottom: 20px;
        }

        .campo-etiqueta label {
          display: block;

          margin-bottom: 8px;

          color: #d8d8dc;

          font-size: 13px;

          font-weight: 600;
        }

        .campo-etiqueta select,
        .campo-etiqueta input {
          width: 100%;

          height: 46px;

          padding:
            0 13px;

          border-radius: 10px;

          border:
            1px solid #34343b;

          background: #1d1d22;

          color: #ffffff;

          outline: none;

          font-size: 14px;
        }

        .campo-etiqueta select:focus,
        .campo-etiqueta input:focus {
          border-color: #d4af37;
        }

        .campo-etiqueta select option {
          background: #1d1d22;

          color: #ffffff;
        }

        /* =================================================
           PRODUTO
        ================================================= */

        .produto-selecionado {
          margin-top: 5px;

          padding: 16px;

          border-radius: 12px;

          background:
            rgba(212, 175, 55, 0.06);

          border:
            1px solid
            rgba(212, 175, 55, 0.20);
        }

        .produto-selecionado-titulo {
          color: #888890;

          font-size: 11px;

          text-transform: uppercase;

          letter-spacing: 0.5px;

          margin-bottom: 6px;
        }

        .produto-selecionado-nome {
          color: #ffffff;

          font-size: 16px;

          font-weight: 700;

          word-break: break-word;
        }

        .produto-selecionado-codigo {
          margin-top: 8px;

          color: #d4af37;

          font-family: monospace;

          font-size: 14px;

          font-weight: 600;
        }

        /* =================================================
           BOTÕES
        ================================================= */

        .botoes-etiqueta {
          display: flex;

          flex-direction: column;

          gap: 10px;

          margin-top: 22px;
        }

        .botao-imprimir,
        .botao-atualizar {
          width: 100%;

          min-height: 48px;

          border-radius: 11px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          cursor: pointer;

          font-size: 14px;

          font-weight: 700;

          transition: 0.2s;
        }

        .botao-imprimir {
          border: 0;

          background: #d4af37;

          color: #111111;
        }

        .botao-imprimir:hover {
          filter: brightness(1.08);
        }

        .botao-atualizar {
          border:
            1px solid #33333a;

          background: #1b1b20;

          color: #cccccc;
        }

        .botao-atualizar:hover {
          border-color: #d4af37;

          color: #d4af37;
        }

        /* =================================================
           ERRO
        ================================================= */

        .etiquetas-erro {
          margin-bottom: 20px;

          padding:
            13px 15px;

          border-radius: 10px;

          background:
            rgba(255, 80, 80, 0.08);

          border:
            1px solid
            rgba(255, 80, 80, 0.25);

          color: #ff8a8a;

          font-size: 13px;
        }

        /* =================================================
           PREVIEW
        ================================================= */

        .etiquetas-preview-container {
          background: #151518;

          border:
            1px solid #29292f;

          border-radius: 18px;

          padding: 24px;

          min-height: 550px;
        }

        .preview-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          margin-bottom: 20px;
        }

        .preview-header h2 {
          margin: 0;

          font-size: 18px;
        }

        .preview-header span {
          color: #77777f;

          font-size: 13px;
        }

        /* =================================================
           FOLHA DE PRÉ-VISUALIZAÇÃO
           
           A etiqueta real é 4 x 1 cm.
           Aqui usamos escala visual de 2.5x.
        ================================================= */

        .etiquetas-folha {
          background: #eeeeee;

          padding: 30px;

          border-radius: 10px;

          display: flex;

          flex-wrap: wrap;

          gap: 20px;

          align-items: flex-start;

          justify-content: flex-start;

          min-height: 450px;
        }

        /* =================================================
           ETIQUETA

           TAMANHO REAL:
           40mm x 10mm

           VISUAL:
           100mm x 25mm
        ================================================= */

        .etiqueta {
          position: relative;

          background: #ffffff;

          color: #111111;

          width: 100mm;

          height: 25mm;

          min-width: 100mm;

          min-height: 25mm;

          max-width: 100mm;

          max-height: 25mm;

          border:
            1px solid #999999;

          border-radius: 3mm;

          padding: 2mm;

          display: grid;

          grid-template-columns:
            28mm 1fr;

          gap: 2mm;

          align-items: center;

          text-align: center;

          overflow: hidden;

          box-sizing: border-box;
        }

        /* =================================================
           LOGO
        ================================================= */

        .etiqueta-logo {
          width: 28mm;

          height: 20mm;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          border-right:
            0.5mm solid #222222;

          padding-right: 2mm;

          overflow: hidden;
        }

        .etiqueta-logo-bella {
          font-family: cursive;

          font-size: 20px;

          font-weight: 700;

          line-height: 1;

          white-space: nowrap;
        }

        .etiqueta-logo-tom {
          font-size: 17px;

          font-weight: 900;

          line-height: 1;

          margin-top: 1mm;
        }

        .etiqueta-logo-sub {
          font-size: 7px;

          font-weight: 700;

          letter-spacing: 1px;

          line-height: 1;

          margin-top: 1.5mm;

          white-space: nowrap;
        }

        /* =================================================
           CONTEÚDO
        ================================================= */

        .etiqueta-conteudo {
          width: 100%;

          height: 20mm;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          overflow: hidden;
        }

        .etiqueta-produto {
          width: 100%;

          font-size: 14px;

          font-weight: 900;

          line-height: 1;

          margin-bottom: 1.5mm;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .etiqueta-codigo-svg {
          width: 58mm;

          height: 11mm;

          max-width: 100%;

          display: block;
        }

        .etiqueta-numero {
          margin-top: 1mm;

          font-family: monospace;

          font-size: 9px;

          line-height: 1;

          letter-spacing: 0.5px;

          white-space: nowrap;
        }

        /* =================================================
           VAZIA
        ================================================= */

        .etiqueta-vazia {
          min-height: 400px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          color: #77777f;

          text-align: center;
        }

        .etiqueta-vazia p {
          margin-top: 12px;

          font-size: 14px;
        }

        .carregando-etiquetas {
          padding: 30px;

          text-align: center;

          color: #888890;
        }

        /* =================================================
           RESPONSIVO
        ================================================= */

        @media (max-width: 950px) {
          .etiquetas-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {

          .etiquetas-page {
            padding: 20px;
          }

          .etiquetas-header {
            align-items: flex-start;
          }

          .etiquetas-header h1 {
            font-size: 24px;
          }

          .etiquetas-folha {
            padding: 15px;

            gap: 15px;
          }

          .etiqueta {
            transform-origin:
              top left;
          }
        }

        /* =================================================
           IMPRESSÃO
           
           AQUI É O TAMANHO REAL:
           
           40mm x 10mm
           4cm x 1cm
        ================================================= */

        @media print {

          @page {
            size: A4;

            margin: 10mm;
          }

          html,
          body {
            margin: 0 !important;

            padding: 0 !important;

            background: #ffffff !important;
          }

          body * {
            visibility: hidden !important;
          }

          .etiquetas-folha,
          .etiquetas-folha * {
            visibility: visible !important;
          }

          .etiquetas-page {
            position: absolute;

            left: 0;

            top: 0;

            width: 100%;

            min-height: auto !important;

            padding: 0 !important;

            background: #ffffff !important;
          }

          .etiquetas-preview-container {
            padding: 0 !important;

            margin: 0 !important;

            border: 0 !important;

            background: #ffffff !important;

            min-height: auto !important;
          }

          .preview-header {
            display: none !important;
          }

          .etiquetas-folha {

            width: 100%;

            min-height: auto !important;

            padding: 0 !important;

            margin: 0 !important;

            background: #ffffff !important;

            border-radius: 0 !important;

            display: grid;

            grid-template-columns:
              repeat(4, 40mm);

            column-gap: 4mm;

            row-gap: 3mm;

            justify-content: start;

            align-content: start;
          }

          /* =============================================
             ETIQUETA FÍSICA
             
             4 CM X 1 CM
          ============================================= */

          .etiqueta {

            width: 40mm !important;

            height: 10mm !important;

            min-width: 40mm !important;

            min-height: 10mm !important;

            max-width: 40mm !important;

            max-height: 10mm !important;

            padding: 1mm !important;

            border:
              0.25mm solid #999999;

            border-radius: 1mm;

            display: grid;

            grid-template-columns:
              11mm 1fr;

            gap: 1mm;

            box-sizing: border-box;

            break-inside: avoid;

            page-break-inside: avoid;

            transform: none !important;
          }

          /* =============================================
             LOGO REAL
          ============================================= */

          .etiqueta-logo {

            width: 11mm !important;

            height: 8mm !important;

            border-right:
              0.25mm solid #222222;

            padding-right:
              1mm !important;
          }

          .etiqueta-logo-bella {

            font-size: 8px !important;

            line-height: 1 !important;
          }

          .etiqueta-logo-tom {

            font-size: 7px !important;

            margin-top:
              0.5mm !important;
          }

          .etiqueta-logo-sub {

            font-size: 3.2px !important;

            letter-spacing:
              0.4px !important;

            margin-top:
              0.6mm !important;
          }

          /* =============================================
             CONTEÚDO REAL
          ============================================= */

          .etiqueta-conteudo {

            width: 100% !important;

            height: 8mm !important;
          }

          .etiqueta-produto {

            font-size: 6px !important;

            margin-bottom:
              0.5mm !important;
          }

          .etiqueta-codigo-svg {

            width: 25mm !important;

            height: 4.5mm !important;
          }

          .etiqueta-numero {

            font-size: 4px !important;

            margin-top:
              0.3mm !important;

            letter-spacing:
              0.2px !important;
          }
        }

      `}</style>

      {/* =================================================
          CABEÇALHO
      ================================================= */}

      <div className="etiquetas-header">

        <div className="etiquetas-header-left">

          <button
            type="button"
            className="etiquetas-voltar"
            onClick={() => navigate(-1)}
            title="Voltar"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="etiquetas-icon">
            <Barcode size={25} />
          </div>

          <div>

            <h1>
              Etiquetas
            </h1>

            <p>
              Gere etiquetas com código de barras
              para seus produtos.
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          ERRO
      ================================================= */}

      {erro && (
        <div className="etiquetas-erro">
          {erro}
        </div>
      )}

      {/* =================================================
          LAYOUT
      ================================================= */}

      <div className="etiquetas-layout">

        {/* =================================================
            CONFIGURAÇÃO
        ================================================= */}

        <div className="etiquetas-config">

          <h2>
            Configuração da etiqueta
          </h2>

          {/* PRODUTO */}

          <div className="campo-etiqueta">

            <label>
              Produto
            </label>

            {carregando ? (

              <div className="carregando-etiquetas">
                Carregando produtos...
              </div>

            ) : (

              <select
                value={
                  produtoSelecionado?.id || ""
                }
                onChange={selecionarProduto}
              >

                <option value="">
                  Selecione um produto
                </option>

                {produtos.map((item) => (

                  <option
                    key={item.id}
                    value={item.id}
                  >

                    {item.nome}

                    {item.codigoBarras
                      ? ` — ${item.codigoBarras}`
                      : " — sem código"}

                  </option>

                ))}

              </select>

            )}

          </div>

          {/* QUANTIDADE */}

          <div className="campo-etiqueta">

            <label>
              Quantidade de etiquetas
            </label>

            <input
              type="number"
              min="1"
              max="100"
              value={quantidade}
              onChange={alterarQuantidade}
            />

          </div>

          {/* PRODUTO SELECIONADO */}

          {produtoSelecionado && (

            <div className="produto-selecionado">

              <div className="produto-selecionado-titulo">
                Produto selecionado
              </div>

              <div className="produto-selecionado-nome">
                {produtoSelecionado.nome}
              </div>

              <div className="produto-selecionado-codigo">

                {produtoSelecionado.codigoBarras ||
                  "Sem código de barras"}

              </div>

            </div>

          )}

          {/* BOTÕES */}

          <div className="botoes-etiqueta">

            <button
              type="button"
              className="botao-imprimir"
              onClick={imprimirEtiquetas}
            >

              <Printer size={19} />

              Imprimir etiquetas

            </button>

            <button
              type="button"
              className="botao-atualizar"
              onClick={atualizarProdutos}
            >

              <RefreshCw size={18} />

              Atualizar produtos

            </button>

          </div>

        </div>

        {/* =================================================
            PRÉ-VISUALIZAÇÃO
        ================================================= */}

        <div className="etiquetas-preview-container">

          <div className="preview-header">

            <h2>
              Pré-visualização
            </h2>

            <span>
              {quantidadeFinal} etiqueta(s)
            </span>

          </div>

          {/* SEM PRODUTO */}

          {!produtoSelecionado ? (

            <div className="etiqueta-vazia">

              <Package size={42} />

              <p>
                Selecione um produto para
                visualizar as etiquetas.
              </p>

            </div>

          ) : !produtoSelecionado.codigoBarras ? (

            /* SEM CÓDIGO */

            <div className="etiqueta-vazia">

              <Barcode size={42} />

              <p>
                Este produto não possui
                código de barras.
              </p>

            </div>

          ) : (

            /* ETIQUETAS */

            <div className="etiquetas-folha">

              {Array.from(
                {
                  length: quantidadeFinal,
                },
                (_, index) => (

                  <div
                    className="etiqueta"
                    key={index}
                  >

                    {/* ===============================
                        LOGO
                    =============================== */}

                    <div className="etiqueta-logo">

                      <div className="etiqueta-logo-bella">
                        Bella ♥
                      </div>

                      <div className="etiqueta-logo-tom">
                        Tom
                      </div>

                      <div className="etiqueta-logo-sub">
                        PERSONALIZADOS
                      </div>

                    </div>

                    {/* ===============================
                        CONTEÚDO
                    =============================== */}

                    <div className="etiqueta-conteudo">

                      <div className="etiqueta-produto">

                        {
                          produtoSelecionado.nome
                        }

                      </div>

                      <svg
                        className="etiqueta-codigo-svg"
                      />

                      <div className="etiqueta-numero">

                        {
                          produtoSelecionado.codigoBarras
                        }

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}