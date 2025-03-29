const express = require("express");
const router = express.Router();
const { pool } = require("../config/database"); // 🔹 Importando conexão com banco de dados

// ✅ Relatório diário de movimentação
router.get("/relatorio", async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
    
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erro ao buscar relatório diário:", error);
    res.status(500).json({ error: "Erro ao buscar relatório diário." });
  }
});

// ✅ Listar produtos no estoque
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nome, estoque FROM produtos ORDER BY nome ASC");

    if (rows.length === 0) {
      return res.status(404).json({ error: "Nenhum produto encontrado no estoque." });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erro ao buscar estoque:", error);
    res.status(500).json({ error: "Erro ao buscar estoque.", details: error.message });
  }
});

// ✅ Atualizar estoque e registrar movimentação
router.put("/:id/movimentar", async (req, res) => {
  const { id } = req.params;
  const { quantidade, tipo } = req.body;

  if (!quantidade || !tipo) {
    return res.status(400).json({ error: "Quantidade e tipo são obrigatórios." });
  }

  try {
    // 🔹 Verifica se o produto existe
    const [produto] = await pool.query("SELECT estoque FROM produtos WHERE id = ?", [id]);

    if (produto.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    let novoEstoque = parseInt(produto[0].estoque);
    const qtdMovimentacao = parseInt(quantidade);

    if (isNaN(qtdMovimentacao) || qtdMovimentacao <= 0) {
      return res.status(400).json({ error: "Quantidade inválida." });
    }

    if (tipo === "entrada") {
      novoEstoque += qtdMovimentacao;
    } else if (tipo === "saida") {
      if (qtdMovimentacao > novoEstoque) {
        return res.status(400).json({ error: "Estoque insuficiente." });
      }
      novoEstoque -= qtdMovimentacao;
    } else {
      return res.status(400).json({ error: "Tipo inválido. Use 'entrada' ou 'saida'." });
    }

    // 🔹 Atualiza o estoque
    await pool.query("UPDATE produtos SET estoque = ? WHERE id = ?", [novoEstoque, id]);

    // 🔹 Registra movimentação
    await pool.query(
      "INSERT INTO movimentacoes_estoque (produto_id, tipo_movimentacao, quantidade, data_movimentacao) VALUES (?, ?, ?, NOW())",
      [id, tipo, qtdMovimentacao]
    );

    res.status(200).json({ message: "✅ Estoque atualizado!" });
  } catch (error) {
    console.error("❌ Erro ao movimentar estoque:", error);
    res.status(500).json({ error: "Erro ao movimentar estoque.", details: error.message });
  }
});

module.exports = router;
