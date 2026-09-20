async function cadastrarProduto(dadosProduto) {
    const token = localStorage.getItem('token'); // Garanta que a chave onde guarda o JWT no login seja a mesma

    // 1. Fazer o Upload da imagem primeiro (se selecionada)
    let urlImagemFinal = '/images/placeholder.jpg';
    
    if (dadosProduto.arquivoImagem) {
        const formData = new FormData();
        formData.append('imagemFile', dadosProduto.arquivoImagem);

        const uploadRes = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
            urlImagemFinal = uploadData.url;
        } else {
            alert('Erro no upload da imagem: ' + (uploadData.erro || 'Falha ao enviar'));
            return;
        }
    }

    // 2. Cadastrar o produto com a URL da imagem retornada pelo ImgBB
    const response = await fetch('/api/admin/produtos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            nome: dadosProduto.nome,
            descricao: dadosProduto.descricao,
            preco: dadosProduto.preco,
            categoria_id: dadosProduto.categoria_id,
            destaque: dadosProduto.destaque,
            imagem: urlImagemFinal
        })
    });

    const data = await response.json();
    
    if (response.ok) {
        alert('Produto cadastrado com sucesso!');
    } else {
        alert('Erro ao cadastrar: ' + (data.erro || data.detalhe));
    }
}