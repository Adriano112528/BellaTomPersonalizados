const express = require("express");

const router = express.Router();

const db = require("../database/database");

// ========================================
// CRIAR TABELA DE CONTATO
// ========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS contato (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    telefone TEXT DEFAULT '',
    whatsapp TEXT DEFAULT '',
    whatsapp_secundario TEXT DEFAULT '',
    email TEXT DEFAULT '',
    endereco TEXT DEFAULT '',
    horario TEXT DEFAULT '',
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ========================================
// INSERIR CONFIGURAÇÃO INICIAL
// ========================================

db.prepare(`
  INSERT OR IGNORE INTO contato (
    id,
    telefone,
    whatsapp,
    whatsapp_secundario,
    email,
    endereco,
    horario
  )
  VALUES (1, ?, ?, ?, ?, ?, ?)
`).run(
  "(54) 99180-5078",
  "(54) 99180-5078",
  "(54) 99272-4941",
  "contato@bellatompersonalizados.com.br",
  "Caxias do Sul - RS",
  "Segunda a sexta, das 8h às 18h"
);

// ========================================
// BUSCAR CONTATO
// ========================================

function buscarContato() {
  return db
    .prepare(`
      SELECT
        id,
        telefone,
        whatsapp,
        whatsapp_secundario AS whatsappSecundario,
        email,
        endereco,
        horario,
        atualizado_em AS atualizadoEm
      FROM contato
      WHERE id = 1
    `)
    .get();
}

// ========================================
// GET /api/contato
// ========================================

router.get("/", (req, res) => {
  try {
    const contato = buscarContato();

    res.json(contato);
  } catch (erro) {
    console.error("Erro ao carregar contato:", erro);

    res.status(500).json({
      erro: "Erro ao carregar contato.",
    });
  }
});

// ========================================
// PUT /api/contato
// ========================================

router.put("/", (req, res) => {
  try {
    const {
      telefone = "",
      whatsapp = "",
      whatsappSecundario = "",
      email = "",
      endereco = "",
      horario = "",
    } = req.body;

    db.prepare(`
      UPDATE contato
      SET
        telefone = ?,
        whatsapp = ?,
        whatsapp_secundario = ?,
        email = ?,
        endereco = ?,
        horario = ?,
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      String(telefone).trim(),
      String(whatsapp).trim(),
      String(whatsappSecundario).trim(),
      String(email).trim(),
      String(endereco).trim(),
      String(horario).trim()
    );

    const contatoAtualizado = buscarContato();

    res.json(contatoAtualizado);
  } catch (erro) {
    console.error("Erro ao atualizar contato:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar contato.",
    });
  }
});

module.exports = router;