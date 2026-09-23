const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");

const imageRoutes = require("./routes/imageRoutes");

// PRODUTOS AGORA USA POSTGRESQL
const produtoRoutes = require("./routes/produtoRoutesPostgres");

const galeriaRoutes = require("./routes/galeriaRoutes");
const contatoRoutes = require("./routes/contatoRoutes");
const redesSociaisRoutes = require("./routes/redesSociaisRoutes");

// ESTOQUE AGORA USA POSTGRESQL
const estoqueRoutes = require("./routes/estoqueRoutesPostgres");

// PEDIDOS AGORA USA POSTGRESQL
const pedidoRoutes = require("./routes/pedidoRoutesPostgres");

// SQLite ainda mantido para as partes que ainda utilizam o banco antigo
const db = require("./database/database");

const app = express();

// ========================================
// MIDDLEWARES DE SEGURANÇA E PARSER
// ========================================

app.use(cors());

// Limite maior para imagens em Base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ========================================
// TRATAMENTO DE ERROS DO PARSER
// ========================================

app.use((err, req, res, next) => {
  if (err && err.type === "entity.too.large") {
    return res.status(413).json({
      erro: "A imagem enviada é muito grande. O limite máximo é de 50MB.",
    });
  }

  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      erro: "JSON enviado é inválido.",
    });
  }

  next(err);
});

// ========================================
// ROTAS DA API
// ========================================

app.use("/api/images", imageRoutes);

app.use("/api/produtos", produtoRoutes);

app.use("/api/galeria", galeriaRoutes);

app.use("/api/contato", contatoRoutes);

app.use("/api/redes-sociais", redesSociaisRoutes);

app.use("/api/estoque", estoqueRoutes);

// PEDIDOS
app.use("/api/pedidos", pedidoRoutes);

// ========================================
// ROTA PRINCIPAL
// ========================================

app.get("/", (req, res) => {
  res.json({
    status: "Servidor Online",

    cloudinary: process.env.CLOUDINARY_CLOUD_NAME
      ? "OK"
      : "NÃO CONFIGURADO",

    openai: process.env.OPENAI_API_KEY
      ? "OK"
      : "ERRO",

    sqlite: db ? "OK" : "ERRO",

    postgresql: process.env.DATABASE_URL
      ? "OK"
      : "ERRO",
  });
});

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado na porta ${PORT}`);
});