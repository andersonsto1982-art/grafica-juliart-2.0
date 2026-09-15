const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ erro: 'Acesso negado. Token de autenticação não fornecido.' });
        }

        // O cabeçalho geralmente vem no formato "Bearer TOKEN_AQUI"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ erro: 'Formato de token inválido.' });
        }

        const token = parts[1];
        const secret = process.env.JWT_SECRET || 'chave_secreta_padrao_juliart';

        // Valida o token recebido
        const decoded = jwt.verify(token, secret);
        req.usuario = decoded; // Salva as informações do usuário logado na requisição

        next(); // Autorizado: segue para a rota principal
    } catch (error) {
        return res.status(403).json({ erro: 'Token inválido ou expirado. Faça login novamente.' });
    }
};