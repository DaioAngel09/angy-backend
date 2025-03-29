const express = require("express");
const router = express.Router();
const db = require("../config/database");

// ✅ 1. Criar um novo cliente
router.post("/clientes", async (req, res) => {
  const { nome, email, telefone, endereco } = req.body;
  try {
    await db.execute(
      "INSERT INTO clientes (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)",
      [nome, email, telefone, endereco]
    );
    res.status(201).json({ message: "Cliente cadastrado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao cadastrar cliente." });
  }
});

// ✅ 2. Criar um novo pedido
router.post("/pedidos", async (req, res) => {
  const { cliente_id, produtos } = req.body; // produtos = [{ produto_id, quantidade, preco_unitario }]
  try {
    let total = produtos.reduce((sum, p) => sum + p.quantidade * p.preco_unitario, 0);

    const [pedido] = await db.execute(
      "INSERT INTO pedidos (cliente_id, total, status) VALUES (?, ?, 'pendente')",
      [cliente_id, total]
    );

    const pedido_id = pedido.insertId;

    for (let p of produtos) {
      await db.execute(
        "INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?)",
        [pedido_id, p.produto_id, p.quantidade, p.preco_unitario, p.quantidade * p.preco_unitario]
      );

      // Atualizar estoque
      await db.execute("UPDATE produtos SET estoque = estoque - ? WHERE id = ?", [p.quantidade, p.produto_id]);
    }

    res.status(201).json({ message: "Pedido criado com sucesso!", pedido_id });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar pedido." });
  }
});

// ✅ 3. Gerar uma fatura para um pedido
router.post("/faturas", async (req, res) => {
  const { pedido_id } = req.body;
  try {
    const [pedido] = await db.execute("SELECT total FROM pedidos WHERE id = ?", [pedido_id]);
    if (pedido.length === 0) return res.status(404).json({ error: "Pedido não encontrado." });

    await db.execute(
      "INSERT INTO faturas (pedido_id, valor_total, status) VALUES (?, ?, 'pendente')",
      [pedido_id, pedido[0].total]
    );

    res.status(201).json({ message: "Fatura gerada com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar fatura." });
  }
});

// ✅ 4. Listar pedidos e faturas
router.get("/pedidos", async (req, res) => {
  try {
    const [pedidos] = await db.execute(
      "SELECT p.id, c.nome AS cliente, p.data_pedido, p.total, p.status FROM pedidos p JOIN clientes c ON p.cliente_id = c.id"
    );
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar pedidos." });
  }
});

router.get("/faturas", async (req, res) => {
  try {
    const [faturas] = await db.execute(
      "SELECT f.id, p.id AS pedido_id, c.nome AS cliente, f.data_fatura, f.valor_total, f.status FROM faturas f JOIN pedidos p ON f.pedido_id = p.id JOIN clientes c ON p.cliente_id = c.id"
    );
    res.json(faturas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar faturas." });
  }
});

module.exports = router;
