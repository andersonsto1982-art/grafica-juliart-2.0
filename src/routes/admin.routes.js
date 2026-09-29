const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;

        if (!usuario || !senha) {
            return res.status(400).json({ erro: 'Usuário e senha são obrigatórios' });
        }

        const [rows] = await pool.query('SELECT * FROM gj_administradores WHERE usuario = ?', [usuario]);

        if (rows.length === 0) {
            return res.status(401).json({ erro: 'Usuário ou senha incorretos' });
        }

        const admin = rows[0];

        // SE A SENHA NO BANCO FOR TEXTO PURO (ex: "123456"):
        const senhaValida = (senha === admin.senha) || await bcrypt.compare(senha, admin.senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: 'Usuário ou senha incorretos' });
        }

        const secret = process.env.JWT_SECRET || 'chave_secreta_padrao';
        const token = jwt.sign(
            { id: admin.id, usuario: admin.usuario },
            secret,
            { expiresIn: '8h' }
        );

        res.json({
            mensagem: 'Login realizado com sucesso',
            token: token
        });

    } catch (error) {
    console.error('Erro na rota de login:', error);
    // Retorna o erro exato retornado pelo driver do MySQL
    res.status(500).json({ 
        erro: 'Erro interno no servidor ao realizar login', 
        detalhe: error.message,
        codigo: error.code || 'SEM_CODIGO'
    });
}
});

module.exports = router;