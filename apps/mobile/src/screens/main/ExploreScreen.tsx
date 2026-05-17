import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ScreenScroll,
  GradientHero,
  Card,
  Pill,
  EmptyState,
  SectionTitle,
} from '../../components/ui';
import { palette, gradients, glow, space, radius } from '../../theme/colors';
import { api, type EventListItem, type DJListItem } from '../../services/api';
import type { RootNav } from '../../navigation/types';

export function ExploreScreen() {
  const nav = useNavigation<RootNav>();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [djs, setDjs] = useState<DJListItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      api.listEvents('all').then((d) => setEvents(d.events)).catch(() => {});
      api.djs().then((d) => setDjs(d.djs)).catch(() => {});
    }, [])
  );

  return (
    <ScreenScroll edges={['top']}>
      <GradientHero colors={gradients.cyber}>
        <Text style={styles.title}>Explorar</Text>
        <Text style={styles.sub}>A cena inteira num lugar.</Text>
        <Pressable
          style={styles.search}
          onPress={() => nav.navigate('Search')}
        >
          <Text style={styles.searchIcon}>⌕</Text>
          <Text style={styles.searchText}>Buscar eventos, DJs, produtos…</Text>
        </Pressable>
      </GradientHero>

      <View style={styles.body}>
        <SectionTitle action={{ label: 'todos', onPress: () => nav.navigate('Discover') }}>
          Eventos
        </SectionTitle>
        {events.length === 0 ? (
          <Card>
            <EmptyState emoji="🎶" title="Sem eventos ainda" />
          </Card>
        ) : (
          events.slice(0, 8).map((ev) => (
            <Card
              key={ev.id}
              style={styles.row}
              onPress={() => nav.navigate('EventDetail', { eventId: ev.id })}
            >
              <Text style={styles.rowEmoji}>🎉</Text>
              <View style={styles.flex}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {ev.name}
                </Text>
                <Text style={styles.rowMeta}>
                  {ev.venue.city}/{ev.venue.state} · {ev.checkinCount} indo
                </Text>
              </View>
              {ev.styles[0] ? <Pill label={ev.styles[0]} color={palette.accent} /> : null}
            </Card>
          ))
        )}

        <SectionTitle action={{ label: 'ranking', onPress: () => nav.navigate('DJs') }}>
          DJs em alta
        </SectionTitle>
        {djs.length === 0 ? (
          <Card>
            <EmptyState emoji="🎧" title="Nenhum DJ no ranking" />
          </Card>
        ) : (
          djs.slice(0, 6).map((dj) => (
            <Card
              key={dj.id}
              style={styles.row}
              onPress={() => nav.navigate('DJDetail', { djId: dj.id })}
            >
              <View style={[styles.rank, glow(palette.gold, 8, 0.4)]}>
                <Text style={styles.rankText}>{dj.position}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {dj.artistName}
                </Text>
                <Text style={styles.rowMeta}>
                  {dj.followerCount} seguidores · score {dj.rankScore}
                </Text>
              </View>
              {dj.isFollowing ? (
                <Pill label="seguindo" color={palette.success} />
              ) : null}
            </Card>
          ))
        )}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { color: palette.bg, fontSize: 32, fontWeight: '900' },
  sub: { color: 'rgba(7,7,13,0.7)', fontSize: 14, fontWeight: '600', marginTop: 2 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7,7,13,0.85)',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginTop: space.lg,
  },
  searchIcon: { color: palette.accent, fontSize: 18, marginRight: 10 },
  searchText: { color: palette.textMuted, fontSize: 14 },
  body: { paddingHorizontal: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: space.md },
  rowEmoji: { fontSize: 24 },
  flex: { flex: 1 },
  rowName: { color: palette.text, fontSize: 15, fontWeight: '800' },
  rowMeta: { color: palette.textMuted, fontSize: 12, marginTop: 3 },
  rank: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.gold + '22',
    borderWidth: 1,
    borderColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { color: palette.gold, fontWeight: '900', fontSize: 15 },
});
