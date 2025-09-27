const express = require('express')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController.js');
const { autenticarToken, verificarAdmin } = require('../middlewares/auth.js');

// Caminho da pasta de uploads
const uploadPath = path.join(__dirname, "..", "uploads", "produtos");



// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // pasta onde as imagens ficam
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5 
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);
        
        if (mimeType && extName) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas!'));
        }
    }
});


// Middleware de erro
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Arquivo muito grande. Máximo: 5MB' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Máximo 5 imagens por produto' });
        }
    }
    if (error.message.includes('Apenas imagens')) {
        return res.status(400).json({ error: error.message });
    }
    next(error);
};



// Rota para cadastrar produto COM upload de imagem
router.post('/register', 
    // autenticarToken, 
    // verificarAdmin, 
    upload.array('product-image', 5), 
    handleMulterError,
    ProdutoController.cadastrarProduto
);



// Rota para buscar todos os produtos
router.get('/', ProdutoController.buscarTodosProdutos);


// Buscar todas as categorias
router.get('/categorias', ProdutoController.buscarCategorias);

// Rota para buscar produto por ID
router.get("/:id", ProdutoController.buscarProdutoPorId);

// Buscar tamanhos por categoria
router.get('/categorias/:id/tamanhos', ProdutoController.buscarTamanhosPorCategoria);

// Editar produto
router.put('/edit/:id', ProdutoController.editarProduto)

// Excluir produto
router.delete('/delete/:id', ProdutoController.excluirProduto)

module.exports = router;