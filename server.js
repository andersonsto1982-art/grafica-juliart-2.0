const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
const produtosRoutes = require('./src/routes/produtos.routes');
const adminRoutes = require('./src/routes/admin.routes');

app.use('/api/produtos', produtosRoutes);
app.use('/api/admin', adminRoutes);

// Servir ficheiros estáticos da pasta public
app.use(express.static(path.join(process.cwd(), 'public')));

// Fallback para SPA e páginas HTML
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ erro: 'Rota de API não encontrada' });
    }

    if (req.path === '/admin' || req.path === '/admin.html') {
        return res.sendFile(path.join(process.cwd(), 'public', 'admin.html'));
    }

    return res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Middleware de Erros Globais
app.use((err, req, res, next) => {
    console.error('Erro no servidor:', err);
    res.status(500).json({ erro: 'Erro interno no servidor', detalhe: err.message });
});

// Inicialização local
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor a rodar em http://localhost:${PORT}`);
    });
}

module.exports = app;