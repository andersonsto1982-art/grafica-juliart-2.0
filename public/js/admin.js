// Função de Login do Administrador com Logs
async function realizarLogin(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    console.log('Tentando realizar login...');

    const usuarioInput = document.getElementById('usuario')?.value?.trim();
    const senhaInput = document.getElementById('senha')?.value?.trim();

    if (!usuarioInput || !senhaInput) {
        alert('Por favor, preencha os campos de usuário e senha.');
        return;
    }

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: usuarioInput, senha: senhaInput })
        });

        console.log('Status da resposta:', response.status);
        const data = await response.json();
        console.log('Resposta do servidor:', data);

        if (response.ok && data.token) {
            // Salva o token
            localStorage.setItem('adminToken', data.token);

            alert('Login realizado com sucesso!');

            // Altera as seções na tela
            const loginSection = document.getElementById('login-section');
            const dashboardSection = document.getElementById('dashboard-section');
            const btnLogout = document.getElementById('btn-logout');

            if (loginSection) loginSection.style.display = 'none';
            if (dashboardSection) dashboardSection.style.display = 'block';
            if (btnLogout) btnLogout.style.display = 'inline-block';

            // Chama a função de carregar dados protegidos (se existir)
            if (typeof carregarDadosPainel === 'function') {
                carregarDadosPainel();
            }
        } else {
            alert(data.erro || data.detalhe || 'Usuário ou senha inválidos.');
        }
    } catch (error) {
        console.error('Erro na requisição de login:', error);
        alert('Erro de conexão ao tentar fazer login. Verifique o console (F12).');
    }
}

// Execução ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    // Escuta submissão do formulário OU clique no botão
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', realizarLogin);
    }

    const btnEntrar = document.getElementById('btn-entrar');
    if (btnEntrar) {
        btnEntrar.addEventListener('click', realizarLogin);
    }

    // Checagem de token ativo se estiver na página admin
    if (window.location.pathname.includes('admin')) {
        const token = localStorage.getItem('adminToken');
        if (token) {
            const loginSection = document.getElementById('login-section');
            const dashboardSection = document.getElementById('dashboard-section');
            const btnLogout = document.getElementById('btn-logout');

            if (loginSection) loginSection.style.display = 'none';
            if (dashboardSection) dashboardSection.style.display = 'block';
            if (btnLogout) btnLogout.style.display = 'inline-block';

            if (typeof carregarDadosPainel === 'function') {
                carregarDadosPainel();
            }
        }
    }
});