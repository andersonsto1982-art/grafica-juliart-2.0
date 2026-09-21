const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Roteamento de APIs
const adminRoutes = require('./src/routes/admin.routes');
const produtosRoutes = require('./src/routes/produtos.routes');

app.use('/api/admin', adminRoutes);
app.use('/api/produtos', produtosRoutes);

// Servir arquivos estáticos da pasta public
const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
}

// Rota de fallback para SPA/index.html
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ erro: 'Rota de API não encontrada' });
    }
    
    const indexPath = path.join(process.cwd(), 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }
    
    return res.status(404).send('Página não encontrada');
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro interno do servidor:', err);
    res.status(500).json({ erro: 'Erro interno no servidor', detalhe: err.message });
});

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}

module.exports = app;