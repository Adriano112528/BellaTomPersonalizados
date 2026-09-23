const express = require("express");
const router = express.Router();

const { pool } = require("../database/postgres");

// ============================================================
// HELPERS
// ============================================================

function numero(valor, padrao = 0) {
  const n = Number(valor);

  if (!Number.isFinite(n)) {
    return padrao;
  }

  return n;
}

function texto(valor, padrao = "") {
  if (valor === undefined || valor === null) {
    return padrao;
  }

  return String(valor).trim();
}

function calcularSubtotal(quantidade, precoUnitario) {
  return Number((quantidade * precoUnitario).toFixed(2));
}

// ============================================================
// GET - LISTAR PEDIDOS
// ============================================================
router.get("/", async (req, res) => {
  try {
    const { status, busca } = req.query;

    const valores = [];
    const filtros = [];

    if (status) {
      valores.push(status);
      filtros.push(`p.status = $${valores.length}`);
    }

    if (busca) {
      valores.push(`%${busca}%`);

      filtros.push(`
        (
          CAST(p.numero_pedido AS TEXT) ILIKE $${valores.length}
          OR p.cliente_nome ILIKE $${valores.length}
          OR p.cliente_whatsapp ILIKE $${valores.length}
          OR EXISTS (
            SELECT 1
            FROM pedido_itens pi_busca
            INNER JOIN produtos prod_busca
              ON prod_busca.id = pi_busca.produto_id
            WHERE pi_busca.pedido_id = p.id
              AND prod_busca.nome ILIKE $${valores.length}
          )
        )
      `);
    }

    const where =
      filtros.length > 0
        ? `WHERE ${filtros.join(" AND ")}`
        : "";

    const result = await pool.query(
      `
      SELECT
        p.*,

        COALESCE(
          (
            SELECT SUM(pi.quantidade)
            FROM pedido_itens pi
            WHERE pi.pedido_id = p.id
          ),
          0
        ) AS quantidade_itens,

        COALESCE(
          (
            SELECT COUNT(DISTINCT pi.produto_id)
            FROM pedido_itens pi
            WHERE pi.pedido_id = p.id
          ),
          0
        ) AS produtos_diferentes,

        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', pi.id,
                'produto_id', pi.produto_id,
                'produto_nome', prod.nome,
                'codigo_barras', prod.codigo_barras,
                'produto_imagem', prod.imagem,
                'quantidade', pi.quantidade,
                'preco_unitario', pi.preco_unitario,
                'subtotal', pi.subtotal
              )
              ORDER BY pi.id ASC
            )
            FROM pedido_itens pi
            INNER JOIN produtos prod
              ON prod.id = pi.produto_id
            WHERE pi.pedido_id = p.id
          ),
          '[]'::json
        ) AS itens

      FROM pedidos p

      ${where}

      ORDER BY p.criado_em DESC
      `,
      valores
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);

    res.status(500).json({
      erro: "Erro ao listar pedidos.",
      detalhes: error.message,
    });
  }
});

// ============================================================
// GET - BUSCAR PEDIDO POR ID
// ============================================================

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do pedido inválido.",
      });
    }

    const pedidoResult = await pool.query(
      `
      SELECT *
      FROM pedidos
      WHERE id = $1
      `,
      [id]
    );

    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({
        erro: "Pedido não encontrado.",
      });
    }

    const pedido = pedidoResult.rows[0];

    const itensResult = await pool.query(
      `
      SELECT
        pi.*,
        p.nome AS produto_nome,
        p.codigo_barras,
        p.imagem AS produto_imagem

      FROM pedido_itens pi

      INNER JOIN produtos p
        ON p.id = pi.produto_id

      WHERE pi.pedido_id = $1

      ORDER BY pi.id ASC
      `,
      [id]
    );

    pedido.itens = itensResult.rows;

    res.json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);

    res.status(500).json({
      erro: "Erro ao buscar pedido.",
      detalhes: error.message,
    });
  }
});

// ============================================================
// POST - CRIAR PEDIDO
// ============================================================

