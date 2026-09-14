const express = require("express");

const router = express.Router();

const db = require("../database/database");

// ========================================
// CRIAR TABELA DA GALERIA
// ========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS galeria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    categoria TEXT DEFAULT '',
    texto TEXT DEFAULT '',
    imagem TEXT DEFAULT '',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ========================================
// BUSCAR ITEM POR ID
// ========================================

function buscarGaleriaPorId(id) {
  return db
    .prepare(`
      SELECT
        id,
        titulo,
        categoria,
        texto,
        imagem,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm
      FROM galeria
      WHERE id = ?
    `)
    .get(id);
}

// ========================================
// GET /api/galeria
// ========================================

router.get("/", (req, res) => {
  try {
    const itens = db
      .prepare(`
        SELECT
          id,
          titulo,
          categoria,
          texto,
          imagem,
          criado_em AS criadoEm,
          atualizado_em AS atualizadoEm
        FROM galeria
        ORDER BY id ASC
      `)
      .all();

    res.json(itens);
  } catch (erro) {
    console.error("Erro ao carregar galeria:", erro);

    res.status(500).json({
      erro: "Erro ao carregar galeria.",
    });
  }
});

// ========================================
// POST /api/galeria
// ========================================

router.post("/", (req, res) => {
  try {
    const {
      titulo = "",
      categoria = "",
      texto = "",
      imagem = "",
    } = req.body;

    if (!titulo.trim()) {
      return res.status(400).json({
        erro: "O título é obrigatório.",
      });
    }

    const resultado = db
      .prepare(`
        INSERT INTO galeria (
          titulo,
          categoria,
          texto,
          imagem
        )
        VALUES (?, ?, ?, ?)
      `)
      .run(
        titulo.trim(),
        categoria.trim(),
        texto.trim(),
        imagem
      );

    const item = buscarGaleriaPorId(
      resultado.lastInsertRowid
    );

    res.status(201).json(item);
  } catch (erro) {
    console.error("Erro ao cadastrar item da galeria:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar item da galeria.",
    });
  }
});

// ========================================
// PUT /api/galeria/:id
// ========================================

router.put("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        erro: "ID inválido.",
      });
    }

    const itemExistente = buscarGaleriaPorId(id);

    if (!itemExistente) {
      return res.status(404).json({
        erro: "Item da galeria não encontrado.",
      });
    }

    const {
      titulo,
      categoria = "",
      texto = "",
    } = req.body;

    const imagemFinal =
      req.body.imagem !== undefined
        ? String(req.body.imagem)
        : itemExistente.imagem || "";

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({
        erro: "O título é obrigatório.",
      });
    }

    db.prepare(`
      UPDATE galeria
      SET
        titulo = ?,
        categoria = ?,
        texto = ?,
        imagem = ?,
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      titulo.trim(),
      categoria.trim(),
      texto.trim(),
      imagemFinal,
      id
    );

    const itemAtualizado = buscarGaleriaPorId(id);

    res.json(itemAtualizado);
  } catch (erro) {
    console.error("Erro ao atualizar item da galeria:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar item da galeria.",
    });
  }
});

// ========================================
// DELETE /api/galeria/:id
// ========================================

router.delete("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    const itemExistente = buscarGaleriaPorId(id);

    if (!itemExistente) {
      return res.status(404).json({
        erro: "Item da galeria não encontrado.",
      });
    }

    db.prepare(`
      DELETE FROM galeria
      WHERE id = ?
    `).run(id);

    res.json({
      sucesso: true,
      mensagem: "Item excluído com sucesso.",
      id,
    });
  } catch (erro) {
    console.error("Erro ao excluir item da galeria:", erro);

    res.status(500).json({
      erro: "Erro ao excluir item da galeria.",
    });
  }
});

module.exports = router;