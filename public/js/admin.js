// Função de Login do Administrador
async function realizarLogin(event) {
    event.preventDefault();

    const usuarioInput = document.getElementById('usuario').value;
    const senhaInput = document.getElementById('senha').value;

    try {
        // Alinhado com a rota /api/admin/login
        const response = await fetch('/api/admin/login', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                usuario: usuarioInput, 
                senha: senhaInput 
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            window.location.href = '/admin-dashboard.html';
        } else {
            alert(data.erro || data.mensagem || 'Falha no login');
        }
    } catch (error) {
        console.error('Erro ao conectar com o servidor:', error);
        alert('Erro ao tentar conectar com o servidor.');
    }
}

// Função de Cadastrar Produto
async function cadastrarProduto(dadosProduto) {
    const token = localStorage.getItem('adminToken');

    if (!token) {
        alert('Sessão expirada ou não autenticada. Faça login novamente.');
        window.location.href = '/login.html';
        return;
    }

    let urlImagemFinal = '/images/placeholder.jpg';

    if (dadosProduto.arquivoImagem) {
        const formData = new FormData();
        formData.append('imagemFile', dadosProduto.arquivoImagem);

        try {
            const uploadRes = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const uploadData = await uploadRes.json();

            if (uploadRes.ok && uploadData.url) {
                urlImagemFinal = uploadData.url;
            } else {
                alert('Erro no upload da imagem: ' + (uploadData.erro || uploadData.detalhe || 'Falha no envio'));
                return;
            }
        } catch (err) {
            console.error('Erro de rede no upload:', err);
            alert('Falha de conexão ao enviar imagem.');
            return;
        }
    } else if (dadosProduto.imagemUrl) {
        urlImagemFinal = dadosProduto.imagemUrl;
    }

    const payload = {
        nome: dadosProduto.nome ? dadosProduto.nome.trim() : '',
        descricao: dadosProduto.descricao ? dadosProduto.descricao.trim() : '',
        preco: parseFloat(dadosProduto.preco) || 0,
        categoria_id: dadosProduto.categoria_id ? parseInt(dadosProduto.categoria_id, 10) : null,
        destaque: Boolean(dadosProduto.destaque),
        imagem: urlImagemFinal
    };

    try {
        const response = await fetch('/api/admin/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Produto cadastrado com sucesso!');
        } else {
            alert('Erro ao cadastrar produto: ' + (data.erro || data.detalhe || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro de rede ao cadastrar produto:', error);
        alert('Falha de conexão com o servidor ao cadastrar produto.');
    }
}