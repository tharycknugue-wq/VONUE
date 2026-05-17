import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, type StoreProduct } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

export function StoreScreen({ navigation }: ScreenProps<'Store'>) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api
      .storeProducts()
      .then((d) => setProducts(d.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.actions}>
        <Button
          label="Vender um produto"
          onPress={() => navigation.navigate('SellProduct')}
          style={styles.flex}
        />
        <Button
          label="Meus pedidos"
          variant="ghost"
          onPress={() => navigation.navigate('Orders')}
          style={styles.flex}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={palette.primary} style={{ marginTop: 40 }} />
      ) : products.length === 0 ? (
        <Text style={styles.muted}>
          Nenhum produto à venda. Seja o primeiro a anunciar.
        </Text>
      ) : (
        products.map((p) => (
          <Pressable
            key={p.id}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}
          >
            <View style={styles.flex}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.seller}>
                por {p.seller?.name ?? 'vendedor'} ·{' '}
                {p.eventId ? 'produto de evento' : 'terceiro'}
              </Text>
              <Text style={styles.stock}>
                {p.stock > 0 ? `${p.stock} em estoque` : 'esgotado'}
              </Text>
            </View>
            <Text style={styles.price}>R$ {p.price.toFixed(2)}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 20, paddingBottom: 40 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  flex: { flex: 1 },
  muted: { color: palette.textMuted, fontSize: 15, textAlign: 'center', marginTop: 50 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  name: { color: palette.text, fontSize: 16, fontWeight: '800' },
  seller: { color: palette.textMuted, fontSize: 13, marginTop: 4 },
  stock: { color: palette.textMuted, fontSize: 12, marginTop: 2 },
  price: { color: palette.primary, fontSize: 18, fontWeight: '900' },
});
