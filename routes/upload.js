const express = require("express");
const router = express.Router();
const upload = require("../config/uploadConfig"); // Importar a configuração do multer
const path = require("path");

// Rota para upload
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Por favor, envie um arquivo válido." });
  }

  // Retorna o caminho do arquivo salvo
  res.json({
    message: "Upload realizado com sucesso!",
    filePath: `/uploads/${req.file.filename}`,
  });
});

// Rota para servir as imagens
router.get("/uploads/:filename", (req, res) => {
  const filePath = path.resolve(__dirname, "..", "uploads", req.params.filename);
  res.sendFile(filePath);
});

module.exports = router;
