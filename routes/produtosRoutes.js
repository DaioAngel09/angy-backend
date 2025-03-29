const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// ✅ Listar todos os produtos
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM produtos ORDER BY nome ASC");
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos." });
  }
});

// ✅ Adicionar novo produto
router.post("/", async (req, res) => {
  const { nome, descricao, preco, estoque } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO produtos (nome, descricao, preco, estoque) VALUES (?, ?, ?, ?)",
      [nome, descricao, parseFloat(preco), parseInt(estoque)]
    );

    res.status(201).json({ message: "✅ Produto adicionado!", id: result.insertId });
  } catch (error) {
    console.error("❌ Erro ao adicionar produto:", error);
    res.status(500).json({ error: "Erro ao adicionar produto." });
  }
});

// ✅ Atualizar informações do produto
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE produtos SET nome = ?, descricao = ?, preco = ? WHERE id = ?",
      [nome, descricao, parseFloat(preco), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    res.json({ message: "✅ Produto atualizado!" });
  } catch (error) {
    console.error("❌ Erro ao atualizar produto:", error);
    res.status(500).json({ error: "Erro ao atualizar produto." });
  }
});

// ✅ Remover produto pelo ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM produtos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    res.json({ message: "🗑️ Produto removido!" });
  } catch (error) {
    console.error("❌ Erro ao remover produto:", error);
    res.status(500).json({ error: "Erro ao remover produto." });
  }
});

// ✅ Atualizar estoque e registrar movimentação
router.put("/:id/estoque", async (req, res) => {
  const { id } = req.params;
  const { quantidade, tipo } = req.body;

  if (!quantidade || !tipo) {
    return res.status(400).json({ error: "Quantidade e tipo são obrigatórios." });
  }

  try {
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

    await pool.query("UPDATE produtos SET estoque = ? WHERE id = ?", [novoEstoque, id]);

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
