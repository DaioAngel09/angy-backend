require('dotenv').config(); // Carrega variáveis de ambiente
const mysql = require('mysql2/promise');

const connectDB = async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Luis.011963',
      database: process.env.DB_NAME || 'angy_db',
      waitForConnections: true,
      connectionLimit: 10, // Melhor performance
      queueLimit: 0
    });

    console.log('Conexão com o banco de dados bem-sucedida!');
    return pool; // Retorna o pool de conexões
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
    setTimeout(connectDB, 5000); // Tenta reconectar após 5s
  }
};

module.exports = connectDB;
