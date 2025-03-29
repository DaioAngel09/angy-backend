const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateToken = require("../middleware/auth");

// 📌 Criar uma nova venda
router.post("/", authenticateToken, (req, res) => {
    const { cliente_id, produtos, total } = req.body;

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: "Erro ao iniciar transação" });

        const insertVenda = "INSERT INTO vendas (cliente_id, total) VALUES (?, ?)";
        db.query(insertVenda, [cliente_id, total], (err, result) => {
            if (err) {
                db.rollback();
                return res.status(500).json({ error: "Erro ao registrar venda" });
            }

            const vendaId = result.insertId;
            const itemsQuery = "INSERT INTO venda_items (venda_id, produto_id, quantidade) VALUES ?";
            const items = produtos.map(prod => [vendaId, prod.id, prod.quantidade]);

            db.query(itemsQuery, [items], (err) => {
                if (err) {
                    db.rollback();
                    return res.status(500).json({ error: "Erro ao registrar itens da venda" });
                }

                db.commit();
                res.status(201).json({ message: "Venda registrada com sucesso", vendaId });
            });
        });
    });
});

// 📌 Listar todas as vendas
router.get("/", authenticateToken, (req, res) => {
    const query = `
        SELECT v.id, v.cliente_id, v.total, v.data_criacao, c.nome AS cliente_nome
        FROM vendas v
        JOIN clientes c ON v.cliente_id = c.id
        ORDER BY v.data_criacao DESC
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar vendas" });

        res.status(200).json(results);
    });
});

// 📌 Obter detalhes de uma venda por ID
router.get("/:id", authenticateToken, (req, res) => {
    const vendaId = req.params.id;

    const queryVenda = `
        SELECT v.id, v.cliente_id, v.total, v.data_criacao, c.nome AS cliente_nome
        FROM vendas v
        JOIN clientes c ON v.cliente_id = c.id
        WHERE v.id = ?
    `;

    const queryItens = `
        SELECT vi.produto_id, p.nome AS produto_nome, vi.quantidade, p.preco
        FROM venda_items vi
        JOIN produtos p ON vi.produto_id = p.id
        WHERE vi.venda_id = ?
    `;

    db.query(queryVenda, [vendaId], (err, venda) => {
        if (err || venda.length === 0) return res.status(404).json({ error: "Venda não encontrada" });

        db.query(queryItens, [vendaId], (err, itens) => {
            if (err) return res.status(500).json({ error: "Erro ao buscar itens da venda" });

            res.status(200).json({ ...venda[0], itens });
        });
    });
});

// 📌 Atualizar uma venda
router.put("/:id", authenticateToken, (req, res) => {
    const vendaId = req.params.id;
    const { cliente_id, produtos, total } = req.body;

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: "Erro ao iniciar transação" });

        const updateVenda = "UPDATE vendas SET cliente_id = ?, total = ? WHERE id = ?";
        db.query(updateVenda, [cliente_id, total, vendaId], (err) => {
            if (err) {
                db.rollback();
                return res.status(500).json({ error: "Erro ao atualizar venda" });
            }

            const deleteItens = "DELETE FROM venda_items WHERE venda_id = ?";
            db.query(deleteItens, [vendaId], (err) => {
                if (err) {
                    db.rollback();
                    return res.status(500).json({ error: "Erro ao remover itens antigos" });
                }

                const itemsQuery = "INSERT INTO venda_items (venda_id, produto_id, quantidade) VALUES ?";
                const items = produtos.map(prod => [vendaId, prod.id, prod.quantidade]);

                db.query(itemsQuery, [items], (err) => {
                    if (err) {
                        db.rollback();
                        return res.status(500).json({ error: "Erro ao adicionar novos itens" });
                    }

                    db.commit();
                    res.status(200).json({ message: "Venda atualizada com sucesso" });
                });
            });
        });
    });
});

// 📌 Deletar uma venda
router.delete("/:id", authenticateToken, (req, res) => {
    const vendaId = req.params.id;

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: "Erro ao iniciar transação" });

        const deleteItens = "DELETE FROM venda_items WHERE venda_id = ?";
        db.query(deleteItens, [vendaId], (err) => {
            if (err) {
                db.rollback();
                return res.status(500).json({ error: "Erro ao deletar itens da venda" });
            }

            const deleteVenda = "DELETE FROM vendas WHERE id = ?";
            db.query(deleteVenda, [vendaId], (err) => {
                if (err) {
                    db.rollback();
                    return res.status(500).json({ error: "Erro ao deletar venda" });
                }

                db.commit();
                res.status(200).json({ message: "Venda deletada com sucesso" });
            });
        });
    });
});

module.exports = router;
