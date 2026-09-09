-- Estrutura da tabela de produtos
CREATE TABLE IF NOT EXISTS gj_produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    imagem VARCHAR(255),
    categoria_slug VARCHAR(100),
    destaque TINYINT(1) DEFAULT 0
);

-- Estrutura da tabela de categorias (se utilizar)
CREATE TABLE IF NOT EXISTS gj_categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE
);