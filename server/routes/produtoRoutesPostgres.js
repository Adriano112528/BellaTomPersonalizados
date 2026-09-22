const express = require("express");
const router = express.Router();

const { pool } = require("../database/postgres");

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function converterPreco(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return 0;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : 0;
}

function normalizarImagem(imagem) {
  if (!imagem) {
    return "";
  }

  return String(imagem).trim();
}

function normalizarBooleano(valor, padrao = true) {
  if (valor === undefined || valor === null || valor === "") {
    return padrao ? 1 : 0;
  }

  if (typeof valor === "boolean") {
    return valor ? 1 : 0;
  }

  return String(valor).toLowerCase() === "true" || Number(valor) === 1
    ? 1
    : 0;
}

// ========================================
// BUSCAR PRODUTO POR ID
// ========================================

async function buscarProdutoPorId(id, conexao = pool) {
  const resultado = await conexao.query(
    `
      SELECT
        id,
        nome,
        descricao,
        categoria,
        preco,
        preco_promocional AS "precoPromocional",
        ativo,
        imagem,
        cloudinary_public_id AS "cloudinaryPublicId",
        codigo_barras AS "codigoBarras",
        estoque,
        estoque_minimo AS "estoqueMinimo",
        criado_em AS "criadoEm",
        atualizado_em AS "atualizadoEm"
      FROM produtos
      WHERE id = $1
    `,
    [id]
  );

  return resultado.rows[0] || null;
}

// ========================================
// LISTAR PRODUTOS
// ========================================

