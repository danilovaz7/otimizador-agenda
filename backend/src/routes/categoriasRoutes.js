const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriasController');
const { verificarToken } = require('../middlewares/auth'); // caminho do seu middleware

// O verificarToken protege a rota e garante que o controller receba o usuarioId
router.get('/categorias', verificarToken, categoriaController.listarCategorias);
router.post('/categorias', verificarToken, categoriaController.criarCategoria);

module.exports = router;