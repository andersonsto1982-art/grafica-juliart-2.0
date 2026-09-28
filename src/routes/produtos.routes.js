const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 1. Rota de Login do Administrador
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

        // Se a senha no banco não for hash (texto puro), altere para: const senhaValida = (senha === admin.senha);
        const senhaValida = await bcrypt.compare(senha, admin.senha);

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
        console.error(error);
        res.status(500).json({ erro: 'Erro interno no servidor ao realizar login', detalhe: error.message });
    }
});

// 2. Rota para cadastrar produto (alinhada a /api/admin/produtos)
router.post('/produtos', async (req, res) => {
    try {
        const { nome, descricao, preco, imagem, categoria_id, destaque } = req.body;

        if (!nome || !preco) {
            return res.status(400).json({ erro: 'Nome e preço são obrigatórios' });
        }

        const query = `
            INSERT INTO gj_produtos (nome, descricao, preco, imagem, categoria_id, destaque)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.query(query, [
            nome,
            descricao || null,
            preco,
            imagem || 'default.jpg',
            categoria_id || null,
            destaque ? 1 : 0
        ]);

        res.status(201).json({ 
            mensagem: 'Produto criado com sucesso!', 
            id: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao cadastrar produto', detalhe: error.message });
    }
});

module.exports = router;