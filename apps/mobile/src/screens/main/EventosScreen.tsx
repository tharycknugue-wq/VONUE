import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { OrkutScreen, FeedEventCard, Chip } from '../../components/orkut';
import { palette } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { useAppNav } from '../../hooks/useAppNav';
import { api, type EventListItem } from '../../services/api';

const FILTERS = [
  { label: 'TODOS', style: null },
  { label: 'FULL ON', style: 'FULLON' },
  { label: 'PROGRESSIVO', style: 'PROGRESSIVO' },
  { label: 'DARK', style: 'DARK_FOREST' },
  { label: 'TECHNO', style: 'TECHNO' },
] as const;

const EV_BG = [
  ['#1A0400', '#3D1020', '#0A0830'],
  ['#0A0030', '#200050', '#0A1800'],
  ['#001810', '#002A20', '#001030'],
] as const;
const EV_EMOJI = ['🌳', '🌀', '⚡'];

function when(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace('.', '')
    .toUpperCase();
}

export function EventosScreen() {
  const { root } = useAppNav();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [filter, setFilter] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      api.listEvents('all').then((d) => setEvents(d.events)).catch(() => {});
    }, [])
  );

  const list = filter
    ? events.filter((e) => e.styles.includes(filter))
    : events;

  return (
    <OrkutScreen current="Eventos">
      <View style={st.pad}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.chips}
        >
          {FILTERS.map((f) => (
            <Chip
              key={f.label}
              label={f.label}
              active={filter === f.style}
              onPress={() => setFilter(f.style)}
            />
          ))}
        </ScrollView>

        {list.length === 0 ? (
          <Text style={st.empty}>
            Nenhum evento neste filtro. Quando rolar festa, ela aparece aqui.
          </Text>
        ) : (
          list.map((ev, i) => (
            <FeedEventCard
              key={ev.id}
              tag={ev.styles.slice(0, 3).join(' · ') || 'PSYTRANCE'}
              name={ev.name}
              meta={`📍 ${ev.venue.city}, ${ev.venue.state}  ·  📅 ${when(ev.date)}  ·  👥 ${ev.checkinCount}`}
              bg={EV_BG[i % EV_BG.length]}
              bigEmoji={EV_EMOJI[i % EV_EMOJI.length]}
              onPress={() => root?.navigate('EventDetail', { eventId: ev.id })}
            >
              <Text style={st.org}>
                ORGANIZA: {ev.organizer.toUpperCase()}
              </Text>
            </FeedEventCard>
          ))
        )}
      </View>
    </OrkutScreen>
  );
}

const st = StyleSheet.create({
  pad: { padding: 12 },
  chips: { paddingBottom: 10 },
  org: {
    fontFamily: font.mono,
    fontSize: 8,
    color: palette.textMuted,
    letterSpacing: 1,
  },
  empty: {
    fontFamily: font.bodyLight,
    fontSize: 13,
    color: palette.textMuted,
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 20,
  },
});
