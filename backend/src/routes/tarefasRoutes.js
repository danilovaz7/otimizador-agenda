const express = require('express');
const router = express.Router();
const tarefaController = require('../controllers/tarefasController');
const { verificarToken } = require('../middlewares/auth');

router.get('/tarefas', verificarToken, tarefaController.listarTarefas);
router.post('/tarefas', verificarToken, tarefaController.criarTarefa);
router.put('/tarefas/:id/concluir', verificarToken, tarefaController.concluirTarefa);
router.put('/tarefas/:id/reagendar', verificarToken, tarefaController.reagendarTarefa);
router.put('/tarefas/:id/desconcluir', verificarToken, tarefaController.desconcluirTarefa);

module.exports = router;