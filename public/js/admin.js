document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const formLogin = document.getElementById('form-login');
    const formProduto = document.getElementById('form-produto');
    const formEditarProduto = document.getElementById('form-editar-produto');
    const listaProdutos = document.getElementById('lista-admin-produtos');

    // Função global para abrir/fechar modais
    window.toggleModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.toggle('active');
        }
    };

    // Autenticação
    // Autenticação
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

        const data = await res.json();
        console.log('Resposta do Servidor:', res.status, data);

        if (res.ok) {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            carregarProdutosAdmin();
        } else {
            // Exibe a mensagem de erro que vem do banco ou servidor
            alert(data.detalhe || data.erro || 'Erro ao realizar login');
        }
    } catch (err) {
        console.error('Erro detalhado no fetch:', err);
        alert('Erro de conexão com o servidor. Verifique o console (F12).');
    }
});

    // Cadastro de produto
    formProduto.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formProduto);

        try {
            const res = await fetch('/api/admin/produtos', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                alert('Produto cadastrado com sucesso!');
                formProduto.reset();
                carregarProdutosAdmin();
            } else {
                alert('Erro ao cadastrar produto');
            }
        } catch (err) {
            alert('Erro de conexão ao salvar produto');
        }
    });

    // Atualização / Edição de produto
    if (formEditarProduto) {
        formEditarProduto.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('edit-prod-id').value;
            const dadosAtualizados = {
                nome: document.getElementById('edit-prod-nome').value,
                preco: parseFloat(document.getElementById('edit-prod-preco').value),
                categoria_id: document.getElementById('edit-prod-categoria').value,
                descricao: document.getElementById('edit-prod-descricao').value
            };

            try {
                const res = await fetch(`/api/admin/produtos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosAtualizados)
                });

                if (res.ok) {
                    alert('✅ Produto atualizado com sucesso!');
                    toggleModal('modal-editar-produto');
                    carregarProdutosAdmin();
                } else {
                    const data = await res.json();
                    alert(data.erro || 'Erro ao atualizar produto');
                }
            } catch (err) {
                console.error('Erro ao atualizar produto:', err);
                alert('Erro de conexão ao atualizar produto');
            }
        });
    }

    // Listar produtos
    async function carregarProdutosAdmin() {
        try {
            const res = await fetch('/api/produtos');
            const produtos = await res.json();
            listaProdutos.innerHTML = '';

            // Armazena a lista globalmente para resgatar os dados no clique do botão Editar
            window.produtosListaCache = produtos;

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
        } catch (err) {
            console.error('Erro ao carregar produtos:', err);
        }
    }

    // Função para preencher e abrir o modal de edição
    window.abrirModalEdicao = (id) => {
        const produto = window.produtosListaCache ? window.produtosListaCache.find(p => p.id === id) : null;
        if (!produto) return;

        document.getElementById('edit-prod-id').value = produto.id;
        document.getElementById('edit-prod-nome').value = produto.nome || '';
        document.getElementById('edit-prod-preco').value = produto.preco || '';
        document.getElementById('edit-prod-categoria').value = produto.categoria_id || '1';
        document.getElementById('edit-prod-descricao').value = produto.descricao || '';

        toggleModal('modal-editar-produto');
    };

    // Função para excluir produto
    window.excluirProduto = async (id) => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            try {
                const res = await fetch(`/api/admin/produtos/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    carregarProdutosAdmin();
                } else {
                    alert('Erro ao excluir produto.');
                }
            } catch (err) {
                alert('Erro de conexão ao excluir produto.');
            }
        }
    };
});