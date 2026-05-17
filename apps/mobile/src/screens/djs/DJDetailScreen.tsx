import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import {
  api,
  type DJProfile,
  type EventReview,
  type ReviewAggregate,
} from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

export function DJDetailScreen({ route, navigation }: ScreenProps<'DJDetail'>) {
  const { djId } = route.params;
  const [dj, setDj] = useState<DJProfile | null>(null);
  const [reviews, setReviews] = useState<{
    aggregate: ReviewAggregate;
    reviews: EventReview[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    Promise.all([api.dj(djId), api.djReviews(djId)])
      .then(([d, r]) => {
        setDj(d);
        setReviews(r);
      })
      .catch(() => setDj(null))
      .finally(() => setLoading(false));
  }, [djId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggle = async () => {
    if (!dj) return;
    setBusy(true);
    try {
      if (dj.isFollowing) await api.unfollowDJ(dj.id);
      else await api.followDJ(dj.id);
      load();
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
  if (!dj) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.muted}>DJ não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.name}>{dj.artistName}</Text>
      <Text style={styles.handle}>@{dj.user.username}</Text>
      <Text style={styles.score}>
        ⭐ {dj.rankScore} pts · 👥 {dj.followerCount} seguidores
      </Text>
      {dj.tipCount > 0 && (
        <Text style={styles.tips}>
          🪙 {dj.tipCount} gorjeta(s) · R$ {dj.tipNetTotal.toFixed(2)} recebidos
        </Text>
      )}

      <View style={styles.tags}>
        {dj.style.map((s) => (
          <View key={s} style={styles.tag}>
            <Text style={styles.tagText}>{s}</Text>
          </View>
        ))}
      </View>

      {dj.bpm && <Text style={styles.muted}>BPM {dj.bpm}</Text>}
      {dj.country && <Text style={styles.muted}>{dj.country}</Text>}
      {dj.bio && <Text style={styles.bio}>{dj.bio}</Text>}

      <Button
        label={dj.isFollowing ? 'Deixar de seguir' : 'Seguir'}
        variant={dj.isFollowing ? 'ghost' : 'primary'}
        onPress={toggle}
        loading={busy}
        style={styles.followBtn}
      />
      <Button
        label="💸 Mandar gorjeta"
        variant="ghost"
        onPress={() =>
          navigation.navigate('SendTip', {
            djId: dj.id,
            artistName: dj.artistName,
          })
        }
        style={styles.tipBtn}
      />

      <Text style={styles.section}>Reputação</Text>
      <Text style={styles.rating}>
        {dj.reviewCount > 0
          ? `★ ${dj.reviewAverage.toFixed(1)} · ${dj.reviewCount} avaliação(ões)`
          : 'Ainda sem avaliações'}
      </Text>
      {reviews?.reviews.slice(0, 3).map((r) => (
        <View key={r.id} style={styles.reviewCard}>
          <Text style={styles.reviewHead}>
            {'★'.repeat(r.rating)}
            <Text style={styles.reviewWho}> {r.reviewer?.name ?? 'Anônimo'}</Text>
          </Text>
          {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
        </View>
      ))}
      <Button
        label="Avaliar DJ"
        variant="ghost"
        onPress={() =>
          navigation.navigate('Review', {
            mode: 'dj',
            djId: dj.id,
            title: dj.artistName,
          })
        }
        style={styles.tipBtn}
      />

      <Text style={styles.section}>Próximos sets</Text>
      {dj.lineup.length === 0 ? (
        <Text style={styles.muted}>Nenhum line-up confirmado.</Text>
      ) : (
        dj.lineup.map((l) => (
          <View key={`${l.event.id}-${l.order}`} style={styles.lineupItem}>
            <Text style={styles.lineupEvent}>{l.event.name}</Text>
            <Text style={styles.muted}>
              {new Date(l.event.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 24, paddingBottom: 48 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  name: { color: palette.text, fontSize: 26, fontWeight: '900' },
  handle: { color: palette.textMuted, fontSize: 14, marginTop: 4 },
  score: { color: palette.primary, fontSize: 14, fontWeight: '700', marginTop: 10 },
  tips: { color: palette.textMuted, fontSize: 13, marginTop: 6 },
  tipBtn: { marginTop: 12 },
  rating: { color: '#FFC83D', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reviewCard: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  reviewHead: { color: '#FFC83D', fontSize: 14, fontWeight: '700' },
  reviewWho: { color: palette.textMuted, fontWeight: '600' },
  reviewComment: { color: palette.text, fontSize: 14, marginTop: 6, lineHeight: 19 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  tag: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: { color: palette.textMuted, fontSize: 12, fontWeight: '700' },
  muted: { color: palette.textMuted, fontSize: 14, marginTop: 6 },
  bio: { color: palette.text, fontSize: 15, lineHeight: 22, marginTop: 16 },
  followBtn: { marginTop: 24 },
  section: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 32,
    marginBottom: 10,
  },
  lineupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  lineupEvent: { color: palette.text, fontSize: 15, fontWeight: '700' },
});
