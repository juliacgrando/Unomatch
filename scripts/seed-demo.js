require('dotenv/config');

const crypto = require('node:crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PASSWORD = 'unomatch';
const NOW = Date.now();

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function daysAgo(days) {
  return new Date(NOW - days * 24 * 60 * 60 * 1000);
}

function minutesAgo(minutes) {
  return new Date(NOW - minutes * 60 * 1000);
}

const passwordHash = hashPassword(PASSWORD);

const women = [
  ['user_julia', 'Julia Teste', 'julia.teste@unochapeco.edu.br', 20, 'Sistemas de Informacao', 'Curto tecnologia, cafe e filmes depois da aula.', ['Tecnologia', 'Cafe', 'Cinema']],
  ['user_amanda', 'Amanda Martins', 'amanda.martins@unochapeco.edu.br', 21, 'Direito', 'Gosto de trilhas, leitura e conversa boa.', ['Trilhas', 'Leitura', 'Cafe']],
  ['user_carolina', 'Carolina Silva', 'carolina.silva@unochapeco.edu.br', 20, 'Medicina', 'Musica ao vivo, viagens e fotografia.', ['Musica', 'Viagem', 'Fotografia']],
  ['user_larissa', 'Larissa Costa', 'larissa.costa@unochapeco.edu.br', 22, 'Psicologia', 'Amo podcasts, academia e roles tranquilos.', ['Podcasts', 'Academia', 'Psicologia']],
  ['user_beatriz', 'Beatriz Souza', 'beatriz.souza@unochapeco.edu.br', 19, 'Arquitetura', 'Design, exposicoes e cafe gelado.', ['Design', 'Arte', 'Cafe']],
  ['user_manuela', 'Manuela Reis', 'manuela.reis@unochapeco.edu.br', 23, 'Enfermagem', 'Sou de boas, curto musica e voluntariado.', ['Musica', 'Voluntariado', 'Series']],
  ['user_rafaela', 'Rafaela Lima', 'rafaela.lima@unochapeco.edu.br', 21, 'Administracao', 'Gosto de empreendedorismo e praia no fim de semana.', ['Empreender', 'Praia', 'Marketing']],
  ['user_isadora', 'Isadora Klein', 'isadora.klein@unochapeco.edu.br', 20, 'Odontologia', 'Treino, estudo e nao recuso sushi.', ['Academia', 'Sushi', 'Saude']],
  ['user_gabriela', 'Gabriela Alves', 'gabriela.alves@unochapeco.edu.br', 24, 'Publicidade', 'Criativa, curiosa e apaixonada por fotografia.', ['Fotografia', 'Design', 'Cinema']],
  ['user_luana', 'Luana Ferreira', 'luana.ferreira@unochapeco.edu.br', 22, 'Pedagogia', 'Livros, natureza e conversas sem pressa.', ['Livros', 'Natureza', 'Educacao']],
  ['user_marina', 'Marina Lopes', 'marina.lopes@unochapeco.edu.br', 21, 'Biomedicina', 'Gosto de laboratorio, series e caminhada.', ['Series', 'Caminhada', 'Ciencia']],
  ['user_camila', 'Camila Duarte', 'camila.duarte@unochapeco.edu.br', 23, 'Fisioterapia', 'Esporte, saude e chimarrao.', ['Esporte', 'Saude', 'Chimarrao']],
  ['user_ana', 'Ana Clara Nunes', 'ana.nunes@unochapeco.edu.br', 19, 'Jornalismo', 'Escrevo, fotografo e adoro conhecer gente.', ['Escrita', 'Fotografia', 'Noticias']],
  ['user_thais', 'Thais Ribeiro', 'thais.ribeiro@unochapeco.edu.br', 22, 'Engenharia Civil', 'Obras, calculos e roles culturais.', ['Engenharia', 'Arte', 'Musica']],
  ['user_vitoria', 'Vitoria Gomes', 'vitoria.gomes@unochapeco.edu.br', 20, 'Nutricionismo', 'Receitas, treino e vida universitaria.', ['Receitas', 'Treino', 'Saude']],
];

const men = [
  ['user_fabricio', 'Fabricio Demo', 'fabricio.demo@unochapeco.edu.br', 22, 'Sistemas de Informacao', 'Tecnologia, games e cafe antes da aula.', ['Tecnologia', 'Games', 'Cafe']],
  ['user_bruno', 'Bruno Almeida', 'bruno.almeida@unochapeco.edu.br', 23, 'Sistemas de Informacao', 'Codigo, academia e ficcao cientifica.', ['Tech', 'Academia', 'Cinema']],
  ['user_diego', 'Diego Rocha', 'diego.rocha@unochapeco.edu.br', 22, 'Arquitetura', 'Design, arte visual e musica indie.', ['Design', 'Arte', 'Musica']],
  ['user_pedro', 'Pedro Henrique', 'pedro.henrique@unochapeco.edu.br', 21, 'Direito', 'Debate, futebol e churrasco com amigos.', ['Futebol', 'Direito', 'Churrasco']],
  ['user_lucas', 'Lucas Pereira', 'lucas.pereira@unochapeco.edu.br', 24, 'Educacao Fisica', 'Treino, corrida e trilhas.', ['Corrida', 'Trilhas', 'Academia']],
  ['user_mateus', 'Mateus Santos', 'mateus.santos@unochapeco.edu.br', 20, 'Administracao', 'Negocios, musica e resenha leve.', ['Negocios', 'Musica', 'Marketing']],
  ['user_gustavo', 'Gustavo Moreira', 'gustavo.moreira@unochapeco.edu.br', 23, 'Medicina Veterinaria', 'Campo, estudos e rock classico.', ['Campo', 'Rock', 'Estudos']],
  ['user_joao', 'Joao Vitor', 'joao.vitor@unochapeco.edu.br', 22, 'Engenharia de Software', 'Projetos, startups e basquete.', ['Startups', 'Basquete', 'Codigo']],
  ['user_renan', 'Renan Oliveira', 'renan.oliveira@unochapeco.edu.br', 25, 'Contabeis', 'Planilhas, investimentos e cinema.', ['Financas', 'Cinema', 'Cafe']],
  ['user_caio', 'Caio Mendes', 'caio.mendes@unochapeco.edu.br', 21, 'Design', 'UI, ilustracao e shows pequenos.', ['UI', 'Ilustracao', 'Shows']],
];

const users = [...women, ...men].map(([id, name, email, age, course, bio, interests], index) => ({
  id,
  name,
  email,
  passwordHash,
  age,
  course,
  bio,
  interests,
  university: 'UNOCHAPECO',
  distanceKm: (index % 9) + 1,
  notificationsEnabled: true,
  showOnlyUniversity: true,
  minAge: 18,
  maxAge: 26,
  maxDistanceKm: 20,
  online: index % 3 !== 0,
  createdAt: daysAgo(25 - index),
}));

const chatPartners = [
  'user_fabricio',
  'user_bruno',
  'user_diego',
  'user_pedro',
  'user_lucas',
  'user_joao',
  'user_amanda',
  'user_carolina',
  'user_larissa',
  'user_beatriz',
];

const swipes = chatPartners.flatMap((partnerId, index) => [
  {
    id: `swipe_julia_${partnerId}`,
    fromUserId: 'user_julia',
    toUserId: partnerId,
    action: 'like',
    createdAt: daysAgo(10 - index * 0.3),
  },
  {
    id: `swipe_${partnerId}_julia`,
    fromUserId: partnerId,
    toUserId: 'user_julia',
    action: 'like',
    createdAt: daysAgo(9 - index * 0.3),
  },
]);

const matches = chatPartners.map((partnerId, index) => ({
  id: `match_julia_${partnerId.replace('user_', '')}`,
  userIds: ['user_julia', partnerId],
  createdAt: daysAgo(8 - index * 0.4),
}));

const messageTexts = [
  ['Oi Julia, vi que voce tambem curte tecnologia.', 'Sim! Estou testando o Unomatch para um trabalho.'],
  ['Bora tomar um cafe na UNO essa semana?', 'Bora, depois da aula fica perfeito.'],
  ['Curti teu perfil, principalmente a parte de cinema.', 'Tambem vivo procurando filme novo pra assistir.'],
  ['Voce vai no evento do campus?', 'Vou sim, acho que vai ser legal para conhecer gente.'],
  ['Match novo por aqui.', 'Agora o chat ja esta funcionando de verdade.'],
  ['Teu curso parece muito massa.', 'E puxado, mas eu gosto bastante.'],
  ['Tambem gosto de trilhas.', 'Entao ja temos assunto para a primeira conversa.'],
  ['Vi que voce curte fotografia.', 'Sim, principalmente no campus e em viagens.'],
  ['Essa demonstracao ficou bem completa.', 'Tomara que o professor curta tambem.'],
  ['Oi, tudo bem?', 'Tudo certo, testando mensagens pelo backend online.'],
];

const messages = matches.flatMap((match, index) => {
  const partnerId = match.userIds[1];
  const [first, second] = messageTexts[index];

  return [
    {
      id: `message_${index}_a`,
      matchId: match.id,
      senderId: partnerId,
      text: first,
      readBy: [partnerId],
      createdAt: minutesAgo(240 - index * 15),
    },
    {
      id: `message_${index}_b`,
      matchId: match.id,
      senderId: 'user_julia',
      text: second,
      readBy: ['user_julia'],
      createdAt: minutesAgo(230 - index * 15),
    },
  ];
});

async function main() {
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({ data: users });
  await prisma.swipe.createMany({ data: swipes });
  await prisma.match.createMany({ data: matches });
  await prisma.message.createMany({ data: messages });

  console.log(`Banco limpo e alimentado com ${users.length} usuarios demo.`);
  console.log('Mulheres: 15 | Homens: 10 | Senha de todos: unomatch');
  console.log('Login recomendado: julia.teste@unochapeco.edu.br');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
