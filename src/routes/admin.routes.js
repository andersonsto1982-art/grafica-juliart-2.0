const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');

// Configuração do Upload de Imagens com Multer (caminho seguro)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, '../../public/images'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Login do Administrador
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        // Ajustado para gj_usuarios
        const [rows] = await pool.query('SELECT * FROM gj_usuarios WHERE email = ? AND senha = ?', [email, senha]);

        if (rows.length === 0) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
        }

        res.json({ mensagem: 'Login realizado com sucesso', usuario: rows[0].nome });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao autenticar', detalhe: error.message });
    }
});

// Cadastrar Novo Produto
router.post('/produtos', upload.single('imagem'), async (req, res) => {
    try {
        const { nome, descricao, preco, categoria_id, destaque } = req.body;
        const imagemNome = req.file ? req.file.filename : 'placeholder.jpg';

        const isDestaque = destaque === 'true' || destaque === '1' || destaque === true ? 1 : 0;
        const catId = categoria_id && categoria_id !== '' ? categoria_id : null;

        // Ajustado para gj_produtos
        const [result] = await pool.query(
            'INSERT INTO gj_produtos (nome, descricao, preco, imagem, categoria_id, destaque) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, descricao || '', preco, imagemNome, catId, isDestaque]
        );

        res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao cadastrar produto', detalhe: error.message });
    }
});

// Buscar um Produto Específico por ID
router.get('/produtos/:id', async (req, res) => {
    try {
        // Ajustado para gj_produtos
        const [rows] = await pool.query('SELECT * FROM gj_produtos WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar produto', detalhe: error.message });
    }
});

// Atualizar Produto Existente
router.put('/produtos/:id', upload.single('imagem'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, categoria_id, destaque } = req.body;

        // Ajustado para gj_produtos
        const [produtoExistente] = await pool.query('SELECT * FROM gj_produtos WHERE id = ?', [id]);

        if (produtoExistente.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado para edição' });
        }

        const produtoAtual = produtoExistente[0];

        const novoNome = nome !== undefined && nome !== '' ? nome : produtoAtual.nome;
        const novaDescricao = descricao !== undefined ? descricao : produtoAtual.descricao;
        const novoPreco = preco !== undefined && preco !== '' ? preco : produtoAtual.preco;
        const novaCategoria = categoria_id !== undefined && categoria_id !== '' ? categoria_id : produtoAtual.categoria_id;
        
        let novoDestaque = produtoAtual.destaque;
        if (destaque !== undefined) {
            novoDestaque = (destaque === 'true' || destaque === '1' || destaque === true) ? 1 : 0;
        }

        const novaImagem = req.file ? req.file.filename : produtoAtual.imagem;

        // Ajustado para gj_produtos
        await pool.query(
            `UPDATE gj_produtos 
             SET nome = ?, descricao = ?, preco = ?, imagem = ?, categoria_id = ?, destaque = ? 
             WHERE id = ?`,
            [novoNome, novaDescricao, novoPreco, novaImagem, novaCategoria, novoDestaque, id]
        );

        res.json({ mensagem: 'Produto atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro no PUT /admin/produtos:', error);
        res.status(500).json({ erro: 'Erro ao atualizar produto', detalhe: error.message });
    }
});

// Excluir Produto
router.delete('/produtos/:id', async (req, res) => {
    try {
        // Ajustado para gj_produtos
        const [result] = await pool.query('DELETE FROM gj_produtos WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }

        res.json({ mensagem: 'Produto excluído com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir produto', detalhe: error.message });
    }
});

module.exports = router;