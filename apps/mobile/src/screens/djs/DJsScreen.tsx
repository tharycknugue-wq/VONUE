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
import { api, type DJListItem } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

export function DJsScreen({ navigation }: ScreenProps<'DJs'>) {
  const [djs, setDjs] = useState<DJListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .djs()
      .then((d) => setDjs(d.djs))
      .catch(() => setDjs([]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleFollow = async (dj: DJListItem) => {
    setBusy(dj.id);
    try {
      if (dj.isFollowing) await api.unfollowDJ(dj.id);
      else await api.followDJ(dj.id);
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Button
        label="Sou DJ — criar/editar perfil"
        onPress={() => navigation.navigate('BecomeDJ')}
        style={styles.top}
      />

      {loading ? (
        <ActivityIndicator color={palette.primary} style={{ marginTop: 40 }} />
      ) : djs.length === 0 ? (
        <Text style={styles.empty}>Nenhum DJ na cena ainda.</Text>
      ) : (
        djs.map((dj) => (
          <Pressable
            key={dj.id}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.navigate('DJDetail', { djId: dj.id })}
          >
            <Text style={styles.pos}>#{dj.position}</Text>
            <View style={styles.flex}>
              <Text style={styles.name}>{dj.artistName}</Text>
              <Text style={styles.meta}>
                {dj.style.slice(0, 3).join(' · ') || 'sem estilo'} · 👥{' '}
                {dj.followerCount} · 🎧 {dj.lineupCount}
              </Text>
            </View>
            <Button
              label={dj.isFollowing ? 'Seguindo' : 'Seguir'}
              variant={dj.isFollowing ? 'ghost' : 'primary'}
              onPress={() => toggleFollow(dj)}
              loading={busy === dj.id}
              style={styles.followBtn}
            />
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 20, paddingBottom: 40 },
  top: { marginBottom: 18 },
  empty: { color: palette.textMuted, fontSize: 15, textAlign: 'center', marginTop: 50 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  pos: { color: palette.primary, fontSize: 18, fontWeight: '900', width: 38 },
  flex: { flex: 1 },
  name: { color: palette.text, fontSize: 16, fontWeight: '800' },
  meta: { color: palette.textMuted, fontSize: 12, marginTop: 4 },
  followBtn: { width: 104, height: 40 },
});
