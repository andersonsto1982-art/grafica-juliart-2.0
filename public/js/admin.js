// Função de Login do Administrador
// Exemplo da função de login no front-end
async function realizarLogin(event) {
    event.preventDefault();

    const usuarioInput = document.getElementById('usuario').value;
    const senhaInput = document.getElementById('senha').value;

    try {
        // USE CAMINHO RELATIVO '/api/admin/login' OU '/src/routes/admin/login'
        // Evite colocar 'http://localhost:3000' fixo no código!
        const response = await fetch('/admin/login', { // ou a rota exata definida no seu server.js
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
            // 1. Salva o token retornado pelo backend
            localStorage.setItem('adminToken', data.token);
            
            // 2. Redireciona para o painel principal
            window.location.href = '/admin-dashboard.html'; // ajuste para a sua página de painel
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
    // 1. Recupera o token salvo no login
    const token = localStorage.getItem('adminToken');

    if (!token) {
        alert('Sessão expirada ou não autenticada. Faça login novamente.');
        window.location.href = '/login.html'; // Redireciona caso o token não exista
        return;
    }

    let urlImagemFinal = '/images/placeholder.jpg';

    // 2. Upload da imagem para o ImgBB (se houver arquivo selecionado)
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
        // Permite usar URL direta caso o usuário cole o link de uma imagem
        urlImagemFinal = dadosProduto.imagemUrl;
    }

    // 3. Formatação dos dados para garantir tipos compatíveis com o MySQL
    const payload = {
        nome: dadosProduto.nome ? dadosProduto.nome.trim() : '',
        descricao: dadosProduto.descricao ? dadosProduto.descricao.trim() : '',
        preco: parseFloat(dadosProduto.preco) || 0,
        categoria_id: dadosProduto.categoria_id ? parseInt(dadosProduto.categoria_id, 10) : null,
        destaque: Boolean(dadosProduto.destaque),
        imagem: urlImagemFinal
    };

    // 4. Envio do cadastro de produto
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
            // Opcional: limpar formulário ou recarregar lista
        } else {
            alert('Erro ao cadastrar produto: ' + (data.erro || data.detalhe || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro de rede ao cadastrar produto:', error);
        alert('Falha de conexão com o servidor ao cadastrar produto.');
    }
}