const express = require("express");

const router = express.Router();

const db = require("../database/database");

// ========================================
// BUSCAR PRODUTO POR CÃ“DIGO DE BARRAS
// ========================================

router.get("/buscar/:codigo", (req, res) => {
  try {
    const codigo = String(req.params.codigo || "").trim();

    if (!codigo) {
      return res.status(400).json({
        erro: "CÃ³digo de barras nÃ£o informado.",
      });
    }

    const produto = db
      .prepare(`
        SELECT
          id,
          nome,
          descricao,
          categoria,
          preco,
          preco_promocional AS precoPromocional,
          ativo,
          imagem,
          codigo_barras AS codigoBarras,
          estoque,
          estoque_minimo AS estoqueMinimo,
          criado_em AS criadoEm,
          atualizado_em AS atualizadoEm
        FROM produtos
        WHERE codigo_barras = ?
      `)
      .get(codigo);

    if (!produto) {
      return res.status(404).json({
        erro: "Produto nÃ£o encontrado.",
      });
    }

    res.json(produto);
  } catch (erro) {
    console.error(
      "Erro ao buscar produto por cÃ³digo de barras:",
      erro
    );

    res.status(500).json({
      erro: "Erro ao buscar produto.",
    });
  }
});

// ========================================
// LISTAR ESTOQUE
// ========================================

router.get("/", (req, res) => {
  try {
    const produtos = db
      .prepare(`
        SELECT
          id,
          nome,
          categoria,
          preco,
          imagem,
          codigo_barras AS codigoBarras,
          estoque,
          estoque_minimo AS estoqueMinimo,
          CASE
            WHEN estoque <= 0 THEN 'ZERADO'
            WHEN estoque <= estoque_minimo THEN 'BAIXO'
            ELSE 'NORMAL'
          END AS statusEstoque
        FROM produtos
        ORDER BY nome ASC
      `)
      .all();

    res.json(produtos);
  } catch (erro) {
    console.error(
      "Erro ao carregar estoque:",
      erro
    );

    res.status(500).json({
      erro: "Erro ao carregar estoque.",
    });
  }
});

// ========================================
// ENTRADA DE ESTOQUE
// ========================================

router.post("/entrada", (req, res) => {
  try {
    const {
      produtoId = null,
      codigoBarras = "",
      quantidade,
      motivo = ""
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
        erro: "Quantidade inválida."
      });
    }

    let produto = null;

    if (codigo) {
      produto = db.prepare(`
        SELECT id, nome, estoque, codigo_barras
        FROM produtos
        WHERE codigo_barras = ?
      `).get(codigo);
    } else if (Number.isInteger(idInformado)) {
      produto = db.prepare(`
        SELECT id, nome, estoque, codigo_barras
        FROM produtos
        WHERE id = ?
      `).get(idInformado);
    }

    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado."
      });
    }

    const estoqueAnterior = Number(produto.estoque || 0);
    const estoquePosterior = estoqueAnterior + qtd;

    const atualizar = db.prepare(`
      UPDATE produtos
      SET estoque = ?, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const registrar = db.prepare(`
      INSERT INTO movimentacoes_estoque
      (
        produto_id,
        tipo,
        quantidade,
        estoque_anterior,
        estoque_posterior,
        motivo
      )
      VALUES (?, 'ENTRADA', ?, ?, ?, ?)
    `);

    const transacao = db.transaction(() => {
      atualizar.run(estoquePosterior, produto.id);

      registrar.run(
        produto.id,
        qtd,
        estoqueAnterior,
        estoquePosterior,
        motivo
      );
    });

    transacao();

    return res.json({
      sucesso: true,
      produtoId: produto.id,
      produto: produto.nome,
      codigoBarras: produto.codigo_barras,
      quantidade: qtd,
      estoqueAnterior,
      estoquePosterior
    });

  } catch (erro) {
    console.error("Erro na entrada de estoque:", erro);

    return res.status(500).json({
      erro: "Erro ao registrar entrada de estoque."
    });
  }
});

router.post("/saida", (req, res) => {
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
        erro: "Produto invÃ¡lido.",
      });
    }

    if (!Number.isInteger(qtd) || qtd <= 0) {
      return res.status(400).json({
        erro: "A quantidade deve ser maior que zero.",
      });
    }

    const produto = db
      .prepare(`
        SELECT id, nome, estoque
        FROM produtos
        WHERE id = ?
      `)
      .get(id);

    if (!produto) {
      return res.status(404).json({
        erro: "Produto nÃ£o encontrado.",
      });
    }

    const estoqueAnterior = Number(produto.estoque || 0);

    if (qtd > estoqueAnterior) {
      return res.status(400).json({
        erro: "Estoque insuficiente.",
        estoqueAtual: estoqueAnterior,
        quantidadeSolicitada: qtd,
      });
    }

    const estoquePosterior =
      estoqueAnterior - qtd;

    const executarSaida = db.transaction(() => {
      db.prepare(`
        UPDATE produtos
        SET
          estoque = ?,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        estoquePosterior,
        id
      );

      db.prepare(`
        INSERT INTO movimentacoes_estoque (
          produto_id,
          tipo,
          quantidade,
          estoque_anterior,
          estoque_posterior,
          motivo,
          pedido_id
        )
        VALUES (?, 'SAIDA', ?, ?, ?, ?, ?)
      `).run(
        id,
        qtd,
        estoqueAnterior,
        estoquePosterior,
        motivo,
        pedidoId
      );
    });

    executarSaida();

    res.json({
      sucesso: true,
      mensagem: "SaÃ­da registrada.",
      produto: {
        id: produto.id,
        nome: produto.nome,
        estoqueAnterior,
        quantidade: qtd,
        estoqueAtual: estoquePosterior,
      },
    });
  } catch (erro) {
    console.error(
      "Erro ao registrar saÃ­da:",
      erro
    );

    res.status(500).json({
      erro: "Erro ao registrar saÃ­da.",
    });
  }
});

