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

// Resolução dos caminhos
const publicPath = path.resolve(__dirname, '..', 'public');
const uploadsPath = path.resolve(__dirname, '..', 'uploads'); // Exposição da pasta de arquivos enviados

// Servir imagens e uploads enviados via Multer
app.use('/uploads', express.static(uploadsPath));

// Servir arquivos estáticos do front-end
app.use(express.static(publicPath));

// Rotas da API (Devem vir ANTES do fallback)
app.use('/api/produtos', produtosRoutes);
app.use('/api/admin', adminRoutes);

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