const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const produtosRoutes = require('./routes/produtos.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do front-end
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API
app.use('/api/produtos', produtosRoutes);
app.use('/api/admin', adminRoutes);

// Fallback para entregar o index.html nas rotas do Front
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ erro: 'Rota de API não encontrada' });
    }
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = app;

// Inicialização local
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}