import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError, type WalletData, type LedgerType } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

const ICON: Record<LedgerType, string> = {
  SALE: '🛍️',
  TIP: '🪙',
  TICKET: '🎟️',
  WITHDRAWAL: '🏦',
};

export function WalletScreen(_props: ScreenProps<'Wallet'>) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api
      .wallet()
      .then(setWallet)
      .catch(() => setWallet(null))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const doWithdraw = async () => {
    const value = Number(amount.replace(',', '.'));
    if (!Number.isFinite(value) || value < 1) {
      Alert.alert('Atenção', 'Informe um valor de no mínimo R$ 1.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.withdraw(value);
      setAmount('');
      Alert.alert(
        'Saque realizado',
        `R$ ${res.amount.toFixed(2)} transferidos (sandbox). Saldo: R$ ${res.available.toFixed(2)}.`
      );
      load();
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha no saque.');
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
  if (!wallet) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.muted}>Não foi possível carregar a carteira.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.balanceBox}>
        <Text style={styles.balanceLabel}>SALDO DISPONÍVEL</Text>
        <Text style={styles.balance}>R$ {wallet.available.toFixed(2)}</Text>
        <Text style={styles.sub}>
          Recebido R$ {wallet.totalEarned.toFixed(2)} · Sacado R${' '}
          {wallet.totalWithdrawn.toFixed(2)}
        </Text>
      </View>

      <Text style={styles.label}>Sacar (sandbox)</Text>
      <View style={styles.withdrawRow}>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0,00"
          placeholderTextColor={palette.textMuted}
          style={styles.input}
        />
        <Button
          label="Sacar"
          onPress={doWithdraw}
          loading={busy}
          style={styles.withdrawBtn}
        />
      </View>

      <Text style={styles.label}>Extrato</Text>
      {wallet.entries.length === 0 ? (
        <Text style={styles.muted}>Sem movimentações ainda.</Text>
      ) : (
        wallet.entries.map((e) => {
          const isOut = e.type === 'WITHDRAWAL';
          return (
            <View key={e.id} style={styles.entry}>
              <Text style={styles.entryIcon}>{ICON[e.type]}</Text>
              <View style={styles.flex}>
                <Text style={styles.entryDesc}>{e.description}</Text>
                <Text style={styles.entryDate}>
                  {new Date(e.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={[styles.entryAmount, isOut ? styles.out : styles.in]}>
                {isOut ? '−' : '+'} R$ {e.amount.toFixed(2)}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 20, paddingBottom: 40 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: palette.textMuted, fontSize: 15, marginTop: 12 },
  balanceBox: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
  },
  balanceLabel: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
  },
  balance: {
    color: palette.text,
    fontSize: 38,
    fontWeight: '900',
    marginTop: 8,
  },
  sub: { color: palette.textMuted, fontSize: 13, marginTop: 8 },
  label: {
    color: palette.textMuted,
    fontSize: 13,
    letterSpacing: 1,
    marginTop: 28,
    marginBottom: 10,
  },
  withdrawRow: { flexDirection: 'row', gap: 12 },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    color: palette.text,
    fontSize: 18,
  },
  withdrawBtn: { width: 110 },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  entryIcon: { fontSize: 20 },
  flex: { flex: 1 },
  entryDesc: { color: palette.text, fontSize: 14, fontWeight: '600' },
  entryDate: { color: palette.textMuted, fontSize: 12, marginTop: 2 },
  entryAmount: { fontSize: 15, fontWeight: '800' },
  in: { color: palette.success },
  out: { color: palette.danger },
});
