document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const formLogin = document.getElementById('form-login');
    const formProduto = document.getElementById('form-produto');
    const formEditarProduto = document.getElementById('form-editar-produto');
    const listaProdutos = document.getElementById('lista-admin-produtos');

    // Função para pegar o token de autenticação salvo
    function getToken() {
        return localStorage.getItem('juliart_token');
    }

    // Função auxiliar para requisições autenticadas
    function getAuthHeaders() {
        const token = getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    window.toggleModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.toggle('active');
        }
    };

    // Verificar se já existe sessão salva ao carregar a página
    if (getToken()) {
        if (loginSection) loginSection.style.display = 'none';
        if (dashboardSection) dashboardSection.style.display = 'block';
        carregarProdutosAdmin();
    }

    // Autenticação de Usuário (Login)
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const senha = document.getElementById('login-senha').value;

            try {
                const res = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const data = await res.json().catch(() => ({}));

                if (res.ok && data.token) {
                    // Salva o token JWT no navegador
                    localStorage.setItem('juliart_token', data.token);
                    loginSection.style.display = 'none';
                    dashboardSection.style.display = 'block';
                    carregarProdutosAdmin();
                } else {
                    alert(data.detalhe || data.erro || 'Falha ao autenticar.');
                }
            } catch (err) {
                console.error('Erro no login:', err);
                alert('Erro de conexão com o servidor.');
            }
        });
    }

    // Cadastrar produto (com JWT)
    if (formProduto) {
        formProduto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formProduto);
            const payload = Object.fromEntries(formData.entries());

            try {
                const res = await fetch('/api/admin/produtos', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });

                const data = await res.json().catch(() => ({}));

                if (res.ok) {
                    alert('✅ Produto cadastrado com sucesso!');
                    formProduto.reset();
                    carregarProdutosAdmin();
                } else if (res.status === 401 || res.status === 403) {
                    alert('Sessão expirada. Faça login novamente.');
                    localStorage.removeItem('juliart_token');
                    location.reload();
                } else {
                    alert(data.detalhe || data.erro || 'Falha ao cadastrar produto.');
                }
            } catch (err) {
                console.error('Erro ao cadastrar produto:', err);
                alert('Erro de conexão ao salvar produto.');
            }
        });
    }

    // Editar produto (com JWT)
    if (formEditarProduto) {
        formEditarProduto.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('edit-prod-id').value;
            const dadosAtualizados = {
                nome: document.getElementById('edit-prod-nome').value,
                preco: parseFloat(document.getElementById('edit-prod-preco').value),
                categoria_id: document.getElementById('edit-prod-categoria').value,
                descricao: document.getElementById('edit-prod-descricao').value,
                imagem: document.getElementById('edit-prod-imagem').value
            };

            try {
                const res = await fetch(`/api/admin/produtos/${id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(dadosAtualizados)
                });

                const data = await res.json().catch(() => ({}));

                if (res.ok) {
                    alert('✅ Produto atualizado com sucesso!');
                    toggleModal('modal-editar-produto');
                    carregarProdutosAdmin();
                } else if (res.status === 401 || res.status === 403) {
                    alert('Sessão expirada. Faça login novamente.');
                    localStorage.removeItem('juliart_token');
                    location.reload();
                } else {
                    alert(data.detalhe || data.erro || 'Erro ao atualizar produto.');
                }
            } catch (err) {
                console.error('Erro ao atualizar produto:', err);
                alert('Erro de conexão ao atualizar produto.');
            }
        });
    }

    // Listar produtos
    async function carregarProdutosAdmin() {
        try {
            const res = await fetch('/api/produtos');
            const produtos = await res.json();
            listaProdutos.innerHTML = '';

            window.produtosListaCache = produtos;

            if (Array.isArray(produtos)) {
                produtos.forEach(p => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${p.nome}</td>
                        <td>R$ ${Number(p.preco).toFixed(2)}</td>
                        <td>
                            <div class="admin-actions">
                                <button class="btn-edit" onclick="abrirModalEdicao(${p.id})">
                                    <i class="fa-solid fa-pen-to-square"></i> Editar
                                </button>
                                <button class="btn-delete" onclick="excluirProduto(${p.id})">
                                    <i class="fa-solid fa-trash"></i> Excluir
                                </button>
                            </div>
                        </td>
                    `;
                    listaProdutos.appendChild(tr);
                });
            }
        } catch (err) {
            console.error('Erro ao carregar produtos:', err);
        }
    }

    // Preencher modal de edição
    window.abrirModalEdicao = (id) => {
        const produto = window.produtosListaCache ? window.produtosListaCache.find(p => p.id === id) : null;
        if (!produto) return;

        document.getElementById('edit-prod-id').value = produto.id;
        document.getElementById('edit-prod-nome').value = produto.nome || '';
        document.getElementById('edit-prod-preco').value = produto.preco || '';
        document.getElementById('edit-prod-categoria').value = produto.categoria_id || '1';
        document.getElementById('edit-prod-descricao').value = produto.descricao || '';
        document.getElementById('edit-prod-imagem').value = produto.imagem || '';

        toggleModal('modal-editar-produto');
    };

    // Excluir produto (com JWT)
    window.excluirProduto = async (id) => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            try {
                const res = await fetch(`/api/admin/produtos/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                
                if (res.ok) {
                    carregarProdutosAdmin();
                } else if (res.status === 401 || res.status === 403) {
                    alert('Sessão expirada. Faça login novamente.');
                    localStorage.removeItem('juliart_token');
                    location.reload();
                } else {
                    const data = await res.json().catch(() => ({}));
                    alert(data.detalhe || data.erro || 'Erro ao excluir produto.');
                }
            } catch (err) {
                alert('Erro de conexão ao excluir produto.');
            }
        }
    };
});

            const btnLogout = document.getElementById('btn-logout');
            if (btnLogout) {
                btnLogout.addEventListener('click', () => {
                    localStorage.removeItem('juliart_token');
                    location.reload();
                });
}