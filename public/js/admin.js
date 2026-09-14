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

    // Autenticação de Usuário
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

                const textData = await res.text();
                let data = {};
                
                try {
                    data = JSON.parse(textData);
                } catch (jsonErr) {
                    console.error('Resposta não-JSON do servidor:', textData);
                }

                if (res.ok) {
                    loginSection.style.display = 'none';
                    dashboardSection.style.display = 'block';
                    carregarProdutosAdmin();
                } else {
                    alert(data.detalhe || data.erro || `Erro (${res.status}): Não foi possível autenticar.`);
                }
            } catch (err) {
                console.error('Erro detalhado no fetch:', err);
                alert('Erro de conexão com o servidor. Verifique o console (F12).');
            }
        });
    }

    // Cadastro de produto (Com captura completa de erros do MySQL)
    if (formProduto) {
        formProduto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formProduto);

            try {
                const res = await fetch('/api/admin/produtos', {
                    method: 'POST',
                    body: formData
                });

                const textData = await res.text();
                let data = {};
                try {
                    data = JSON.parse(textData);
                } catch (e) {}

                if (res.ok) {
                    alert('✅ Produto cadastrado com sucesso!');
                    formProduto.reset();
                    carregarProdutosAdmin();
                } else {
                    alert(data.detalhe || data.erro || `Erro (${res.status}): Falha ao cadastrar produto.`);
                }
            } catch (err) {
                console.error('Erro ao cadastrar produto:', err);
                alert('Erro de conexão ao salvar produto.');
            }
        });
    }

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

                const data = await res.json().catch(() => ({}));

                if (res.ok) {
                    alert('✅ Produto atualizado com sucesso!');
                    toggleModal('modal-editar-produto');
                    carregarProdutosAdmin();
                } else {
                    alert(data.detalhe || data.erro || 'Erro ao atualizar produto');
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

    // Preencher e abrir modal de edição
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

    // Excluir produto
    window.excluirProduto = async (id) => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            try {
                const res = await fetch(`/api/admin/produtos/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    carregarProdutosAdmin();
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