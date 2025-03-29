const multer = require("multer");
const path = require("path");

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Diretório onde os arquivos serão salvos
    cb(null, path.resolve(__dirname, "..", "uploads")); // Pasta 'uploads' no nível raiz
  },
  filename: (req, file, cb) => {
    // Define o nome do arquivo com timestamp para evitar duplicados
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

// Filtrar tipos de arquivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não suportado. Apenas JPG, JPEG e PNG são permitidos."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limite de 2MB
});

module.exports = upload;
