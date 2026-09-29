const app = require('../server');
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken');

    // Se NÃO existir token salvo, redireciona de volta para a tela de login
    if (!token) {
        window.location.href = '/login.html'; // Ajuste o nome da sua tela de login
        return;
    }

    // Se o token existir, carrega os dados protegidos do painel
    carregarDadosPainel();
});

module.exports = app;