const { bus } = require('nodemon/lib/utils');
const db = require('../db');
const bcrypt = require('bcrypt');


// Cadastrar Produto
async function cadastrarProduto(produto) {
    const { nome_produto, descricao, valor_produto, id_categoria_produto, disponivel} = produto;

    const queryProduto = `
        INSERT INTO produtos (nome_produto, descricao, valor_produto, id_categoria_produto, disponivel, data_criacao)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id_produto, nome_produto, valor_produto;
    `;

    const values = [nome_produto, descricao, valor_produto, id_categoria_produto, disponivel];

    try {
        const res = await db.query(queryProduto, values);
        return res.rows[0];
    } catch (error) {
        throw error;
    }
}

// Salvar estoque por tamanho
async function salvarEstoqueTamanhos(idProduto, estoqueTamanhos, valor_produto) {
    const query = `
        INSERT INTO produto_tamanhos (id_produto, id_tamanho, estoque, valor_produto)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    try {
        const resultados = [];
        
        for (const [idTamanho, quantidade] of Object.entries(estoqueTamanhos)) {
            // if (quantidade > 0) { // Só salva se tiver estoque
                
            // }
            const res = await db.query(query, [
                    idProduto, 
                    parseInt(idTamanho), 
                    parseInt(quantidade), 
                    valor_produto
                ]);
                resultados.push(res.rows[0]);

        }
        
        return resultados;
    } catch (error) {
        throw error;
    }
}


// Buscar categorias
async function buscarCategorias() {
    const query = 'SELECT * FROM categorias_produto ORDER BY id_categoria_produto ASC';
    
    try {
        const res = await db.query(query);
        return res.rows;
    } catch (error) {
        throw error;
    }
}


// Nova função para buscar tamanhos por categoria
async function buscarTamanhosPorCategoria(idCategoria) {
    const query = `
        SELECT t.id_tamanho, t.nome
        FROM tamanhos t
        INNER JOIN categoria_tamanho ct ON t.id_tamanho = ct.id_tamanho
        WHERE ct.id_categoria_produto = $1
        ORDER BY t.id_tamanho ASC;
    `;

    try {
        const res = await db.query(query, [idCategoria]);
        return res.rows;
    } catch (error) {
        throw error;
    }
}


// Salvar imagens do produto
async function salvarImagens(id_produto, imagens) {
  const query = `
    INSERT INTO produto_imagens (id_produto, url_imagem_produto)
    VALUES ($1, $2)
    RETURNING *;
  `;

  try {
    const insercoes = [];
    for (const img of imagens) {
      const res = await db.query(query, [id_produto, img]);
      insercoes.push(res.rows[0]);
    }
    return insercoes;
  } catch (error) {
    throw error;
  }
}


// Buscar Produto por ID
async function buscarProdutoPorId(id_produto) {

    const query = `SELECT 
            p.id_produto,
            p.id_categoria_produto,
            p.nome_produto,
            p.descricao,
            p.valor_produto,
            p.estoque,
            p.disponivel,
            ARRAY_AGG(DISTINCT pi.url_imagem_produto) FILTER (WHERE pi.url_imagem_produto IS NOT NULL) AS urls_imagens,
            ARRAY_AGG(DISTINCT t.nome) FILTER (WHERE t.nome IS NOT NULL) AS tamanhos_disponiveis
        FROM produtos p
        LEFT JOIN produto_imagens pi 
            ON p.id_produto = pi.id_produto
        LEFT JOIN produto_tamanhos pt 
            ON p.id_produto = pt.id_produto
        LEFT JOIN tamanhos t 
            ON pt.id_tamanho = t.id_tamanho
        WHERE p.id_produto = $1
        GROUP BY p.id_produto, p.id_categoria_produto, p.nome_produto, 
                p.descricao, p.valor_produto, p.estoque, p.disponivel;`;
    const values = [id_produto];

    try {
        const res = await db.query(query, values);
        return res.rows[0];
    } catch (error) {
        throw error;
    }
}


// Buscar todos os tamanhos
async function buscarTamanhos(){
    const query = `SELECT * FROM tamanhos`;
    try {
        const res = await db.query(query);
        return res.rows;
    }
    catch (error) {
        throw error;
    }
}




// Editar Produto
async function editarProduto(produto) {
    const { id_produto, nome_produto, descricao, valor_produto} = produto;

    if (!id_produto) {
        throw new Error('ID do produto é obrigatório para edição');
    }

    const query = `
        UPDATE produtos
        SET nome_produto = $1,
            descricao = $2,
            valor_produto = $3
        WHERE id_produto = $4
        RETURNING *;`;

    const values = [nome_produto, descricao, valor_produto, id_produto];

    try {
        const res = await db.query(query, values);

        if (res.rows.length === 0) {
            throw new Error('Produto não encontrado para edição');
        }

        return res.rows[0];
    } catch (error) {
        throw error;
    }
}

// Buscar todos os produtos
async function buscarTodosProdutos() {
    const query = `SELECT p.id_produto,
               p.nome_produto,
               p.descricao,
               p.valor_produto,
               p.estoque,
               p.disponivel,
               ARRAY_AGG(pi.url_imagem_produto) AS urls_imagens
        FROM produtos p
        LEFT JOIN produto_imagens pi ON p.id_produto = pi.id_produto
        GROUP BY p.id_produto, p.nome_produto, p.descricao, 
                 p.valor_produto, p.estoque, p.disponivel
        ORDER BY p.id_produto ASC;`;
    try {
        const res = await db.query(query);
        return res.rows;
    } catch (error) {
        throw error;
    }
}


// Buscar imagens
async function buscarImagens(id_produto){
    
    const values = [id_produto];

    const query = `
    SELECT ARRAY_AGG(url_imagem_produto) AS urls_imagens
    FROM produto_imagens
    WHERE id_produto = $1
    `;

    try {
        const res = await db.query(query, values);
        return res.rows[0]; 
    }
    catch (error) {
        throw error;
    }

}



// Excluir produto
async function excluirProduto(id_produto){

    const values = [id_produto];

    const query = `DELETE FROM produtos
            WHERE id_produto = $1`;

    try {
        const res = await db.query(query, values);
        return res.rows[0];  
    }
    catch (error) {
        throw error;
    }

}





module.exports = {
    cadastrarProduto,
    salvarEstoqueTamanhos,
    buscarCategorias,
    buscarTamanhosPorCategoria,
    salvarImagens,
    buscarProdutoPorId,
    buscarTamanhos,
    editarProduto,
    buscarTodosProdutos,
    buscarImagens,
    excluirProduto
};