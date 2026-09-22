const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testarPostgres() {
  const resultado = await pool.query(`
    SELECT
      id,
      nome,
      codigo_barras,
      estoque,
      estoque_minimo,
      preco,
      preco_promocional,
      length(imagem) AS tamanho_imagem
    FROM produtos
    ORDER BY id
  `);

  console.log("✅ PostgreSQL conectado.");
  console.table(resultado.rows);
}

module.exports = {
  pool,
  testarPostgres,
};
