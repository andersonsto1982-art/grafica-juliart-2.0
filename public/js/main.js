// Variável do carrinho (global no escopo da página)
let carrinho = [];

// INSIRA SEU NÚMERO DO WHATSAPP AQUI (Com DDD, apenas números)
const NUMERO_WHATSAPP = '558191427836';

// Função global para abrir/fechar modais
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('active');
    }
}

// =======================================================
// GERENCIAMENTO DO CARRINHO (UI, SOMA E REMOÇÃO)
// =======================================================

// Função para atualizar a interface do carrinho (Badge, Lista e Total)
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

// Função para adicionar produto ao carrinho
function adicionarAoCarrinho(produto) {
    carrinho.push(produto);
    atualizarCarrinhoUI();

    // Animação no badge ao adicionar
    const badge = document.getElementById('carrinho-qtd-badge');
    if (badge) {
        badge.style.transform = 'scale(1.4)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    }

    console.log('Carrinho atual:', carrinho);
}

// Função para remover um item individual do carrinho pelo índice
function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoUI();
}

// Função para limpar todos os itens do carrinho
function limparCarrinho() {
    if (carrinho.length === 0) return;
    if (confirm('Deseja realmente limpar todos os itens do carrinho?')) {
        carrinho = [];
        atualizarCarrinhoUI();
    }
}

// Função para enviar o pedido via WhatsApp
function finalizarPedidoWhatsApp() {
    if (!NUMERO_WHATSAPP || NUMERO_WHATSAPP === '5511999999999') {
        alert('Por favor, configure o número do WhatsApp no arquivo main.js!');
        return;
    }

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
    
    // Fecha o modal do carrinho caso esteja aberto
    toggleModal('modal-carrinho');

    window.open(url, '_blank');
}

