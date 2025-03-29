
const express = require("express");
const db = require("../db");
const PDFDocument = require("pdfkit");

const router = express.Router();

router.get("/", async (req, res) => {
    const { periodo } = req.query;
    let intervalo = "";

    if (periodo === "diario") {
        intervalo = "DATE(data_emissao)";
    } else if (periodo === "mensal") {
        intervalo = "DATE_FORMAT(data_emissao, '%Y-%m')";
    } else if (periodo === "anual") {
        intervalo = "YEAR(data_emissao)";
    }

    try {
        const [receitas] = await db.execute(
            `SELECT ${intervalo} AS periodo, SUM(total) AS receita
             FROM faturas
             GROUP BY periodo
             ORDER BY periodo`
        );

        const [produtos] = await db.execute(
            `SELECT p.nome AS produto, SUM(i.quantidade) AS vendas
             FROM itens_fatura i
             JOIN produtos p ON i.produto_id = p.id
             GROUP BY produto
             ORDER BY vendas DESC
             LIMIT 5`
        );

        res.json({
            periodos: receitas.map((r) => r.periodo),
            receitas: receitas.map((r) => r.receita),
            produtos: produtos.map((p) => p.produto),
            vendas: produtos.map((p) => p.vendas),
        });
    } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        res.status(500).json({ error: "Erro ao gerar relatório." });
    }
});

router.get("/pdf", async (req, res) => {
    const { periodo } = req.query;

    try {
        const data = [
            { periodo: "2025-01", receita: 10000 },
            { periodo: "2025-02", receita: 15000 },
        ];

        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);

        doc.fontSize(18).text("Relatório Financeiro", { align: "center" });
        doc.fontSize(14).moveDown();

        data.forEach((item) => {
            doc.text(`Período: ${item.periodo} - Receita: AOA ${item.receita}`);
        });

        doc.end();
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        res.status(500).send("Erro ao gerar PDF.");
    }
});

module.exports = router;
