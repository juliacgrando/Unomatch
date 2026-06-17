require('dotenv/config');

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DATA_FILE = path.join(__dirname, 'data', 'unomatch.json');
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, expectedHash] = storedHash.split(':');
  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actualHash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

function nowIso() {
  return new Date().toISOString();
}

function seedState() {
  const defaultPassword = hashPassword('unomatch');
  const users = [
    {
      id: 'user_julia',
      name: 'Julia Teste',
      email: 'julia.teste@unochapeco.edu.br',
      passwordHash: defaultPassword,
      age: 20,
      course: 'Sistemas de Informacao',
      bio: 'Curto tecnologia, esportes e cafe. Buscando conexoes reais com pessoas da UNOCHAPECO.',
      interests: ['Tecnologia', 'Academia', 'Cinema', 'Cafe', 'Musica'],
      university: 'UNOCHAPECO',
      distanceKm: 1,
      notificationsEnabled: true,
      showOnlyUniversity: true,
      minAge: 18,
      maxAge: 24,
      maxDistanceKm: 15,
      online: true,
      createdAt: nowIso(),
    },
    {
      id: 'user_amanda',
      name: 'Amanda',
      email: 'amanda@unochapeco.edu.br',
      passwordHash: defaultPassword,
      age: 21,
      course: 'Direito',
      bio: 'Gosto de trilhas, cafe e conversa boa depois da aula.',
      interests: ['Trilhas', 'Cafe', 'Leitura'],
      university: 'UNOCHAPECO',
      distanceKm: 2,
      notificationsEnabled: true,
      showOnlyUniversity: true,
      minAge: 18,
      maxAge: 26,
      maxDistanceKm: 20,
      online: true,
      createdAt: nowIso(),
    },
    {
      id: 'user_bruno',
      name: 'Bruno',
      email: 'bruno@unochapeco.edu.br',
      passwordHash: defaultPassword,
      age: 23,
      course: 'Sistemas de Informacao',
      bio: 'Curto tecnologia, academia e filmes de ficcao.',
      interests: ['Tech', 'Academia', 'Cinema'],
      university: 'UNOCHAPECO',
      distanceKm: 5,
      notificationsEnabled: true,
      showOnlyUniversity: true,
      minAge: 18,
      maxAge: 28,
      maxDistanceKm: 20,
      online: false,
      createdAt: nowIso(),
    },
    {
      id: 'user_carolina',
      name: 'Carolina',
      email: 'carolina@unochapeco.edu.br',
      passwordHash: defaultPassword,
      age: 20,
      course: 'Medicina',
      bio: 'Amo musica ao vivo, viagens e fotografia.',
      interests: ['Musica', 'Viagem', 'Fotografia'],
      university: 'UNOCHAPECO',
      distanceKm: 3,
      notificationsEnabled: true,
      showOnlyUniversity: true,
      minAge: 18,
      maxAge: 24,
      maxDistanceKm: 15,
      online: true,
      createdAt: nowIso(),
    },
    {
      id: 'user_diego',
      name: 'Diego',
      email: 'diego@unochapeco.edu.br',
      passwordHash: defaultPassword,
      age: 22,
      course: 'Arquitetura',
      bio: 'Design, artes visuais e role cultural no fim de semana.',
      interests: ['Design', 'Arte', 'Musica'],
      university: 'UNOCHAPECO',
      distanceKm: 6,
      notificationsEnabled: true,
      showOnlyUniversity: true,
      minAge: 18,
      maxAge: 25,
      maxDistanceKm: 18,
      online: false,
      createdAt: nowIso(),
    },
  ];

  return {
    users,
    sessions: [],
    swipes: [
      { id: 'swipe_amanda_julia', fromUserId: 'user_amanda', toUserId: 'user_julia', action: 'like', createdAt: nowIso() },
      { id: 'swipe_carolina_julia', fromUserId: 'user_carolina', toUserId: 'user_julia', action: 'like', createdAt: nowIso() },
    ],
    matches: [
      { id: 'match_julia_amanda', userIds: ['user_julia', 'user_amanda'], createdAt: nowIso() },
      { id: 'match_julia_carolina', userIds: ['user_julia', 'user_carolina'], createdAt: nowIso() },
    ],
    messages: [
      {
        id: 'message_1',
        matchId: 'match_julia_amanda',
        senderId: 'user_amanda',
        text: 'Vamos no cafe da UNO depois da aula?',
        readBy: ['user_amanda'],
        createdAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
      },
      {
        id: 'message_2',
        matchId: 'match_julia_carolina',
        senderId: 'user_carolina',
        text: 'Match novo! Bora conversar?',
        readBy: ['user_carolina'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      },
    ],
  };
}

function asDate(value) {
  return value ? new Date(value) : undefined;
}

function normalizeState(state) {
  return {
    users: state.users.map((user) => ({
      ...user,
      createdAt: asDate(user.createdAt) || new Date(),
      updatedAt: asDate(user.updatedAt),
      interests: user.interests || [],
    })),
    sessions: state.sessions.map((session) => ({
      ...session,
      createdAt: asDate(session.createdAt) || new Date(),
      expiresAt: asDate(session.expiresAt) || new Date(Date.now() + SESSION_TTL_MS),
    })),
    swipes: state.swipes.map((swipe) => ({
      ...swipe,
      createdAt: asDate(swipe.createdAt) || new Date(),
    })),
    matches: state.matches.map((match) => ({
      ...match,
      userIds: match.userIds || [],
      createdAt: asDate(match.createdAt) || new Date(),
    })),
    messages: state.messages.map((message) => ({
      ...message,
      readBy: message.readBy || [],
      createdAt: asDate(message.createdAt) || new Date(),
    })),
  };
}

function loadInitialState() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }

  return seedState();
}

async function replaceState(state, client = prisma) {
  const normalized = normalizeState(state);

  await client.message.deleteMany();
  await client.match.deleteMany();
  await client.swipe.deleteMany();
  await client.session.deleteMany();
  await client.user.deleteMany();

  if (normalized.users.length > 0) {
    await client.user.createMany({ data: normalized.users });
  }

  if (normalized.sessions.length > 0) {
    await client.session.createMany({ data: normalized.sessions });
  }

  if (normalized.swipes.length > 0) {
    await client.swipe.createMany({ data: normalized.swipes });
  }

  if (normalized.matches.length > 0) {
    await client.match.createMany({ data: normalized.matches });
  }

  if (normalized.messages.length > 0) {
    await client.message.createMany({ data: normalized.messages });
  }
}

async function ensureSeeded() {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    return;
  }

  await prisma.$transaction(async (transaction) => {
    await replaceState(loadInitialState(), transaction);
  });
}

async function readState() {
  await ensureSeeded();

  const [users, sessions, swipes, matches, messages] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.session.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.swipe.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.match.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.message.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);

  return { users, sessions, swipes, matches, messages };
}

async function writeState(state) {
  await prisma.$transaction(async (transaction) => {
    await replaceState(state, transaction);
  });
}

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function createSession(state, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const session = {
    token,
    userId,
    createdAt: nowIso(),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
  state.sessions.push(session);
  return session;
}

function pruneSessions(state) {
  const now = Date.now();
  state.sessions = state.sessions.filter((session) => new Date(session.expiresAt).getTime() > now);
}

module.exports = {
  createId,
  createSession,
  hashPassword,
  nowIso,
  pruneSessions,
  publicUser,
  readState,
  verifyPassword,
  writeState,
};