router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        id,
        nome,
        descricao,
        categoria,
        preco,
        preco_promocional AS "precoPromocional",
        ativo,
        imagem,
        cloudinary_public_id AS "cloudinaryPublicId",
        codigo_barras AS "codigoBarras",
        estoque,
        estoque_minimo AS "estoqueMinimo",
        criado_em AS "criadoEm",
        atualizado_em AS "atualizadoEm"
      FROM produtos
      ORDER BY id DESC
    `);

    res.json(resultado.rows);
  } catch (erro) {
    console.error("Erro ao listar produtos:", erro);

    res.status(500).json({
      erro: "Erro ao carregar produtos.",
      detalhe: erro.message,
    });
  }
});

// ========================================
// BUSCAR PRODUTO POR ID
// ========================================

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        erro: "ID do produto inválido.",
      });
    }

    const produto = await buscarProdutoPorId(id);

    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado.",
      });
    }

    res.json(produto);
  } catch (erro) {
    console.error("Erro ao buscar produto:", erro);

    res.status(500).json({
      erro: "Erro ao buscar produto.",
      detalhe: erro.message,
    });
  }
});

// ========================================
// CADASTRAR PRODUTO
// ========================================

router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      nome,
      descricao = "",
      categoria = "",
      preco = 0,
      precoPromocional = null,
      ativo = true,
      imagem = "",
      cloudinaryPublicId = "",
      codigoBarras = "",
      estoque = 0,
      estoqueMinimo = 0,
    } = req.body;

    if (!nome || !String(nome).trim()) {
      return res.status(400).json({
        erro: "O nome do produto é obrigatório.",
      });
    }

    const precoConvertido = converterPreco(preco);

    const precoPromocionalConvertido =
      precoPromocional === null ||
      precoPromocional === undefined ||
      precoPromocional === ""
        ? null
        : converterPreco(precoPromocional);

    const estoqueConvertido = Number(estoque);
    const estoqueMinimoConvertido = Number(estoqueMinimo);

    if (
      !Number.isInteger(estoqueConvertido) ||
      estoqueConvertido < 0
    ) {
      return res.status(400).json({
        erro: "Estoque inválido.",
      });
    }

    if (
      !Number.isInteger(estoqueMinimoConvertido) ||
      estoqueMinimoConvertido < 0
    ) {
      return res.status(400).json({
        erro: "Estoque mínimo inválido.",
      });
    }

    await client.query("BEGIN");

    let codigoFinal = String(codigoBarras || "").trim();

    if (!codigoFinal) {
      const ultimoCodigo = await client.query(`
        SELECT MAX(CAST(codigo_barras AS BIGINT)) AS ultimo
        FROM produtos
        WHERE codigo_barras IS NOT NULL
          AND length(trim(codigo_barras)) > 0
          AND codigo_barras ~ '^[0-9]+$'
      `);

      const maior = Number(
        ultimoCodigo.rows[0]?.ultimo || 200000000000
      );

      codigoFinal = String(maior + 1).padStart(12, "0");
    }

    const resultado = await client.query(
      `
        INSERT INTO produtos (
          nome,
          descricao,
          categoria,
          preco,
          preco_promocional,
          ativo,
          imagem,
          cloudinary_public_id,
          codigo_barras,
          estoque,
          estoque_minimo
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11
        )
        RETURNING id
      `,
      [
        String(nome).trim(),
        String(descricao || ""),
        String(categoria || ""),
        precoConvertido,
        precoPromocionalConvertido,
        normalizarBooleano(ativo, true),
        normalizarImagem(imagem),
        String(cloudinaryPublicId || ""),
        codigoFinal,
        estoqueConvertido,
        estoqueMinimoConvertido,
      ]
    );

    const produtoCriado = await buscarProdutoPorId(
      resultado.rows[0].id,
      client
    );

    await client.query("COMMIT");

    console.log("Produto cadastrado:", produtoCriado);

    res.status(201).json(produtoCriado);
  } catch (erro) {
    await client.query("ROLLBACK").catch(() => {});

    console.error("Erro ao cadastrar produto:", erro);

    if (erro.code === "23505") {
      return res.status(409).json({
        erro: "Já existe um produto com este código de barras.",
      });
    }

    res.status(500).json({
      erro: "Erro ao cadastrar produto.",
      detalhe: erro.message,
    });
  } finally {
    client.release();
  }
});

// ========================================
// ATUALIZAR PRODUTO
// ========================================

router.put("/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        erro: "ID do produto inválido.",
      });
    }

    const produtoExistente = await buscarProdutoPorId(id);

    if (!produtoExistente) {
      return res.status(404).json({
        erro: "Produto não encontrado.",
      });
    }

    const {
      nome,
      descricao = "",
      categoria = "",
      preco = 0,
      precoPromocional = null,
      ativo = true,
      imagem,
      cloudinaryPublicId,
      codigoBarras,
      estoque,
      estoqueMinimo,
    } = req.body;

    if (!nome || !String(nome).trim()) {
      return res.status(400).json({
        erro: "O nome do produto é obrigatório.",
      });
    }

    const precoConvertido = converterPreco(preco);

    const precoPromocionalConvertido =
      precoPromocional === null ||
      precoPromocional === undefined ||
      precoPromocional === ""
        ? null
        : converterPreco(precoPromocional);

    const estoqueAtual = Number(produtoExistente.estoque || 0);
    const estoqueMinimoAtual = Number(
      produtoExistente.estoqueMinimo || 0
    );

    const estoqueConvertido =
      estoque === undefined ||
      estoque === null ||
      estoque === ""
        ? estoqueAtual
        : Number(estoque);

    const estoqueMinimoConvertido =
      estoqueMinimo === undefined ||
      estoqueMinimo === null ||
      estoqueMinimo === ""
        ? estoqueMinimoAtual
        : Number(estoqueMinimo);

    if (
      !Number.isInteger(estoqueConvertido) ||
      estoqueConvertido < 0
    ) {
      return res.status(400).json({
        erro: "Estoque inválido.",
      });
    }

    if (
      !Number.isInteger(estoqueMinimoConvertido) ||
      estoqueMinimoConvertido < 0
    ) {
      return res.status(400).json({
        erro: "Estoque mínimo inválido.",
      });
    }

    const imagemFinal =
      imagem === undefined
        ? produtoExistente.imagem || ""
        : normalizarImagem(imagem);

    const cloudinaryFinal =
      cloudinaryPublicId === undefined
        ? produtoExistente.cloudinaryPublicId || ""
        : String(cloudinaryPublicId || "");

    const codigoBarrasFinal =
      codigoBarras === undefined
        ? produtoExistente.codigoBarras || ""
        : String(codigoBarras || "").trim();

    await client.query("BEGIN");

    await client.query(
      `
        UPDATE produtos
        SET
          nome = $1,
          descricao = $2,
          categoria = $3,
          preco = $4,
          preco_promocional = $5,
          ativo = $6,
          imagem = $7,
          cloudinary_public_id = $8,
          codigo_barras = $9,
          estoque = $10,
          estoque_minimo = $11,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $12
      `,
      [
        String(nome).trim(),
        String(descricao || ""),
        String(categoria || ""),
        precoConvertido,
        precoPromocionalConvertido,
        normalizarBooleano(ativo, true),
        imagemFinal,
        cloudinaryFinal,
        codigoBarrasFinal,
        estoqueConvertido,
        estoqueMinimoConvertido,
        id,
      ]
    );

    const produtoAtualizado = await buscarProdutoPorId(id, client);

    await client.query("COMMIT");

    console.log("Produto atualizado:", produtoAtualizado);

    res.json(produtoAtualizado);
  } catch (erro) {
    await client.query("ROLLBACK").catch(() => {});

    console.error("Erro ao atualizar produto:", erro);

    if (erro.code === "23505") {
      return res.status(409).json({
        erro: "Já existe um produto com este código de barras.",
      });
    }

    res.status(500).json({
      erro: "Erro ao atualizar produto.",
      detalhe: erro.message,
    });
  } finally {
    client.release();
  }
});

// ========================================
// EXCLUIR PRODUTO
// ========================================

router.delete("/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        erro: "ID do produto inválido.",
      });
    }

    const produto = await buscarProdutoPorId(id);

    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado.",
      });
    }

    const movimentacoes = await client.query(
      `
        SELECT COUNT(*)::int AS total
        FROM movimentacoes_estoque
        WHERE produto_id = $1
      `,
      [id]
    );

    if (Number(movimentacoes.rows[0].total) > 0) {
      return res.status(400).json({
        erro:
          "Este produto possui movimentações de estoque e não pode ser excluído.",
      });
    }

    await client.query(
      "DELETE FROM produtos WHERE id = $1",
      [id]
    );

    console.log("Produto excluído:", id);

    res.json({
      sucesso: true,
      mensagem: "Produto excluído com sucesso.",
    });
  } catch (erro) {
    console.error("Erro ao excluir produto:", erro);

    if (erro.code === "23503") {
      return res.status(400).json({
        erro:
          "Este produto está relacionado a outros registros e não pode ser excluído.",
      });
    }

    res.status(500).json({
      erro: "Erro ao excluir produto.",
      detalhe: erro.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;