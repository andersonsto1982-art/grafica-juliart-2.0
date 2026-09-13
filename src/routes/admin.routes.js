const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../config/database');

// Configuração do Multer para memória (Seguro para Serverless / Vercel)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // limite de 5MB
});

// Login do Administrador
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
        }

        const emailLimpo = email.trim();
        const senhaLimpa = senha.trim();

        // Busca o usuário pelo e-mail
        const [rows] = await pool.query('SELECT * FROM gj_usuarios WHERE email = ?', [emailLimpo]);

        if (rows.length === 0) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
        }

        const usuario = rows[0];

        // Comparação de senha com remoção de espaços nas pontas
        if (String(usuario.senha).trim() !== senhaLimpa) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
        }

        res.json({ mensagem: 'Login realizado com sucesso', usuario: usuario.nome });
    } catch (error) {
        console.error('Erro detalhado no login:', error);
        res.status(500).json({ erro: 'Erro ao autenticar no banco de dados', detalhe: error.message });
    }
});

// Cadastrar Novo Produto
router.post('/produtos', upload.single('imagem'), async (req, res) => {
    try {
        const { nome, descricao, preco, categoria_id, destaque } = req.body;
        
        // Define imagem padrão se nenhum arquivo foi enviado
        const imagemNome = req.file ? req.file.originalname : 'placeholder.jpg';

        const isDestaque = destaque === 'true' || destaque === '1' || destaque === true ? 1 : 0;
        const catId = categoria_id && categoria_id !== '' ? categoria_id : null;

        const [result] = await pool.query(
            'INSERT INTO gj_produtos (nome, descricao, preco, imagem, categoria_id, destaque) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, descricao || '', preco, imagemNome, catId, isDestaque]
        );

        res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        res.status(500).json({ erro: 'Erro ao cadastrar produto', detalhe: error.message });
    }
});

// Buscar um Produto Específico por ID
router.get('/produtos/:id', async (req, res) => {
    try {
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

        const novaImagem = req.file ? req.file.originalname : produtoAtual.imagem;

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