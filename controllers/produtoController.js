// backend/controllers/produtoController.js
const produtoModel = require('../models/produtoModel');

// Controlador para obter produtos
const getProdutos = async (req, res) => {
  try {
    const produtos = await produtoModel.getProdutos();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

module.exports = { getProdutos };
