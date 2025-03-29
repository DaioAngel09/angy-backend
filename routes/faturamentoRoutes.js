const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// 🔹 Rota para buscar faturamento mensal
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(data_venda, '%M %Y') AS mes, SUM(valor_total) AS valor
      FROM vendas 
      GROUP BY mes 
      ORDER BY data_venda ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error("❌ Erro ao buscar faturamento:", error);
    res.status(500).json({ error: "Erro ao buscar faturamento. Verifique se a tabela 'vendas' existe." });
  }
});

module.exports = router;