router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      cliente_nome,
      cliente_whatsapp,
      origem = "PAINEL",
      status = "NOVO",

      arte_url = null,
      arte_nome = null,
      arte_status = "PENDENTE",

      mockup_url = null,
      mockup_nome = null,
      mockup_status = "PENDENTE",

      observacoes = "",
      desconto = 0,
      validade_orcamento = null,
      prazo_producao = null,
      forma_pagamento = null,
      data_entrega = null,

      itens = [],
    } = req.body;

    const nomeCliente = texto(cliente_nome);
    const whatsapp = texto(cliente_whatsapp);

    if (!nomeCliente) {
      return res.status(400).json({
        erro: "Informe o nome do cliente.",
      });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: "O pedido precisa ter pelo menos um produto.",
      });
    }

    const origensPermitidas = [
      "WHATSAPP",
      "SITE",
      "PAINEL",
      "MANUAL",
    ];

    if (!origensPermitidas.includes(origem)) {
      return res.status(400).json({
        erro: "Origem do pedido inválida.",
      });
    }

    await client.query("BEGIN");

    // --------------------------------------------------------
    // GERA NÚMERO DO PEDIDO
    // --------------------------------------------------------
    const numeroPedidoResult = await client.query(`
      SELECT nextval('public.pedidos_numero_seq') AS numero
    `);

    const numeroPedido = Number(
      numeroPedidoResult.rows[0].numero
    );

    // --------------------------------------------------------
    // BUSCA PRODUTOS E CALCULA VALORES
    // --------------------------------------------------------

    const itensProcessados = [];

    let subtotal = 0;

    for (const item of itens) {
      const produtoId = Number(item.produto_id);
      const quantidade = Number(item.quantidade);

      if (!Number.isInteger(produtoId) || produtoId <= 0) {
        throw new Error(
          "Produto inválido informado no pedido."
        );
      }

      if (!Number.isInteger(quantidade) || quantidade <= 0) {
        throw new Error(
          "A quantidade do produto deve ser maior que zero."
        );
      }

      const produtoResult = await client.query(
        `
        SELECT
          id,
          nome,
          preco,
          preco_promocional,
          ativo

        FROM produtos

        WHERE id = $1
        `,
        [produtoId]
      );

      if (produtoResult.rows.length === 0) {
        throw new Error(
          `Produto ID ${produtoId} não encontrado.`
        );
      }

      const produto = produtoResult.rows[0];

      if (Number(produto.ativo) !== 1) {
        throw new Error(
          `O produto "${produto.nome}" está inativo.`
        );
      }

      let precoUnitario;

      if (
        item.preco_unitario !== undefined &&
        item.preco_unitario !== null &&
        item.preco_unitario !== ""
      ) {
        precoUnitario = Number(item.preco_unitario);
      } else if (
        produto.preco_promocional !== null &&
        Number(produto.preco_promocional) > 0
      ) {
        precoUnitario = Number(
          produto.preco_promocional
        );
      } else {
        precoUnitario = Number(produto.preco || 0);
      }

      if (!Number.isFinite(precoUnitario) || precoUnitario < 0) {
        throw new Error(
          `Preço inválido para o produto "${produto.nome}".`
        );
      }

      const itemSubtotal = calcularSubtotal(
        quantidade,
        precoUnitario
      );

      subtotal += itemSubtotal;

      itensProcessados.push({
        produto_id: produtoId,
        quantidade,
        preco_unitario: precoUnitario,
        subtotal: itemSubtotal,
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    const valorDesconto = Math.max(
      0,
      Number(numero(desconto, 0).toFixed(2))
    );

    const total = Number(
      Math.max(0, subtotal - valorDesconto).toFixed(2)
    );

    // --------------------------------------------------------
    // CRIA PEDIDO
    // --------------------------------------------------------

    const pedidoResult = await client.query(
      `
      INSERT INTO pedidos (
        numero_pedido,
        cliente_nome,
        cliente_whatsapp,
        origem,
        status,

        arte_url,
        arte_nome,
        arte_status,

        mockup_url,
        mockup_nome,
        mockup_status,

        observacoes,

        subtotal,
        desconto,
        total,

        validade_orcamento,
        prazo_producao,
        forma_pagamento,
        data_entrega,

        criado_em,
        atualizado_em
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
        $11,

        $12,

        $13,
        $14,
        $15,

        $16,
        $17,
        $18,
        $19,

        NOW(),
        NOW()
      )

      RETURNING *
      `,
      [
        numeroPedido,
        nomeCliente,
        whatsapp,
        origem,
        status,

        arte_url,
        arte_nome,
        arte_status,

        mockup_url,
        mockup_nome,
        mockup_status,

        observacoes,

        subtotal,
        valorDesconto,
        total,

        validade_orcamento,
        prazo_producao,
        forma_pagamento,
        data_entrega,
      ]
    );

    const pedido = pedidoResult.rows[0];

    // --------------------------------------------------------
    // INSERE ITENS
    // --------------------------------------------------------

    for (const item of itensProcessados) {
      await client.query(
        `
        INSERT INTO pedido_itens (
          pedido_id,
          produto_id,
          quantidade,
          preco_unitario,
          subtotal,
          criado_em
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          NOW()
        )
        `,
        [
          pedido.id,
          item.produto_id,
          item.quantidade,
          item.preco_unitario,
          item.subtotal,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      mensagem: "Pedido criado com sucesso.",
      pedido: {
        ...pedido,
        itens: itensProcessados,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Erro ao criar pedido:", error);

    res.status(500).json({
      erro: "Erro ao criar pedido.",
      detalhes: error.message,
    });
  } finally {
    client.release();
  }
});

// ============================================================
// PUT - ATUALIZAR PEDIDO
// ============================================================

router.put("/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do pedido inválido.",
      });
    }

    const atual = await client.query(
      `
      SELECT *
      FROM pedidos
      WHERE id = $1
      FOR UPDATE
      `,
      [id]
    );

    if (atual.rows.length === 0) {
      return res.status(404).json({
        erro: "Pedido não encontrado.",
      });
    }

    const pedidoAtual = atual.rows[0];

    const {
      cliente_nome,
      cliente_whatsapp,
      origem,
      status,

      arte_url,
      arte_nome,
      arte_status,

      mockup_url,
      mockup_nome,
      mockup_status,

      observacoes,

      desconto,

      validade_orcamento,
      prazo_producao,
      forma_pagamento,
      data_entrega,

      cliente_aprovou_em,
      iniciado_producao_em,
      finalizado_em,
    } = req.body;

    const novoStatus =
      status !== undefined
        ? texto(status)
        : pedidoAtual.status;

    const novaOrigem =
      origem !== undefined
        ? texto(origem)
        : pedidoAtual.origem;

    const nomeCliente =
      cliente_nome !== undefined
        ? texto(cliente_nome)
        : pedidoAtual.cliente_nome;

    const whatsapp =
      cliente_whatsapp !== undefined
        ? texto(cliente_whatsapp)
        : pedidoAtual.cliente_whatsapp;

    const novoDesconto =
      desconto !== undefined
        ? Math.max(0, Number(desconto))
        : Number(pedidoAtual.desconto || 0);

    // --------------------------------------------------------
    // ITENS PODEM SER ALTERADOS
    // --------------------------------------------------------

    let subtotal = Number(pedidoAtual.subtotal || 0);

    if (Array.isArray(req.body.itens)) {
      if (req.body.itens.length === 0) {
        return res.status(400).json({
          erro: "O pedido precisa ter pelo menos um produto.",
        });
      }

      subtotal = 0;

      const itensProcessados = [];

      for (const item of req.body.itens) {
        const produtoId = Number(item.produto_id);
        const quantidade = Number(item.quantidade);

        if (
          !Number.isInteger(produtoId) ||
          produtoId <= 0 ||
          !Number.isInteger(quantidade) ||
          quantidade <= 0
        ) {
          throw new Error(
            "Produto ou quantidade inválidos."
          );
        }

        const produtoResult = await client.query(
          `
          SELECT
            id,
            nome,
            preco,
            preco_promocional,
            ativo

          FROM produtos

          WHERE id = $1
          `,
          [produtoId]
        );

        if (produtoResult.rows.length === 0) {
          throw new Error(
            `Produto ID ${produtoId} não encontrado.`
          );
        }

        const produto = produtoResult.rows[0];

        if (Number(produto.ativo) !== 1) {
          throw new Error(
            `O produto "${produto.nome}" está inativo.`
          );
        }

        let precoUnitario;

        if (
          item.preco_unitario !== undefined &&
          item.preco_unitario !== null &&
          item.preco_unitario !== ""
        ) {
          precoUnitario = Number(item.preco_unitario);
        } else if (
          produto.preco_promocional !== null &&
          Number(produto.preco_promocional) > 0
        ) {
          precoUnitario = Number(
            produto.preco_promocional
          );
        } else {
          precoUnitario = Number(produto.preco || 0);
        }

        const itemSubtotal = calcularSubtotal(
          quantidade,
          precoUnitario
        );

        subtotal += itemSubtotal;

        itensProcessados.push({
          produto_id: produtoId,
          quantidade,
          preco_unitario: precoUnitario,
          subtotal: itemSubtotal,
        });
      }

      subtotal = Number(subtotal.toFixed(2));

      await client.query(
        `
        DELETE FROM pedido_itens
        WHERE pedido_id = $1
        `,
        [id]
      );

      for (const item of itensProcessados) {
        await client.query(
          `
          INSERT INTO pedido_itens (
            pedido_id,
            produto_id,
            quantidade,
            preco_unitario,
            subtotal,
            criado_em
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            NOW()
          )
          `,
          [
            id,
            item.produto_id,
            item.quantidade,
            item.preco_unitario,
            item.subtotal,
          ]
        );
      }
    }

    const novoTotal = Number(
      Math.max(0, subtotal - novoDesconto).toFixed(2)
    );

    // --------------------------------------------------------
    // ATUALIZA PEDIDO
    // --------------------------------------------------------

    const resultado = await client.query(
      `
      UPDATE pedidos

      SET
        cliente_nome = $1,
        cliente_whatsapp = $2,
        origem = $3,
        status = $4,

        arte_url = COALESCE($5, arte_url),
        arte_nome = COALESCE($6, arte_nome),
        arte_status = COALESCE($7, arte_status),

        mockup_url = COALESCE($8, mockup_url),
        mockup_nome = COALESCE($9, mockup_nome),
        mockup_status = COALESCE($10, mockup_status),

        observacoes = COALESCE($11, observacoes),

        subtotal = $12,
        desconto = $13,
        total = $14,
        validade_orcamento = COALESCE($15, validade_orcamento),
        prazo_producao = COALESCE($16, prazo_producao),
        forma_pagamento = COALESCE($17, forma_pagamento),
        data_entrega = COALESCE($18, data_entrega),

        cliente_aprovou_em = COALESCE(
          $19,
          cliente_aprovou_em
        ),

        iniciado_producao_em = COALESCE(
          $20,
          iniciado_producao_em
        ),

        finalizado_em = COALESCE(
          $21,
          finalizado_em
        ),

        atualizado_em = NOW()

      WHERE id = $22

      RETURNING *
      `,
      [
        nomeCliente,
        whatsapp,
        novaOrigem,
        novoStatus,

        arte_url !== undefined ? arte_url : null,
        arte_nome !== undefined ? arte_nome : null,
        arte_status !== undefined ? arte_status : null,

        mockup_url !== undefined ? mockup_url : null,
        mockup_nome !== undefined ? mockup_nome : null,
        mockup_status !== undefined ? mockup_status : null,

        observacoes !== undefined
          ? observacoes
          : null,

        subtotal,
        novoDesconto,
        novoTotal,

        validade_orcamento !== undefined ? validade_orcamento : null,
        prazo_producao !== undefined ? prazo_producao : null,
        forma_pagamento !== undefined ? forma_pagamento : null,
        data_entrega !== undefined ? data_entrega : null,

        cliente_aprovou_em !== undefined
          ? cliente_aprovou_em
          : null,

        iniciado_producao_em !== undefined
          ? iniciado_producao_em
          : null,

        finalizado_em !== undefined
          ? finalizado_em
          : null,

        id,
      ]
    );

    await client.query("COMMIT");

    res.json({
      mensagem: "Pedido atualizado com sucesso.",
      pedido: resultado.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Erro ao atualizar pedido:", error);

    res.status(500).json({
      erro: "Erro ao atualizar pedido.",
      detalhes: error.message,
    });
  } finally {
    client.release();
  }
});

// ============================================================
// PUT - ALTERAR STATUS
// ============================================================

router.put("/:id/status", async (req, res) => {
  const client = await pool.connect();

  try {
    const id = Number(req.params.id);
    const novoStatus = texto(req.body.status);

    const statusPermitidos = [
      "NOVO",
      "AGUARDANDO_ARTE",
      "ARTE_ENVIADA",
      "AGUARDANDO_APROVACAO",
      "APROVADO",
      "EM_PRODUCAO",
      "FINALIZADO",
      "CANCELADO",
    ];

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do pedido inválido.",
      });
    }

    if (!statusPermitidos.includes(novoStatus)) {
      return res.status(400).json({
        erro: "Status inválido.",
      });
    }

    await client.query("BEGIN");

    const pedidoResult = await client.query(
      `
      SELECT *
      FROM pedidos
      WHERE id = $1
      FOR UPDATE
      `,
      [id]
    );

    if (pedidoResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        erro: "Pedido não encontrado.",
      });
    }

    const pedido = pedidoResult.rows[0];

    // --------------------------------------------------------
    // FINALIZAÇÃO + BAIXA DO ESTOQUE
    // --------------------------------------------------------

    if (
      novoStatus === "FINALIZADO" &&
      !pedido.estoque_baixado
    ) {
      const itensResult = await client.query(
        `
        SELECT
          pi.id,
          pi.produto_id,
          pi.quantidade,
          pi.preco_unitario,

          p.nome,
          p.estoque

        FROM pedido_itens pi

        INNER JOIN produtos p
          ON p.id = pi.produto_id

        WHERE pi.pedido_id = $1

        FOR UPDATE OF p
        `,
        [id]
      );

      if (itensResult.rows.length === 0) {
        throw new Error(
          "Não é possível finalizar um pedido sem produtos."
        );
      }

      for (const item of itensResult.rows) {
        const estoqueAtual = Number(item.estoque || 0);

        if (estoqueAtual < Number(item.quantidade)) {
          throw new Error(
            `Estoque insuficiente para "${item.nome}". ` +
            `Disponível: ${estoqueAtual}. ` +
            `Necessário: ${item.quantidade}.`
          );
        }
      }

      for (const item of itensResult.rows) {
        const estoqueAnterior = Number(item.estoque || 0);

        const estoquePosterior =
          estoqueAnterior - Number(item.quantidade);

        await client.query(
          `
          UPDATE produtos

          SET
            estoque = $1,
            atualizado_em = NOW()

          WHERE id = $2
          `,
          [
            estoquePosterior,
            item.produto_id,
          ]
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
            pedido_id,
            criado_em
          )

          VALUES (
            $1,
            'SAIDA',
            $2,
            $3,
            $4,
            $5,
            $6,
            NOW()
          )
          `,
          [
            item.produto_id,
            item.quantidade,
            estoqueAnterior,
            estoquePosterior,
            `Baixa automática - Pedido #${pedido.numero_pedido}`,
            pedido.id,
          ]
        );
      }

      await client.query(
        `
        UPDATE pedidos

        SET
          estoque_baixado = TRUE,
          finalizado_em = COALESCE(
            finalizado_em,
            NOW()
          ),
          atualizado_em = NOW()

        WHERE id = $1
        `,
        [id]
      );
    }

    let clienteAprovouEm = null;

    if (novoStatus === "APROVADO") {
      clienteAprovouEm = "NOW()";
    }

    let producaoSql = "";

    if (novoStatus === "EM_PRODUCAO") {
      producaoSql = ", iniciado_producao_em = COALESCE(iniciado_producao_em, NOW())";
    }

    let updateQuery;

    if (clienteAprovouEm) {
      updateQuery = `
        UPDATE pedidos

        SET
          status = $1,
          cliente_aprovou_em = COALESCE(
            cliente_aprovou_em,
            NOW()
          ),
          atualizado_em = NOW()
          ${producaoSql}

        WHERE id = $2

        RETURNING *
      `;
    } else {
      updateQuery = `
        UPDATE pedidos

        SET
          status = $1,
          atualizado_em = NOW()
          ${producaoSql}

        WHERE id = $2

        RETURNING *
      `;
    }

    const resultado = await client.query(
      updateQuery,
      [novoStatus, id]
    );

    await client.query("COMMIT");

    res.json({
      mensagem: "Status do pedido atualizado com sucesso.",
      pedido: resultado.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Erro ao alterar status do pedido:",
      error
    );

    res.status(400).json({
      erro: "Não foi possível alterar o status do pedido.",
      detalhes: error.message,
    });
  } finally {
    client.release();
  }
});