// =======================================================
// INICIALIZAÇÃO DOS COMPONENTES DA PÁGINA
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    let lightbox = null;

    // Inicializa a interface do carrinho no carregamento
    atualizarCarrinhoUI();

    // Inicialização do Swiper para a seção de Eventos
    if (document.querySelector('.eventos-swiper') && typeof Swiper !== 'undefined') {
        window.eventosSwiper = new Swiper('.eventos-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            navigation: {
                nextEl: '.eventos-next',
                prevEl: '.eventos-prev',
            },
            breakpoints: {
                640: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 30 },
                1024: { slidesPerView: 4, spaceBetween: 30 },
            }
        });
    }

    const btnAbrirPrecos = document.getElementById('btn-abrir-precos');
    const btnFecharPrecos = document.getElementById('btn-fechar-precos');
    const btnFinalizarWhatsapp = document.getElementById('btn-finalizar-whatsapp');

    if (btnAbrirPrecos) {
        btnAbrirPrecos.addEventListener('click', () => toggleModal('modal-precos'));
    }
    if (btnFecharPrecos) {
        btnFecharPrecos.addEventListener('click', () => toggleModal('modal-precos'));
    }
    if (btnFinalizarWhatsapp) {
        btnFinalizarWhatsapp.addEventListener('click', finalizarPedidoWhatsApp);
    }

    // Fechar modais ao clicar no fundo escuro (fora do conteúdo)
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });

    function initLightbox() {
        if (typeof GLightbox === 'undefined') return;

        if (lightbox) {
            lightbox.destroy();
        }
        lightbox = GLightbox({
            selector: '.glightbox',
            touchNavigation: true,
            loop: true,
            zoomable: true
        });
    }

    async function carregarDestaques() {
        try {
            const response = await fetch('/api/produtos/destaques');
            if (!response.ok) return;

            const destaques = await response.json();
            const wrapper = document.getElementById('banner-destaques-wrapper');

            if (!wrapper || destaques.length === 0) return;

            wrapper.innerHTML = '';

            destaques.forEach(prod => {
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide', 'banner-slide');

                const imagemUrl = prod.imagem.startsWith('http') 
                    ? prod.imagem 
                    : `images/${prod.imagem}`;

                slide.style.backgroundImage = `url('${imagemUrl}')`;

                const precoFormatado = Number(prod.preco).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });

                slide.innerHTML = `
                    <div class="banner-content">
                        <h2>${prod.nome}</h2>
                        <p>${prod.descricao || 'Confira nossas condições e faça seu pedido!'}</p>
                        <button class="btn-pink btn-destaque-cart" style="margin-top: 15px; cursor: pointer; position: relative; z-index: 10;">
                            <i class="fa-solid fa-cart-shopping"></i> Comprar por ${precoFormatado}
                        </button>
                    </div>
                `;

                const btnCart = slide.querySelector('.btn-destaque-cart');
                if (btnCart) {
                    btnCart.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        adicionarAoCarrinho(prod);
                    });
                }

                wrapper.appendChild(slide);
            });

            if (window.bannerSwiper && typeof window.bannerSwiper.update === 'function') {
                window.bannerSwiper.update();
                if (window.bannerSwiper.autoplay && typeof window.bannerSwiper.autoplay.start === 'function') {
                    window.bannerSwiper.autoplay.start();
                }
            }

        } catch (error) {
            console.error('Erro ao carregar produtos em destaque:', error);
        }
    }

    function createProductCard(produto, galeriaNome) {
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide', 'product-card');

        const precoFormatado = Number(produto.preco).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        const imagemUrl = produto.imagem.startsWith('http') 
            ? produto.imagem 
            : `images/${produto.imagem}`;

        const link = document.createElement('a');
        link.href = imagemUrl;
        link.classList.add('glightbox');
        link.setAttribute('data-gallery', galeriaNome);
        link.setAttribute('data-title', produto.nome);

        const img = document.createElement('img');
        img.src = imagemUrl;
        img.alt = produto.nome;
        img.onerror = () => { img.src = 'https://via.placeholder.com/300x300?text=Grafica+Juliart'; };
        link.appendChild(img);

        const h4 = document.createElement('h4');
        h4.textContent = produto.nome;

        const pDescricao = document.createElement('p');
        pDescricao.classList.add('product-description');
        pDescricao.textContent = produto.descricao || 'Sem descrição disponível';

        const spanPreco = document.createElement('span');
        spanPreco.classList.add('price');
        spanPreco.textContent = precoFormatado;

        const btnCart = document.createElement('button');
        btnCart.classList.add('btn-cart');
        btnCart.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Adicionar ao Carrinho';
        
        btnCart.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            adicionarAoCarrinho(produto);
        });

        slide.appendChild(link);
        slide.appendChild(h4);
        slide.appendChild(pDescricao);
        slide.appendChild(spanPreco);
        slide.appendChild(btnCart);

        return slide;
    }

    async function carregarProdutos() {
        try {
            const response = await fetch('/api/produtos');
            if (!response.ok) throw new Error('Erro ao buscar produtos da API');

            const produtos = await response.json();

            const gridCanecas = document.getElementById('grid-canecas');
            const gridCamisas = document.getElementById('grid-camisas');
            const gridItens = document.getElementById('grid-itens');
            const gridEventos = document.getElementById('grid-eventos');

            if (gridCanecas) gridCanecas.innerHTML = '';
            if (gridCamisas) gridCamisas.innerHTML = '';
            if (gridItens) gridItens.innerHTML = '';
            if (gridEventos) gridEventos.innerHTML = '';

            produtos.forEach(produto => {
                const slug = produto.categoria_slug ? produto.categoria_slug.toLowerCase() : '';

                if (slug === 'canecas' && gridCanecas) {
                    const card = createProductCard(produto, 'canecas');
                    gridCanecas.appendChild(card);
                } else if (slug === 'camisas' && gridCamisas) {
                    const card = createProductCard(produto, 'camisas');
                    gridCamisas.appendChild(card);
                } else if ((slug === 'eventos' || slug === 'personalizados-eventos') && gridEventos) {
                    const card = createProductCard(produto, 'eventos');
                    gridEventos.appendChild(card);
                } else if (gridItens) {
                    const card = createProductCard(produto, 'itens');
                    gridItens.appendChild(card);
                }
            });

            // Atualização segura dos Swipers
            if (window.canecasSwiper && typeof window.canecasSwiper.update === 'function') window.canecasSwiper.update();
            if (window.camisasSwiper && typeof window.camisasSwiper.update === 'function') window.camisasSwiper.update();
            if (window.itensSwiper && typeof window.itensSwiper.update === 'function') window.itensSwiper.update();
            if (window.eventosSwiper && typeof window.eventosSwiper.update === 'function') window.eventosSwiper.update();

            initLightbox();

        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }

    // =======================================================
    // LÓGICA DINÂMICA DO FORMULÁRIO "MONTE SEU PERSONALIZADO"
    // =======================================================
    const selectTipo = document.getElementById('custom-tipo');
    const containerCampos = document.getElementById('campos-especificos');

    if (selectTipo && containerCampos) {
        selectTipo.addEventListener('change', (e) => {
            const valor = e.target.value;
            containerCampos.innerHTML = '';

            if (valor === 'Camisa') {
                containerCampos.innerHTML = `
                    <div class="form-group" style="flex: 1; min-width: 140px;">
                        <label for="custom-tamanho"><strong>Tamanho:</strong></label>
                        <select id="custom-tamanho" class="form-control" required>
                            <option value="" disabled selected>Selecione...</option>
                            <option value="Infantil (2 ao 14)">Infantil (2 ao 14)</option>
                            <option value="P">P</option>
                            <option value="M">M</option>
                            <option value="G">G</option>
                            <option value="GG">GG</option>
                            <option value="EXG">EXG</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1; min-width: 140px;">
                        <label for="custom-cor"><strong>Cor da Camisa:</strong></label>
                        <input type="text" id="custom-cor" class="form-control" placeholder="Ex: Branca, Preta, Rosa" required>
                    </div>
                    <div class="form-group" style="flex: 1; min-width: 140px;">
                        <label for="custom-tecido"><strong>Tipo de Tecido:</strong></label>
                        <select id="custom-tecido" class="form-control" required>
                            <option value="" disabled selected>Selecione...</option>
                            <option value="100% Algodão">100% Algodão</option>
                            <option value="100% Poliéster">100% Poliéster</option>
                            <option value="PV (Malha Fria)">PV (Malha Fria)</option>
                            <option value="Dry Fit">Dry Fit</option>
                        </select>
                    </div>
                `;
            } else if (valor === 'Caneca') {
                containerCampos.innerHTML = `
                    <div class="form-group" style="flex: 1; min-width: 140px;">
                        <label for="custom-tipo-caneca"><strong>Tipo de Caneca:</strong></label>
                        <select id="custom-tipo-caneca" class="form-control" required>
                            <option value="" disabled selected>Selecione...</option>
                            <option value="Porcelana Branca Tradicional">Porcelana Branca</option>
                            <option value="Porcelana com Alça/Interior Colorido">Alça/Interior Colorido</option>
                            <option value="Caneca Mágica">Caneca Mágica</option>
                            <option value="Polímero (Plástico Rígido)">Polímero (Infantil)</option>
                            <option value="Alumínio / Chopp">Alumínio / Chopp</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1; min-width: 140px;">
                        <label for="custom-cor-caneca"><strong>Cor / Detalhes:</strong></label>
                        <input type="text" id="custom-cor-caneca" class="form-control" placeholder="Ex: Branca, Alça Rosa, etc.">
                    </div>
                    <div class="form-group" style="flex: 1; min-width: 140px;">
                        <label for="custom-capacidade"><strong>Capacidade:</strong></label>
                        <select id="custom-capacidade" class="form-control">
                            <option value="325ml (Padrão)">325ml (Padrão)</option>
                            <option value="450ml / 500ml">450ml / 500ml</option>
                        </select>
                    </div>
                `;
            } else if (valor === 'Topo de Bolo') {
                containerCampos.innerHTML = `
                    <div class="form-group" style="flex: 1; min-width: 200px;">
                        <label for="custom-estilo-topo"><strong>Estilo / Material:</strong></label>
                        <select id="custom-estilo-topo" class="form-control" required>
                            <option value="" disabled selected>Selecione...</option>
                            <option value="Papel Fotográfico Simples">Papel Fotográfico</option>
                            <option value="3D / Camadas em Scrap">3D com Camadas (Scrap)</option>
                            <option value="Com Elementos em Lamicote (Dourado/Prata)">Lamicote Dourado/Prata</option>
                            <option value="Acrílico Personalizado">Acrílico</option>
                        </select>
                    </div>
                `;
            } else if (valor === 'Comunicação Visual') {
                containerCampos.innerHTML = `
                    <div class="form-group" style="flex: 1; min-width: 160px;">
                        <label for="custom-tipo-visual"><strong>Tipo de Item:</strong></label>
                        <select id="custom-tipo-visual" class="form-control" required>
                            <option value="" disabled selected>Selecione...</option>
                            <option value="Banner com Bastão e Corda">Banner (Lona)</option>
                            <option value="Adesivo em Vinil">Adesivo em Vinil</option>
                            <option value="Placa em PS / MDF">Placa PS / MDF</option>
                            <option value="Faixa de Divulgação">Faixa</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1; min-width: 160px;">
                        <label for="custom-dimensoes"><strong>Dimensões (Largura x Altura):</strong></label>
                        <input type="text" id="custom-dimensoes" class="form-control" placeholder="Ex: 60x90 cm, 1x2 metros" required>
                    </div>
                `;
            } else if (valor === 'Lembrancinha de Evento') {
                containerCampos.innerHTML = `
                    <div class="form-group" style="flex: 1; min-width: 200px;">
                        <label for="custom-tipo-lembranca"><strong>Tipo de Lembrancinha:</strong></label>
                        <select id="custom-tipo-lembranca" class="form-control" required>
                            <option value="" disabled selected>Selecione...</option>
                            <option value="Chaveiro Personalizado">Chaveiro</option>
                            <option value="Botton / Mdf">Botton / Pin</option>
                            <option value="Caixinha / Papelaria Personalizada">Caixinha Personalizada</option>
                            <option value="Copo Long Drink / Twiister">Copo Long Drink / Twister</option>
                            <option value="Outro Modelo">Outro Modelo</option>
                        </select>
                    </div>
                `;
            }
        });
    }

    // Submissão do formulário personalizado
    const formCustom = document.getElementById('form-custom-item');
    if (formCustom) {
        formCustom.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!NUMERO_WHATSAPP || NUMERO_WHATSAPP === '5511999999999') {
                alert('Por favor, configure o número do WhatsApp no arquivo main.js!');
                return;
            }

            const tipo = document.getElementById('custom-tipo').value;
            const qtd = document.getElementById('custom-qtd').value;
            const detalhes = document.getElementById('custom-detalhes').value;
            const nomeCliente = document.getElementById('custom-nome').value;

            let especificacoes = '';

            if (tipo === 'Camisa') {
                const tamanho = document.getElementById('custom-tamanho')?.value || 'Não informado';
                const cor = document.getElementById('custom-cor')?.value || 'Não informada';
                const tecido = document.getElementById('custom-tecido')?.value || 'Não informado';
                especificacoes = `Tamanho: ${tamanho} | Cor: ${cor} | Tecido: ${tecido}`;
            } else if (tipo === 'Caneca') {
                const tipoCaneca = document.getElementById('custom-tipo-caneca')?.value || 'Não informado';
                const corCaneca = document.getElementById('custom-cor-caneca')?.value || 'Padrão';
                const capacidade = document.getElementById('custom-capacidade')?.value || '325ml';
                especificacoes = `Tipo: ${tipoCaneca} | Cor/Detalhes: ${corCaneca} | Cap: ${capacidade}`;
            } else if (tipo === 'Topo de Bolo') {
                const estilo = document.getElementById('custom-estilo-topo')?.value || 'Não informado';
                especificacoes = `Estilo/Material: ${estilo}`;
            } else if (tipo === 'Comunicação Visual') {
                const tipoVisual = document.getElementById('custom-tipo-visual')?.value || 'Não informado';
                const dim = document.getElementById('custom-dimensoes')?.value || 'Não informado';
                especificacoes = `Modelo: ${tipoVisual} | Tamanho/Medida: ${dim}`;
            } else if (tipo === 'Lembrancinha de Evento') {
                const tipoLembranca = document.getElementById('custom-tipo-lembranca')?.value || 'Não informado';
                especificacoes = `Modelo: ${tipoLembranca}`;
            } else {
                especificacoes = 'Conforme descrição enviada';
            }

            let mensagem = `*Olá, Gráfica Juliart! Gostaria de um orçamento para um item personalizado:* 🎨\n\n`;
            mensagem += `👤 *Cliente:* ${nomeCliente}\n`;
            mensagem += `📦 *Produto:* ${tipo}\n`;
            mensagem += `🔢 *Quantidade:* ${qtd}\n`;
            mensagem += `🛠️ *Especificações:* ${especificacoes}\n`;
            mensagem += `📝 *Detalhes da Arte / Tema:* ${detalhes}\n\n`;
            mensagem += `*Aguardo seu contato para envio de modelos e valores!*`;

            const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
            
            toggleModal('modal-custom');
            formCustom.reset();
            if (containerCampos) containerCampos.innerHTML = '';

            window.open(url, '_blank');
        });
    }

    carregarDestaques();
    carregarProdutos();
});