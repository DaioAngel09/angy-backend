const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Rota de cadastro
router.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // Insere no banco de dados
    const query = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    await db.query(query, [nome, email, senha]);

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
});

module.exports = router;
