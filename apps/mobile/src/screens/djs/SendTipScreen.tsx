import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError, type SendTipResult } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

const PRESETS = [5, 10, 20, 50];

export function SendTipScreen({ route, navigation }: ScreenProps<'SendTip'>) {
  const { djId, artistName } = route.params;
  const [amount, setAmount] = useState('10');
  const [message, setMessage] = useState('');
  const [tip, setTip] = useState<SendTipResult | null>(null);
  const [loading, setLoading] = useState(false);

  const value = Number(amount.replace(',', '.'));

  const generate = async () => {
    if (!Number.isFinite(value) || value < 1) {
      Alert.alert('Atenção', 'Valor mínimo R$ 1.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.sendTip(djId, {
        amount: value,
        message: message.trim() || undefined,
      });
      setTip(res);
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha na gorjeta.');
    } finally {
      setLoading(false);
    }
  };

  const pay = async () => {
    if (!tip) return;
    setLoading(true);
    try {
      await api.payTip(tip.tip.id);
      Alert.alert(
        'Gorjeta enviada',
        `${artistName} recebeu R$ ${tip.netAmount.toFixed(2)}. Valeu pela cena!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha no pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Gorjeta para</Text>
      <Text style={styles.artist}>{artistName}</Text>

      {!tip ? (
        <>
          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
          />
          <View style={styles.presets}>
            {PRESETS.map((p) => (
              <Button
                key={p}
                label={`R$ ${p}`}
                variant={value === p ? 'primary' : 'ghost'}
                onPress={() => setAmount(String(p))}
                style={styles.preset}
              />
            ))}
          </View>

          <Text style={styles.label}>Mensagem (opcional)</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={280}
            placeholder="manda aquela!"
            placeholderTextColor={palette.textMuted}
            style={[styles.input, styles.inputMulti]}
          />

          <Button
            label="Gerar gorjeta"
            onPress={generate}
            loading={loading}
            style={styles.cta}
          />
        </>
      ) : (
        <>
          <View style={styles.box}>
            <Row label="Você paga" value={`R$ ${tip.payment.amount.toFixed(2)}`} />
            <Row label="Taxa Vonue (20%)" value={`R$ ${tip.commission.toFixed(2)}`} />
            <Row
              label={`${artistName} recebe`}
              value={`R$ ${tip.netAmount.toFixed(2)}`}
            />
          </View>
          <Text style={styles.sandbox}>
            Ambiente sandbox — sem cobrança real. Confirme para creditar o DJ.
          </Text>
          <Button
            label="Pagar gorjeta (sandbox)"
            onPress={pay}
            loading={loading}
            style={styles.cta}
          />
        </>
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
  title: { color: palette.textMuted, fontSize: 14 },
  artist: { color: palette.text, fontSize: 26, fontWeight: '900', marginTop: 4 },
  label: { color: palette.textMuted, fontSize: 13, marginTop: 26, marginBottom: 8 },
  input: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    color: palette.text,
    fontSize: 18,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12, fontSize: 15 },
  presets: { flexDirection: 'row', gap: 8, marginTop: 12 },
  preset: { flex: 1, height: 42 },
  cta: { marginTop: 28 },
  box: {
    marginTop: 28,
    padding: 18,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.primary,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowLabel: { color: palette.textMuted, fontSize: 14 },
  rowValue: { color: palette.text, fontSize: 15, fontWeight: '700' },
  sandbox: { color: palette.textMuted, fontSize: 13, marginTop: 14, lineHeight: 18 },
});
