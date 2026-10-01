const NUMERO_WHATSAPP = '558191427836';
let carrinho = [];

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('active');
    }
}

function obterUrlImagem(imagem) {
    if (!imagem) return '/images/placeholder.jpg';
    if (imagem.startsWith('http://') || imagem.startsWith('https://')) {
        return imagem;
    }
    return imagem.startsWith('/') ? imagem : `/${imagem}`;
}

function atualizarCarrinhoUI() {
    const badge = document.getElementById('carrinho-qtd-badge');
    const lista = document.getElementById('carrinho-lista-itens');
    const totalElemento = document.getElementById('carrinho-valor-total');

    if (badge) badge.textContent = carrinho.length;
    if (!lista || !totalElemento) return;

    lista.innerHTML = '';
    let valorTotal = 0;

    if (carrinho.length === 0) {
        lista.innerHTML = '<li class="carrinho-vazio-msg">Seu carrinho está vazio!</li>';
    } else {
        carrinho.forEach((item, index) => {
            valorTotal += Number(item.preco);
            const precoFormatado = Number(item.preco).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const li = document.createElement('li');
            li.classList.add('carrinho-item');
            li.innerHTML = `
                <div class="carrinho-item-info">
                    <span class="carrinho-item-nome">${item.nome}</span>
                    <span class="carrinho-item-preco">${precoFormatado}</span>
                </div>
                <button class="btn-remover-item" onclick="removerDoCarrinho(${index})" title="Remover item">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            lista.appendChild(li);
        });
    }

    totalElemento.textContent = valorTotal.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function mostrarToast(mensagem) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.classList.add('toast-notification');
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${mensagem}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function adicionarAoCarrinho(produto) {
    carrinho.push(produto);
    atualizarCarrinhoUI();
    mostrarToast(`"${produto.nome}" foi adicionado ao carrinho!`);
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoUI();
}

function limparCarrinho() {
    if (carrinho.length === 0) return;
    if (confirm('Deseja realmente limpar todos os itens do carrinho?')) {
        carrinho = [];
        atualizarCarrinhoUI();
    }
}

function finalizarPedidoWhatsApp() {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio! Adicione alguns produtos antes de finalizar.');
        return;
    }

    let mensagem = '*Olá, Gráfica Juliart! Gostaria de fazer o seguinte pedido:*\n\n';
    let total = 0;

    carrinho.forEach((item, index) => {
        mensagem += `${index + 1}. *${item.nome}* - R$ ${Number(item.preco).toFixed(2)}\n`;
        total += Number(item.preco);
    });

    mensagem += `\n*Total Estimado:* R$ ${total.toFixed(2)}`;
    mensagem += '\n\n*Aguardo orientações para envio da arte e chave PIX/pagamento.*';

    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
    toggleModal('modal-carrinho');
    window.open(url, '_blank');
}

async function carregarProdutosAdmin() {
    const tabela = document.getElementById('lista-admin-produtos');
    if (!tabela) return;

    const token = localStorage.getItem('adminToken');

    try {
        const response = await fetch('/api/produtos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                fazerLogout();
                return;
            }
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }

        const produtos = await response.json();
        tabela.innerHTML = '';

        if (!Array.isArray(produtos) || produtos.length === 0) {
            tabela.innerHTML = '<tr><td colspan="3" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
            return;
        }

        produtos.forEach(prod => {
            const tr = document.createElement('tr');
            const precoNumero = typeof prod.preco === 'string' 
                ? parseFloat(prod.preco.replace(',', '.')) 
                : prod.preco;

            const precoFormatado = Number(precoNumero || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            tr.innerHTML = `
                <td>${prod.nome || 'Sem nome'}</td>
                <td>${precoFormatado}</td>
                <td class="admin-actions">
                    <button type="button" class="btn-delete" title="Excluir" onclick="deletarProduto(${prod.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tabela.appendChild(tr);
        });
    } catch (err) {
        console.error('Erro ao carregar lista no painel:', err);
        tabela.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#e74c3c;">Erro ao carregar produtos do servidor.</td></tr>';
    }
}

async function realizarLogin(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const btnEntrar = document.getElementById('btn-entrar');
    const usuarioInput = document.getElementById('usuario')?.value.trim();
    const senhaInput = document.getElementById('senha')?.value.trim();

    if (!usuarioInput || !senhaInput) {
        alert('Por favor, preencha o utilizador/e-mail e a senha.');
        return;
    }

    if (btnEntrar) {
        btnEntrar.disabled = true;
        btnEntrar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A verificar...';
    }

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ usuario: usuarioInput, senha: senhaInput })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem('adminToken', data.token);

            const loginSection = document.getElementById('login-section');
            const dashboardSection = document.getElementById('dashboard-section');
            const btnLogout = document.getElementById('btn-logout');

            if (loginSection) loginSection.style.display = 'none';
            if (dashboardSection) dashboardSection.style.display = 'block';
            if (btnLogout) btnLogout.style.display = 'inline-block';

            carregarProdutosAdmin();
            alert('Login efetuado com sucesso!');
        } else {
            alert(data.erro || data.detalhe || 'Utilizador ou senha inválidos.');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro ao conectar com a API de login. Verifique sua conexão.');
    } finally {
        if (btnEntrar) {
            btnEntrar.disabled = false;
            btnEntrar.innerHTML = 'Entrar';
        }
    }
}

function fazerLogout() {
    localStorage.removeItem('adminToken');
    window.location.reload();
}

async function deletarProduto(id) {
    if (!confirm('Deseja realmente apagar este produto?')) return;

    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`/api/produtos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });

        const data = await response.json();
        if (response.ok) {
            alert('Produto apagado com sucesso!');
            carregarProdutosAdmin();
        } else {
            alert(data.erro || 'Não foi possível apagar o produto.');
        }
    } catch (err) {
        console.error('Erro ao eliminar produto:', err);
        alert('Erro de comunicação com o servidor.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', realizarLogin);
    }

    if (window.location.pathname.includes('admin')) {
        const token = localStorage.getItem('adminToken');
        if (token) {
            const loginSection = document.getElementById('login-section');
            const dashboardSection = document.getElementById('dashboard-section');
            const btnLogout = document.getElementById('btn-logout');

            if (loginSection) loginSection.style.display = 'none';
            if (dashboardSection) dashboardSection.style.display = 'block';
            if (btnLogout) btnLogout.style.display = 'inline-block';

            carregarProdutosAdmin();
        }
    }

    atualizarCarrinhoUI();
});