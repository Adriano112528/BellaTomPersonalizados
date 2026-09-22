const express = require("express");
const { pool } = require("../database/postgres");

const router = express.Router();

// ========================================
// BUSCAR PRODUTO POR CÓDIGO DE BARRAS
// ========================================

router.get("/buscar/:codigo", async (req, res) => {
  try {
    const codigo = String(req.params.codigo || "").trim();

    if (!codigo) {
      return res.status(400).json({
        erro: "Código de barras não informado.",
      });
    }

    const resultado = await pool.query(
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
          codigo_barras AS "codigoBarras",
          estoque,
          estoque_minimo AS "estoqueMinimo",
          criado_em AS "criadoEm",
          atualizado_em AS "atualizadoEm"
        FROM produtos
        WHERE codigo_barras = $1
      `,
      [codigo]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Produto não encontrado.",
      });
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    console.error("Erro ao buscar produto por código de barras:", erro);

    return res.status(500).json({
      erro: "Erro ao buscar produto.",
    });
  }
});

// ========================================
// LISTAR ESTOQUE
// ========================================

router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        id,
        nome,
        categoria,
        preco,
        imagem,
        codigo_barras AS "codigoBarras",
        estoque,
        estoque_minimo AS "estoqueMinimo",
        CASE
          WHEN estoque <= 0 THEN 'ZERADO'
          WHEN estoque <= estoque_minimo THEN 'BAIXO'
          ELSE 'NORMAL'
        END AS "statusEstoque"
      FROM produtos
      ORDER BY nome ASC
    `);

    return res.json(resultado.rows);
  } catch (erro) {
    console.error("Erro ao carregar estoque:", erro);

    return res.status(500).json({
      erro: "Erro ao carregar estoque.",
    });
  }
});

// ========================================
// ENTRADA DE ESTOQUE
// ========================================

