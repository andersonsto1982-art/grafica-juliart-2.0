// Carregar categorias no select do painel admin
async function carregarCategoriasSelect() {
    const select = document.getElementById('categoria-produto');
    if (!select) return;

    try {
        const response = await fetch('/api/categorias');
        if (!response.ok) return;

        const categorias = await response.json();
        select.innerHTML = '<option value="">Selecione uma categoria...</option>';

        categorias.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.nome;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Erro ao carregar categorias:', err);
    }
}

// Cadastrar nova categoria via Admin
async function cadastrarCategoria(event) {
    event.preventDefault();

    const token = localStorage.getItem('adminToken');
    const nome = document.getElementById('nome-categoria')?.value.trim();

    if (!nome) {
        alert('Digite o nome da categoria.');
        return;
    }

    try {
        const response = await fetch('/api/categorias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Categoria cadastrada com sucesso!');
            document.getElementById('form-cadastrar-categoria')?.reset();
            carregarCategoriasSelect();
        } else {
            alert(data.erro || 'Erro ao cadastrar categoria.');
        }
    } catch (err) {
        console.error('Erro ao cadastrar categoria:', err);
        alert('Erro de conexão com o servidor.');
    }
}

// Cadastrar produto com Categoria associada
async function cadastrarProduto(event) {
    event.preventDefault();

    const token = localStorage.getItem('adminToken');
    if (!token) {
        alert('Sessão expirada. Faça login novamente.');
        fazerLogout();
        return;
    }

    const nome = document.getElementById('nome-produto')?.value.trim();
    const preco = document.getElementById('preco-produto')?.value;
    const categoria_id = document.getElementById('categoria-produto')?.value;
    const imagem = document.getElementById('imagem-produto')?.value.trim();
    const descricao = document.getElementById('descricao-produto')?.value.trim();
    const destaque = document.getElementById('destaque-produto')?.checked || false;

    if (!nome || !preco) {
        alert('Por favor, preencha o nome e o preço do produto.');
        return;
    }

    const btnSalvar = document.getElementById('btn-salvar-produto');
    if (btnSalvar) btnSalvar.disabled = true;

    try {
        const response = await fetch('/api/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome,
                preco,
                categoria_id: categoria_id || null,
                imagem: imagem || 'default.jpg',
                descricao,
                destaque
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Produto cadastrado com sucesso!');
            document.getElementById('form-cadastrar-produto')?.reset();
            carregarProdutosAdmin();
        } else {
            alert(data.erro || 'Erro ao cadastrar produto.');
        }
    } catch (error) {
        console.error('Erro na requisição de cadastro:', error);
        alert('Erro ao conectar com o servidor.');
    } finally {
        if (btnSalvar) btnSalvar.disabled = false;
    }
}

// Atualize o listener DOMContentLoaded no final de script.js
document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', realizarLogin);
    }

    const formCadastrarProd = document.getElementById('form-cadastrar-produto');
    if (formCadastrarProd) {
        formCadastrarProd.addEventListener('submit', cadastrarProduto);
    }

    const formCadastrarCat = document.getElementById('form-cadastrar-categoria');
    if (formCadastrarCat) {
        formCadastrarCat.addEventListener('submit', cadastrarCategoria);
    }

    if (window.location.pathname.includes('admin')) {
        const token = localStorage.getItem('adminToken');
        if (token) {
            document.getElementById('login-section')?.setAttribute('style', 'display: none !important');
            document.getElementById('dashboard-section')?.setAttribute('style', 'display: block !important');
            document.getElementById('btn-logout')?.setAttribute('style', 'display: inline-block !important');

            carregarCategoriasSelect();
            carregarProdutosAdmin();
        }
    }

    atualizarCarrinhoUI();   
});