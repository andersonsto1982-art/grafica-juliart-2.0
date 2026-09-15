let carrinho = [];
const NUMERO_WHATSAPP = '558191427836';

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('active');
    }
}

// Tratamento aprimorado da URL da imagem
function obterUrlImagem(imagem) {
    if (!imagem) return '/images/placeholder.jpg';
    if (imagem.startsWith('http://') || imagem.startsWith('https://')) {
        return imagem;
    }
    // Garante que o caminho comece com /
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

    const badge = document.getElementById('carrinho-qtd-badge');
    if (badge) {
        badge.style.transform = 'scale(1.4)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    }
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
    mensagem += '\n\n*Aguardo orientações para envio da arte e chave PIX/pagamento!*';

    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
    toggleModal('modal-carrinho');
    window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    atualizarCarrinhoUI();

    const btnAbrirPrecos = document.getElementById('btn-abrir-precos');
    const btnFecharPrecos = document.getElementById('btn-fechar-precos');

    if (btnAbrirPrecos) btnAbrirPrecos.addEventListener('click', () => toggleModal('modal-precos'));
    if (btnFecharPrecos) btnFecharPrecos.addEventListener('click', () => toggleModal('modal-precos'));

    // Filtro de Busca em Tempo Real
    const inputBusca = document.getElementById('input-busca-produto');
    if (inputBusca) {
        inputBusca.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            const todosCards = document.querySelectorAll('.product-card, .swiper-slide');

            todosCards.forEach(card => {
                const nome = card.querySelector('h3, h4, h2')?.textContent.toLowerCase() || '';
                if (nome.includes(termo)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Carregar destaques do banner
    async function carregarDestaques() {
        try {
            const response = await fetch('/api/produtos/destaques');
            
            // Verifica se a resposta HTTP é OK e se o conteúdo é JSON
            const contentType = response.headers.get('content-type');
            if (!response.ok || !contentType || !contentType.includes('application/json')) {
                console.warn('API de destaques não retornou JSON válido:', response.status);
                return;
            }

            const destaques = await response.json();
            const wrapper = document.getElementById('banner-destaques-wrapper');

            if (!wrapper || !Array.isArray(destaques) || destaques.length === 0) return;

            wrapper.innerHTML = '';

            destaques.forEach(prod => {
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide', 'banner-slide');

                const imagemUrl = obterUrlImagem(prod.imagem);
                slide.style.backgroundImage = `url('${imagemUrl}')`;

                const precoFormatado = Number(prod.preco).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });

                slide.innerHTML = `
                    <div class="banner-content">
                        <h2>${prod.nome}</h2>
                        <p>${prod.descricao || 'Confira nossas condições e faça seu pedido!'}</p>
                        <button class="btn-pink btn-destaque-cart" style="margin-top: 15px; cursor: pointer;">
                            <i class="fa-solid fa-cart-shopping"></i> Comprar por ${precoFormatado}
                        </button>
                    </div>
                `;

                const btnCart = slide.querySelector('.btn-destaque-cart');
                if (btnCart) {
                    btnCart.addEventListener('click', (e) => {
                        e.preventDefault();
                        adicionarAoCarrinho(prod);
                    });
                }

                wrapper.appendChild(slide);
            });
        } catch (error) {
            console.error('Erro ao carregar produtos em destaque:', error);
        }
    }

    // Carregar produtos da vitrine geral
    async function carregarProdutosGerais() {
        try {
            const response = await fetch('/api/produtos');
            
            const contentType = response.headers.get('content-type');
            if (!response.ok || !contentType || !contentType.includes('application/json')) {
                console.warn('API de produtos não retornou JSON válido:', response.status);
                return;
            }

            const produtos = await response.json();
            const container = document.getElementById('produtos-container');

            if (!container || !Array.isArray(produtos) || produtos.length === 0) return;

            container.innerHTML = '';

            produtos.forEach(prod => {
                const card = document.createElement('div');
                card.classList.add('product-card');

                const imagemUrl = obterUrlImagem(prod.imagem);
                const precoFormatado = Number(prod.preco).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });

                card.innerHTML = `
                    <img src="${imagemUrl}" alt="${prod.nome}" class="product-img" onerror="this.src='/images/placeholder.jpg'" />
                    <div class="product-info">
                        <h3>${prod.nome}</h3>
                        <p>${prod.descricao || ''}</p>
                        <span class="product-price">${precoFormatado}</span>
                        <button class="btn-pink btn-add-cart">
                            <i class="fa-solid fa-cart-shopping"></i> Adicionar
                        </button>
                    </div>
                `;

                const btnAdd = card.querySelector('.btn-add-cart');
                if (btnAdd) {
                    btnAdd.addEventListener('click', () => adicionarAoCarrinho(prod));
                }

                container.appendChild(card);
            });
        } catch (error) {
            console.error('Erro ao carregar catálogo de produtos:', error);
        }
    }

    carregarDestaques();
    carregarProdutosGerais();
});