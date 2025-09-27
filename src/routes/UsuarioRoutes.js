const express = require('express')
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioControllers.js');
const { autenticarToken, verificarAdmin } = require('../middlewares/auth.js');

// Cadastro e login
router.post('/register', UsuarioController.cadastrarUsuario);
router.post('/login', UsuarioController.loginUsuario);

// Rotas protegidas

// Busca os dados do usuário autenticado
router.get('/meus-dados', autenticarToken, async (req, res) => {
    try {
        const dadosUsuario = await UsuarioController.buscarDadosUsuario(req.usuario.id_usuario);
        res.json({usuario: dadosUsuario});
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error.message);
        res.status(500).json({ erro: 'Erro ao buscar dados do usuário.' });
    }
})


// Atualizar dados do usuário
router.put('/meus-dados', autenticarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario; // ID do usuário autenticado
        const dadosUsuarioAtualizados = req.body; // Dados enviados pelo front-end

        // Chama o controller para atualizar os dados
        const resultado = await UsuarioController.editarUsuario(id_usuario, dadosUsuarioAtualizados);

        res.status(200).json({ mensagem: 'Dados atualizados com sucesso!', usuario: resultado });
    } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error.message);
        res.status(500).json({ erro: 'Erro ao atualizar dados do usuário.' });
    }
});



// Rota de exemplo para área administrativa
router.get('/admin-area', autenticarToken, verificarAdmin, (req, res) => {
    res.json({mensagem: 'Bem-vindo, administrador!'});
});



module.exports = router;