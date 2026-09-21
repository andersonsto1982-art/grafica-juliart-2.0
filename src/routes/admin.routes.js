const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const https = require('https');
const authMiddleware = require('../middleware/auth');

// Configuração do Multer (armazenamento temporário em memória)
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

// Upload para ImgBB
router.post('/upload', authMiddleware, upload.single('imagemFile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });

        const apiKey = process.env.IMGBB_API_KEY;
        if (!apiKey) return res.status(500).json({ erro: 'Chave IMGBB_API_KEY não configurada na Vercel.' });

        const base64Image = req.file.buffer.toString('base64');
        const postData = new URLSearchParams({ image: base64Image }).toString();

        const options = {
            hostname: 'api.imgbb.com',
            path: `/1/upload?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const imgbbReq = https.request(options, (imgbbRes) => {
            let data = '';
            imgbbRes.on('data', (chunk) => data += chunk);
            imgbbRes.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.success) {
                        return res.json({ url: json.data.url });
                    } else {
                        return res.status(500).json({ erro: 'Erro no envio para ImgBB', detalhe: json });
                    }
                } catch (e) {
                    return res.status(500).json({ erro: 'Resposta inválida do ImgBB' });
                }
            });
        });

        imgbbReq.on('error', (err) => {
            res.status(500).json({ erro: 'Falha de conexão com ImgBB', detalhe: err.message });
        });

        imgbbReq.write(postData);
        imgbbReq.end();
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao processar imagem', detalhe: error.message });
    }
});

// Cadastrar Produto
router.post('/produtos', authMiddleware, async (req, res) => {
    try {
        const { nome, descricao, preco, categoria_id, destaque, imagem } = req.body;

        if (!nome || preco === undefined || preco === null || preco === '') {
            return res.status(400).json({ erro: 'Nome e preço são obrigatórios.' });
        }

        const precoNum = parseFloat(preco);
        const imagemUrl = imagem && String(imagem).trim() !== '' ? String(imagem).trim() : '/images/placeholder.jpg';
        const isDestaque = (destaque === 'true' || destaque === '1' || destaque === 1 || destaque === true) ? 1 : 0;
        const catId = categoria_id && categoria_id !== '' ? parseInt(categoria_id, 10) : null;

        const [result] = await pool.query(
            'INSERT INTO gj_produtos (nome, descricao, preco, imagem, categoria_id, destaque) VALUES (?, ?, ?, ?, ?, ?)',
            [nome.trim(), descricao || '', precoNum, imagemUrl, catId, isDestaque]
        );

        res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao cadastrar produto', detalhe: error.message });
    }
});

// Atualizar Produto
router.put('/produtos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, categoria_id, destaque, imagem } = req.body;

        const [produtoExistente] = await pool.query('SELECT * FROM gj_produtos WHERE id = ?', [id]);
        if (produtoExistente.length === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });

        const produtoAtual = produtoExistente[0];

        const novoNome = nome !== undefined && String(nome).trim() !== '' ? String(nome).trim() : produtoAtual.nome;
        const novaDescricao = descricao !== undefined ? descricao : produtoAtual.descricao;
        const novoPreco = preco !== undefined && preco !== '' ? parseFloat(preco) : produtoAtual.preco;
        const novaCategoria = categoria_id !== undefined && categoria_id !== '' ? parseInt(categoria_id, 10) : produtoAtual.categoria_id;
        const novaImagem = imagem !== undefined && String(imagem).trim() !== '' ? String(imagem).trim() : produtoAtual.imagem;
        const novoDestaque = destaque !== undefined ? ((destaque === 'true' || destaque === '1' || destaque === 1 || destaque === true) ? 1 : 0) : produtoAtual.destaque;

        await pool.query(
            'UPDATE gj_produtos SET nome = ?, descricao = ?, preco = ?, imagem = ?, categoria_id = ?, destaque = ? WHERE id = ?',
            [novoNome, novaDescricao, novoPreco, novaImagem, novaCategoria, novoDestaque, id]
        );

        res.json({ mensagem: 'Produto atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar produto', detalhe: error.message });
    }
});

// Excluir Produto
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