const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');

// Configuração do Multer (armazenamento em memória temporária para envio)
const upload = multer({ storage: multer.memoryStorage() });

// Login do Administrador
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });

        const [rows] = await pool.query('SELECT * FROM gj_usuarios WHERE email = ?', [email.trim()]);
        if (rows.length === 0) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });

        const usuario = rows[0];
        let senhaValida = false;
        if (usuario.senha.startsWith('$2a$') || usuario.senha.startsWith('$2b$')) {
            senhaValida = await bcrypt.compare(senha.trim(), usuario.senha);
        } else {
            senhaValida = String(usuario.senha).trim() === senha.trim();
        }

        if (!senhaValida) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });

        const secret = process.env.JWT_SECRET || 'chave_secreta_padrao_juliart';
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, nome: usuario.nome },
            secret,
            { expiresIn: '8h' }
        );

        res.json({ mensagem: 'Login realizado com sucesso', usuario: usuario.nome, token });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao autenticar', detalhe: error.message });
    }
});

// Rota de Upload de Imagem para o ImgBB (PROTEGIDA)
router.post('/upload', authMiddleware, upload.single('imagemFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
        }

        const apiKey = process.env.IMGBB_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ erro: 'Chave da API do ImgBB não configurada no servidor.' });
        }

        // Converter buffer da imagem para base64
        const base64Image = req.file.buffer.toString('base64');
        const formData = new URLSearchParams();
        formData.append('image', base64Image);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return res.json({ url: data.data.url });
        } else {
            return res.status(500).json({ erro: 'Erro no envio para o ImgBB', detalhe: data });
        }
    } catch (error) {
        console.error('Erro no upload de imagem:', error);
        res.status(500).json({ erro: 'Erro ao processar imagem', detalhe: error.message });
    }
});

// Cadastrar Produto (PROTEGIDO)
router.post('/produtos', authMiddleware, async (req, res) => {
    try {
        const { nome, descricao, preco, categoria_id, destaque, imagem } = req.body;
        const imagemUrl = imagem && imagem.trim() !== '' ? imagem.trim() : '/images/placeholder.jpg';
        const isDestaque = destaque === 'true' || destaque === '1' || destaque === true ? 1 : 0;
        const catId = categoria_id && categoria_id !== '' ? categoria_id : null;

        const [result] = await pool.query(
            'INSERT INTO gj_produtos (nome, descricao, preco, imagem, categoria_id, destaque) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, descricao || '', preco, imagemUrl, catId, isDestaque]
        );

        res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao cadastrar produto', detalhe: error.message });
    }
});

// Atualizar Produto (PROTEGIDO)
router.put('/produtos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, categoria_id, destaque, imagem } = req.body;

        const [produtoExistente] = await pool.query('SELECT * FROM gj_produtos WHERE id = ?', [id]);
        if (produtoExistente.length === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });

        const produtoAtual = produtoExistente[0];
        const novoNome = nome !== undefined && nome !== '' ? nome : produtoAtual.nome;
        const novaDescricao = descricao !== undefined ? descricao : produtoAtual.descricao;
        const novoPreco = preco !== undefined && preco !== '' ? preco : produtoAtual.preco;
        const novaCategoria = categoria_id !== undefined && categoria_id !== '' ? categoria_id : produtoAtual.categoria_id;
        const novaImagem = imagem !== undefined && imagem !== '' ? imagem : produtoAtual.imagem;
        const novoDestaque = destaque !== undefined ? (destaque ? 1 : 0) : produtoAtual.destaque;

        await pool.query(
            `UPDATE gj_produtos SET nome = ?, descricao = ?, preco = ?, imagem = ?, categoria_id = ?, destaque = ? WHERE id = ?`,
            [novoNome, novaDescricao, novoPreco, novaImagem, novaCategoria, novoDestaque, id]
        );

        res.json({ mensagem: 'Produto atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar produto', detalhe: error.message });
    }
});

// Excluir Produto (PROTEGIDO)
router.delete('/produtos/:id', authMiddleware, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM gj_produtos WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });

        res.json({ mensagem: 'Produto excluído com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir produto', detalhe: error.message });
    }
});

module.exports = router;