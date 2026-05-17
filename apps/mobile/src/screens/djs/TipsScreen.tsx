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
import { api, ApiError, type TipSent, type TipReceived } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

type Tab = 'sent' | 'received';

export function TipsScreen(_props: ScreenProps<'Tips'>) {
  const [tab, setTab] = useState<Tab>('sent');
  const [sent, setSent] = useState<TipSent[]>([]);
  const [received, setReceived] = useState<TipReceived[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .myTips()
      .then((d) => {
        setSent(d.sent);
        setReceived(d.received);
      })
      .catch(() => {
        setSent([]);
        setReceived([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const pay = async (id: string) => {
    setBusy(id);
    try {
      await api.payTip(id);
      load();
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha ao pagar.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.tabs}>
        {(['sent', 'received'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'sent' ? 'Enviadas' : 'Recebidas'}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={palette.primary} style={{ marginTop: 40 }} />
      ) : tab === 'sent' ? (
        sent.length === 0 ? (
          <Text style={styles.empty}>Você ainda não mandou gorjetas.</Text>
        ) : (
          sent.map((t) => (
            <View key={t.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.who}>{t.djName}</Text>
                <Text style={styles.amount}>R$ {t.amount.toFixed(2)}</Text>
              </View>
              {t.message && <Text style={styles.msg}>“{t.message}”</Text>}
              <Text style={styles.status}>
                {t.status === 'PAID' ? 'Paga ✓' : 'Aguardando pagamento'}
              </Text>
              {t.status === 'PENDING' && (
                <Button
                  label="Pagar (sandbox)"
                  onPress={() => pay(t.id)}
                  loading={busy === t.id}
                  style={styles.cta}
                />
              )}
            </View>
          ))
        )
      ) : received.length === 0 ? (
        <Text style={styles.empty}>
          Nenhuma gorjeta recebida. Crie seu perfil de DJ e suba no set.
        </Text>
      ) : (
        received.map((t) => (
          <View key={t.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.who}>{t.fromName}</Text>
              <Text style={styles.amount}>+ R$ {t.netAmount.toFixed(2)}</Text>
            </View>
            {t.message && <Text style={styles.msg}>“{t.message}”</Text>}
            <Text style={styles.status}>
              {t.status === 'PAID' ? 'Recebida ✓' : 'Pendente'}
            </Text>
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
  empty: { color: palette.textMuted, fontSize: 15, textAlign: 'center', marginTop: 50 },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  who: { color: palette.text, fontSize: 16, fontWeight: '800', flex: 1 },
  amount: { color: palette.primary, fontSize: 16, fontWeight: '900', marginLeft: 10 },
  msg: { color: palette.text, fontSize: 14, marginTop: 8, fontStyle: 'italic' },
  status: { color: palette.textMuted, fontSize: 13, marginTop: 8 },
  cta: { marginTop: 14 },
});
