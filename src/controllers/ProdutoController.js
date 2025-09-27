const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ProdutoModel = require('../models/ProdutoModel');
const fs = require('fs');
const path = require('path');


const JWT_SECRET = process.env.JWT_SECRET;


// Cadastrar Produto
async function cadastrarProduto(req, res) {
    try {

        // Debug: ver o que chegou no corpo da requisição
        console.log("📦 Body recebido:", req.body);

        // Debug: ver se o arquivo chegou
        if (req.file) {
        console.log("🖼️ Arquivo recebido:", req.files);

        // Aqui você pode acessar, por exemplo:
        console.log("Nome original:", req.files.originalname);
        console.log("Nome salvo:", req.files.filename);
        console.log("Caminho temporário:", req.files.paths);
        } else {
        console.log("⚠️ Nenhum arquivo foi enviado!");
        }

        console.log('Dados recebidos para cadastro de produto:', req.body);
        
        // Validações básicas
        const { nome_produto, descricao, valor_produto, id_categoria_produto, disponivel, estoque_tamanhos } = req.body;

        let estoqueTamanhos = {};
        if (estoque_tamanhos) {
            try {
                estoqueTamanhos = JSON.parse(estoque_tamanhos);
            } catch (parseError) {
                console.error('Erro ao fazer parse do estoque_tamanhos:', parseError);
                return res.status(400).json({ error: 'Formato inválido do estoque por tamanho' });
            }
        }


        const novoProduto = await ProdutoModel.cadastrarProduto({
            nome_produto: nome_produto,
            descricao: descricao,
            valor_produto: parseFloat(valor_produto),
            id_categoria_produto: parseInt(id_categoria_produto),
            disponivel: disponivel === 'true' || disponivel === true
        });

        if (novoProduto) {
        // Salvar estoque por tamanho
            if (Object.keys(estoqueTamanhos).length >= 0) {
                await ProdutoModel.salvarEstoqueTamanhos(novoProduto.id_produto, estoqueTamanhos, novoProduto.valor_produto);
            }
        }

        // Se houver imagens, salvar os nomes no banco
        if (req.files && req.files.length > 0) {
            const imagens = req.files.map(file => `/uploads/produtos/${file.filename}`);
            console.log('Imagens recebidas:', imagens); 
            await ProdutoModel.salvarImagens(novoProduto.id_produto, imagens);
        }
        
        
        res.status(201).json({mensagem: 'Produto cadastrado com sucesso!'});
        console.log('Produto cadastrado com sucesso!');
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error.message);

        // Se der erro, remover os arquivos que foram salvos
        if (req.files) {
            req.files.forEach(file => {
                try {
                    // Usar file.path em vez de construir o caminho manualmente
                    fs.unlinkSync(file.path);
                    console.log('Arquivo removido:', file.filename);
                } catch (err) {
                    // Só loga se não for erro de arquivo não encontrado
                    if (err.code !== 'ENOENT') {
                        console.error('Erro ao remover arquivo:', err);
                    }
                }
            });
        }

        res.status(500).json({ error: 'Erro ao cadastrar produto.' });
    }
}

// Buscar todos os Produtos
async function buscarTodosProdutos(req, res) {
    try {
        const produtos = await ProdutoModel.buscarTodosProdutos();
        // Garantir que urls_imagens é sempre um array
        const produtosFormatados = produtos.map(p => ({
        ...p,
        urls_imagens: p.urls_imagens?.filter(Boolean) || [] // remove nulls e garante array
        }));
        res.status(200).json(produtosFormatados);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error.message);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
}


// Buscar Produto por ID
async function buscarProdutoPorId(req, res) {
    const id_produto = req.params.id;

    if (!id_produto || id_produto === 'undefined') {
        throw new Error('ID do produto inválido');
    }

    try {
        const produtoBuscado = await ProdutoModel.buscarProdutoPorId(id_produto);

        if (!produtoBuscado) {
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        }

        // Garantir que urls_imagens é sempre um array


        const produtoFormatado = {
            ...produtoBuscado,
            urls_imagens: Array.isArray(produtoBuscado.urls_imagens)
                ? produtoBuscado.urls_imagens.filter(Boolean) // remove nulls
                : [], // se undefined ou null, cria array vazio

            tamanhos_disponiveis: Array.isArray(produtoBuscado.tamanhos_disponiveis) 
            ? produtoBuscado.tamanhos_disponiveis.filter(Boolean) 
            : []
        };
        res.status(200).json(produtoFormatado);
    }
    catch (error) {
        console.error('Erro ao buscar produto:', error.message);
        res.status(500).json({ error: 'Erro ao buscar produto.' });
    }   
}


// Buscar categorias
async function buscarCategorias(req, res) {
    try {
        const categorias = await ProdutoModel.buscarCategorias();
        res.status(200).json(categorias);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
}


// Buscar tamanhos por categoria
async function buscarTamanhosPorCategoria(req, res) {
    try {
        const idCategoria = req.params.id;
        const tamanhos = await ProdutoModel.buscarTamanhosPorCategoria(idCategoria);
        res.status(200).json(tamanhos);
    } catch (error) {
        console.error('Erro ao buscar tamanhos:', error);
        res.status(500).json({ error: 'Erro ao buscar tamanhos' });
    }
}


// Editar Produto
async function editarProduto(req, res) {
    try {
        const id_produto = req.params.id;
        const { nome_produto, descricao, valor_produto, disponivel } = req.body;

        const produtoEditado = await ProdutoModel.editarProduto({
            id_produto: parseInt(id_produto),
            nome_produto,
            descricao,
            valor_produto: parseFloat(valor_produto),
            disponivel: disponivel === 'true' || disponivel === true
        });

        res.status(200).json({
            mensagem: 'Produto editado com sucesso!', 
            produto: produtoEditado
        });
    } catch (error) {
        console.error('Erro ao editar produto:', error);
        res.status(500).json({ error: 'Erro ao editar produto' });
    }
}



async function excluirProduto(req, res){
    
    const id_produto = req.params.id;

    try {
        const urlsObj = await ProdutoModel.buscarImagens(id_produto);
        const urls_imagens = Array.isArray(urlsObj) ? urlsObj : urlsObj?.urls_imagens || [];

        console.log('Imagens para excluir:', urls_imagens);

        if (urls_imagens.length > 0) {
            urls_imagens.forEach(filePath => {
                try {
                    const fullPath = path.join(__dirname, '..', filePath);
                    fs.unlinkSync(fullPath);
                    console.log('Arquivo removido:', fullPath);
                } catch (err) {
                    if (err.code !== 'ENOENT') {
                        console.error('Erro ao remover arquivo:', err);
                    }
                }
            });
        }

        await ProdutoModel.excluirProduto(id_produto);
        return res.status(201).json({mensagem: 'Produto foi removido com sucesso'});
    }
    catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ error: 'Erro ao excluir produto' });
    }



}


module.exports = {
    cadastrarProduto,
    buscarProdutoPorId,
    buscarCategorias,
    buscarTamanhosPorCategoria,
    buscarTodosProdutos,
    editarProduto,
    excluirProduto
};