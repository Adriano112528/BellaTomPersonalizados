const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

// ========================================
// CARREGAR ESTOQUE
// ========================================

export async function carregarEstoque() {
  try {
    const resposta = await fetch(
      `${API_URL}/api/estoque`
    );

    if (!resposta.ok) {
      throw new Error(
        `Erro HTTP ${resposta.status}`
      );
    }

    const dados = await resposta.json();

    // A API pode retornar:
    // 1. Um array diretamente
    // 2. Um objeto contendo os produtos em "value"
    const estoque = Array.isArray(dados)
      ? dados
      : Array.isArray(dados?.value)
        ? dados.value
        : [];

    console.log("========== ESTOQUE API ==========");
    console.table(estoque);
    console.log("=================================");

    return estoque;
  } catch (erro) {
    console.error(
      "Erro ao carregar estoque:",
      erro
    );

    throw erro;
  }
}

// ========================================
// BUSCAR PRODUTO POR CÓDIGO DE BARRAS
// ========================================

export async function buscarProdutoPorCodigo(
  codigo
) {
  try {
    const codigoLimpo = String(
      codigo || ""
    ).trim();

    if (!codigoLimpo) {
      throw new Error(
        "Código de barras não informado."
      );
    }

    const resposta = await fetch(
      `${API_URL}/api/estoque/buscar/${encodeURIComponent(
        codigoLimpo
      )}`
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados?.erro ||
          `Erro HTTP ${resposta.status}`
      );
    }

    return dados;
  } catch (erro) {
    console.error(
      "Erro ao buscar produto por código de barras:",
      erro
    );

    throw erro;
  }
}

// ========================================
// REGISTRAR ENTRADA
// ========================================

export async function registrarEntrada(
  produtoId,
  quantidade,
  motivo = ""
) {
  try {
    const quantidadeNumerica =
      Number(quantidade);

    if (
      !produtoId ||
      !Number.isFinite(quantidadeNumerica) ||
      quantidadeNumerica <= 0
    ) {
      throw new Error(
        "Produto ou quantidade de entrada inválida."
      );
    }

    const resposta = await fetch(
      `${API_URL}/api/estoque/entrada`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          produtoId,
          quantidade: quantidadeNumerica,
          motivo: String(motivo || "").trim(),
        }),
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados?.erro ||
          `Erro HTTP ${resposta.status}`
      );
    }

    return dados;
  } catch (erro) {
    console.error(
      "Erro ao registrar entrada:",
      erro
    );

    throw erro;
  }
}

// ========================================
// REGISTRAR SAÍDA MANUAL
// ========================================

export async function registrarSaida(
  produtoId,
  quantidade,
  motivo = "",
  pedidoId = null
) {
  try {
    const quantidadeNumerica =
      Number(quantidade);

    if (
      !produtoId ||
      !Number.isFinite(quantidadeNumerica) ||
      quantidadeNumerica <= 0
    ) {
      throw new Error(
        "Produto ou quantidade de saída inválida."
      );
    }

    const resposta = await fetch(
      `${API_URL}/api/estoque/saida`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          produtoId,
          quantidade: quantidadeNumerica,
          motivo: String(motivo || "").trim(),
          pedidoId:
            pedidoId === null ||
            pedidoId === undefined ||
            pedidoId === ""
              ? null
              : pedidoId,
        }),
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados?.erro ||
          `Erro HTTP ${resposta.status}`
      );
    }

    return dados;
  } catch (erro) {
    console.error(
      "Erro ao registrar saída:",
      erro
    );

    throw erro;
  }
}

// ========================================
// AJUSTAR ESTOQUE
// ========================================

export async function ajustarEstoque(
  produtoId,
  quantidade,
  motivo = ""
) {
  try {
    const quantidadeNumerica =
      Number(quantidade);

    if (
      !produtoId ||
      !Number.isFinite(quantidadeNumerica)
    ) {
      throw new Error(
        "Produto ou quantidade de ajuste inválida."
      );
    }

    if (!String(motivo || "").trim()) {
      throw new Error(
        "Informe o motivo do ajuste."
      );
    }

    const resposta = await fetch(
      `${API_URL}/api/estoque/ajuste`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          produtoId,
          quantidade: quantidadeNumerica,
          motivo: String(motivo).trim(),
        }),
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados?.erro ||
          `Erro HTTP ${resposta.status}`
      );
    }

    return dados;
  } catch (erro) {
    console.error(
      "Erro ao ajustar estoque:",
      erro
    );

    throw erro;
  }
}

// ========================================
// CARREGAR MOVIMENTAÇÕES
// ========================================

export async function carregarMovimentacoes() {
  try {
    const resposta = await fetch(
      `${API_URL}/api/estoque/movimentacoes`
    );

    if (!resposta.ok) {
      throw new Error(
        `Erro HTTP ${resposta.status}`
      );
    }

    const dados = await resposta.json();

    // Mesma proteção caso a API retorne
    // { value: [...] } em vez de [...]
    const movimentacoes = Array.isArray(dados)
      ? dados
      : Array.isArray(dados?.value)
        ? dados.value
        : [];

    console.log(
      "======= MOVIMENTAÇÕES ESTOQUE ======="
    );

    console.table(movimentacoes);

    console.log(
      "====================================="
    );

    return movimentacoes;
  } catch (erro) {
    console.error(
      "Erro ao carregar movimentações:",
      erro
    );

    throw erro;
  }
}