import { releaseExpiredEscrow } from '../services/store.service';

/** Libera o escrow de pedidos pagos há mais de 48h sem disputa. */
export async function escrowAutoRelease(): Promise<string> {
  const released = await releaseExpiredEscrow();
  return released > 0 ? `${released} pedido(s) liberado(s)` : 'nada a liberar';
}
