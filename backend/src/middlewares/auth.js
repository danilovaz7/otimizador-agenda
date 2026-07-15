const jwt = require('jsonwebtoken');
const JWT_SECRET = 'sua_chave_secreta_super_segura_aqui';

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) {
    return res.status(403).json({ error: 'Nenhum token fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
    
    req.usuarioId = decoded.id;
    next();
  });
};

// Exportação explícita e limpa
module.exports = { verificarToken, JWT_SECRET };