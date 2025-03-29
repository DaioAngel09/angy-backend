require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const vendasRoutes = require("./routes/vendas");

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || "angy_secret_key";

// Configuração do CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'https://angy-stock.web.app'], // Permite o localhost e o frontend hospedado
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Se necessário para cookies/autenticação
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/vendas", vendasRoutes);

// Conexão com o banco de dados MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "angy_db",
  waitForConnections: true,
  connectionLimit: 10,
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Token não fornecido." });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido." });
    req.user = user;
    next();
  });
};

// Registro de usuário
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Usuário e senha são obrigatórios." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);
    res.status(201).json({ message: "Usuário registrado com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao registrar usuário." });
  }
});

// Login de usuário
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Usuário e senha são obrigatórios." });

  try {
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (users.length === 0) return res.status(401).json({ error: "Credenciais inválidas." });

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) return res.status(401).json({ error: "Credenciais inválidas." });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "2h" });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer login." });
  }
});

// Cadastro de produtos
app.post("/produtos", authenticateToken, async (req, res) => {
  const { nome, preco, estoque } = req.body;
  try {
    await db.query("INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)", [nome, preco, estoque]);
    res.status(201).json({ message: "Produto cadastrado com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao cadastrar produto." });
  }
});

// Listagem de produtos
app.get("/produtos", authenticateToken, async (req, res) => {
  try {
    const [produtos] = await db.query("SELECT * FROM produtos");
    res.status(200).json(produtos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar produtos." });
  }
});

// Atualizar produto
app.put("/produtos/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nome, preco, estoque } = req.body;
  try {
    await db.query("UPDATE produtos SET nome = ?, preco = ?, estoque = ? WHERE id = ?", [nome, preco, estoque, id]);
    res.status(200).json({ message: "Produto atualizado com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar produto." });
  }
});

// Remover produto
app.delete("/produtos/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM produtos WHERE id = ?", [id]);
    res.status(200).json({ message: "Produto removido com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover produto." });
  }
});

// Criar fatura
app.post("/faturas", authenticateToken, async (req, res) => {
  const { cliente_id, produtos, total } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query("INSERT INTO faturas (cliente_id, total) VALUES (?, ?)", [cliente_id, total]);
    const faturaId = result.insertId;

    const items = produtos.map(prod => [faturaId, prod.id, prod.quantidade]);
    await connection.query("INSERT INTO fatura_items (fatura_id, produto_id, quantidade) VALUES ?", [items]);

    for (const prod of produtos) {
      await connection.query("UPDATE produtos SET estoque = estoque - ? WHERE id = ?", [prod.quantidade, prod.id]);
    }

    await connection.commit();
    res.status(201).json({ message: "Fatura emitida com sucesso." });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: "Erro ao emitir fatura." });
  } finally {
    connection.release();
  }
});

// Listar faturas
app.get("/faturas", authenticateToken, async (req, res) => {
  try {
    const [faturas] = await db.query("SELECT * FROM faturas");
    res.status(200).json(faturas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar faturas." });
  }
});

// Servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
});
