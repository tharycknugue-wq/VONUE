import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { palette } from '../../theme/colors';
import { api, type UserSelo } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

const TYPE_LABEL: Record<UserSelo['selo']['type'], string> = {
  CONNECTOR: 'Conector',
  EVENT: 'Evento',
  ACHIEVEMENT: 'Conquista',
  SPECIAL: 'Especial',
};

export function SelosScreen(_props: ScreenProps<'Selos'>) {
  const [selos, setSelos] = useState<UserSelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSelos()
      .then((data) => setSelos(data.selos))
      .catch(() => setError('Não foi possível carregar seus selos.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && <Text style={styles.error}>{error}</Text>}

      {!error && selos.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🏅</Text>
          <Text style={styles.emptyText}>
            Você ainda não tem selos. Insira gente na cena e marque presença
            nos eventos para colecionar.
          </Text>
        </View>
      )}

      <View style={styles.grid}>
        {selos.map((us) => (
          <View key={us.id} style={styles.card}>
            <Text style={styles.emoji}>{us.selo.emoji}</Text>
            <Text style={styles.name}>{us.selo.name}</Text>
            {us.selo.description && (
              <Text style={styles.desc} numberOfLines={3}>
                {us.selo.description}
              </Text>
            )}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{TYPE_LABEL[us.selo.type]}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 20, paddingBottom: 40 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  emoji: { fontSize: 40, marginBottom: 8 },
  name: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  desc: {
    color: palette.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: palette.surfaceAlt,
  },
  badgeText: { color: palette.primary, fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyText: {
    color: palette.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  error: { color: palette.danger, fontSize: 14, marginBottom: 16 },
});
