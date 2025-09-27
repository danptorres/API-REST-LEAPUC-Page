const db = require('../db');
const bcrypt = require('bcrypt');

const saltRounds = 10;

// Cadastro do Usuário
async function cadastrarUsuario(usuario) {
    const { nome_usuario, email, cpf, dataNascimento, senha, aceita_emails } = usuario;

    // Hash da senha
    const hashedSenha = await bcrypt.hash(senha, saltRounds);

    const query = `
    INSERT INTO usuarios (nome_usuario, email, senha, cpf, nascimento, data_criacao, aceita_emails)
    VALUES ($1, $2, $3, $4, $5, NOW(), $6)
    RETURNING *;
    `;

    const values = [nome_usuario, email, hashedSenha, cpf, dataNascimento, aceita_emails];

    try {
        const res = await db.query(query, values);
        return res.rows[0];
    } catch (error) {
        
        throw error;
    }
}

// Login do Usuario
async function buscarUsuarioPorEmail(email) {
    const query = 'SELECT id_usuario, nome_usuario, email, senha, is_admin FROM usuarios WHERE email = $1';
    const values = [email];

    try {
        const res = await db.query(query, values);
        return res.rows[0];
    } catch (error) {
        throw error;
    }

}

async function buscarDadosUsuario(id_usuario){
    
    const query = `SELECT nome_usuario, 
                    email, 
                    senha, 
                    cpf, 
                    endereco, 
                    telefone, 
                    data_nascimento,  
                    aceita_emails, 
                    curso
                    FROM USUARIOS
                    WHERE id_usuario = $1`;

    // const values = [id_usuario];
    const values = [Number(id_usuario)];

    try {
        const res = await db.query(query, values);
        return res.rows[0];
    } catch (error) {
        throw error;
    }
}


// Editar Usuario
async function editarUsuario(usuario) {
    const { id_usuario, nome_usuario, cpf, endereco, telefone, data_nascimento, curso, aceita_emails, senha} = usuario;

    let query;
    let values;

    // Se uma nova senha foi fornecida, incluir no UPDATE
    if (usuario.hasOwnProperty('senha') && senha && senha.trim() !== '') {

        // Hash da nova senha
        const hashedSenha = await bcrypt.hash(senha, saltRounds);
        
        query = `
        UPDATE usuarios
        SET nome_usuario = $2, cpf = $3, endereco = $4, telefone = $5, data_nascimento = $6, curso = $7, aceita_emails = $8, senha = $9  
        WHERE id_usuario = $1
        RETURNING *;
        `;
        
        values = [id_usuario, nome_usuario, cpf, endereco, telefone, data_nascimento, curso, aceita_emails, hashedSenha];
    } else {
        // Não atualizar a senha se não foi fornecida
        query = `
        UPDATE usuarios
        SET nome_usuario = $2, cpf = $3, endereco = $4, telefone = $5, data_nascimento = $6, curso = $7, aceita_emails = $8
        WHERE id_usuario = $1
        RETURNING *;
        `;
        
        values = [id_usuario, nome_usuario, cpf, endereco, telefone, data_nascimento, curso, aceita_emails];
    }

    try {
        const res = await db.query(query, values);
        if (!res.rows[0]) {
                throw new Error('Usuário não encontrado para edição.');
            }
        return res.rows[0];    
        } catch (error) {
        throw error;
    }

}


module.exports = { cadastrarUsuario, buscarUsuarioPorEmail, editarUsuario, buscarDadosUsuario };