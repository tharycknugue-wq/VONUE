import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma';
import { getRedis } from '../lib/redis';
import { AppError } from '../middlewares/error';
import { awardAchievementByName } from './selo.service';
import { notifySafe } from './notification.service';

// NFC sem hardware: o "toque" carrega uma etiqueta efêmera (token) que o
// outro aparelho lê. Em produção o token viaja na tag NDEF; aqui ele é
// gerado/lido via API. A conexão tem 1h de "arrependimento".
const TOKEN_TTL_SEC = 120;
const REGRET_MS = 60 * 60 * 1000;
const FIRST_CONNECTION_SELO = 'Primeira Conexão';

const PERSON = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
  nucleoType: true,
} as const;

type Person = {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  nucleoType: string | null;
};

async function redis() {
  try {
    return await getRedis();
  } catch {
    throw new AppError(503, 'Conexão NFC indisponível no momento (Redis).');
  }
}

const tokenKey = (token: string) => `nfc:token:${token}`;

export async function createTapToken(userId: string) {
  const token = randomBytes(4).toString('hex').toUpperCase(); // 8 chars
  const client = await redis();
  await client.set(tokenKey(token), userId, { EX: TOKEN_TTL_SEC });
  return { token, expiresInSec: TOKEN_TTL_SEC };
}

type Conn = {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  connectedAt: Date;
  expiresAt: Date;
  sender?: Person;
  receiver?: Person;
};

function deriveState(status: string, expiresAt: Date): 'PENDING' | 'CONFIRMED' | 'REJECTED' {
  if (status === 'REJECTED') return 'REJECTED';
  if (status === 'ACCEPTED') return 'CONFIRMED';
  return Date.now() < expiresAt.getTime() ? 'PENDING' : 'CONFIRMED';
}

function present(conn: Conn, viewerId: string) {
  const initiated = conn.senderId === viewerId;
  const other = initiated ? conn.receiver : conn.sender;
  const state = deriveState(conn.status, conn.expiresAt);
  return {
    id: conn.id,
    otherUser: other ?? null,
    role: initiated ? 'INITIATED' : 'RECEIVED',
    state,
    connectedAt: conn.connectedAt,
    canRegretUntil:
      state === 'PENDING' ? conn.expiresAt : null,
  };
}

export async function connect(userId: string, token: string) {
  const client = await redis();
  const ownerId = await client.get(tokenKey(token.toUpperCase()));
  if (!ownerId) throw new AppError(400, 'Etiqueta NFC inválida ou expirada');
  if (ownerId === userId) {
    throw new AppError(400, 'Não dá pra conectar com você mesmo');
  }
  await client.del(tokenKey(token.toUpperCase())); // uso único

  const existing = await prisma.nFCConnection.findFirst({
    where: {
      OR: [
        { senderId: ownerId, receiverId: userId },
        { senderId: userId, receiverId: ownerId },
      ],
    },
  });

  const expiresAt = new Date(Date.now() + REGRET_MS);
  let conn;
  if (existing) {
    if (existing.status !== 'REJECTED') {
      throw new AppError(409, 'Vocês já estão conectados');
    }
    conn = await prisma.nFCConnection.update({
      where: { id: existing.id },
      data: { status: 'PENDING', connectedAt: new Date(), expiresAt },
      include: { sender: { select: PERSON }, receiver: { select: PERSON } },
    });
  } else {
    conn = await prisma.nFCConnection.create({
      data: { senderId: ownerId, receiverId: userId, status: 'PENDING', expiresAt },
      include: { sender: { select: PERSON }, receiver: { select: PERSON } },
    });
  }

  const seloAwarded = await awardAchievementByName(userId, FIRST_CONNECTION_SELO);
  await awardAchievementByName(ownerId, FIRST_CONNECTION_SELO);

  const connector = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  await notifySafe(ownerId, {
    type: 'NFC',
    title: '📲 Nova conexão',
    body: `${connector?.name ?? 'Alguém'} se conectou com você na pista.`,
    data: { connectionId: conn.id },
  });

  return { connection: present(conn as Conn, userId), seloAwarded };
}

async function loadParticipantConn(userId: string, id: string) {
  const conn = await prisma.nFCConnection.findUnique({ where: { id } });
  if (!conn) throw new AppError(404, 'Conexão não encontrada');
  if (conn.senderId !== userId && conn.receiverId !== userId) {
    throw new AppError(403, 'Você não participa desta conexão');
  }
  return conn;
}

export async function accept(userId: string, id: string) {
  const conn = await loadParticipantConn(userId, id);
  if (conn.status !== 'PENDING') {
    throw new AppError(409, 'Conexão não está pendente');
  }
  const updated = await prisma.nFCConnection.update({
    where: { id },
    data: { status: 'ACCEPTED' },
    include: { sender: { select: PERSON }, receiver: { select: PERSON } },
  });
  return present(updated as Conn, userId);
}

export async function reject(userId: string, id: string) {
  const conn = await loadParticipantConn(userId, id);
  if (conn.status === 'REJECTED') {
    throw new AppError(409, 'Conexão já foi desfeita');
  }
  if (conn.status === 'ACCEPTED') {
    throw new AppError(409, 'Conexão já confirmada — não há arrependimento');
  }
  if (conn.expiresAt.getTime() < Date.now()) {
    throw new AppError(409, 'Janela de arrependimento (1h) encerrada');
  }
  await prisma.nFCConnection.update({
    where: { id },
    data: { status: 'REJECTED' },
  });
  return { id, state: 'REJECTED' as const };
}

export async function listConnections(userId: string) {
  const conns = await prisma.nFCConnection.findMany({
    where: {
      status: { not: 'REJECTED' },
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: { connectedAt: 'desc' },
    include: { sender: { select: PERSON }, receiver: { select: PERSON } },
  });
  return conns.map((c) => present(c as Conn, userId));
}
