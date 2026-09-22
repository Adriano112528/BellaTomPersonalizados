import "./Produtos.css";

import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ArrowLeft,
  Upload,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  cadastrarProduto,
  carregarProdutos,
  atualizarProduto,
  excluirProduto,
} from "../services/produtoService";

export default function Produtos() {
  const navigate = useNavigate();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [produtoEditandoId, setProdutoEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);

  const [produto, setProduto] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    preco: "",
    precoPromocional: "",
    codigoBarras: "",
    estoque: 0,
    estoqueMinimo: 0,
    ativo: true,
    imagem: null,
    cloudinaryPublicId: "",
  });

  /* =====================================================
     CARREGAR PRODUTOS
     ===================================================== */

  useEffect(() => {
    carregarListaProdutos();
  }, []);

  async function carregarListaProdutos() {
    try {
      setCarregandoProdutos(true);

      const dados = await carregarProdutos();

      if (Array.isArray(dados)) {
        setProdutos(dados);
      } else {
        setProdutos([]);
      }
    } catch (erro) {
      console.error("Erro ao carregar produtos:", erro);
      setProdutos([]);
    } finally {
      setCarregandoProdutos(false);
    }
  }

  /* =====================================================
     GERAR PRÓXIMO CÓDIGO INTERNO
     ===================================================== */

  const gerarProximoCodigoInterno = () => {
    const CODIGO_INICIAL = 200000000001;

    const codigosInternos = produtos
      .map((item) => String(item.codigoBarras || "").trim())
      .filter((codigo) => /^200000000\d{3}$/.test(codigo))
      .map((codigo) => Number(codigo))
      .filter((codigo) => Number.isFinite(codigo));

    if (codigosInternos.length === 0) {
      return String(CODIGO_INICIAL);
    }

    const maiorCodigo = Math.max(...codigosInternos);
    return String(maiorCodigo + 1);
  };

  /* =====================================================
     NOVO PRODUTO
     ===================================================== */

  function abrirFormulario() {
    setModoEdicao(false);
    setProdutoEditandoId(null);

    setProduto({
      nome: "",
      descricao: "",
      categoria: "",
      preco: "",
      precoPromocional: "",
      codigoBarras: gerarProximoCodigoInterno(),
      estoque: 0,
      estoqueMinimo: 0,
      ativo: true,
      imagem: null,
      cloudinaryPublicId: "",
    });

    setMostrarFormulario(true);
  }

  /* =====================================================
     FECHAR FORMULÁRIO
     ===================================================== */

  function fecharFormulario() {
    if (salvando) return;

    setMostrarFormulario(false);
    setModoEdicao(false);
    setProdutoEditandoId(null);
  }

  /* =====================================================
     EDITAR PRODUTO
     ===================================================== */

  function abrirEdicao(item) {
    setModoEdicao(true);
    setProdutoEditandoId(item.id);

    setProduto({
      nome: item.nome || "",
      descricao: item.descricao || "",
      categoria: item.categoria || "",
      preco: item.preco || "",
      precoPromocional: item.precoPromocional || "",
      codigoBarras: item.codigoBarras || "",
      estoque: Number(item.estoque) || 0,
      estoqueMinimo: Number(item.estoqueMinimo) || 0,
      ativo: item.ativo ?? true,
      imagem: item.imagem || null,
      cloudinaryPublicId: item.cloudinaryPublicId || "",
    });

    setMostrarFormulario(true);
  }

  /* =====================================================
     ALTERAR CAMPOS
     ===================================================== */

  function alterarCampo(campo, valor) {
    setProduto((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  /* =====================================================
     SELECIONAR IMAGEM
     ===================================================== */

  function selecionarImagem(event) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem válido.");
      event.target.value = "";
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      setProduto((anterior) => ({
        ...anterior,
        imagem: leitor.result,
      }));
    };

    leitor.onerror = () => {
      alert("Não foi possível carregar a imagem.");
    };

    leitor.readAsDataURL(arquivo);
    event.target.value = "";
  }

  /* =====================================================
     REMOVER IMAGEM
     ===================================================== */

  function removerImagem() {
    const imagemAtual = produto.imagem;

    if (
      typeof imagemAtual === "string" &&
      imagemAtual.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagemAtual);
    }

    setProduto((anterior) => ({
      ...anterior,
      imagem: null,
    }));
  }

  /* =====================================================
     SALVAR PRODUTO
     ===================================================== */

  async function salvarProduto() {
    if (!String(produto.nome || "").trim()) {
      alert("Informe o nome do produto.");
      return;
    }

    if (!produto.categoria) {
      alert("Selecione uma categoria.");
      return;
    }

    if (!String(produto.preco ?? "").trim()) {
      alert("Informe o preço do produto.");
      return;
    }

    try {
      setSalvando(true);

      /* ================================================
         DADOS DO PRODUTO
         ================================================ */

      const produtoParaSalvar = {
        nome: produto.nome || "",
        descricao: produto.descricao || "",
        categoria: produto.categoria || "",
        preco: produto.preco || "",
        precoPromocional: produto.precoPromocional || null,
        codigoBarras: produto.codigoBarras || "",
        estoque: Number(produto.estoque) || 0,
        estoqueMinimo: Number(produto.estoqueMinimo) || 0,
        ativo: produto.ativo ?? true,
        imagem: produto.imagem || "",
        cloudinaryPublicId: produto.cloudinaryPublicId || "",
      };

      console.log("📦 DADOS DO PRODUTO:", produtoParaSalvar);

      /* ================================================
         EDITAR PRODUTO
         ================================================ */

      if (modoEdicao && produtoEditandoId) {
        await atualizarProduto(
          produtoEditandoId,
          produtoParaSalvar
        );

        alert("Produto atualizado com sucesso!");
      }

      /* ================================================
         NOVO PRODUTO
         ================================================ */

      else {
        await cadastrarProduto(produtoParaSalvar);

        alert("Produto cadastrado com sucesso!");
      }

      /* ================================================
         LIMPAR FORMULÁRIO
         ================================================ */

      setProduto({
        nome: "",
        descricao: "",
        categoria: "",
        preco: "",
        precoPromocional: "",
        codigoBarras: "",
        estoque: 0,
        estoqueMinimo: 0,
        ativo: true,
        imagem: null,
        cloudinaryPublicId: "",
      });

      setModoEdicao(false);
      setProdutoEditandoId(null);

      /* ================================================
         VOLTAR PARA A LISTA
         ================================================ */

      window.location.href = "/produtos";
    } catch (erro) {
      console.error("Erro ao salvar produto:", erro);

      alert(
        erro?.message ||
          "Não foi possível salvar o produto."
      );
    } finally {
      setSalvando(false);
    }
  }

  /* =====================================================
     EXCLUIR PRODUTO
     ===================================================== */

  async function removerProduto(item) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o produto "${item.nome}"?`
    );

    if (!confirmar) return;

    try {
      setExcluindo(item.id);

      await excluirProduto(item.id);

      alert("Produto excluído com sucesso!");

      try {
        const dados = await carregarProdutos();

        setProdutos(Array.isArray(dados) ? dados : []);
      } catch (erroLista) {
        console.error(
          "Erro ao atualizar lista:",
          erroLista
        );
      }
    } catch (erro) {
      console.error(
        "Erro ao excluir produto:",
        erro
      );

      alert(
        "Não foi possível excluir o produto."
      );
    } finally {
      setExcluindo(null);
    }
  }

  /* =====================================================
     CATEGORIA E FORMATADORES
     ===================================================== */

  function formatarCategoria(categoria) {
    const categorias = {
      canecas: "Canecas",
      personalizados: "Personalizados",
      presentes: "Presentes",
      decoracao: "Decoração",
      outros: "Outros",
    };

    return (
      categorias[categoria] ||
      categoria ||
      "Sem categoria"
    );
  }

  function formatarPreco(valor) {
    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {
      return "R$ 0,00";
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      return "R$ 0,00";
    }

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /* =====================================================
     ESTATÍSTICAS
     ===================================================== */

  const totalProdutos = produtos.length;

  const produtosAtivos = produtos.filter(
    (item) => item.ativo
  ).length;

  const produtosInativos = produtos.filter(
    (item) => !item.ativo
  ).length;

  /* =====================================================
     FORMULÁRIO
     ===================================================== */

  if (mostrarFormulario) {
    return (
      <div className="produtos-page">
        <div className="produtos-header">
          <div className="produtos-header-left">
            <button
              type="button"
              className="voltar-produto-button"
              onClick={fecharFormulario}
              disabled={salvando}
              title="Voltar"
            >
              <ArrowLeft size={21} />
            </button>

            <div className="produtos-header-icon">
              <Package
                size={30}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h1>
                {modoEdicao
                  ? "Editar Produto"
                  : "Novo Produto"}
              </h1>

              <p>
                {modoEdicao
                  ? "Atualize as informações do produto."
                  : "Cadastre um novo produto para sua loja Bella Tom."}
              </p>
            </div>
          </div>
        </div>

        <div className="produto-form-container">
          <div className="produto-form-header">
            <div>
              <h2>Informações do Produto</h2>

              <p>
                Preencha os dados abaixo para{" "}
                {modoEdicao
                  ? "atualizar o produto."
                  : "cadastrar o produto."}
              </p>
            </div>
          </div>

          <div className="produto-form">

            {/* =================================================
                IMAGEM
                ================================================= */}

            <div className="produto-form-image-section">
              <label>Imagem do Produto</label>

              <div className="produto-image-upload">
                {produto.imagem ? (
                  <>
                    <img
                      src={produto.imagem}
                      alt={
                        produto.nome ||
                        "Prévia do produto"
                      }
                    />

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <label
                        htmlFor="imagem-produto"
                        className="produto-upload-button"
                      >
                        <Upload size={18} />
                        Trocar foto
                      </label>

                      <button
                        type="button"
                        className="produto-upload-button"
                        onClick={removerImagem}
                        disabled={salvando}
                      >
                        <X size={18} />
                        Remover
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="produto-image-placeholder">
                      <ImageIcon
                        size={42}
                        strokeWidth={1.4}
                      />

                      <span>
                        Adicionar foto do produto
                      </span>
                    </div>

                    <label
                      htmlFor="imagem-produto"
                      className="produto-upload-button"
                    >
                      <Upload size={18} />
                      Selecionar foto
                    </label>
                  </>
                )}

                <input
                  id="imagem-produto"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={selecionarImagem}
                  hidden
                  disabled={salvando}
                />
              </div>

              <small>
                JPG, PNG ou WEBP. Recomendado:
                imagem quadrada em boa qualidade.
              </small>
            </div>

            {/* =================================================
                CAMPOS
                ================================================= */}

            <div className="produto-form-fields">

              {/* NOME */}

              <div className="campo-produto">
                <label>Nome do Produto *</label>

                <input
                  type="text"
                  placeholder="Ex.: Caneca Personalizada"
                  value={produto.nome}
                  onChange={(event) =>
                    alterarCampo(
                      "nome",
                      event.target.value
                    )
                  }
                  disabled={salvando}
                />
              </div>

              {/* DESCRIÇÃO */}

              <div className="campo-produto">
                <label>Descrição</label>

                <textarea
                  rows={5}
                  placeholder="Descreva o produto..."
                  value={produto.descricao}
                  onChange={(event) =>
                    alterarCampo(
                      "descricao",
                      event.target.value
                    )
                  }
                  disabled={salvando}
                />
              </div>

              {/* CATEGORIA */}

              <div className="campo-produto">
                <label>Categoria *</label>

                <select
                  value={produto.categoria}
                  onChange={(event) =>
                    alterarCampo(
                      "categoria",
                      event.target.value
                    )
                  }
                  disabled={salvando}
                >
                  <option value="">
                    Selecione uma categoria
                  </option>

                  <option value="canecas">
                    Canecas
                  </option>

                  <option value="personalizados">
                    Personalizados
                  </option>

                  <option value="presentes">
                    Presentes
                  </option>

                  <option value="decoracao">
                    Decoração
                  </option>

                  <option value="outros">
                    Outros
                  </option>
                </select>
              </div>

              {/* PREÇOS */}

              <div className="produto-form-row">
                <div className="campo-produto">
                  <label>Preço *</label>

                  <input
                    type="text"
                    placeholder="R$ 0,00"
                    value={produto.preco}
                    onChange={(event) =>
                      alterarCampo(
                        "preco",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="campo-produto">
                  <label>
                    Preço Promocional
                  </label>

                  <input
                    type="text"
                    placeholder="R$ 0,00"
                    value={
                      produto.precoPromocional
                    }
                    onChange={(event) =>
                      alterarCampo(
                        "precoPromocional",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>
              </div>

              {/* =================================================
                  CÓDIGO DE BARRAS
                  ================================================= */}

              <div className="campo-produto">
                <label>Código de barras</label>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex.: 7891234567890"
                  value={produto.codigoBarras}
                  onChange={(event) =>
                    alterarCampo(
                      "codigoBarras",
                      event.target.value
                    )
                  }
                  disabled={salvando}
                />

                <small>
                  Código interno gerado automaticamente. Você pode substituir pelo código de barras original do produto.
                </small>
              </div>

              {/* =================================================
                  ESTOQUE
                  ================================================= */}

              <div className="produto-form-row">

                <div className="campo-produto">
                  <label>
                    Estoque inicial
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={produto.estoque}
                    onChange={(event) =>
                      alterarCampo(
                        "estoque",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

                <div className="campo-produto">
                  <label>
                    Estoque mínimo
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={produto.estoqueMinimo}
                    onChange={(event) =>
                      alterarCampo(
                        "estoqueMinimo",
                        event.target.value
                      )
                    }
                    disabled={salvando}
                  />
                </div>

              </div>

              {/* STATUS */}

              <div className="produto-status-section">
                <div>
                  <label>
                    Status do Produto
                  </label>

                  <p>
                    Defina se o produto ficará
                    visível na loja.
                  </p>
                </div>

                <button
                  type="button"
                  className={`produto-status-toggle ${
                    produto.ativo
                      ? "ativo"
                      : "inativo"
                  }`}
                  onClick={() =>
                    alterarCampo(
                      "ativo",
                      !produto.ativo
                    )
                  }
                  disabled={salvando}
                >
                  <span className="status-toggle-circle"></span>

                  <span>
                    {produto.ativo
                      ? "Ativo"
                      : "Inativo"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              AÇÕES
              ================================================= */}

          <div className="produto-form-actions">
            <button
              type="button"
              className="cancelar-produto-button"
              onClick={fecharFormulario}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="salvar-produto-button"
              onClick={salvarProduto}
              disabled={salvando}
            >
              {salvando ? (
                "Salvando..."
              ) : (
                <>
                  <Plus size={19} />

                  {modoEdicao
                    ? "Salvar Alterações"
                    : "Salvar Produto"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     LISTA DE PRODUTOS
     ===================================================== */

  return (
    <div className="produtos-page">

      {/* CABEÇALHO */}

      <div className="produtos-header">
        <div className="produtos-header-left">
          <button
            type="button"
            className="voltar-produtos-lista-button"
            onClick={() => navigate(-1)}
            title="Voltar para o Editor do Site"
          >
            <ArrowLeft size={21} />
          </button>

          <div className="produtos-header-icon">
            <Package
              size={30}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h1>Produtos</h1>

            <p>
              Gerencie os produtos exibidos
              em sua loja Bella Tom.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="novo-produto-button"
          onClick={abrirFormulario}
        >
          <Plus
            size={20}
            strokeWidth={2.2}
          />

          <span>Novo Produto</span>
        </button>
      </div>

      {/* ESTATÍSTICAS */}

      <div className="produtos-stats">

        <div className="produto-stat-card">
          <div className="stat-icon">
            <Package size={22} />
          </div>

          <div>
            <span>Total de Produtos</span>

            <strong>
              {carregandoProdutos
                ? "..."
                : totalProdutos}
            </strong>
          </div>
        </div>

        <div className="produto-stat-card">
          <div className="stat-icon ativo">
            <Eye size={22} />
          </div>

          <div>
            <span>Produtos Ativos</span>

            <strong>
              {carregandoProdutos
                ? "..."
                : produtosAtivos}
            </strong>
          </div>
        </div>

        <div className="produto-stat-card">
          <div className="stat-icon inativo">
            <EyeOff size={22} />
          </div>

          <div>
            <span>Produtos Inativos</span>

            <strong>
              {carregandoProdutos
                ? "..."
                : produtosInativos}
            </strong>
          </div>
        </div>

      </div>

      {/* BUSCA E FILTROS */}

      <div className="produtos-toolbar">
        <div className="produtos-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Buscar produto..."
          />
        </div>

        <button
          type="button"
          className="filtro-button"
        >
          <SlidersHorizontal size={18} />

          <span>Filtros</span>
        </button>
      </div>

      {/* LISTAGEM DE PRODUTOS */}

      <div className="produtos-container">

        <div className="produtos-container-header">
          <div>
            <h2>
              Produtos Cadastrados
            </h2>

            <p>
              Produtos cadastrados no
              catálogo da Bella Tom.
            </p>
          </div>
        </div>

        {carregandoProdutos ? (

          <div className="produtos-empty">
            <div className="empty-icon">
              <Package
                size={42}
                strokeWidth={1.5}
              />
            </div>

            <h3>
              Carregando produtos...
            </h3>

            <p>
              Buscando os produtos
              cadastrados na API.
            </p>
          </div>

        ) : produtos.length === 0 ? (

          <div className="produtos-empty">
            <div className="empty-icon">
              <ImageIcon
                size={42}
                strokeWidth={1.5}
              />
            </div>

            <h3>
              Nenhum produto cadastrado
            </h3>

            <p>
              Comece cadastrando seu primeiro
              produto para aparecer no
              catálogo da Bella Tom.
            </p>

            <button
              type="button"
              className="empty-button"
              onClick={abrirFormulario}
            >
              <Plus size={19} />

              Cadastrar primeiro produto
            </button>
          </div>

        ) : (

          <div
            className="produtos-lista"
            style={{
              padding: "24px",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >

            {produtos.map((item) => (

              <div
                key={item.id}
                className="produto-card"
                style={{
                  overflow: "hidden",
                  borderRadius: "16px",
                  background:
                    "rgba(255,255,255,0.035)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                }}
              >

                {/* IMAGEM DA CARD */}

                <div
                  style={{
                    height: "210px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "rgba(0,0,0,0.18)",
                    overflow: "hidden",
                  }}
                >
                  {item.imagem ? (

                    <img
                      src={item.imagem}
                      alt={
                        item.nome ||
                        "Produto"
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                  ) : (

                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        alignItems:
                          "center",
                        gap: "8px",
                        color: "#777",
                      }}
                    >
                      <ImageIcon size={42} />

                      <span
                        style={{
                          fontSize: "12px",
                        }}
                      >
                        Sem imagem
                      </span>
                    </div>
                  )}
                </div>

                {/* INFORMAÇÕES DA CARD */}

                <div
                  style={{
                    padding: "18px",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >

                    <span
                      style={{
                        fontSize: "11px",
                        color: "#d4af37",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.5px",
                      }}
                    >
                      {formatarCategoria(
                        item.categoria
                      )}
                    </span>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: item.ativo
                          ? "#64d98b"
                          : "#888",
                      }}
                    >
                      {item.ativo
                        ? "● Ativo"
                        : "● Inativo"}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin:
                        "0 0 7px",
                      fontSize: "17px",
                      color: "#fff",
                    }}
                  >
                    {item.nome}
                  </h3>

                  <p
                    style={{
                      margin:
                        "0 0 14px",
                      minHeight: "38px",
                      fontSize: "12px",
                      lineHeight: 1.5,
                      color: "#777",
                    }}
                  >
                    {item.descricao ||
                      "Sem descrição cadastrada."}
                  </p>

                  {/* PREÇO */}

                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "baseline",
                      gap: "8px",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "20px",
                        color: "#d4af37",
                      }}
                    >
                      {formatarPreco(
                        item.preco
                      )}
                    </strong>

                    {item.precoPromocional && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#888",
                        }}
                      >
                        Promoção:{" "}
                        {formatarPreco(
                          item.precoPromocional
                        )}
                      </span>
                    )}
                  </div>

                  {/* =================================================
                      ESTOQUE
                      ================================================= */}

                  <div
                    style={{
                      marginTop: "12px",
                      padding:
                        "10px 12px",
                      borderRadius: "9px",
                      background:
                        "rgba(212,175,55,0.05)",
                      border:
                        "1px solid rgba(212,175,55,0.10)",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: "10px",
                    }}
                  >

                    <div>
                      <span
                        style={{
                          display:
                            "block",
                          fontSize:
                            "10px",
                          color:
                            "#777",
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.4px",
                        }}
                      >
                        Estoque
                      </span>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "2px",
                          fontSize:
                            "15px",
                          color:
                            Number(
                              item.estoque
                            ) <=
                            Number(
                              item.estoqueMinimo
                            )
                              ? "#e8a44a"
                              : "#64d98b",
                        }}
                      >
                        {Number(
                          item.estoque
                        ) || 0}{" "}
                        un.
                      </strong>
                    </div>

                    <div
                      style={{
                        textAlign:
                          "right",
                      }}
                    >
                      <span
                        style={{
                          display:
                            "block",
                          fontSize:
                            "10px",
                          color:
                            "#777",
                        }}
                      >
                        Mínimo
                      </span>

                      <strong
                        style={{
                          fontSize:
                            "13px",
                          color:
                            "#aaa",
                        }}
                      >
                        {Number(
                          item.estoqueMinimo
                        ) || 0}{" "}
                        un.
                      </strong>
                    </div>

                  </div>

                  {/* CÓDIGO DE BARRAS */}

                  {item.codigoBarras && (
                    <div
                      style={{
                        marginTop:
                          "8px",
                        fontSize:
                          "10px",
                        color:
                          "#666",
                      }}
                    >
                      Código:{" "}
                      {item.codigoBarras}
                    </div>
                  )}

                  {/* AÇÕES DA CARD */}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "16px",
                    }}
                  >

                    <button
                      type="button"
                      onClick={() =>
                        abrirEdicao(item)
                      }
                      style={{
                        flex: 1,
                        minHeight:
                          "38px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        gap: "6px",
                        borderRadius:
                          "9px",
                        border:
                          "1px solid rgba(212,175,55,0.25)",
                        background:
                          "rgba(212,175,55,0.06)",
                        color:
                          "#d4af37",
                        cursor:
                          "pointer",
                        fontWeight:
                          600,
                      }}
                    >
                      <Pencil size={15} />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removerProduto(item)
                      }
                      disabled={
                        excluindo ===
                        item.id
                      }
                      title="Excluir produto"
                      style={{
                        width: "42px",
                        minHeight:
                          "38px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        borderRadius:
                          "9px",
                        border:
                          "1px solid rgba(255,80,80,0.18)",
                        background:
                          "rgba(255,80,80,0.05)",
                        color:
                          "#d87979",
                        cursor:
                          excluindo ===
                          item.id
                            ? "wait"
                            : "pointer",
                      }}
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}