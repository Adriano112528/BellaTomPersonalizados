const express = require("express");

const router = express.Router();

const db = require("../database/database");

// ========================================
// BUSCAR REDES SOCIAIS
// GET /api/redes-sociais
// ========================================

router.get("/", (req, res) => {
  try {
    const redes = db
      .prepare("SELECT * FROM redes_sociais WHERE id = 1")
      .get();

    if (!redes) {
      return res.status(404).json({
        erro: "Redes sociais não encontradas.",
      });
    }

    let whatsappNumbers = [];

    try {
      whatsappNumbers = JSON.parse(redes.whatsapp_numbers || "[]");
    } catch (error) {
      whatsappNumbers = [];
    }

    return res.json({
      id: redes.id,
      instagram: redes.instagram || "",
      facebook: redes.facebook || "",
      whatsappNumbers,
      atualizado_em: redes.atualizado_em,
    });
  } catch (error) {
    console.error("Erro ao buscar redes sociais:", error);

    return res.status(500).json({
      erro: "Erro ao buscar redes sociais.",
    });
  }
});

// ========================================
// SALVAR REDES SOCIAIS
// PUT /api/redes-sociais
// ========================================

router.put("/", (req, res) => {
  try {
    const {
      instagram = "",
      facebook = "",
      whatsappNumbers = [],
    } = req.body;

    if (!Array.isArray(whatsappNumbers)) {
      return res.status(400).json({
        erro: "whatsappNumbers precisa ser uma lista.",
      });
    }

    const whatsappValidos = whatsappNumbers
      .map((item, index) => ({
        id: item.id || index + 1,
        nome: String(item.nome || "").trim(),
        numero: String(item.numero || "").trim(),
      }))
      .filter((item) => item.numero !== "");

    if (whatsappValidos.length === 0) {
      return res.status(400).json({
        erro: "Cadastre pelo menos um número de WhatsApp.",
      });
    }

    db.prepare(`
      UPDATE redes_sociais
      SET
        instagram = ?,
        facebook = ?,
        whatsapp_numbers = ?,
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      String(instagram).trim(),
      String(facebook).trim(),
      JSON.stringify(whatsappValidos)
    );

    return res.json({
      mensagem: "Redes sociais salvas com sucesso.",
      instagram: String(instagram).trim(),
      facebook: String(facebook).trim(),
      whatsappNumbers: whatsappValidos,
    });
  } catch (error) {
    console.error("Erro ao salvar redes sociais:", error);

    return res.status(500).json({
      erro: "Erro ao salvar redes sociais.",
    });
  }
});

module.exports = router;