// ============================================================
// PUT - ARTE
// ============================================================

router.put("/:id/arte", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      arte_url = null,
      arte_nome = null,
      arte_status = "ENVIADA",
    } = req.body;

    const statusPermitidos = [
      "PENDENTE",
      "ENVIADA",
      "APROVADA",
      "REJEITADA",
    ];

    if (!statusPermitidos.includes(arte_status)) {
      return res.status(400).json({
        erro: "Status da arte inválido.",
      });
    }

    const result = await pool.query(
      `
      UPDATE pedidos

      SET
        arte_url = $1,
        arte_nome = $2,
        arte_status = $3,
        atualizado_em = NOW()

      WHERE id = $4

      RETURNING *
      `,
      [
        arte_url,
        arte_nome,
        arte_status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        erro: "Pedido não encontrado.",
      });
    }

    res.json({
      mensagem: "Arte atualizada com sucesso.",
      pedido: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar arte:", error);

    res.status(500).json({
      erro: "Erro ao atualizar arte.",
      detalhes: error.message,
    });
  }
});

// ============================================================
// PUT - MOCKUP
// ============================================================

router.put("/:id/mockup", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      mockup_url = null,
      mockup_nome = null,
      mockup_status = "ENVIADO",
    } = req.body;

    const statusPermitidos = [
      "PENDENTE",
      "ENVIADO",
      "APROVADO",
      "REJEITADO",
    ];

    if (!statusPermitidos.includes(mockup_status)) {
      return res.status(400).json({
        erro: "Status do mockup inválido.",
      });
    }

    const result = await pool.query(
      `
      UPDATE pedidos

      SET
        mockup_url = $1,
        mockup_nome = $2,
        mockup_status = $3,
        atualizado_em = NOW()

      WHERE id = $4

      RETURNING *
      `,
      [
        mockup_url,
        mockup_nome,
        mockup_status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        erro: "Pedido não encontrado.",
      });
    }

    res.json({
      mensagem: "Mockup atualizado com sucesso.",
      pedido: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar mockup:", error);

    res.status(500).json({
      erro: "Erro ao atualizar mockup.",
      detalhes: error.message,
    });
  }
});

// ============================================================
// DELETE - EXCLUIR PEDIDO
// ============================================================

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do pedido inválido.",
      });
    }

    const pedidoResult = await pool.query(
      `
      SELECT
        id,
        numero_pedido,
        status,
        estoque_baixado

      FROM pedidos

      WHERE id = $1
      `,
      [id]
    );

    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({
        erro: "Pedido não encontrado.",
      });
    }

    const pedido = pedidoResult.rows[0];

    if (pedido.estoque_baixado) {
      return res.status(400).json({
        erro:
          "Este pedido já realizou baixa no estoque e não pode ser excluído.",
      });
    }

    await pool.query(
      `
      DELETE FROM pedidos
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      mensagem: `Pedido #${pedido.numero_pedido} excluído com sucesso.`,
    });
  } catch (error) {
    console.error("Erro ao excluir pedido:", error);

    res.status(500).json({
      erro: "Erro ao excluir pedido.",
      detalhes: error.message,
    });
  }
});

module.exports = router;