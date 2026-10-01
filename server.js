const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas de API
const produtosRoutes = require('./src/routes/produtos.routes');
const adminRoutes = require('./src/routes/admin.routes');

app.use('/api/produtos', produtosRoutes);
app.use('/api/admin', adminRoutes);

// Servir ficheiros estáticos da pasta public
const publicPath = path.join(process.cwd(), 'public');
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
}

// Fallback para rotas do Frontend e páginas HTML
app.get('*', (req, res) => {
    // Retorna erro JSON caso seja uma rota /api/ que não existe
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ erro: 'Rota de API não encontrada' });
    }

    // Se aceder a /admin ou /admin.html
    if (req.path === '/admin' || req.path === '/admin.html') {
        const adminPath = path.join(process.cwd(), 'public', 'admin.html');
        if (fs.existsSync(adminPath)) {
            return res.sendFile(adminPath);
        }
    }

    // Página inicial por defeito
    const indexPath = path.join(process.cwd(), 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }

    return res.status(404).send('Página não encontrada.');
});

// Middleware de Erros Globais
app.use((err, req, res, next) => {
    console.error('Erro no servidor:', err);
    res.status(500).json({ erro: 'Erro interno no servidor', detalhe: err.message });
});

// Inicialização local (desativado na Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor a rodar em http://localhost:${PORT}`);
    });
}

module.exports = app;