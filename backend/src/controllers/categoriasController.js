// Exemplo de como adaptar dentro do seu controller existente
const db = require('../config/db'); // ou como você importa seu banco

exports.listarCategorias = (req, res) => {
  // req.usuarioId vem injetado pelo middleware de autenticação
  const query = 'SELECT * FROM categorias WHERE usuario_id = ? OR usuario_id IS NULL';
  
  db.query(query, [req.usuarioId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar categorias' });
    res.json(results);
  });
};

exports.criarCategoria = (req, res) => {
  const { nome, cor } = req.body;
  const query = 'INSERT INTO categorias (nome, cor, usuario_id) VALUES (?, ?, ?)';
  
  db.query(query, [nome, cor, req.usuarioId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao salvar categoria' });
    res.status(201).json({ id: result.insertId, nome, cor, usuario_id: req.usuarioId });
  });
};