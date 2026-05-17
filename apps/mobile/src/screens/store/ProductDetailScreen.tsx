import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import {
  api,
  ApiError,
  type StoreProduct,
  type CreateOrderResult,
} from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

export function ProductDetailScreen({ route, navigation }: ScreenProps<'ProductDetail'>) {
  const { productId } = route.params;
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<CreateOrderResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .storeProduct(productId)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  const createOrder = async () => {
    setBusy(true);
    try {
      const res = await api.createStoreOrder([{ productId, quantity: 1 }]);
      setOrder(res);
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha ao criar pedido.');
    } finally {
      setBusy(false);
    }
  };

  const pay = async () => {
    if (!order) return;
    setBusy(true);
    try {
      await api.payStoreOrder(order.order.id);
      Alert.alert(
        'Pagamento em escrow',
        'O valor fica retido até você confirmar o recebimento (ou liberar em 48h).',
        [{ text: 'Ver meus pedidos', onPress: () => navigation.navigate('Orders') }]
      );
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha no pagamento.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }
  if (!product) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.muted}>Produto não encontrado.</Text>
      </View>
    );
  }

  const soldOut = product.stock <= 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>
      <Text style={styles.seller}>
        Vendido por {product.seller?.name ?? 'vendedor'} ·{' '}
        {product.eventId ? 'produto de evento (10%)' : 'terceiro (12%)'}
      </Text>
      {product.description && (
        <Text style={styles.desc}>{product.description}</Text>
      )}
      <Text style={styles.stock}>
        {soldOut ? 'Esgotado' : `${product.stock} em estoque`}
      </Text>

      {!order ? (
        <Button
          label={soldOut ? 'Esgotado' : 'Comprar'}
          onPress={createOrder}
          loading={busy}
          disabled={soldOut}
          style={styles.cta}
        />
      ) : (
        <View style={styles.summary}>
          <Text style={styles.sumTitle}>Resumo do pedido</Text>
          <Row label="Total" value={`R$ ${order.order.total.toFixed(2)}`} />
          <Row label="Comissão Vonue" value={`R$ ${order.commission.toFixed(2)}`} />
          <Row
            label="Vendedor recebe"
            value={`R$ ${order.sellerPayout.toFixed(2)}`}
          />
          <Text style={styles.escrowNote}>
            Pagamento sandbox — o valor fica em escrow até a confirmação.
          </Text>
          <Button
            label="Pagar (sandbox)"
            onPress={pay}
            loading={busy}
            style={styles.cta}
          />
        </View>
      )}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 24, paddingBottom: 48 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: palette.textMuted, fontSize: 15 },
  name: { color: palette.text, fontSize: 24, fontWeight: '900' },
  price: { color: palette.primary, fontSize: 22, fontWeight: '900', marginTop: 10 },
  seller: { color: palette.textMuted, fontSize: 14, marginTop: 8 },
  desc: { color: palette.text, fontSize: 15, lineHeight: 22, marginTop: 18 },
  stock: { color: palette.textMuted, fontSize: 13, marginTop: 16 },
  cta: { marginTop: 24 },
  summary: {
    marginTop: 24,
    padding: 18,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.primary,
  },
  sumTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLabel: { color: palette.textMuted, fontSize: 14 },
  rowValue: { color: palette.text, fontSize: 14, fontWeight: '700' },
  escrowNote: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: 12,
    lineHeight: 17,
  },
});
