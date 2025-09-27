const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({mensagem: 'Token não fornecido'});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) return res.status(403).json({mensagem: 'Token inválido'});

        req.usuario = usuario;
        next();
    });
}

function verificarAdmin(req, res, next) {
    if(!req.usuario?.is_admin) {
        return res.status(403).json({mensagem: 'Acesso restrito a administradores'});
    }
    next();
}

module.exports = {
    autenticarToken,
    verificarAdmin
};