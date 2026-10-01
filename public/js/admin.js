// Carregar tabela de produtos dentro do painel do admin
async function carregarProdutosAdmin() {
    const tabela = document.getElementById('lista-admin-produtos');
    if (!tabela) return;

    // Recupera o token guardado no localStorage
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
                console.warn('Sessão expirada ou não autorizada.');
                if (typeof fazerLogout === 'function') {
                    fazerLogout();
                } else {
                    localStorage.removeItem('adminToken');
                    location.reload();
                }
                return;
            }
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }

        const produtos = await response.json();
        tabela.innerHTML = '';

        // Garante que o retorno é uma lista válida
        if (!Array.isArray(produtos) || produtos.length === 0) {
            tabela.innerHTML = '<tr><td colspan="3" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
            return;
        }

        // Renderiza cada produto na tabela
        produtos.forEach(prod => {
            const tr = document.createElement('tr');
            
            // Garante a conversão do preço e substituição de vírgulas se for string
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
                    <button type="button" class="btn-edit" title="Editar" onclick="prepararEdicao(${prod.id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" class="btn-delete" title="Excluir" onclick="deletarProduto(${prod.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tabela.appendChild(tr);
        });

    } catch (err) {
        console.error('Erro ao carregar a lista de produtos no painel:', err);
        tabela.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#e74c3c;">Erro ao carregar produtos. Verifique sua conexão com a API.</td></tr>';
    }
}