const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/produtos
router.get('/', async (req, res) => {
    try {
        const [produtos] = await pool.query('SELECT * FROM gj_produtos ORDER BY id DESC');
        return res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return res.status(500).json({
            erro: 'Erro interno ao buscar produtos',
            detalhe: error.message
        });
    }
});

// GET /api/produtos/destaques
router.get('/destaques', async (req, res) => {
    try {
        const [destaques] = await pool.query(
            'SELECT * FROM gj_produtos WHERE destaque = 1 OR destaque = true ORDER BY id DESC'
        );
        return res.json(destaques);
    } catch (error) {
        console.error('Erro ao buscar produtos em destaque:', error);
        return res.status(500).json({
            erro: 'Erro interno ao buscar produtos em destaque',
            detalhe: error.message
        });
    }
});

// GET /api/produtos/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM gj_produtos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar produto por ID:', error);
        return res.status(500).json({
            erro: 'Erro interno ao buscar produto',
            detalhe: error.message
        });
    }
});

// POST /api/produtos
router.post('/', async (req, res) => {
    try {
        const { nome, descricao, preco, imagem, categoria_id, destaque } = req.body;
        if (!nome || !preco) {
            return res.status(400).json({ erro: 'Nome e preço são obrigatórios.' });
        }

        const query = `
            INSERT INTO gj_produtos (nome, descricao, preco, imagem, categoria_id, destaque)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [
            nome,
            descricao || null,
            parseFloat(preco),
            imagem || 'default.jpg',
            categoria_id ? parseInt(categoria_id) : null,
            destaque ? 1 : 0
        ]);

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Produto cadastrado com sucesso!',
            id: result.insertId
        });
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        return res.status(500).json({
            erro: 'Erro ao cadastrar produto',
            detalhe: error.message
        });
    }
});

// PUT /api/produtos/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco, imagem, categoria_id, destaque } = req.body;

    if (!nome || !preco) {
        return res.status(400).json({ erro: 'Nome e preço são obrigatórios.' });
    }

    try {
        const query = `
            UPDATE gj_produtos
            SET nome = ?, descricao = ?, preco = ?, imagem = ?, categoria_id = ?, destaque = ?
            WHERE id = ?
        `;

        const [result] = await pool.query(query, [
            nome,
            descricao || null,
            parseFloat(preco),
            imagem || 'default.jpg',
            categoria_id ? parseInt(categoria_id) : null,
            destaque ? 1 : 0,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado para atualização.' });
        }

        return res.json({
            sucesso: true,
            mensagem: 'Produto atualizado com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        return res.status(500).json({
            erro: 'Erro ao atualizar produto',
            detalhe: error.message
        });
    }
});

// DELETE /api/produtos/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM gj_produtos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado para exclusão.' });
        }
        return res.json({
            sucesso: true,
            mensagem: 'Produto excluído com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        return res.status(500).json({
            erro: 'Erro ao excluir produto',
            detalhe: error.message
        });
    }
});

module.exports = router;