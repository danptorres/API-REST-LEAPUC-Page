const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Banco de dados conectado com sucesso.");
    const res = await client.query("SELECT NOW()");
    console.log("Data do servidor:", res.rows[0].now);
    client.release();
  } catch (err) {
    console.error("Erro ao conectar no banco:", err.message);
  }
}

testConnection();

module.exports = pool;
