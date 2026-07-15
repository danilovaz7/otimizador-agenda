require('dotenv').config();
const express = require('express');
const cors = require('cors');

// REMOVA o "src/" dos caminhos, pois você já está dentro da pasta src!
const db = require('./config/db.js'); 

// Verifique se os nomes dos arquivos abaixo terminam com "s" (plural) na sua pasta routes
const authRoutes = require('./routes/authRoutes');
const categoriaRoutes = require('./routes/categoriasRoutes'); 
const tarefaRoutes = require('./routes/tarefasRoutes');

const app = express();

app.use(cors());
app.use(express.json()); 

app.use('/', authRoutes);
app.use('/', categoriaRoutes);
app.use('/', tarefaRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando redondinho na porta ${PORT}`);
});