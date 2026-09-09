const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexões para melhor performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'grafica_juliart',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testar conexão
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexão com o banco de dados MySQL realizada com sucesso!');
        connection.release();
    } catch (error) {
        console.error('❌ Erro ao conectar no MySQL:', error.message);
    }
}

testConnection();

module.exports = pool;