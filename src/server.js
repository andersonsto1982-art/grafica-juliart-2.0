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

// Rotas da API (Devem vir ANTES dos arquivos estáticos)
app.use('/api/produtos', produtosRoutes);
app.use('/api/admin', adminRoutes);

// Resolução do caminho da pasta public a partir de 'src'
const publicPath = path.resolve(__dirname, '..', 'public');

// Servir arquivos estáticos do front-end
app.use(express.static(publicPath));

// Fallback para entregar o index.html nas rotas do front (evita 404 em rotas de API não encontradas)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ erro: 'Rota de API não encontrada' });
    }
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Exportar a instância do Express para a Vercel
module.exports = app;

// Inicialização local (desativada no ambiente Vercel Serverless)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}