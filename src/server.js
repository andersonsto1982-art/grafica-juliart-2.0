const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const produtosRoutes = require('./routes/produtos.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resolução segura de caminhos estáticos
const publicPath = path.join(process.cwd(), 'public');
const uploadsPath = path.join(process.cwd(), 'uploads');

// Servir pasta de uploads apenas se ela existir fisicamente
if (fs.existsSync(uploadsPath)) {
    app.use('/uploads', express.static(uploadsPath));
}

// Servir arquivos estáticos do front-end (CSS, JS, imagens públicas)
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
}

// Rotas da API
app.use('/api/produtos', produtosRoutes);
app.use('/api/admin', adminRoutes);

// Fallback para entregar o index.html nas rotas do front-end
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ erro: 'Rota de API não encontrada' });
    }

    const indexPath = path.join(publicPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }

    res.status(404).send('Página não encontrada no servidor.');
});

// Exportar a instância do Express para a Vercel
module.exports = app;

// Inicialização em ambiente de desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}