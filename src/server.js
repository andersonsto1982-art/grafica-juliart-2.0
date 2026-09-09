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

// Servir arquivos estáticos do front-end (sobe de 'src' para a raiz e entra em 'public')
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/api/produtos', produtosRoutes);
app.use('/api/admin', adminRoutes);

// Fallback para entregar o index.html nas rotas de navegação
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ erro: 'Rota de API não encontrada' });
    }
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Exportar a instância do Express para o Vercel Serverless
module.exports = app;

// Inicialização local (Apenas fora de produção/Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}