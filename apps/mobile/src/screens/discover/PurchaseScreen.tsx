import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError, type PurchaseResult } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

type Method = 'PIX' | 'CARD';

export function PurchaseScreen({ route, navigation }: ScreenProps<'Purchase'>) {
  const { ticketTypeId, lotName, price, eventName } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState<Method>('PIX');
  const [promoterCode, setPromoterCode] = useState('');
  const [payment, setPayment] = useState<PurchaseResult | null>(null);
  const [loading, setLoading] = useState(false);

  const total = (price * quantity).toFixed(2);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.purchase(
        ticketTypeId,
        quantity,
        method,
        promoterCode.trim() || undefined
      );
      setPayment(res);
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha na compra.');
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!payment) return;
    setLoading(true);
    try {
      const res = await api.confirmPayment(payment.paymentId);
      Alert.alert(
        'Pagamento confirmado',
        `${res.tickets.length} ingresso(s) emitido(s) para ${eventName}.`,
        [{ text: 'Ver meus ingressos', onPress: () => navigation.navigate('Tickets') }]
      );
    } catch (e) {
      Alert.alert(
        'Erro',
        e instanceof ApiError ? e.message : 'Falha ao confirmar.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.event}>{eventName}</Text>
      <Text style={styles.lot}>{lotName}</Text>
      <Text style={styles.price}>R$ {price.toFixed(2)} / un</Text>

      {!payment ? (
        <>
          <Text style={styles.label}>Quantidade</Text>
          <View style={styles.qtyRow}>
            <Pressable
              style={styles.qtyBtn}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Text style={styles.qtySign}>−</Text>
            </Pressable>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <Pressable
              style={styles.qtyBtn}
              onPress={() => setQuantity((q) => Math.min(10, q + 1))}
            >
              <Text style={styles.qtySign}>+</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Pagamento</Text>
          <View style={styles.methodRow}>
            {(['PIX', 'CARD'] as Method[]).map((m) => (
              <Button
                key={m}
                label={m === 'PIX' ? 'Pix' : 'Cartão'}
                variant={method === m ? 'primary' : 'ghost'}
                onPress={() => setMethod(m)}
                style={styles.flex}
              />
            ))}
          </View>

          <Text style={styles.label}>Código de promoter (opcional)</Text>
          <TextInput
            value={promoterCode}
            onChangeText={setPromoterCode}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="cole o código se veio por um promoter"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
          />

          <Text style={styles.total}>Total: R$ {total}</Text>
          <Button
            label="Gerar pagamento"
            onPress={generate}
            loading={loading}
            style={styles.cta}
          />
        </>
      ) : (
        <>
          <View style={styles.payBox}>
            <Text style={styles.payStatus}>PAGAMENTO {payment.status}</Text>
            <Text style={styles.payAmount}>R$ {payment.amount.toFixed(2)}</Text>
            <Text style={styles.payMethod}>
              {payment.method === 'PIX' ? 'Pix — copia e cola' : 'Cartão de crédito'}
            </Text>
            {payment.pix && (
              <Text selectable style={styles.pixCode}>
                {payment.pix.code}
              </Text>
            )}
          </View>
          {payment.provider === 'STRIPE' ? (
            <Text style={styles.sandbox}>
              Pagamento processado pelo Stripe. Conclua o cartão no checkout
              do provedor — a confirmação chega automaticamente pelo webhook.
            </Text>
          ) : (
            <>
              <Text style={styles.sandbox}>
                Ambiente sandbox — nenhuma cobrança real. Toque abaixo para
                simular a confirmação do provedor.
              </Text>
              <Button
                label="Confirmar pagamento (sandbox)"
                onPress={confirm}
                loading={loading}
                style={styles.cta}
              />
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 24, paddingBottom: 48 },
  event: { color: palette.text, fontSize: 22, fontWeight: '900' },
  lot: { color: palette.primary, fontSize: 16, fontWeight: '700', marginTop: 6 },
  price: { color: palette.textMuted, fontSize: 14, marginTop: 2 },
  label: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 28,
    marginBottom: 10,
    letterSpacing: 1,
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    color: palette.text,
    fontSize: 15,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  qtyBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtySign: { color: palette.text, fontSize: 22, fontWeight: '800' },
  qtyValue: { color: palette.text, fontSize: 22, fontWeight: '800', minWidth: 30, textAlign: 'center' },
  methodRow: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  total: { color: palette.text, fontSize: 20, fontWeight: '800', marginTop: 28 },
  cta: { marginTop: 20 },
  payBox: {
    marginTop: 28,
    padding: 20,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.primary,
  },
  payStatus: { color: palette.primary, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  payAmount: { color: palette.text, fontSize: 30, fontWeight: '900', marginTop: 8 },
  payMethod: { color: palette.textMuted, fontSize: 14, marginTop: 4 },
  pixCode: {
    color: palette.text,
    fontSize: 13,
    marginTop: 16,
    fontFamily: 'monospace',
    backgroundColor: palette.surfaceAlt,
    padding: 12,
    borderRadius: 10,
  },
  sandbox: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 18,
    lineHeight: 19,
  },
});
