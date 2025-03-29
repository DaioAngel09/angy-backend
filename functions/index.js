const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config(); // Carregar .env para ambiente local

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Firebase e Variáveis de Ambiente
const firebaseConfig = functions.config();
const SECRET_KEY = (firebaseConfig.auth && firebaseConfig.auth.secret) || process.env.AUTH_SECRET;

if (!SECRET_KEY) {
  console.error("Erro: AUTH_SECRET não está definido no Firebase ou .env");
}

// Configuração do Banco de Dados
const dbConfig = firebaseConfig.db || {};
const db = mysql.createPool({
  host: dbConfig.host || process.env.DB_HOST,
  user: dbConfig.user || process.env.DB_USER,
  password: dbConfig.pass || process.env.DB_PASS,
  database: dbConfig.name || process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Rota de teste
app.get("/", (req, res) => {
  res.send("API rodando no Firebase!");
});

// Registro de usuário
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Usuário e senha são obrigatórios." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);

    res.status(201).json({ message: "Usuário registrado com sucesso." });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error.message);
    res.status(500).json({ error: "Erro ao registrar usuário." });
  }
});

// Login de usuário
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Usuário e senha são obrigatórios." });
  }

  try {
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Erro ao fazer login:", error.message);
    res.status(500).json({ error: "Erro ao fazer login." });
  }
});

// Exportar API para Firebase Functions
exports.api = functions.https.onRequest(app);
