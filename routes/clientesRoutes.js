const express = require("express");
const router = express.Router();
const db = require("../config/database");

// ✅ Listar todos os clientes
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM clientes ORDER BY nome ASC");
    res.json(rows);
  } catch (error) {
    console.error("❌ Erro ao buscar clientes:", error);
    res.status(500).json({ error: "Erro ao buscar clientes." });
  }
});

// ✅ Adicionar um novo cliente
router.post("/", async (req, res) => {
  const { nome, email, telefone } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)",
      [nome, email, telefone]
    );
    res.status(201).json({ message: "✅ Cliente adicionado com sucesso!", id: result.insertId });
  } catch (error) {
    console.error("❌ Erro ao adicionar cliente:", error);
    res.status(500).json({ error: "Erro ao adicionar cliente." });
  }
});

// ✅ Remover um cliente
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute("DELETE FROM clientes WHERE id = ?", [id]);
    res.json({ message: "🗑️ Cliente removido com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao remover cliente:", error);
    res.status(500).json({ error: "Erro ao remover cliente." });
  }
});

module.exports = router;
