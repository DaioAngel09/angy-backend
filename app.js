const express = require("express");
const cors = require("cors");
const { pool, connectDB } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 5000;

// 🔹 Middleware global
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // 🔹 Restringe o CORS ao frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true, // 🔹 Permite cookies e autenticação caso necessário
  })
);

// 🔹 Conectar ao banco de dados antes de iniciar o servidor
(async () => {
  try {
    await connectDB();
    console.log("✅ Conexão com o banco de dados estabelecida!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  }
})();

// 🔹 Importação e uso das rotas da API
const produtosRoutes = require("./routes/produtosRoutes");
const clientesRoutes = require("./routes/clientesRoutes");
const estoqueRoutes = require("./routes/estoqueRoutes");
const relatoriosRoutes = require("./routes/relatoriosRoutes");
//const vendasRoutes = require("./routes/vendasRoutes");
//const faturamentoRoutes = require("./routes/faturamentoRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes"); // 🔹 Mantido no final

// 🔹 Definição das rotas
app.use("/api/produtos", produtosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/estoque", estoqueRoutes);
app.use("/api/relatorios", relatoriosRoutes);
//app.use("/api/vendas", vendasRoutes);
//app.use("/api/faturamento", faturamentoRoutes);
app.use("/api/dashboard", dashboardRoutes); // 🔹 Rota do dashboard

// 🔹 Rota de Teste para verificar se a API está rodando
app.get("/", (req, res) => {
  res.json({ message: "🚀 API do Angy está rodando com sucesso!" });
});

// 🔹 Middleware para rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ error: "🚫 Rota não encontrada!" });
});

// 🔹 Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error("❌ Erro interno do servidor:", err);
  res.status(500).json({ error: "Erro interno do servidor. Tente novamente mais tarde." });
});

// 🔹 Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} - http://localhost:${PORT}`);
});
