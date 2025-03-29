const db = require("../config/db");

/**
 * Obtém todas as vendas do banco de dados.
 */
const getVendas = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM vendas");
    res.json(rows);
  } catch (error) {
    console.error("❌ Erro ao buscar vendas:", error);
    res.status(500).json({ error: "Erro ao buscar vendas." });
  }
};

/**
 * Cria uma nova venda e atualiza o estoque.
 */
const criarVenda = async (req, res) => {
  const { cliente, produtos } = req.body;

  if (!cliente || !produtos || !Array.isArray(produtos) || produtos.length === 0) {
    return res.status(400).json({ error: "Dados inválidos. Informe cliente e produtos corretamente." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Criar a venda no banco de dados
    const [vendaResult] = await connection.query(
      "INSERT INTO vendas (cliente, data_venda) VALUES (?, NOW())",
      [cliente]
    );

    const vendaId = vendaResult.insertId;

    // Atualizar estoque e registrar produtos vendidos
    for (const { produtoId, quantidade, preco } of produtos) {
      await connection.query(
        "INSERT INTO vendas_produtos (venda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
        [vendaId, produtoId, quantidade, preco]
      );

      // Atualizar o estoque
      await connection.query(
        "UPDATE produtos SET estoque = estoque - ? WHERE id = ?",
        [quantidade, produtoId]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Venda registrada com sucesso!", vendaId });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Erro ao registrar venda:", error);
    res.status(500).json({ error: "Erro ao registrar venda." });
  } finally {
    connection.release();
  }
};

module.exports = { getVendas, criarVenda };
