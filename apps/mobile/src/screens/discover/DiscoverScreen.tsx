import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { palette } from '../../theme/colors';
import { api, type EventListItem } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DiscoverScreen({ navigation }: ScreenProps<'Discover'>) {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    return api
      .listEvents('upcoming')
      .then((d) => setEvents(d.events))
      .catch(() => setError('Não foi possível carregar os eventos.'))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
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
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={events}
      keyExtractor={(e) => e.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={palette.primary}
        />
      }
      ListEmptyComponent={
        <Text style={styles.muted}>
          {error ?? 'Nenhum evento próximo. Volte em breve.'}
        </Text>
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
          onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
        >
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {formatDate(item.date)} · {item.venue.city}/{item.venue.state}
          </Text>
          <Text style={styles.venue}>{item.venue.name}</Text>
          <View style={styles.tags}>
            {item.styles.slice(0, 3).map((s) => (
              <View key={s} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
            <View style={styles.flex} />
            <Text style={styles.count}>👥 {item.checkinCount}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 20, paddingBottom: 40 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  name: { color: palette.text, fontSize: 18, fontWeight: '800' },
  meta: { color: palette.primary, fontSize: 13, marginTop: 6, fontWeight: '600' },
  venue: { color: palette.textMuted, fontSize: 13, marginTop: 2 },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  tag: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { color: palette.textMuted, fontSize: 11, fontWeight: '700' },
  flex: { flex: 1 },
  count: { color: palette.textMuted, fontSize: 13 },
  muted: {
    color: palette.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 60,
  },
});
