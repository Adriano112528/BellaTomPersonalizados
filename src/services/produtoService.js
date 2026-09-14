const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://bellatompersonalizados.onrender.com";

/**
 * ========================================
 * CARREGAR PRODUTOS
 * ========================================
 */
export async function carregarProdutos() {
  try {
    const resposta = await fetch(
      `${API_URL}/api/produtos`
    );

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    const produtos = await resposta.json();

    console.table(produtos);

    return produtos;
  } catch (erro) {
    console.error(
      "Erro ao carregar produtos pela API:",
      erro
    );

    throw erro;
  }
}

/**
 * ========================================
 * CADASTRAR PRODUTO
 * ========================================
 */
export async function cadastrarProduto(produto) {
  try {
    const dados = {
      nome: produto.nome || "",
      descricao: produto.descricao || "",
      categoria: produto.categoria || "",
      preco: produto.preco || "",
      precoPromocional:
        produto.precoPromocional || null,
      ativo: produto.ativo ?? true,
      imagem: produto.imagem || "",
      cloudinaryPublicId:
        produto.cloudinaryPublicId || "",
    };

    const resposta = await fetch(
      `${API_URL}/api/produtos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      }
    );

    if (!resposta.ok) {
      const erroResposta =
        await resposta.json().catch(() => null);

      throw new Error(
        erroResposta?.erro ||
          `Erro HTTP ${resposta.status}`
      );
    }

    const produtoCriado =
      await resposta.json();

    console.log(
      "Produto cadastrado pela API:",
      produtoCriado
    );

    return produtoCriado;
  } catch (erro) {
    console.error(
      "Erro ao cadastrar produto pela API:",
      erro
    );

    throw erro;
  }
}

/**
 * ========================================
 * ATUALIZAR PRODUTO
 * ========================================
 */
export async function atualizarProduto(
  id,
  produto
) {
  try {
    const dados = {
      nome: produto.nome || "",
      descricao: produto.descricao || "",
      categoria: produto.categoria || "",
      preco: produto.preco || "",
      precoPromocional:
        produto.precoPromocional || null,
      ativo: produto.ativo ?? true,
      imagem: produto.imagem || "",
      cloudinaryPublicId:
        produto.cloudinaryPublicId || "",
    };

    const resposta = await fetch(
      `${API_URL}/api/produtos/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      }
    );

    if (!resposta.ok) {
      const erroResposta =
        await resposta.json().catch(() => null);

      throw new Error(
        erroResposta?.erro ||
          `Erro HTTP ${resposta.status}`
      );
    }

    const produtoAtualizado =
      await resposta.json();

    console.log(
      "Produto atualizado pela API:",
      produtoAtualizado
    );

    return produtoAtualizado;
  } catch (erro) {
    console.error(
      "Erro ao atualizar produto pela API:",
      erro
    );

    throw erro;
  }
}

/**
 * ========================================
 * EXCLUIR PRODUTO
 * ========================================
 */
export async function excluirProduto(id) {
  try {
    const resposta = await fetch(
      `${API_URL}/api/produtos/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!resposta.ok) {
      const erroResposta =
        await resposta.json().catch(() => null);

      throw new Error(
        erroResposta?.erro ||
          `Erro HTTP ${resposta.status}`
      );
    }

    const resultado =
      await resposta.json();

    console.log(
      "Produto excluído pela API:",
      resultado
    );

    return true;
  } catch (erro) {
    console.error(
      "Erro ao excluir produto pela API:",
      erro
    );

    throw erro;
  }
}