const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importação segura das rotas (evita crash se houver erro interno de módulo)
try {
    const produtosRoutes = require('./routes/produtos.routes');
    const adminRoutes = require('./routes/admin.routes');
    
    app.use('/api/produtos', produtosRoutes);
    app.use('/api/admin', adminRoutes);
} catch (err) {
    console.error('Erro ao carregar arquivos de rotas:', err.message);
}

// Resolução dos arquivos estáticos
const publicPath = path.join(process.cwd(), 'public');
const uploadsPath = path.join(process.cwd(), 'uploads');

if (fs.existsSync(uploadsPath)) {
    app.use('/uploads', express.static(uploadsPath));
}

if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
}

// Fallback para SPA / index.html
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ erro: 'Rota de API não encontrada' });
    }

    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }
    res.status(404).send('Arquivo index.html não foi encontrado na pasta public.');
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro interno do servidor:', err);
    res.status(500).json({ erro: 'Erro interno no servidor', detalhe: err.message });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}