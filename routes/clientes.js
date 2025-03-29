const express = require("express");
const router = express.Router();
const pool = require("../config/database"); // Certifique-se de que está configurado corretamente

// Criar um cliente
router.post("/clientes", async (req, res) => {
  const { nome, email, telefone } = req.body;

  try {
    const [result] = await pool.query("INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)", [nome, email, telefone]);
    res.status(201).json({ sucesso: true, mensagem: "Cliente criado com sucesso", clienteId: result.insertId });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao criar cliente", erro });
  }
});

// Listar todos os clientes
router.get("/clientes", async (req, res) => {
  try {
    const [clientes] = await pool.query("SELECT * FROM clientes");
    res.status(200).json({ sucesso: true, dados: clientes });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao listar clientes", erro });
  }
});

// Obter um cliente específico
router.get("/clientes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [cliente] = await pool.query("SELECT * FROM clientes WHERE id = ?", [id]);
    if (cliente.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: "Cliente não encontrado" });
    }
    res.status(200).json({ sucesso: true, dados: cliente[0] });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar cliente", erro });
  }
});

// Atualizar um cliente
router.put("/clientes/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone } = req.body;

  try {
    const [result] = await pool.query("UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?", [nome, email, telefone, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ sucesso: false, mensagem: "Cliente não encontrado" });
    }
    res.status(200).json({ sucesso: true, mensagem: "Cliente atualizado com sucesso" });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar cliente", erro });
  }
});

// Excluir um cliente
router.delete("/clientes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM clientes WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ sucesso: false, mensagem: "Cliente não encontrado" });
    }
    res.status(200).json({ sucesso: true, mensagem: "Cliente excluído com sucesso" });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir cliente", erro });
  }
});

module.exports = router;
