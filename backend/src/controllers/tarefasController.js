const db = require('../config/db');

// ==========================================
// LISTAR TAREFAS DO USUÁRIO LOGADO
// ==========================================
exports.listarTarefas = (req, res) => {
  const { mes, ano } = req.query;
  
  const dataAtual = new Date();
  const mesFiltro = mes || (dataAtual.getMonth() + 1);
  const anoFiltro = ano || dataAtual.getFullYear();

  // REMOVIDO "AND t.concluida = 0" para trazer todas as tarefas e o React fazer o papel de abas dinamicamente
  const query = `
    SELECT t.*, c.nome AS categoria_nome, c.cor AS categoria_cor 
    FROM tarefas t 
    LEFT JOIN categorias c ON t.categoria_id = c.id 
    WHERE t.usuario_id = ? 
      AND MONTH(t.data_vencimento) = ? 
      AND YEAR(t.data_vencimento) = ?
  `;
  
  db.query(query, [req.usuarioId, mesFiltro, anoFiltro], (err, results) => {
    if (err) {
      console.error("Erro no MySQL ao listar tarefas:", err);
      return res.status(500).json({ error: 'Erro interno ao buscar tarefas no banco de dados.' });
    }
    return res.json(results);
  });
};

// ==========================================
// CRIAR NOVA TAREFA
// ==========================================
exports.criarTarefa = (req, res) => {
  const { titulo, descricao, data_vencimento, categoria_id } = req.body;
  
  if (!titulo || !data_vencimento) {
    return res.status(400).json({ error: 'Título e data de vencimento são obrigatórios.' });
  }

  const query = 'INSERT INTO tarefas (titulo, descricao, data_vencimento, categoria_id, usuario_id) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [titulo, descricao, data_vencimento, categoria_id || null, req.usuarioId], (err, result) => {
    if (err) {
      console.error("Erro no MySQL ao criar tarefa:", err);
      return res.status(500).json({ error: 'Erro interno ao salvar tarefa no banco de dados.' });
    }
    return res.status(201).json({ id: result.insertId, message: 'Tarefa criada com sucesso!' });
  });
};

// ==========================================
// CONCLUIR TAREFA (Apagamento Lógico)
// ==========================================
exports.concluirTarefa = (req, res) => {
  const { id } = req.params;
  
  const query = 'UPDATE tarefas SET concluida = 1 WHERE id = ? AND usuario_id = ?';
  
  db.query(query, [id, req.usuarioId], (err, result) => {
    if (err) {
      console.error("Erro no MySQL ao concluir tarefa:", err);
      return res.status(500).json({ error: 'Erro interno ao concluir tarefa.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada ou não pertence a este usuário.' });
    }
    return res.json({ message: 'Tarefa concluída com sucesso!' });
  });
};

// ==========================================
// NOVO: DESCONCLUIR TAREFA (Voltar para Ativa)
// ==========================================
exports.desconcluirTarefa = (req, res) => {
  const { id } = req.params;
  
  // Altera a coluna concluida de volta para 0
  const query = 'UPDATE tarefas SET concluida = 0 WHERE id = ? AND usuario_id = ?';
  
  db.query(query, [id, req.usuarioId], (err, result) => {
    if (err) {
      console.error("Erro no MySQL ao desconcluir tarefa:", err);
      return res.status(500).json({ error: 'Erro interno ao reativar tarefa.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada ou não pertence a este usuário.' });
    }
    return res.json({ message: 'Tarefa reativada com sucesso!' });
  });
};

// ==========================================
// REAGENDAR TAREFA (Mudar o dia)
// ==========================================
exports.reagendarTarefa = (req, res) => {
  const { id } = req.params;
  const { nova_data } = req.body;

  if (!nova_data) {
    return res.status(400).json({ error: 'A nova data é obrigatória.' });
  }
  
  const query = 'UPDATE tarefas SET data_vencimento = ? WHERE id = ? AND usuario_id = ?';
  
  db.query(query, [nova_data, id, req.usuarioId], (err, result) => {
    if (err) {
      console.error("Erro no MySQL ao reagendar tarefa:", err);
      return res.status(500).json({ error: 'Erro interno ao reagendar tarefa.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada ou não pertence a este usuário.' });
    }
    return res.json({ message: 'Tarefa reagendada com sucesso!' });
  });
};