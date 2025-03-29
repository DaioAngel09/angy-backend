// backend/models/produtoModel.js
const db = require('../config/database.');

// Função para obter todos os produtos
const getProdutos = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM produtos', (err, results) => {
      if (err) {
        reject('Erro ao buscar produtos: ' + err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = { getProdutos };
