import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError, type StoreOrder, type OrderStatus } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

const STATUS: Record<OrderStatus, string> = {
  PENDING: 'Aguardando pagamento',
  PAID: 'Em escrow',
  DELIVERED: 'Liberado',
  DISPUTED: 'Em disputa',
  REFUNDED: 'Estornado',
};

type Tab = 'buy' | 'sell';

export function OrdersScreen(_props: ScreenProps<'Orders'>) {
  const [tab, setTab] = useState<Tab>('buy');
  const [buys, setBuys] = useState<StoreOrder[]>([]);
  const [sales, setSales] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([api.myStoreOrders(), api.myStoreSales()])
      .then(([o, s]) => {
        setBuys(o.orders);
        setSales(s.orders);
      })
      .catch(() => {
        setBuys([]);
        setSales([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const act = async (
    id: string,
    fn: (id: string) => Promise<unknown>,
    okMsg: string
  ) => {
    setBusy(id);
    try {
      await fn(id);
      Alert.alert('Pronto', okMsg);
      load();
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Ação falhou.');
    } finally {
      setBusy(null);
    }
  };

  const list = tab === 'buy' ? buys : sales;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.tabs}>
        {(['buy', 'sell'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'buy' ? 'Compras' : 'Vendas'}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={palette.primary} style={{ marginTop: 40 }} />
      ) : list.length === 0 ? (
        <Text style={styles.muted}>
          {tab === 'buy' ? 'Você ainda não comprou nada.' : 'Nenhuma venda ainda.'}
        </Text>
      ) : (
        list.map((o) => (
          <View key={o.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.title}>
                {o.items.map((i) => `${i.quantity}× ${i.product.name}`).join(', ')}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{STATUS[o.status]}</Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {tab === 'buy'
                ? `Vendedor: ${o.seller?.name ?? '—'}`
                : `Comprador: ${o.buyer?.name ?? '—'}`}
            </Text>
            <Text style={styles.meta}>
              Total R$ {o.total.toFixed(2)} · comissão R$ {o.commission.toFixed(2)} ·{' '}
              {tab === 'sell' ? 'você recebe' : 'vendedor recebe'} R${' '}
              {o.sellerPayout.toFixed(2)}
            </Text>

            {tab === 'buy' && o.status === 'PENDING' && (
              <Button
                label="Pagar (sandbox)"
                onPress={() =>
                  act(o.id, api.payStoreOrder, 'Pagamento em escrow.')
                }
                loading={busy === o.id}
                style={styles.cta}
              />
            )}
            {tab === 'buy' && o.status === 'PAID' && (
              <View style={styles.actions}>
                <Button
                  label="Confirmar entrega"
                  onPress={() =>
                    act(o.id, api.confirmStoreOrder, 'Valor liberado ao vendedor.')
                  }
                  loading={busy === o.id}
                  style={styles.flex}
                />
                <Button
                  label="Abrir disputa"
                  variant="ghost"
                  onPress={() =>
                    act(o.id, api.disputeStoreOrder, 'Pedido em revisão.')
                  }
                  loading={busy === o.id}
                  style={styles.flex}
                />
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 20, paddingBottom: 40 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: palette.surfaceAlt },
  tabText: { color: palette.textMuted, fontWeight: '700' },
  tabTextActive: { color: palette.primary },
  muted: { color: palette.textMuted, fontSize: 15, textAlign: 'center', marginTop: 50 },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { color: palette.text, fontSize: 15, fontWeight: '800', flex: 1 },
  badge: {
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 10,
  },
  badgeText: { color: palette.primary, fontSize: 11, fontWeight: '700' },
  meta: { color: palette.textMuted, fontSize: 13, marginTop: 8 },
  cta: { marginTop: 14 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 14 },
  flex: { flex: 1 },
});
