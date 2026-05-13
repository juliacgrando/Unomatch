const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'unomatch.json');
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

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedState(), null, 2));
  }
}

function readState() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeState(state) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
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