router.post("/entrada", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      produtoId = null,
      codigoBarras = "",
      quantidade,
      motivo = "",
    } = req.body;

    const codigo = String(codigoBarras || "").trim();

    const idInformado =
      produtoId === null ||
      produtoId === undefined ||
      produtoId === ""
        ? null
        : Number(produtoId);

    const qtd = Number(quantidade);

    if (!Number.isInteger(qtd) || qtd <= 0) {
      return res.status(400).json({
        erro: "Quantidade inválida.",
      });
    }

    await client.query("BEGIN");

    let resultado;

    if (codigo) {
      resultado = await client.query(
        `
          SELECT id, nome, estoque, codigo_barras
          FROM produtos
          WHERE codigo_barras = $1
          FOR UPDATE
        `,
        [codigo]
      );
    } else if (Number.isInteger(idInformado)) {
      resultado = await client.query(
        `
          SELECT id, nome, estoque, codigo_barras
          FROM produtos
          WHERE id = $1
          FOR UPDATE
        `,
        [idInformado]
      );
    } else {
      await client.query("ROLLBACK");

      return res.status(400).json({
        erro: "Produto não informado.",
      });
    }

    if (resultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        erro: "Produto não encontrado.",
      });
    }

    const produto = resultado.rows[0];

    const estoqueAnterior = Number(produto.estoque || 0);
    const estoquePosterior = estoqueAnterior + qtd;

    await client.query(
      `
        UPDATE produtos
        SET
          estoque = $1,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
      [estoquePosterior, produto.id]
    );

    await client.query(
      `
        INSERT INTO movimentacoes_estoque (
          produto_id,
          tipo,
          quantidade,
          estoque_anterior,
          estoque_posterior,
          motivo
        )
        VALUES ($1, 'ENTRADA', $2, $3, $4, $5)
      `,
      [
        produto.id,
        qtd,
        estoqueAnterior,
        estoquePosterior,
        motivo,
      ]
    );

    await client.query("COMMIT");

    return res.json({
      sucesso: true,
      produtoId: produto.id,
      produto: produto.nome,
      codigoBarras: produto.codigo_barras,
      quantidade: qtd,
      estoqueAnterior,
      estoquePosterior,
    });
  } catch (erro) {
    await client.query("ROLLBACK").catch(() => {});

    console.error("=================================");
    console.error("ERRO COMPLETO NA ENTRADA:");
    console.error(erro);
    console.error("MESSAGE:", erro.message);
    console.error("CODE:", erro.code);
    console.error("DETAIL:", erro.detail);
    console.error("HINT:", erro.hint);
    console.error("=================================");

    return res.status(500).json({
      erro: "Erro ao registrar entrada de estoque.",
      detalhe: erro.message,
      codigo: erro.code,
      detail: erro.detail,
      hint: erro.hint,
    });
  } finally {
    client.release();
  }
});

// ========================================
// SAÍDA DE ESTOQUE
// ========================================

router.post("/saida", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      produtoId,
      quantidade,
      motivo = "",
      pedidoId = null,
    } = req.body;

    const id = Number(produtoId);
    const qtd = Number(quantidade);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        erro: "Produto inválido.",
      });
    }

    if (!Number.isInteger(qtd) || qtd <= 0) {
      return res.status(400).json({
        erro: "A quantidade deve ser maior que zero.",
      });
    }

    await client.query("BEGIN");

    const resultado = await client.query(
      `
        SELECT id, nome, estoque
        FROM produtos
        WHERE id = $1
        FOR UPDATE
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        erro: "Produto não encontrado.",
      });
    }

    const produto = resultado.rows[0];

    const estoqueAnterior = Number(produto.estoque || 0);

    if (qtd > estoqueAnterior) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        erro: "Estoque insuficiente.",
        estoqueAtual: estoqueAnterior,
        quantidadeSolicitada: qtd,
      });
    }

    const estoquePosterior = estoqueAnterior - qtd;

    await client.query(
      `
        UPDATE produtos
        SET
          estoque = $1,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
      [estoquePosterior, id]
    );

    await client.query(
      `
        INSERT INTO movimentacoes_estoque (
          produto_id,
          tipo,
          quantidade,
          estoque_anterior,
          estoque_posterior,
          motivo,
          pedido_id
        )
        VALUES ($1, 'SAIDA', $2, $3, $4, $5, $6)
      `,
      [
        id,
        qtd,
        estoqueAnterior,
        estoquePosterior,
        motivo,
        pedidoId,
      ]
    );

    await client.query("COMMIT");

    return res.json({
      sucesso: true,
      mensagem: "Saída registrada.",
      produto: {
        id: produto.id,
        nome: produto.nome,
        estoqueAnterior,
        quantidade: qtd,
        estoqueAtual: estoquePosterior,
      },
    });
  } catch (erro) {
    await client.query("ROLLBACK").catch(() => {});

    console.error("Erro ao registrar saída:", erro);

    return res.status(500).json({
      erro: "Erro ao registrar saída.",
    });
  } finally {
    client.release();
  }
});

// ========================================
// AJUSTE DE ESTOQUE
// ========================================

router.post("/ajuste", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      produtoId,
      quantidade,
      motivo = "",
    } = req.body;

    const id = Number(produtoId);
    const qtd = Number(quantidade);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        erro: "Produto inválido.",
      });
    }

    if (!Number.isInteger(qtd) || qtd < 0) {
      return res.status(400).json({
        erro: "Quantidade inválida.",
      });
    }

    await client.query("BEGIN");

    const resultado = await client.query(
      `
        SELECT id, nome, estoque
        FROM produtos
        WHERE id = $1
        FOR UPDATE
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        erro: "Produto não encontrado.",
      });
    }

    const produto = resultado.rows[0];

    const estoqueAnterior = Number(produto.estoque || 0);
    const estoquePosterior = qtd;

    await client.query(
      `
        UPDATE produtos
        SET
          estoque = $1,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
      [estoquePosterior, id]
    );

    await client.query(
      `
        INSERT INTO movimentacoes_estoque (
          produto_id,
          tipo,
          quantidade,
          estoque_anterior,
          estoque_posterior,
          motivo
        )
        VALUES ($1, 'AJUSTE', $2, $3, $4, $5)
      `,
      [
        id,
        estoquePosterior - estoqueAnterior,
        estoqueAnterior,
        estoquePosterior,
        motivo,
      ]
    );

    await client.query("COMMIT");

    return res.json({
      sucesso: true,
      mensagem: "Estoque ajustado.",
      produto: {
        id: produto.id,
        nome: produto.nome,
        estoqueAnterior,
        estoqueAtual: estoquePosterior,
      },
    });
  } catch (erro) {
    await client.query("ROLLBACK").catch(() => {});

    console.error("Erro ao ajustar estoque:", erro);

    return res.status(500).json({
      erro: "Erro ao ajustar estoque.",
    });
  } finally {
    client.release();
  }
});

// ========================================
// HISTÓRICO DE MOVIMENTAÇÕES
// ========================================

router.get("/movimentacoes", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        m.id,
        m.produto_id AS "produtoId",
        p.nome AS "produtoNome",
        m.tipo,
        m.quantidade,
        m.estoque_anterior AS "estoqueAnterior",
        m.estoque_posterior AS "estoquePosterior",
        m.motivo,
        m.pedido_id AS "pedidoId",
        m.criado_em AS "criadoEm"
      FROM movimentacoes_estoque m
      INNER JOIN produtos p
        ON p.id = m.produto_id
      ORDER BY m.id DESC
    `);

    return res.json(resultado.rows);
  } catch (erro) {
    console.error("Erro ao carregar movimentações:", erro);

    return res.status(500).json({
      erro: "Erro ao carregar movimentações.",
    });
  }
});

module.exports = router;