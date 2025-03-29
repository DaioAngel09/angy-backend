const express = require("express");
const router = express.Router();
const db = require("../config/database");

// ✅ Rota para buscar vendas semanais
router.get("/vendas", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT DATE_FORMAT(data_venda, '%d/%m') AS dia, SUM(valor_total) AS total
      FROM vendas
      WHERE data_venda >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY dia ORDER BY data_venda ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar vendas." });
  }
});

// ✅ Rota para buscar estoque atual
router.get("/estoque", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT nome AS produto, estoque AS quantidade FROM produtos");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar estoque." });
  }
});

// ✅ Rota para buscar faturamento mensal
router.get("/faturamento", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT DATE_FORMAT(data_venda, '%M') AS mes, SUM(valor_total) AS valor
      FROM vendas GROUP BY mes ORDER BY data_venda ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar faturamento." });
  }
});

module.exports = router;
