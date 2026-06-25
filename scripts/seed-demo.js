require('dotenv/config');

const crypto = require('node:crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'unomatch';

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const now = new Date();
const passwordHash = hashPassword(DEMO_PASSWORD);

const users = [
  {
    id: 'user_julia_demo',
    name: 'Julia Teste',
    email: 'julia.teste@unochapeco.edu.br',
    passwordHash,
    age: 20,
    course: 'Sistemas de Informacao',
    bio: 'Perfil de demonstracao para provar app, API publica e banco Railway.',
    interests: ['Tecnologia', 'Cafe', 'Cinema'],
    university: 'UNOCHAPECO',
    distanceKm: 1,
    notificationsEnabled: true,
    showOnlyUniversity: true,
    minAge: 18,
    maxAge: 26,
    maxDistanceKm: 20,
    online: false,
    createdAt: now,
  },
  {
    id: 'user_fabricio_demo',
    name: 'Fabricio Demo',
    email: 'fabricio.demo@unochapeco.edu.br',
    passwordHash,
    age: 22,
    course: 'Sistemas de Informacao',
    bio: 'Segundo perfil de exemplo para demonstrar match e chat.',
    interests: ['Tecnologia', 'Games', 'Musica'],
    university: 'UNOCHAPECO',
    distanceKm: 2,
    notificationsEnabled: true,
    showOnlyUniversity: true,
    minAge: 18,
    maxAge: 26,
    maxDistanceKm: 20,
    online: false,
    createdAt: now,
  },
];

async function main() {
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({ data: users });
  await prisma.swipe.createMany({
    data: [
      {
        id: 'swipe_julia_fabricio_demo',
        fromUserId: 'user_julia_demo',
        toUserId: 'user_fabricio_demo',
        action: 'like',
        createdAt: now,
      },
      {
        id: 'swipe_fabricio_julia_demo',
        fromUserId: 'user_fabricio_demo',
        toUserId: 'user_julia_demo',
        action: 'like',
        createdAt: now,
      },
    ],
  });
  await prisma.match.create({
    data: {
      id: 'match_julia_fabricio_demo',
      userIds: ['user_julia_demo', 'user_fabricio_demo'],
      createdAt: now,
    },
  });
  await prisma.message.createMany({
    data: [
      {
        id: 'message_demo_1',
        matchId: 'match_julia_fabricio_demo',
        senderId: 'user_fabricio_demo',
        text: 'Oi Julia, mensagem salva no Postgres do Railway.',
        readBy: ['user_fabricio_demo'],
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: 'message_demo_2',
        matchId: 'match_julia_fabricio_demo',
        senderId: 'user_julia_demo',
        text: 'Perfeito, isso prova app, API e banco online.',
        readBy: ['user_julia_demo'],
        createdAt: new Date(Date.now() - 1000 * 60 * 4),
      },
    ],
  });

  const [userCount, sessionCount, matchCount, messageCount, swipeCount] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.match.count(),
    prisma.message.count(),
    prisma.swipe.count(),
  ]);

  console.log('Banco limpo e alimentado para demonstracao.');
  console.log(JSON.stringify({
    users: userCount,
    sessions: sessionCount,
    matches: matchCount,
    messages: messageCount,
    swipes: swipeCount,
  }, null, 2));
  console.log('Logins: julia.teste@unochapeco.edu.br / unomatch');
  console.log('        fabricio.demo@unochapeco.edu.br / unomatch');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
