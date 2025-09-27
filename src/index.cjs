require('dotenv').config(); 

const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); // Libera a API para outros domínios, no caso o React
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' });
});


// Rota de usuarios
const usuarioRoutes = require('./routes/UsuarioRoutes');
app.use('/usuarios', usuarioRoutes);


// Rota de produtos
const produtoRoutes = require('./routes/ProdutoRoutes');
app.use('/produtos', produtoRoutes);


// Servir a pasta uploads como pública
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Inicia o servidor
app.listen(port, () => {
  console.log(`Backend rodando na porta ${port}`);
});
