import { prisma } from '../lib/prisma';
import { checkConnectorSelos } from '../services/selo.service';

/**
 * Reconciliação dos selos de conector: reavalia quem tem Thräns, cobrindo
 * qualquer concessão perdida. Idempotente (não renotifica selos antigos).
 */
export async function seloReconcile(): Promise<string> {
  const superiors = await prisma.user.findMany({
    where: { thrans: { some: {} } },
    select: { id: true },
  });

  for (const s of superiors) {
    await checkConnectorSelos(s.id);
  }
  return `${superiors.length} superior(es) reconciliado(s)`;
}
