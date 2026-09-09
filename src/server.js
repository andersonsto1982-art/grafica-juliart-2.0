const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const produtosRoutes = require('./routes/produtos.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta frontend/public
app.use(express.static(path.join(__dirname, '../public')));

// Servir arquivos da pasta de uploads de imagens (caso esteja fora de public)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Rotas da API
app.use('/api/produtos', produtosRoutes);
app.use('/api/admin', adminRoutes);

// Fallback para rotas de navegação no frontend (SPA/HTML)
app.get('*', (req, res) => {
    // Se for uma requisição de API não encontrada, retorna JSON em vez do index.html
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ erro: 'Rota de API não encontrada' });
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor da Gráfica Juliart rodando em http://localhost:${PORT}`);
});

module.exports = app;