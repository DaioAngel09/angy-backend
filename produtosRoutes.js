// backend/routes/produtosRoutes.js
const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// Configurar a conexão com o banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Luis.011963",
  database: "angy_db",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
    return;
  }
  console.log("Conectado ao banco de dados!");
});

// Defina as rotas
router.get("/", (req, res) => {
  const query = "SELECT * FROM produtos";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar produtos:", err.message);
      res.status(500).json({ error: "Erro ao buscar produtos" });
      return;
    }
    res.json(results);
  });
});

module.exports = router;

