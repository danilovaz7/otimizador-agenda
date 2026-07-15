const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middlewares/auth');
const JWT_SECRET = authMiddleware.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui';

exports.registrar = async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    
    db.query(query, [nome, email, senhaCriptografada], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'E-mail já cadastrado' });
        return res.status(500).json({ error: 'Erro ao registrar' });
      }
      return res.status(201).json({ message: 'Registrado com sucesso' });
    });
  } catch (e) {
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    
    db.query(query, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro no banco de dados interno.' });
      }
      if (!results || results.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const usuario = results[0];
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      
      if (!senhaCorreta) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const token = jwt.sign({ id: usuario.id, nome: usuario.nome }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro crítico no servidor.' });
  }
};