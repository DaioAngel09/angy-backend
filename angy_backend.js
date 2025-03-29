
// Estrutura inicial do backend em Node.js para o sistema "Angy"
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luis.01193',
    database: 'angy_db'
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados MySQL.');
    }
});

// Rotas básicas para o sistema

// Cadastro de produtos
app.post('/produtos', (req, res) => {
    const { nome, preco, estoque } = req.body;
    const query = 'INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)';
    db.query(query, [nome, preco, estoque], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar produto:', err);
            res.status(500).json({ error: 'Erro ao cadastrar produto.' });
        } else {
            res.status(201).json({ message: 'Produto cadastrado com sucesso.' });
        }
    });
});

// Listar produtos
app.get('/produtos', (req, res) => {
    const query = 'SELECT * FROM produtos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao listar produtos:', err);
            res.status(500).json({ error: 'Erro ao listar produtos.' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Emissão de faturas
app.post('/faturas', (req, res) => {
    const { cliente_id, produtos, total } = req.body;
    const query = 'INSERT INTO faturas (cliente_id, total) VALUES (?, ?)';
    db.query(query, [cliente_id, total], (err, result) => {
        if (err) {
            console.error('Erro ao emitir fatura:', err);
            res.status(500).json({ error: 'Erro ao emitir fatura.' });
        } else {
            const faturaId = result.insertId;
            const itemsQuery = 'INSERT INTO fatura_items (fatura_id, produto_id, quantidade) VALUES ?';
            const items = produtos.map(prod => [faturaId, prod.id, prod.quantidade]);
            db.query(itemsQuery, [items], (err) => {
                if (err) {
                    console.error('Erro ao salvar itens da fatura:', err);
                    res.status(500).json({ error: 'Erro ao salvar itens da fatura.' });
                } else {
                    res.status(201).json({ message: 'Fatura emitida com sucesso.' });
                }
            });
        }
    });
});

// Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
