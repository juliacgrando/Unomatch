# Unomatch

Aplicativo Expo/React Native para conexoes entre estudantes da UNOCHAPECO, agora com uma API Node local para autenticar usuarios, listar perfis, registrar curtidas/passadas, gerar matches e exibir chats.

## Rodando o projeto

Instale as dependencias do app:

```bash
npm install
```

Suba o backend em um terminal:

```bash
npm run api
```

Em outro terminal, inicie o Expo:

```bash
npm start
```

A API roda por padrao em `http://localhost:3333`. No emulador Android o app usa `http://10.0.2.2:3333`. Em celular fisico, defina o endereco da sua maquina na rede:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3333 npm start
```

## Conta de teste

Use o login institucional abaixo:

- E-mail: `julia.teste@unochapeco.edu.br`
- Senha: `unomatch`

Novas contas criadas pelo onboarding tambem usam a senha inicial `unomatch`.

## Backend

O backend fica em `backend/` e foi feito sem dependencias externas, usando apenas APIs nativas do Node. O banco local e gerado automaticamente em `backend/data/unomatch.json` na primeira execucao.

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
