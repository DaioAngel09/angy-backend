const express = require("express");
const router = express.Router();
const db = require("c:/Angy_Full_Project/backend/node_modules/mysql2/index"); // Substituir pelo caminho real do seu arquivo de conexão ao banco de dados.

router.post("/", async (req, res) => {
  const { cliente, itens, total } = req.body;

  try {
    // Inserir fatura
    const [result] = await db.execute(
      "INSERT INTO faturas (cliente, total) VALUES (?, ?)",
      [cliente, total]
    );

    // Inserir itens da fatura
    const faturaId = result.insertId;
    for (const item of itens) {
      await db.execute(
        "INSERT INTO itens_fatura (fatura_id, produto, quantidade, preco) VALUES (?, ?, ?, ?)",
        [faturaId, item.produto, item.quantidade, item.preco]
      );
    }

    res.status(201).json({ message: "Fatura salva com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar fatura:", error);
    res.status(500).json({ error: "Erro ao salvar fatura." });
  }
});

module.exports = router;

app.get("/faturas", async (req, res) => {
    try {
      const [rows] = await db.execute("SELECT * FROM faturas");
      res.json(rows);
    } catch (error) {
      console.error("Erro ao buscar faturas:", error);
      res.status(500).json({ error: "Erro ao buscar faturas." });
    }
  });

  app.get("/faturas/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const [fatura] = await db.execute("SELECT * FROM faturas WHERE id = ?", [id]);
      const [itens] = await db.execute("SELECT * FROM itens_fatura WHERE fatura_id = ?", [id]);
  
      if (fatura.length === 0) {
        return res.status(404).json({ error: "Fatura não encontrada." });
      }
  
      res.json({ ...fatura[0], itens });
    } catch (error) {
      console.error("Erro ao buscar detalhes da fatura:", error);
      res.status(500).json({ error: "Erro ao buscar detalhes da fatura." });
    }
  });
  
