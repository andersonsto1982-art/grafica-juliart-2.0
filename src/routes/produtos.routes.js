const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 1. Buscar apenas produtos em destaque (para o carrossel principal do topo)
router.get('/destaques', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.nome as categoria_nome, c.slug as categoria_slug 
            FROM gj_produtos p 
            LEFT JOIN gj_categorias c ON p.categoria_id = c.id 
            WHERE p.destaque = 1
            ORDER BY p.id DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar produtos em destaque', detalhe: error.message });
    }
});

// 2. Buscar todos os produtos (com filtros opcionais)
router.get('/', async (req, res) => {
    try {
        const { categoria, destaque } = req.query;
        let query = `
            SELECT p.*, c.nome as categoria_nome, c.slug as categoria_slug 
            FROM gj_produtos p 
            LEFT JOIN gj_categorias c ON p.categoria_id = c.id
        `;
        const conditions = [];
        const params = [];

        if (categoria) {
            conditions.push('c.slug = ?');
            params.push(categoria);
        }

        if (destaque === 'true' || destaque === '1') {
            conditions.push('p.destaque = 1');
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.id DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar produtos', detalhe: error.message });
    }
});

// 3. Buscar um único produto por ID
router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.nome as categoria_nome, c.slug as categoria_slug 
            FROM gj_produtos p 
            LEFT JOIN gj_categorias c ON p.categoria_id = c.id 
            WHERE p.id = ?
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar produto', detalhe: error.message });
    }
});

// 4. Cadastrar um novo produto
router.post('/', async (req, res) => {
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

// 5. Atualizar/Editar um produto existente por ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, imagem, categoria_id, destaque } = req.body;

        const [produtoExistente] = await pool.query('SELECT * FROM gj_produtos WHERE id = ?', [id]);
        if (produtoExistente.length === 0) {
            return res.status(404).json({ mensagem: 'Produto não encontrado para edição' });
        }

        const query = `
            UPDATE gj_produtos 
            SET nome = ?, 
                descricao = ?, 
                preco = ?, 
                imagem = ?, 
                categoria_id = ?, 
                destaque = ?
            WHERE id = ?
        `;

        await pool.query(query, [
            nome || produtoExistente[0].nome,
            descricao !== undefined ? descricao : produtoExistente[0].descricao,
            preco || produtoExistente[0].preco,
            imagem || produtoExistente[0].imagem,
            categoria_id || produtoExistente[0].categoria_id,
            destaque !== undefined ? (destaque ? 1 : 0) : produtoExistente[0].destaque,
            id
        ]);

        res.json({ mensagem: 'Produto atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar produto', detalhe: error.message });
    }
});

// 6. Deletar um produto por ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM gj_produtos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        }

        res.json({ mensagem: 'Produto excluído com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir produto', detalhe: error.message });
    }
});

module.exports = router;