// ========================================
// AJUSTE DE ESTOQUE
// ========================================

router.post("/ajuste", (req, res) => {
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
        erro: "Produto invÃ¡lido.",
      });
    }

    if (!Number.isInteger(qtd) || qtd < 0) {
      return res.status(400).json({
        erro: "Quantidade invÃ¡lida.",
      });
    }

    const produto = db
      .prepare(`
        SELECT id, nome, estoque
        FROM produtos
        WHERE id = ?
      `)
      .get(id);

    if (!produto) {
      return res.status(404).json({
        erro: "Produto nÃ£o encontrado.",
      });
    }

    const estoqueAnterior = Number(produto.estoque || 0);

    const estoquePosterior = qtd;

    const executarAjuste = db.transaction(() => {
      db.prepare(`
        UPDATE produtos
        SET
          estoque = ?,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        estoquePosterior,
        id
      );

      db.prepare(`
        INSERT INTO movimentacoes_estoque (
          produto_id,
          tipo,
          quantidade,
          estoque_anterior,
          estoque_posterior,
          motivo
        )
        VALUES (?, 'AJUSTE', ?, ?, ?, ?)
      `).run(
        id,
        estoquePosterior - estoqueAnterior,
        estoqueAnterior,
        estoquePosterior,
        motivo
      );
    });

    executarAjuste();

    res.json({
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
    console.error(
      "Erro ao ajustar estoque:",
      erro
    );

    res.status(500).json({
      erro: "Erro ao ajustar estoque.",
    });
  }
});

// ========================================
// HISTÃ“RICO DE MOVIMENTAÃ‡Ã•ES
// ========================================

router.get("/movimentacoes", (req, res) => {
  try {
    const movimentacoes = db
      .prepare(`
        SELECT
          m.id,
          m.produto_id AS produtoId,
          p.nome AS produtoNome,
          m.tipo,
          m.quantidade,
          m.estoque_anterior AS estoqueAnterior,
          m.estoque_posterior AS estoquePosterior,
          m.motivo,
          m.pedido_id AS pedidoId,
          m.criado_em AS criadoEm
        FROM movimentacoes_estoque m
        INNER JOIN produtos p
          ON p.id = m.produto_id
        ORDER BY m.id DESC
      `)
      .all();

    res.json(movimentacoes);
  } catch (erro) {
    console.error(
      "Erro ao carregar movimentaÃ§Ãµes:",
      erro
    );

    res.status(500).json({
      erro: "Erro ao carregar movimentaÃ§Ãµes.",
    });
  }
});

module.exports = router;
