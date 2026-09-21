const express = require("express");

const router = express.Router();

const db = require("../database/database");

// ========================================
// BUSCAR PRODUTO POR CÓDIGO DE BARRAS
// ========================================

router.get("/buscar/:codigo", (req, res) => {
  try {
    const codigo = String(req.params.codigo || "").trim();

    if (!codigo) {
      return res.status(400).json({
        erro: "Código de barras não informado.",
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
        erro: "Produto não encontrado.",
      });
    }

    res.json(produto);
  } catch (erro) {
    console.error(
      "Erro ao buscar produto por código de barras:",
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
        erro: "Produto não encontrado.",
      });
    }

    const estoqueAnterior = Number(produto.estoque || 0);

    const estoquePosterior =
      estoqueAnterior + qtd;

    const executarEntrada = db.transaction(() => {
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
        VALUES (?, 'ENTRADA', ?, ?, ?, ?)
      `).run(
        id,
        qtd,
        estoqueAnterior,
        estoquePosterior,
        motivo
      );
    });

    executarEntrada();

    res.json({
      sucesso: true,
      mensagem: "Entrada registrada.",
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
      "Erro ao registrar entrada:",
      erro
    );

    res.status(500).json({
      erro: "Erro ao registrar entrada.",
    });
  }
});

// ========================================
// SAÍDA DE ESTOQUE
// ========================================

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
        erro: "Produto inválido.",
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
        erro: "Produto não encontrado.",
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
    console.error(
      "Erro ao registrar saída:",
      erro
    );

    res.status(500).json({
      erro: "Erro ao registrar saída.",
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
        erro: "Produto inválido.",
      });
    }

    if (!Number.isInteger(qtd) || qtd < 0) {
      return res.status(400).json({
        erro: "Quantidade inválida.",
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
        erro: "Produto não encontrado.",
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
// HISTÓRICO DE MOVIMENTAÇÕES
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
      "Erro ao carregar movimentações:",
      erro
    );

    res.status(500).json({
      erro: "Erro ao carregar movimentações.",
    });
  }
});

module.exports = router;