**Site da Liga das Engenharias e Arquitetura da PUC** 

# API - Sistema de Atlética Universitária  

API backend em desenvolvimento para refetente a Pagina da LEAPUC.  
O sistema busca oferecer **autenticação segura**, **controle completo de produtos e estoque por tamanho**, além de **upload otimizado de imagens**, seguindo boas práticas de arquitetura e escalabilidade.  

---

## 📌 Status do Projeto  
⚠️ **Em desenvolvimento** – novas funcionalidades e melhorias estão sendo implementadas continuamente.  


## 🛠️ Stack Tecnológica  

### Backend  
- Node.js 18+  
- Express.js 4.18+  
- PostgreSQL 14+  
- JWT (autenticação)  
- Bcrypt (hash de senhas)  
- Multer (upload de arquivos)  

### Bibliotecas principais  
- `pg` – Cliente PostgreSQL  
- `jsonwebtoken` – Gerenciamento de tokens JWT  
- `bcrypt` – Criptografia de senhas  
- `multer` – Upload de arquivos  
- `cors` – Controle de origem cruzada  
- `dotenv` – Variáveis de ambiente  

---

## Arquitetura  

O projeto segue o padrão **MVC (Model-View-Controller)** com separação clara de responsabilidades:  
projeto/
├── controllers/ # Lógica de negócio e validações
├── models/ # Interação com banco de dados
├── routes/ # Definição de rotas da API
├── middlewares/ # Autenticação e autorização
├── uploads/ # Armazenamento de imagens
├── db.js # Configuração do PostgreSQL
└── index.js # Execução da API


---

## Funcionalidades  

### 🔐 Autenticação e Usuários  
- Cadastro de usuários com dados completos  
- Login com tokens JWT (expiração em 1h)  
- Middleware de autenticação para rotas protegidas  
- Permissões diferenciadas (usuário comum vs administrador)  
- Edição de perfil com validações  

### 📦 Produtos e Estoque  
- CRUD completo de produtos  
- Sistema flexível de categorias (ex.: camisetas, shorts, calças)  
- Controle de estoque por tamanho (P, M, G ou numeração como 38, 40, 42)  
- Suporte a pré-venda (estoque zero permitido)  
- Upload múltiplo de imagens (até 5MB por arquivo, formatos JPEG, PNG, WebP, GIF)  

### 🖼️ Sistema de Imagens  
- Armazenamento físico no servidor  
- Geração de URLs dinâmicas para acesso público  
- Limpeza automática em caso de erro no upload  
- Redimensionamento e otimização automática  

---

## Estrutura do Banco de Dados  

### **usuarios**  
- Dados pessoais (nome, email, CPF, telefone)  
- Informações acadêmicas (curso)  
- Permissões (is_admin)  
- Preferências de comunicação  

### **categorias_produto**  
- Categorização flexível  
- Relacionamento com tamanhos disponíveis  

### **produtos**  
- Informações básicas (nome, descrição, valor)  
- Relacionamento com categoria  
- Status de disponibilidade  
- Auditoria (data_criacao, criado_por)  

### **produto_tamanhos**  
- Controle de estoque por tamanho  
- Preços específicos por variação  
- Suporte a produtos sob encomenda  

### **produto_imagens**  
- Múltiplas imagens por produto  
- URLs otimizadas para CDN  

---

## Futuras Melhorias  

- Documentação da API com
- Integração com algum serviço de armazenamento em nuvem (S3, Cloudinary, etc.)  
- Dashboard administrativo para gestão de usuários e produtos  
- Logs estruturados e monitoramento da aplicação  
- Deploy automatizado com CI/CD  
- Sistema de notificações (e-mail ou push)  