import 'dotenv/config';
import { PrismaClient, SeloType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Selos de Conector da árvore Drün/Rhän/Thrän — concedidos conforme
// a quantidade de Thräns confirmados (ver jobs/sealVerification).
const CONNECTOR_SELOS = [
  { name: 'Primeiro Broto', emoji: '🌱', min: 1 },
  { name: 'Galho Forte', emoji: '🌿', min: 5 },
  { name: 'Árvore Viva', emoji: '🌳', min: 10 },
  { name: 'Floresta', emoji: '🌲', min: 25 },
  { name: 'Drün Lendário', emoji: '🏔️', min: 50 },
];

async function main() {
  for (const cs of CONNECTOR_SELOS) {
    const existing = await prisma.selo.findFirst({
      where: { name: cs.name, type: SeloType.CONNECTOR },
    });
    if (existing) {
      await prisma.selo.update({
        where: { id: existing.id },
        data: { emoji: cs.emoji, criteria: { minThrans: cs.min } },
      });
    } else {
      await prisma.selo.create({
        data: {
          name: cs.name,
          emoji: cs.emoji,
          type: SeloType.CONNECTOR,
          description: `Concedido ao atingir ${cs.min} Thrän(s) confirmado(s).`,
          criteria: { minThrans: cs.min },
        },
      });
    }
  }
  console.log(`✓ ${CONNECTOR_SELOS.length} selos de conector garantidos.`);

  // Selos de conquista (gerais).
  const ACHIEVEMENT_SELOS = [
    {
      name: 'Primeira Conexão',
      emoji: '🤝',
      description: 'Sua primeira conexão NFC na pista.',
    },
    {
      name: 'Eternizado',
      emoji: '🎞️',
      description: 'Você aprovou sua primeira foto marcada.',
    },
    {
      name: 'No Palco',
      emoji: '🎧',
      description: 'Você entrou no line-up de um evento.',
    },
    {
      name: 'Mão Aberta',
      emoji: '🪙',
      description: 'Você mandou sua primeira gorjeta a um DJ.',
    },
  ];
  for (const as of ACHIEVEMENT_SELOS) {
    const existing = await prisma.selo.findFirst({
      where: { name: as.name, type: SeloType.ACHIEVEMENT },
    });
    if (!existing) {
      await prisma.selo.create({
        data: {
          name: as.name,
          emoji: as.emoji,
          type: SeloType.ACHIEVEMENT,
          description: as.description,
        },
      });
    }
  }
  console.log(`✓ ${ACHIEVEMENT_SELOS.length} selo(s) de conquista garantido(s).`);

  // Origem do Vonue — Tharyck. Sem superior, isOrigin = true.
  const origin = await prisma.user.upsert({
    where: { email: 'tharyck@vonue.app' },
    update: {},
    create: {
      username: 'tharyck',
      name: 'Tharyck',
      email: 'tharyck@vonue.app',
      password: await bcrypt.hash('vonue-origin', 10),
      birthDate: new Date('1995-01-01'),
      gender: 'MASCULINE',
      city: 'São Paulo',
      state: 'SP',
      bio: 'Fundador & Origem do Vonue.',
      isVerified: true,
      isOrigin: true,
    },
  });
  console.log('✓ Usuário origem (tharyck) garantido.');

  // Organizador da origem (auto-provisionado para poder criar eventos).
  const organizer = await prisma.organizer.upsert({
    where: { userId: origin.id },
    update: {},
    create: { userId: origin.id, companyName: 'Vonue Originals', isVerified: true },
  });

  // Evento de exemplo publicado (idempotente por nome).
  const SAMPLE_EVENT = 'Vonue Genesis — Open Air';
  const existingEvent = await prisma.event.findFirst({ where: { name: SAMPLE_EVENT } });
  if (!existingEvent) {
    const venue = await prisma.venue.create({
      data: {
        name: 'Sítio Anhanguera',
        address: 'Estrada do Som, km 12',
        city: 'São Paulo',
        state: 'SP',
        lat: -23.5489,
        lng: -46.6388,
        capacity: 3000,
      },
    });

    const event = await prisma.event.create({
      data: {
        name: SAMPLE_EVENT,
        description: 'A primeira da cena no Vonue. Open air, sunrise garantido.',
        date: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 3600 * 1000),
        venueId: venue.id,
        organizerId: organizer.id,
        styles: ['FULLON', 'PROGRESSIVO', 'DARK_FOREST'],
        isPublished: true,
        capacity: 3000,
      },
    });

    await prisma.selo.create({
      data: {
        name: `Presente: ${SAMPLE_EVENT}`,
        emoji: '🎶',
        type: SeloType.EVENT,
        eventId: event.id,
        description: 'Você esteve no Vonue Genesis.',
      },
    });

    await prisma.ticketType.createMany({
      data: [
        { eventId: event.id, name: '1º Lote', price: 80, quantity: 200 },
        { eventId: event.id, name: '2º Lote', price: 120, quantity: 300 },
        { eventId: event.id, name: 'VIP', price: 250, quantity: 50 },
      ],
    });
    console.log('✓ Evento de exemplo + selo + 3 lotes de ingresso criados.');
  } else {
    console.log('• Evento de exemplo já existe, mantido.');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
