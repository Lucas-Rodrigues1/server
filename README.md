# 💬 Chat API - Server

API de chat em tempo real construída com **Node.js**, **Express**, **Socket.IO** e **MongoDB**.

## ✨ Features

- **Autenticação JWT** — Login com username/password, token com expiração de 1h
- **Gerenciamento de Usuários** — Criar conta, buscar usuários, atualizar avatar (base64) e status
- **Sistema de Amizades** — Enviar, aceitar, rejeitar e remover amizades
- **Chat em Tempo Real** — Mensagens via WebSocket com Socket.IO
- **Mensagens com Emojis** — Suporte nativo a todos os emojis Unicode
- **Envio de Fotos** — Mensagens do tipo `image` com imagem base64 (até 5MB)
- **Indicador de Digitação** — Eventos `typing:start` / `typing:stop`
- **Status Online** — `online`, `offline`, `ausente`, `ocupado` com notificação em tempo real aos amigos
- **Arquivar/Desarquivar Conversas** — Organização de conversas
- **Soft Delete** — Exclusão de conversas sem perda de dados para o outro participante
- **Paginação por Cursor** — Mensagens com `limit` e `before` para scroll infinito

## 🛠️ Tecnologias

- Node.js 20 + TypeScript
- Express 5
- Socket.IO
- MongoDB + Mongoose
- Passport.js (Local + JWT)
- bcrypt
- Docker

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [MongoDB](https://www.mongodb.com/) (local ou Atlas)
- [Docker](https://www.docker.com/) (opcional)

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=sua_chave_secreta_aqui
RENDER_EXTERNAL_URL=https://seu-dominio.com
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `PORT` | Não | Porta do servidor (padrão: 3000) |
| `MONGODB_URI` | Sim | String de conexão do MongoDB |
| `JWT_SECRET` | Sim | Chave secreta para assinar tokens JWT |
| `RENDER_EXTERNAL_URL` | Não | URL externa para health check automático |

## 🚀 Rodando Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo .env (veja seção acima)

# 3. Rodar em modo de desenvolvimento (com hot-reload)
npm run dev

# 4. Ou buildar e rodar em produção
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3000`.

## 🐳 Docker

### Build e Run com Docker Compose (recomendado)

```bash
# Subir o container (build + start)
docker compose up -d

# Ver logs
docker compose logs -f server

# Parar
docker compose down
```

> **Nota:** O `docker-compose.yml` usa o arquivo `.env` automaticamente. Certifique-se de criar o `.env` antes de subir o container.

### Build e Run com Docker direto

```bash
# Build da imagem
docker build -t chat-api .

# Rodar o container
docker run -d -p 3000:3000 --env-file .env --name chat-api chat-api
```

### Sobre o Dockerfile

O Dockerfile usa **multi-stage build** para otimizar a imagem final:

1. **Stage builder** — Instala todas as dependências e compila o TypeScript
2. **Stage production** — Copia apenas o código compilado e dependências de produção

Imagem base: `node:20-alpine` (leve e segura).

## 📮 Postman Collection

O arquivo `postman_collection.json` na raiz do projeto contém todas as rotas da API prontas para importar no Postman.

### Como usar

1. Abra o Postman
2. Clique em **Import** → selecione o arquivo `postman_collection.json`
3. Execute a rota **Auth > Login** primeiro
4. O token JWT é **salvo automaticamente** na variável `{{token}}`
5. Todas as outras rotas já usam o token — basta executar normalmente

### Rotas disponíveis

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `GET` | `/health` | Health check | Não |
| `POST` | `/auth/login` | Login (retorna JWT) | Não |
| `GET` | `/auth/profile` | Perfil do usuário autenticado | Sim |
| `POST` | `/users/create` | Criar novo usuário | Não |
| `GET` | `/users/search?q=` | Buscar usuários | Sim |
| `GET` | `/users/me` | Dados do usuário logado | Sim |
| `PATCH` | `/users/avatar` | Atualizar avatar (base64) | Sim |
| `PATCH` | `/users/status` | Atualizar status | Sim |
| `POST` | `/friends/request` | Enviar solicitação de amizade | Sim |
| `GET` | `/friends/requests` | Listar solicitações pendentes | Sim |
| `GET` | `/friends` | Listar amigos | Sim |
| `POST` | `/friends/accept/:id` | Aceitar solicitação | Sim |
| `POST` | `/friends/reject/:id` | Rejeitar solicitação | Sim |
| `DELETE` | `/friends/:id` | Remover amigo | Sim |
| `POST` | `/chat/conversations` | Iniciar conversa | Sim |
| `GET` | `/chat/conversations` | Listar conversas | Sim |
| `GET` | `/chat/conversations/archived` | Listar arquivadas | Sim |
| `GET` | `/chat/conversations/:id/messages` | Mensagens da conversa | Sim |
| `PATCH` | `/chat/conversations/:id/archive` | Arquivar conversa | Sim |
| `PATCH` | `/chat/conversations/:id/unarchive` | Desarquivar conversa | Sim |
| `DELETE` | `/chat/conversations/:id` | Deletar conversa (soft) | Sim |

## 🔌 WebSocket Events

Conexão via Socket.IO com autenticação por token:

```js
const socket = io("http://localhost:3000", {
  auth: { token: "seu_jwt_token" }
});
```

### Eventos

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `message:send` | Cliente → Servidor | Enviar mensagem (texto ou imagem) |
| `message:ack` | Servidor → Cliente | Confirmação de envio |
| `message:new` | Servidor → Cliente | Nova mensagem recebida |
| `message:read` | Cliente → Servidor | Marcar conversa como lida |
| `message:error` | Servidor → Cliente | Erro no envio |
| `typing:start` | Bidirecional | Começou a digitar |
| `typing:stop` | Bidirecional | Parou de digitar |
| `status:change` | Cliente → Servidor | Alterar status |
| `user:status` | Servidor → Cliente | Status de amigo atualizado |

## 📁 Estrutura do Projeto

```
src/
├── index.ts                 # Entry point + Express config
├── socket.ts                # Socket.IO setup + event system
├── controllers/             # Request handlers
│   ├── auth/
│   ├── chat/
│   ├── friends/
│   └── users/
├── services/                # Business logic
│   ├── auth/
│   ├── chat/
│   ├── friends/
│   └── users/
├── repository/              # Data access layer
│   ├── conversation.repository.ts
│   ├── friendship.repository.ts
│   ├── message.repository.ts
│   └── user.repository.ts
├── schemas/                 # Mongoose models
│   ├── conversation.schema.ts
│   ├── friendship.schema.ts
│   ├── message.schema.ts
│   └── user.schema.ts
├── routes/                  # Express routes
│   ├── auth/
│   ├── chat/
│   ├── friends/
│   └── users/
├── middlewares/              # Auth middlewares
│   ├── auth.ts
│   ├── jwt.ts
│   └── passport.ts
├── dtos/                    # Data transfer objects
│   └── createUser.dto.ts
└── sockets/                 # WebSocket handlers
    └── chat.socket.ts
```
