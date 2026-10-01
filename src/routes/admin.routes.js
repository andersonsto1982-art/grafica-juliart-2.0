const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ erro: 'Usuário e senha são obrigatórios.' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM gj_administradores WHERE usuario = ?',
            [usuario]
        );

        if (rows.length === 0) {
            return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
        }

        const admin = rows[0];
        const senhaValida = (senha === admin.senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
        }

        const secret = process.env.JWT_SECRET || 'secreto_juliart';
        const token = jwt.sign(
            { id: admin.id, usuario: admin.usuario },
            secret,
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            token
        });
    } catch (error) {
        console.error('Erro na rota de login:', error);
        return res.status(500).json({
            erro: 'Erro interno no servidor ao realizar login',
            detalhe: error.message,
            codigo: error.code || 'SEM_CODIGO'
        });
    }
});

module.exports = router;