const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const UsuarioModel = require('../models/UsuarioModel');

const JWT_SECRET = process.env.JWT_SECRET;


// Cadastro de Usuario
async function cadastrarUsuario(req, res) {
    try {
        const novoUsuario = await UsuarioModel.cadastrarUsuario(req.body);

        const token = jwt.sign(
            { id: novoUsuario.id_usuario, email: novoUsuario.email, is_admin: novoUsuario.is_admin },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ usuario: novoUsuario, token });
        

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error.message, error.code);
        
        // Analisa se o erro é por conta do email ou CPF
        if (error.code === '23505') {
            if (error.constraint === 'usuarios_email_key') {
                return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
            }
            if (error.constraint === 'usuarios_cpf_key') {
                return res.status(409).json({ erro: 'Este CPF já está cadastrado.' });
            }
            return res.status(409).json({ erro: 'Dados duplicados. Verifique os campos informados.' });
        }

        res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
    }
}


async function loginUsuario(req, res) {
    const {email, senha} = req.body;

    try {
        const usuario = await UsuarioModel.buscarUsuarioPorEmail(email);

        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado'});
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha)

        if (!senhaValida) {
            return res.status(401).json({mensagem: 'Senha inválida'});
        }

        const token = jwt.sign({id_usuario: usuario.id_usuario, email: usuario.email, is_admin: usuario.is_admin},
            JWT_SECRET,
            {expiresIn: '1h'}
        );

        console.log('O usuario:', usuario.nome_usuario, 'realizou um login!');
        return res.status(200).json({mensagem: 'Login realizado com sucesso', token})


    } catch (error) {
        console.error('Erro ao fazer login:', error.message, error.code);
        return res.status(500).json({mensagem: 'Erro no login', erro: error.message });
    }

}

async function buscarDadosUsuario(id_usuario) {
    try {
        const dadosUsuario = await UsuarioModel.buscarDadosUsuario(id_usuario);
        return dadosUsuario;
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error.message);
        throw error;
    }
}


async function editarUsuario(id_usuario, dadosUsuarioAtualizados) {
    const { nome_usuario, cpf, endereco, telefone, curso, data_nascimento, aceita_emails, senha } = dadosUsuarioAtualizados;

    try {
        const dadosParaAtualizar = {
            id_usuario,
            nome_usuario,
            cpf,
            endereco,
            telefone,
            curso,
            data_nascimento,
            aceita_emails
        };

        // SÓ ADICIONA SENHA SE ELA FOI FORNECIDA E NÃO ESTÁ VAZIA
        if (senha && senha.trim() !== '') {
            dadosParaAtualizar.senha = senha;
        } 

        const usuarioEditado = await UsuarioModel.editarUsuario(dadosParaAtualizar);
        return usuarioEditado;
    } catch (error) {
        throw error;
    }

}



module.exports = {cadastrarUsuario, loginUsuario, buscarDadosUsuario, editarUsuario};