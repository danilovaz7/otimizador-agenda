const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'otimizador_de_agenda',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Erro crítico ao conectar no MySQL:', err.message);
  } else {
    console.log('✅ Conexão com o banco de dados MySQL estabelecida via .env!');
    connection.release();
  }
});

module.exports = pool;