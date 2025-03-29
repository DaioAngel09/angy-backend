const express = require("express");
const router = express.Router();
const db = require("../config/database");

// ✅ Relatório diário de movimentações
router.get("/diario", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        m.id, 
        p.nome AS produto, 
        m.tipo_movimentacao AS tipo, 
        m.quantidade, 
        DATE_FORMAT(m.data_movimentacao, '%d/%m/%Y %H:%i') AS data 
      FROM movimentacoes_estoque m 
      JOIN produtos p ON m.produto_id = p.id 
      WHERE DATE(m.data_movimentacao) = CURDATE() 
      ORDER BY m.data_movimentacao DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Erro ao buscar relatório diário:", error);
    res.status(500).json({ error: "Erro ao buscar relatório diário." });
  }
});

module.exports = router;
