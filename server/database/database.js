const Database = require("better-sqlite3");
const path = require("path");

// Caminho do banco SQLite
const caminhoBanco = path.join(__dirname, "bellatom.db");

// Cria ou abre o banco
const db = new Database(caminhoBanco);

// Ativa integridade das chaves estrangeiras
db.pragma("foreign_keys = ON");

// ========================================
// TABELA DE PRODUTOS
// ========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT DEFAULT '',
    categoria TEXT DEFAULT '',
    preco REAL DEFAULT 0,
    preco_promocional REAL DEFAULT NULL,
    ativo INTEGER DEFAULT 1,
    imagem TEXT DEFAULT '',
    cloudinary_public_id TEXT DEFAULT '',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ========================================
// ESTRUTURA DO ESTOQUE
// ========================================

function colunaExiste(tabela, coluna) {
  const colunas = db
    .prepare(`PRAGMA table_info(${tabela})`)
    .all();

  return colunas.some(
    (item) => item.name === coluna
  );
}

// Código de barras
if (!colunaExiste("produtos", "codigo_barras")) {
  db.exec(`
    ALTER TABLE produtos
    ADD COLUMN codigo_barras TEXT DEFAULT '';
  `);

  console.log("✅ Coluna codigo_barras criada.");
}

// Estoque atual
if (!colunaExiste("produtos", "estoque")) {
  db.exec(`
    ALTER TABLE produtos
    ADD COLUMN estoque INTEGER DEFAULT 0;
  `);

  console.log("✅ Coluna estoque criada.");
}

// Estoque mínimo
if (!colunaExiste("produtos", "estoque_minimo")) {
  db.exec(`
    ALTER TABLE produtos
    ADD COLUMN estoque_minimo INTEGER DEFAULT 0;
  `);

  console.log("✅ Coluna estoque_minimo criada.");
}

// ========================================
// HISTÓRICO DE MOVIMENTAÇÕES
// ========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    produto_id INTEGER NOT NULL,

    tipo TEXT NOT NULL
      CHECK (
        tipo IN (
          'ENTRADA',
          'SAIDA',
          'AJUSTE'
        )
      ),

    quantidade INTEGER NOT NULL,

    estoque_anterior INTEGER NOT NULL DEFAULT 0,

    estoque_posterior INTEGER NOT NULL DEFAULT 0,

    motivo TEXT DEFAULT '',

    pedido_id INTEGER DEFAULT NULL,

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (produto_id)
      REFERENCES produtos(id)
      ON DELETE RESTRICT
  );
`);

console.log("✅ Estrutura de estoque pronta.");
console.log("✅ Histórico de estoque pronto.");

// ========================================
// TABELA DE REDES SOCIAIS
// ========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS redes_sociais (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    instagram TEXT DEFAULT '',
    facebook TEXT DEFAULT '',
    whatsapp_numbers TEXT DEFAULT '[]',
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ========================================
// REGISTRO INICIAL DAS REDES SOCIAIS
// ========================================

const redesExistentes = db
  .prepare("SELECT id FROM redes_sociais WHERE id = 1")
  .get();

if (!redesExistentes) {
  db.prepare(`
    INSERT INTO redes_sociais (
      id,
      instagram,
      facebook,
      whatsapp_numbers
    )
    VALUES (?, ?, ?, ?)
  `).run(
    1,
    "https://www.instagram.com/bellatompersonalizados/",
    "https://www.facebook.com/share/1DVuoG1Nci/",
    JSON.stringify([
      {
        id: 1,
        nome: "WhatsApp principal",
        numero: "5554991805078",
      },
      {
        id: 2,
        nome: "WhatsApp secundário",
        numero: "5554992724941",
      },
    ])
  );
}

// ========================================
// MENSAGENS DE CONFIRMAÇÃO
// ========================================

console.log("✅ SQLite conectado:");
console.log(caminhoBanco);

console.log("✅ Tabela 'produtos' pronta.");
console.log("✅ Tabela 'redes_sociais' pronta.");

module.exports = db;