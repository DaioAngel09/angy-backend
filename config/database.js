const mysql = require("mysql2/promise");

// 🔹 Configuração do banco de dados
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Luis.011963", // 🔹 Substitua pela senha correta
  database: "angy_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// 🔹 Criando pool de conexões
const pool = mysql.createPool(dbConfig);

// 🔹 Testando conexão ao iniciar
const connectDB = async () => {
  try {
    console.log("⏳ Testando conexão com o banco de dados...");
    const connection = await pool.getConnection();
    console.log("✅ Conexão bem-sucedida com MySQL!");

    // Teste se o banco de dados existe
    const [dbCheck] = await connection.query("SHOW DATABASES LIKE 'angy_db'");
    if (dbCheck.length === 0) {
      console.error("❌ Banco de dados 'angy_db' não encontrado!");
      process.exit(1);
    }

    connection.release(); // Libera a conexão após o teste
  } catch (error) {
    console.error("❌ ERRO ao conectar ao banco de dados:", error);

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("🚨 Credenciais incorretas! Verifique o usuário e senha.");
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("🚨 Banco de dados não existe! Crie com: CREATE DATABASE angy_db;");
    } else if (error.code === "ECONNREFUSED") {
      console.error("🚨 Conexão recusada! O MySQL está rodando?");
    }

    process.exit(1);
  }
};

// 🔹 Exportando pool e função de conexão
module.exports = { pool, connectDB };
