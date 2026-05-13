const http = require('node:http');
const { URL } = require('node:url');

const {
  createId,
  createSession,
  hashPassword,
  nowIso,
  pruneSessions,
  publicUser,
  readState,
  verifyPassword,
  writeState,
} = require('./storage');

const PORT = Number(process.env.PORT || 3333);
const INSTITUTIONAL_DOMAIN = '@unochapeco.edu.br';

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message, details) {
  sendJson(res, statusCode, { error: { message, details } });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Payload muito grande.'));
      }
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (_error) {
        reject(new Error('JSON invalido.'));
      }
    });
  });
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateInstitutionalEmail(email) {
  return /^[a-z0-9._-]+@unochapeco\.edu\.br$/.test(email);
}

function sanitizeUserPatch(body) {
  const patch = {};
  const stringFields = ['name', 'course', 'bio'];
  const booleanFields = ['notificationsEnabled', 'showOnlyUniversity'];
  const numberFields = ['age', 'minAge', 'maxAge', 'maxDistanceKm'];

  stringFields.forEach((field) => {
    if (typeof body[field] === 'string' && body[field].trim()) {
      patch[field] = body[field].trim();
    }
  });

  booleanFields.forEach((field) => {
    if (typeof body[field] === 'boolean') {
      patch[field] = body[field];
    }
  });

  numberFields.forEach((field) => {
    if (Number.isFinite(body[field])) {
      patch[field] = Number(body[field]);
    }
  });

  if (Array.isArray(body.interests)) {
    patch.interests = body.interests
      .map((interest) => String(interest).trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  return patch;
}

function getAuth(req, state) {
  const authorization = req.headers.authorization || '';
  const [, token] = authorization.match(/^Bearer (.+)$/) || [];

  if (!token) {
    return null;
  }

  pruneSessions(state);
  const session = state.sessions.find((item) => item.token === token);
  if (!session) {
    return null;
  }

  const user = state.users.find((item) => item.id === session.userId);
  return user ? { session, user } : null;
}

function requireAuth(req, res, state) {
  const auth = getAuth(req, state);
  if (!auth) {
    sendError(res, 401, 'Sessao invalida ou expirada.');
    return null;
  }

  return auth;
}

function profileSummary(user) {
  return {
    id: user.id,
    name: user.name,
    age: user.age,
    course: user.course,
    bio: user.bio,
    interests: user.interests,
    university: user.university,
    distanceKm: user.distanceKm,
    online: user.online,
  };
}

function buildChatItem(match, currentUser, state) {
  const otherUserId = match.userIds.find((userId) => userId !== currentUser.id);
  const otherUser = state.users.find((user) => user.id === otherUserId);
  const matchMessages = state.messages
    .filter((message) => message.matchId === match.id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const lastMessage = matchMessages.at(-1);
  const unreadCount = matchMessages.filter(
    (message) => message.senderId !== currentUser.id && !message.readBy.includes(currentUser.id)
  ).length;

  return {
    id: match.id,
    profileId: otherUser.id,
    name: otherUser.name,
    message: lastMessage?.text || 'Match novo! Bora conversar?',
    time: lastMessage ? formatMessageTime(lastMessage.createdAt) : 'Agora',
    unreadCount,
    online: otherUser.online,
    isNewMatch: matchMessages.length === 0 || new Date(match.createdAt).getTime() > Date.now() - 1000 * 60 * 60 * 48,
  };
}

function formatMessageTime(isoDate) {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();

  if (diffMs < 1000 * 60 * 60 * 24) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  if (diffMs < 1000 * 60 * 60 * 48) {
    return 'Ontem';
  }

  return date.toLocaleDateString('pt-BR', { weekday: 'short' });
}

function findMatchBetween(state, firstUserId, secondUserId) {
  return state.matches.find(
    (match) => match.userIds.includes(firstUserId) && match.userIds.includes(secondUserId)
  );
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const state = readState();
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    if (req.method === 'GET' && path === '/health') {
      sendJson(res, 200, { status: 'ok', name: 'unomatch-api' });
      return;
    }

    if (req.method === 'POST' && path === '/auth/register') {
      const body = await parseBody(req);
      const name = String(body.name || '').trim();
      const email = normalizeEmail(body.email);
      const password = String(body.password || 'unomatch');

      if (!name) {
        sendError(res, 400, 'Informe o nome.');
        return;
      }

      if (!validateInstitutionalEmail(email)) {
        sendError(res, 400, `Use um e-mail institucional ${INSTITUTIONAL_DOMAIN}.`);
        return;
      }

      if (state.users.some((user) => user.email === email)) {
        sendError(res, 409, 'Ja existe uma conta com esse e-mail.');
        return;
      }

      const user = {
        id: createId('user'),
        name,
        email,
        passwordHash: hashPassword(password),
        age: Number(body.age || 20),
        course: String(body.course || 'UNOCHAPECO').trim(),
        bio: String(body.bio || 'Novo perfil no Unomatch.').trim(),
        interests: Array.isArray(body.interests) ? body.interests.slice(0, 8) : ['UNOCHAPECO'],
        university: 'UNOCHAPECO',
        distanceKm: 1,
        notificationsEnabled: true,
        showOnlyUniversity: true,
        minAge: 18,
        maxAge: 24,
        maxDistanceKm: 15,
        online: true,
        createdAt: nowIso(),
      };
      state.users.push(user);
      const session = createSession(state, user.id);
      writeState(state);
      sendJson(res, 201, { token: session.token, user: publicUser(user) });
      return;
    }

    if (req.method === 'POST' && path === '/auth/login') {
      const body = await parseBody(req);
      const email = normalizeEmail(body.email);
      const password = String(body.password || '');
      const user = state.users.find((item) => item.email === email);

      if (!user || !verifyPassword(password, user.passwordHash)) {
        sendError(res, 401, 'E-mail ou senha invalidos.');
        return;
      }

      const session = createSession(state, user.id);
      user.online = true;
      writeState(state);
      sendJson(res, 200, { token: session.token, user: publicUser(user) });
      return;
    }

    if (req.method === 'POST' && path === '/auth/logout') {
      const auth = requireAuth(req, res, state);
      if (!auth) {
        return;
      }

      state.sessions = state.sessions.filter((session) => session.token !== auth.session.token);
      auth.user.online = false;
      writeState(state);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && path === '/me') {
      const auth = requireAuth(req, res, state);
      if (!auth) {
        return;
      }

      sendJson(res, 200, { user: publicUser(auth.user) });
      return;
    }

    if (req.method === 'PATCH' && path === '/me') {
      const auth = requireAuth(req, res, state);
      if (!auth) {
        return;
      }

      const body = await parseBody(req);
      Object.assign(auth.user, sanitizeUserPatch(body), { updatedAt: nowIso() });
      writeState(state);
      sendJson(res, 200, { user: publicUser(auth.user) });
      return;
    }

    if (req.method === 'GET' && path === '/profiles/discover') {
      const auth = requireAuth(req, res, state);
      if (!auth) {
        return;
      }

      const swipedIds = new Set(
        state.swipes
          .filter((swipe) => swipe.fromUserId === auth.user.id)
          .map((swipe) => swipe.toUserId)
      );
      const profiles = state.users
        .filter((user) => user.id !== auth.user.id && !swipedIds.has(user.id))
        .map(profileSummary);
      sendJson(res, 200, { profiles });
      return;
    }

    if (req.method === 'GET' && path === '/profiles') {
      const auth = requireAuth(req, res, state);
      if (!auth) {
        return;
      }

      const query = String(url.searchParams.get('query') || '').trim().toLowerCase();
      const course = String(url.searchParams.get('course') || '').trim().toLowerCase();
      const interest = String(url.searchParams.get('interest') || '').trim().toLowerCase();
      const profiles = state.users
        .filter((user) => user.id !== auth.user.id)
        .filter((user) => !query || user.name.toLowerCase().includes(query) || user.course.toLowerCase().includes(query))
        .filter((user) => !course || user.course.toLowerCase().includes(course))
        .filter((user) => !interest || user.interests.some((item) => item.toLowerCase() === interest))
        .map(profileSummary);
      sendJson(res, 200, { profiles });
      return;
    }

    if (req.method === 'POST' && path === '/swipes') {
      const auth = requireAuth(req, res, state);
      if (!auth) {
        return;
      }

      const body = await parseBody(req);
      const profileId = String(body.profileId || '');
      const action = body.action === 'like' ? 'like' : 'pass';
      const target = state.users.find((user) => user.id === profileId);

      if (!target || target.id === auth.user.id) {
        sendError(res, 404, 'Perfil nao encontrado.');
        return;
      }

      state.swipes = state.swipes.filter(
        (swipe) => !(swipe.fromUserId === auth.user.id && swipe.toUserId === target.id)
      );
      state.swipes.push({
        id: createId('swipe'),
        fromUserId: auth.user.id,
        toUserId: target.id,
        action,
        createdAt: nowIso(),
      });

      let match = findMatchBetween(state, auth.user.id, target.id);
      const reciprocalLike = state.swipes.some(
        (swipe) => swipe.fromUserId === target.id && swipe.toUserId === auth.user.id && swipe.action === 'like'
      );

      if (action === 'like' && reciprocalLike && !match) {
        match = {
          id: createId('match'),
          userIds: [auth.user.id, target.id],
          createdAt: nowIso(),
        };
        state.matches.push(match);
      }

      writeState(state);
      sendJson(res, 200, { ok: true, matched: Boolean(match && action === 'like'), match });
      return;
    }

    if (req.method === 'GET' && path === '/matches') {
      const auth = requireAuth(req, res, state);
      if (!auth) {
        return;
      }

      const matches = state.matches
        .filter((match) => match.userIds.includes(auth.user.id))
        .map((match) => {
          const otherUserId = match.userIds.find((userId) => userId !== auth.user.id);
          const otherUser = state.users.find((user) => user.id === otherUserId);
          return { ...match, profile: profileSummary(otherUser) };
        });
      sendJson(res, 200, { matches });
      return;
    }

    if (req.method === 'GET' && path === '/chats') {
      const auth = requireAuth(req, res, state);
      if (!auth) {
        return;
      }

      const chats = state.matches
        .filter((match) => match.userIds.includes(auth.user.id))
        .map((match) => buildChatItem(match, auth.user, state));
      sendJson(res, 200, { chats });
      return;
    }

    const chatMessagesMatch = path.match(/^\/chats\/([^/]+)\/messages$/);
    if (chatMessagesMatch) {
      const auth = requireAuth(req, res, state);
      if (!auth) {
        return;
      }

      const matchId = chatMessagesMatch[1];
      const match = state.matches.find((item) => item.id === matchId && item.userIds.includes(auth.user.id));
      if (!match) {
        sendError(res, 404, 'Conversa nao encontrada.');
        return;
      }

      if (req.method === 'GET') {
        const messages = state.messages
          .filter((message) => message.matchId === match.id)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        messages.forEach((message) => {
          if (!message.readBy.includes(auth.user.id)) {
            message.readBy.push(auth.user.id);
          }
        });
        writeState(state);
        sendJson(res, 200, { messages });
        return;
      }

      if (req.method === 'POST') {
        const body = await parseBody(req);
        const text = String(body.text || '').trim();
        if (!text) {
          sendError(res, 400, 'Mensagem vazia.');
          return;
        }

        const message = {
          id: createId('message'),
          matchId: match.id,
          senderId: auth.user.id,
          text,
          readBy: [auth.user.id],
          createdAt: nowIso(),
        };
        state.messages.push(message);
        writeState(state);
        sendJson(res, 201, { message });
        return;
      }
    }

    sendError(res, 404, 'Rota nao encontrada.');
  } catch (error) {
    sendError(res, 500, 'Erro interno da API.', error.message);
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Unomatch API running on http://localhost:${PORT}`);
});
