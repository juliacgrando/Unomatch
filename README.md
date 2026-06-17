# Unomatch

Aplicativo Expo/React Native para conexoes entre estudantes da UNOCHAPECO, com uma API Node local para autenticar usuarios, listar perfis, registrar curtidas/passadas, gerar matches e exibir chats.

O backend usa PostgreSQL com Prisma ORM. Na primeira execucao com o banco vazio, a API importa os dados antigos de `backend/data/unomatch.json` se esse arquivo existir; caso contrario, cria dados iniciais de teste.

## Rodando o projeto

Instale as dependencias do app:

```bash
npm install
```

Configure o banco:

```bash
copy .env.example .env
```

Suba um PostgreSQL local. Se voce tiver Docker instalado:

```bash
docker compose up -d
```

Depois rode a migration do Prisma:

```bash
npm run db:migrate
```

Suba o backend em um terminal:

```bash
npm run api
```

Em outro terminal, inicie o Expo:

```bash
npm run web
```

A API publica roda no Railway:

```bash
https://api-production-7e3c.up.railway.app
```

Por padrao, o app aponta para essa API publica. Para desenvolvimento local, voce pode sobrescrever a URL:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3333 npm start
```

## Conta de teste

Use o login institucional abaixo:

- E-mail: `julia.teste@unochapeco.edu.br`
- Senha: `unomatch`

Novas contas criadas pelo onboarding usam a senha escolhida na tela de cadastro.

## Backend e banco

O backend fica em `backend/`, usa Node HTTP nativo para as rotas e Prisma para acessar o PostgreSQL. O schema fica em `prisma/schema.prisma`, e a migration inicial fica em `prisma/migrations/`.

Comandos uteis:

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

Rotas principais:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /me`
- `PATCH /me`
- `GET /profiles/discover`
- `GET /profiles`
- `POST /swipes`
- `GET /matches`
- `GET /chats`
- `GET /chats/:id/messages`
- `POST /chats/:id/messages`
