import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import { notifySafe } from './notification.service';

export type LedgerType = 'SALE' | 'TIP' | 'TICKET' | 'WITHDRAWAL';

export interface LedgerRef {
  refType?: string;
  refId?: string;
}

export async function getOrCreateWallet(userId: string) {
  return prisma.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

/**
 * Credita o repasse líquido de uma venda/gorjeta/ingresso na carteira do
 * usuário, registrando a entrada no ledger (tudo numa transação).
 * Não lança em valor não-positivo — apenas ignora.
 */
export async function credit(
  userId: string,
  amount: number,
  type: Exclude<LedgerType, 'WITHDRAWAL'>,
  description: string,
  ref: LedgerRef = {}
): Promise<void> {
  if (amount <= 0) return;
  const rounded = Number(amount.toFixed(2));

  await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        type,
        amount: rounded,
        description,
        refType: ref.refType,
        refId: ref.refId,
      },
    });
    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        available: { increment: rounded },
        totalEarned: { increment: rounded },
      },
    });
  });

  await notifySafe(userId, {
    type: 'SYSTEM',
    title: '💰 Saldo creditado',
    body: `+ R$ ${rounded.toFixed(2)} — ${description}`,
    data: ref.refId ? { refId: ref.refId } : undefined,
  });
}

export async function withdraw(userId: string, amount: number) {
  const rounded = Number(amount.toFixed(2));
  if (rounded <= 0) throw new AppError(400, 'Informe um valor válido');

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.available < rounded) {
      throw new AppError(400, 'Saldo insuficiente para saque');
    }
    const withdrawal = await tx.withdrawal.create({
      data: { walletId: wallet.id, amount: rounded, status: 'PAID' },
    });
    await tx.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        type: 'WITHDRAWAL',
        amount: rounded,
        description: 'Saque (sandbox)',
        refType: 'withdrawal',
        refId: withdrawal.id,
      },
    });
    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        available: { decrement: rounded },
        totalWithdrawn: { increment: rounded },
      },
    });
    return {
      withdrawalId: withdrawal.id,
      amount: rounded,
      available: Number((wallet.available - rounded).toFixed(2)),
    };
  });
}

export async function getWallet(userId: string) {
  const wallet = await getOrCreateWallet(userId);
  const entries = await prisma.ledgerEntry.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return {
    available: wallet.available,
    totalEarned: wallet.totalEarned,
    totalWithdrawn: wallet.totalWithdrawn,
    entries,
  };
}
