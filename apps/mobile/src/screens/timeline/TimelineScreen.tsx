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
import { api, type TimelineItem } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export function TimelineScreen(_props: ScreenProps<'Timeline'>) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api
      .timeline()
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {items.length === 0 ? (
        <Text style={styles.empty}>
          Sua história na cena começa agora. Faça check-in num evento.
        </Text>
      ) : (
        items.map((it, idx) => (
          <View key={it.id} style={styles.row}>
            <View style={styles.railCol}>
              <Text style={styles.icon}>{it.icon}</Text>
              {idx < items.length - 1 && <View style={styles.rail} />}
            </View>
            <View style={styles.card}>
              <Text style={styles.title}>{it.title}</Text>
              {it.subtitle && <Text style={styles.subtitle}>{it.subtitle}</Text>}
              <Text style={styles.time}>{timeAgo(it.at)}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 20, paddingBottom: 40 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  empty: {
    color: palette.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 60,
    lineHeight: 22,
  },
  row: { flexDirection: 'row', gap: 14 },
  railCol: { alignItems: 'center', width: 32 },
  icon: { fontSize: 22 },
  rail: {
    flex: 1,
    width: 2,
    backgroundColor: palette.border,
    marginTop: 4,
    marginBottom: 4,
  },
  card: {
    flex: 1,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  title: { color: palette.text, fontSize: 15, fontWeight: '700' },
  subtitle: { color: palette.textMuted, fontSize: 13, marginTop: 4 },
  time: { color: palette.textMuted, fontSize: 12, marginTop: 8 },
});
