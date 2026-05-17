import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { palette } from '../../theme/colors';
import { api, type SearchResults } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

export function SearchScreen({ navigation }: ScreenProps<'Search'>) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(() => {
      api
        .search(term)
        .then(setResults)
        .catch(() => setResults(null))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [q]);

  const empty =
    results &&
    results.events.length === 0 &&
    results.djs.length === 0 &&
    results.products.length === 0;

  return (
    <View style={styles.container}>
      <TextInput
        value={q}
        onChangeText={setQ}
        autoFocus
        autoCorrect={false}
        placeholder="Buscar eventos, DJs, produtos…"
        placeholderTextColor={palette.textMuted}
        style={styles.input}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {loading && (
          <ActivityIndicator color={palette.primary} style={{ marginTop: 30 }} />
        )}

        {!loading && q.trim().length < 2 && (
          <Text style={styles.hint}>Digite ao menos 2 caracteres.</Text>
        )}

        {!loading && empty && (
          <Text style={styles.hint}>Nada encontrado para “{results?.query}”.</Text>
        )}

        {!loading && results && results.events.length > 0 && (
          <>
            <Text style={styles.section}>EVENTOS</Text>
            {results.events.map((e) => (
              <Pressable
                key={e.id}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => navigation.navigate('EventDetail', { eventId: e.id })}
              >
                <Text style={styles.rowTitle}>🎉 {e.name}</Text>
                <Text style={styles.rowSub}>
                  {new Date(e.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  })}{' '}
                  · {e.city}/{e.state}
                </Text>
              </Pressable>
            ))}
          </>
        )}

        {!loading && results && results.djs.length > 0 && (
          <>
            <Text style={styles.section}>DJS</Text>
            {results.djs.map((d) => (
              <Pressable
                key={d.id}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => navigation.navigate('DJDetail', { djId: d.id })}
              >
                <Text style={styles.rowTitle}>🎧 {d.artistName}</Text>
                <Text style={styles.rowSub}>
                  {d.style.slice(0, 3).join(' · ') || 'sem estilo'} · ⭐{' '}
                  {d.rankScore}
                </Text>
              </Pressable>
            ))}
          </>
        )}

        {!loading && results && results.products.length > 0 && (
          <>
            <Text style={styles.section}>PRODUTOS</Text>
            {results.products.map((p) => (
              <Pressable
                key={p.id}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() =>
                  navigation.navigate('ProductDetail', { productId: p.id })
                }
              >
                <Text style={styles.rowTitle}>🛍️ {p.name}</Text>
                <Text style={styles.rowSub}>R$ {p.price.toFixed(2)}</Text>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 20 },
  input: {
    height: 50,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    color: palette.text,
    fontSize: 16,
  },
  content: { paddingVertical: 16, paddingBottom: 40 },
  hint: {
    color: palette.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  section: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 10,
  },
  row: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  pressed: { opacity: 0.7 },
  rowTitle: { color: palette.text, fontSize: 15, fontWeight: '700' },
  rowSub: { color: palette.textMuted, fontSize: 13, marginTop: 4 },
});
