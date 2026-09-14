const express = require("express");

const router = express.Router();

const db = require("../database/database");

// ========================================
// CONVERTER PREÇO
// ========================================

function converterPreco(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null;
  }

  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : null;
  }

  let texto = String(valor).trim();

  texto = texto.replace(/[^\d,.-]/g, "");

  if (!texto) {
    return null;
  }

  if (texto.includes(",")) {
    texto = texto.replace(/\./g, "");
    texto = texto.replace(",", ".");
  }

  const numero = Number(texto);

  return Number.isFinite(numero) ? numero : null;
}

// ========================================
// NORMALIZAR IMAGEM
// ========================================

function normalizarImagem(imagem) {
  if (
    imagem === null ||
    imagem === undefined
  ) {
    return "";
  }

  return String(imagem).trim();
}

// ========================================
// BUSCAR PRODUTO POR ID
// ========================================

function buscarProdutoPorId(id) {
  return db
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
        cloudinary_public_id AS cloudinaryPublicId,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm
      FROM produtos
      WHERE id = ?
    `)
    .get(id);
}

// ========================================
// GET /api/produtos
// ========================================

router.get("/", (req, res) => {
  try {
    const produtos = db
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
          cloudinary_public_id AS cloudinaryPublicId,
          criado_em AS criadoEm,
          atualizado_em AS atualizadoEm
        FROM produtos
        ORDER BY id DESC
      `)
      .all();

    res.json(produtos);
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);

    res.status(500).json({
      erro: "Erro ao carregar produtos.",
    });
  }
});

// ========================================
// POST /api/produtos
// ========================================

router.post("/", (req, res) => {
  try {
    const {
      nome,
      descricao = "",
      categoria = "",
      preco = null,
      precoPromocional = null,
      ativo = true,
      imagem,
      cloudinaryPublicId = "",
    } = req.body;

    const imagemNormalizada = normalizarImagem(imagem);

    console.log("IMAGEM RECEBIDA NO POST:", {
      tipo: typeof imagem,
      tamanho: imagemNormalizada.length,
      inicio: imagemNormalizada.substring(0, 50),
    });

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "O nome do produto é obrigatório.",
      });
    }

    const precoConvertido = converterPreco(preco);

    const precoPromocionalConvertido =
      converterPreco(precoPromocional);

    if (precoConvertido === null) {
      return res.status(400).json({
        erro: "Informe um preço válido.",
      });
    }

    const resultado = db
      .prepare(`
        INSERT INTO produtos (
          nome,
          descricao,
          categoria,
          preco,
          preco_promocional,
          ativo,
          imagem,
          cloudinary_public_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        nome.trim(),
        descricao,
        categoria,
        precoConvertido,
        precoPromocionalConvertido,
        ativo ? 1 : 0,
        imagemNormalizada,
        cloudinaryPublicId || ""
      );

    const produto = buscarProdutoPorId(
      resultado.lastInsertRowid
    );

    console.log("Produto cadastrado:", {
      id: produto.id,
      nome: produto.nome,
      tamanhoImagem: produto.imagem
        ? produto.imagem.length
        : 0,
    });

    res.status(201).json(produto);
  } catch (erro) {
    console.error("Erro ao cadastrar produto:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar produto.",
    });
  }
});

// ========================================
// PUT /api/produtos/:id
// ========================================

router.put("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        erro: "ID do produto inválido.",
      });
    }

    const {
      nome,
      descricao = "",
      categoria = "",
      preco = null,
      precoPromocional = null,
      ativo = true,
      cloudinaryPublicId = "",
    } = req.body;

    const produtoExistente = buscarProdutoPorId(id);

    if (!produtoExistente) {
      return res.status(404).json({
        erro: "Produto não encontrado.",
      });
    }

    const imagemRecebida = normalizarImagem(
      req.body.imagem
    );

    const imagemFinal =
      req.body.imagem !== undefined
        ? imagemRecebida
        : produtoExistente.imagem || "";

    console.log("IMAGEM RECEBIDA NO PUT:", {
      id,
      tipo: typeof req.body.imagem,
      tamanhoRecebido: imagemRecebida.length,
      tamanhoAnterior: produtoExistente.imagem
        ? produtoExistente.imagem.length
        : 0,
      tamanhoFinal: imagemFinal.length,
      inicio: imagemFinal.substring(0, 50),
    });

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        erro: "O nome do produto é obrigatório.",
      });
    }

    const precoConvertido = converterPreco(preco);

    const precoPromocionalConvertido =
      converterPreco(precoPromocional);

    if (precoConvertido === null) {
      return res.status(400).json({
        erro: "Informe um preço válido.",
      });
    }

    db.prepare(`
      UPDATE produtos
      SET
        nome = ?,
        descricao = ?,
        categoria = ?,
        preco = ?,
        preco_promocional = ?,
        ativo = ?,
        imagem = ?,
        cloudinary_public_id = ?,
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      nome.trim(),
      descricao,
      categoria,
      precoConvertido,
      precoPromocionalConvertido,
      ativo ? 1 : 0,
      imagemFinal,
      cloudinaryPublicId || "",
      id
    );

    const produtoAtualizado = buscarProdutoPorId(id);

    console.log("Produto atualizado:", {
      id: produtoAtualizado.id,
      nome: produtoAtualizado.nome,
      tamanhoImagem: produtoAtualizado.imagem
        ? produtoAtualizado.imagem.length
        : 0,
    });

    res.json(produtoAtualizado);
  } catch (erro) {
    console.error("Erro ao atualizar produto:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar produto.",
    });
  }
});

// ========================================
// DELETE /api/produtos/:id
// ========================================

router.delete("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        erro: "ID do produto inválido.",
      });
    }

    const produtoExistente = buscarProdutoPorId(id);

    if (!produtoExistente) {
      return res.status(404).json({
        erro: "Produto não encontrado.",
      });
    }

    db.prepare(`
      DELETE FROM produtos
      WHERE id = ?
    `).run(id);

    console.log(
      "Produto excluído:",
      produtoExistente.nome
    );

    res.json({
      sucesso: true,
      mensagem: "Produto excluído com sucesso.",
      id,
    });
  } catch (erro) {
    console.error("Erro ao excluir produto:", erro);

    res.status(500).json({
      erro: "Erro ao excluir produto.",
    });
  }
});

module.exports = router;