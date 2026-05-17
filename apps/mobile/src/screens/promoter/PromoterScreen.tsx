import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { palette } from '../../theme/colors';
import { api } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

type MyPromoter = Awaited<ReturnType<typeof api.myPromoter>>;

export function PromoterScreen(_props: ScreenProps<'Promoter'>) {
  const [data, setData] = useState<MyPromoter | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api
      .myPromoter()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }

  if (!data || !data.isPromoter) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.empty}>
          Você ainda não é promoter. Um organizador precisa te credenciar num
          evento.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>SEU CÓDIGO DE PROMOTER</Text>
        <Text selectable style={styles.code}>
          {data.code}
        </Text>
        <Text style={styles.sales}>
          {data.totalSales} ingresso(s) vendido(s) por você
        </Text>
      </View>

      <Text style={styles.section}>EVENTOS QUE VOCÊ PROMOVE</Text>
      {data.events.length === 0 ? (
        <Text style={styles.empty}>Nenhum evento ainda.</Text>
      ) : (
        data.events.map((e) => (
          <View key={e.eventId} style={styles.card}>
            <Text style={styles.eventName}>{e.eventName}</Text>
            <Text style={styles.meta}>
              {new Date(e.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}{' '}
              · comissão {(e.commission * 100).toFixed(0)}%
            </Text>
          </View>
        ))
      )}

      <Text style={styles.hint}>
        Divulgue seu código. Quem informar ele na compra gera sua comissão,
        creditada na Carteira.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 20, paddingBottom: 40 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: {
    color: palette.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeBox: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
  },
  codeLabel: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
  },
  code: {
    color: palette.primary,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginTop: 10,
    textAlign: 'center',
  },
  sales: { color: palette.text, fontSize: 14, marginTop: 12, fontWeight: '700' },
  section: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 12,
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  eventName: { color: palette.text, fontSize: 15, fontWeight: '700' },
  meta: { color: palette.textMuted, fontSize: 13, marginTop: 4 },
  hint: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 24,
    lineHeight: 19,
  },
});
