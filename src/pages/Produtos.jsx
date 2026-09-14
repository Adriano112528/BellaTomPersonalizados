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

import {
  cadastrarProduto,
  carregarProdutos,
  atualizarProduto,
  excluirProduto,
} from "../services/produtoService";

export default function Produtos() {
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [modoEdicao, setModoEdicao] =
    useState(false);

  const [produtoEditandoId, setProdutoEditandoId] =
    useState(null);

  const [salvando, setSalvando] =
    useState(false);

  const [excluindo, setExcluindo] =
    useState(null);

  const [produtos, setProdutos] =
    useState([]);

  const [carregandoProdutos, setCarregandoProdutos] =
    useState(true);

  const [produto, setProduto] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    preco: "",
    precoPromocional: "",
    ativo: true,
    imagem: null,
    cloudinaryPublicId: "",
  });

  useEffect(() => {
    carregarListaProdutos();
  }, []);

  async function carregarListaProdutos() {
    try {
      setCarregandoProdutos(true);

      const dados = await carregarProdutos();

      setProdutos(Array.isArray(dados) ? dados : []);
    } catch (erro) {
      console.error("Erro ao carregar produtos:", erro);
      setProdutos([]);
    } finally {
      setCarregandoProdutos(false);
    }
  }

  function abrirFormulario() {
    setModoEdicao(false);
    setProdutoEditandoId(null);

    setProduto({
      nome: "",
      descricao: "",
      categoria: "",
      preco: "",
      precoPromocional: "",
      ativo: true,
      imagem: null,
      cloudinaryPublicId: "",
    });

    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    if (salvando) return;

    setMostrarFormulario(false);
    setModoEdicao(false);
    setProdutoEditandoId(null);
  }

  function abrirEdicao(item) {
    setModoEdicao(true);
    setProdutoEditandoId(item.id);

    setProduto({
      nome: item.nome || "",
      descricao: item.descricao || "",
      categoria: item.categoria || "",
      preco: item.preco || "",
      precoPromocional: item.precoPromocional || "",
      ativo: item.ativo ?? true,
      imagem: item.imagem || null,
      cloudinaryPublicId: item.cloudinaryPublicId || "",
    });

    setMostrarFormulario(true);
  }

  function alterarCampo(campo, valor) {
    setProduto((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

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
        cloudinaryPublicId: "",
      }));
    };

    leitor.onerror = () => {
      alert("Não foi possível carregar a imagem.");
    };

    leitor.readAsDataURL(arquivo);

    event.target.value = "";
  }

  function removerImagem() {
    setProduto((anterior) => ({
      ...anterior,
      imagem: null,
      cloudinaryPublicId: "",
    }));
  }

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

      if (modoEdicao && produtoEditandoId) {
        await atualizarProduto(
          produtoEditandoId,
          produto
        );

        alert("Produto atualizado com sucesso!");
      } else {
        await cadastrarProduto(produto);

        alert("Produto cadastrado com sucesso!");
      }

      setProduto({
        nome: "",
        descricao: "",
        categoria: "",
        preco: "",
        precoPromocional: "",
        ativo: true,
        imagem: null,
        cloudinaryPublicId: "",
      });

      setModoEdicao(false);
      setProdutoEditandoId(null);

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

  async function removerProduto(item) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o produto "${item.nome}"?`
    );

    if (!confirmar) return;

    try {
      setExcluindo(item.id);

      await excluirProduto(item.id);

      alert("Produto excluído com sucesso!");

      await carregarListaProdutos();
    } catch (erro) {
      console.error("Erro ao excluir produto:", erro);

      alert("Não foi possível excluir o produto.");
    } finally {
      setExcluindo(null);
    }
  }

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

    const numero = Number(
      String(valor).replace(",", ".")
    );

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

  const totalProdutos = produtos.length;

  const produtosAtivos = produtos.filter(
    (item) => item.ativo
  ).length;

  const produtosInativos = produtos.filter(
    (item) => !item.ativo
  ).length;

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
              <Package size={30} strokeWidth={1.8} />
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

            <div className="produto-form-fields">
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
                  <label>Preço Promocional</label>

                  <input
                    type="text"
                    placeholder="R$ 0,00"
                    value={produto.precoPromocional}
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

              <div className="produto-status-section">
                <div>
                  <label>Status do Produto</label>

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

  return (
    <div className="produtos-page">
      <div className="produtos-header">
        <div className="produtos-header-left">
          <div className="produtos-header-icon">
            <Package size={30} strokeWidth={1.8} />
          </div>

          <div>
            <h1>Produtos</h1>

            <p>
              Gerencie os produtos exibidos em
              sua loja Bella Tom.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="novo-produto-button"
          onClick={abrirFormulario}
        >
          <Plus size={20} strokeWidth={2.2} />

          <span>Novo Produto</span>
        </button>
      </div>

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

      <div className="produtos-container">
        <div className="produtos-container-header">
          <div>
            <h2>Produtos Cadastrados</h2>

            <p>
              Produtos cadastrados no catálogo
              da Bella Tom.
            </p>
          </div>
        </div>

        {carregandoProdutos ? (
          <div className="produtos-empty">
            <div className="empty-icon">
              <Package size={42} strokeWidth={1.5} />
            </div>

            <h3>Carregando produtos...</h3>

            <p>
              Buscando os produtos cadastrados
              no banco de dados.
            </p>
          </div>
        ) : produtos.length === 0 ? (
          <div className="produtos-empty">
            <div className="empty-icon">
              <ImageIcon size={42} strokeWidth={1.5} />
            </div>

            <h3>Nenhum produto cadastrado</h3>

            <p>
              Comece cadastrando seu primeiro
              produto para aparecer no catálogo
              da Bella Tom.
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
                      alt={item.nome || "Produto"}
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
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        color: "#777",
                      }}
                    >
                      <ImageIcon size={42} />

                      <span style={{ fontSize: "12px" }}>
                        Sem imagem
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ padding: "18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#d4af37",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {formatarCategoria(item.categoria)}
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
                      margin: "0 0 7px",
                      fontSize: "17px",
                      color: "#fff",
                    }}
                  >
                    {item.nome}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 14px",
                      minHeight: "38px",
                      fontSize: "12px",
                      lineHeight: 1.5,
                      color: "#777",
                    }}
                  >
                    {item.descricao ||
                      "Sem descrição cadastrada."}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "20px",
                        color: "#d4af37",
                      }}
                    >
                      {formatarPreco(item.preco)}
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

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "16px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => abrirEdicao(item)}
                      style={{
                        flex: 1,
                        minHeight: "38px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        borderRadius: "9px",
                        border:
                          "1px solid rgba(212,175,55,0.25)",
                        background:
                          "rgba(212,175,55,0.06)",
                        color: "#d4af37",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      <Pencil size={15} />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => removerProduto(item)}
                      disabled={excluindo === item.id}
                      title="Excluir produto"
                      style={{
                        width: "42px",
                        minHeight: "38px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "9px",
                        border:
                          "1px solid rgba(255,80,80,0.18)",
                        background:
                          "rgba(255,80,80,0.05)",
                        color: "#d87979",
                        cursor:
                          excluindo === item.id
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