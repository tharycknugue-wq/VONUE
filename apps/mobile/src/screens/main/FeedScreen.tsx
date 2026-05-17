import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GradientHero,
  Card,
  Pill,
  EmptyState,
  SectionTitle,
} from '../../components/ui';
import {
  palette,
  gradients,
  glow,
  space,
  radius,
  NUCLEO_META,
} from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { api, type EventListItem, type TimelineItem } from '../../services/api';
import type { RootNav } from '../../navigation/types';

function eventWhen(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
    .replace('.', '') +
    ' · ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function FeedScreen() {
  const nav = useNavigation<RootNav>();
  const user = useAuthStore((s) => s.user);
  const meta = user?.nucleoType ? NUCLEO_META[user.nucleoType] : null;

  const [events, setEvents] = useState<EventListItem[]>([]);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    api.listEvents('upcoming').then((d) => setEvents(d.events)).catch(() => {});
    api.timeline().then((d) => setItems(d.items)).catch(() => {});
    api
      .notifications(true)
      .then((d) => setUnread(d.unreadCount))
      .catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => load(), [load]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
    setTimeout(() => setRefreshing(false), 700);
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.primary}
          />
        }
      >
        <GradientHero colors={meta ? [meta.color, '#0C0C16', '#07070D'] : gradients.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.hello}>Salve,</Text>
              <Text style={styles.name}>{user?.name ?? 'raver'}</Text>
            </View>
            <Pressable
              onPress={() => nav.navigate('Notifications')}
              style={[styles.bell, glow(palette.primary, 10, 0.35)]}
            >
              <Text style={styles.bellIcon}>🔔</Text>
              {unread > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>
                    {unread > 9 ? '9+' : unread}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
          {meta && (
            <View style={styles.nucleoRow}>
              <View style={[styles.nucleoDot, { backgroundColor: meta.color }]} />
              <Text style={[styles.nucleoLabel, { color: meta.color }]}>
                NÚCLEO {meta.label.toUpperCase()}
              </Text>
              <Text style={styles.nucleoTag}>· {meta.tagline}</Text>
            </View>
          )}
        </GradientHero>

        <View style={styles.body}>
          <SectionTitle action={{ label: 'ver todos', onPress: () => nav.navigate('Discover') }}>
            Próximos da cena
          </SectionTitle>

          {events.length === 0 ? (
            <Card>
              <EmptyState
                emoji="🎉"
                title="Nenhum evento por enquanto"
                hint="Quando rolar festa, ela aparece aqui."
              />
            </Card>
          ) : (
            events.slice(0, 6).map((ev) => (
              <Pressable
                key={ev.id}
                onPress={() => nav.navigate('EventDetail', { eventId: ev.id })}
                style={({ pressed }) => [
                  styles.eventCard,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={styles.eventStripe} />
                <View style={styles.flex}>
                  <Text style={styles.eventName} numberOfLines={1}>
                    {ev.name}
                  </Text>
                  <Text style={styles.eventMeta}>
                    {eventWhen(ev.date)} · {ev.venue.city}/{ev.venue.state}
                  </Text>
                  <View style={styles.eventTags}>
                    {ev.styles.slice(0, 2).map((s) => (
                      <Pill key={s} label={s} color={palette.accent} />
                    ))}
                    <View style={styles.going}>
                      <View style={styles.goingDot} />
                      <Text style={styles.goingText}>{ev.checkinCount} indo</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))
          )}

          <SectionTitle action={{ label: 'minha história', onPress: () => nav.navigate('Timeline') }}>
            Rolando na sua cena
          </SectionTitle>

          {items.length === 0 ? (
            <Card>
              <EmptyState
                emoji="✨"
                title="Sua história começa agora"
                hint="Faça check-in num evento e veja a cena ganhar vida."
              />
            </Card>
          ) : (
            <Card>
              {items.slice(0, 6).map((it, i) => (
                <View
                  key={it.id}
                  style={[styles.actRow, i > 0 && styles.actDivider]}
                >
                  <Text style={styles.actIcon}>{it.icon}</Text>
                  <View style={styles.flex}>
                    <Text style={styles.actTitle}>{it.title}</Text>
                    {it.subtitle ? (
                      <Text style={styles.actSub}>{it.subtitle}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.actTime}>{timeAgo(it.at)}</Text>
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  scroll: { paddingBottom: 32 },
  flex: { flex: 1 },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hello: { color: 'rgba(255,255,255,0.7)', fontSize: 17 },
  name: { color: palette.text, fontSize: 34, fontWeight: '900' },
  bell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: palette.surfaceGlass,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: { fontSize: 20 },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: palette.hot,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: { color: palette.text, fontSize: 11, fontWeight: '900' },
  nucleoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.lg,
    flexWrap: 'wrap',
  },
  nucleoDot: { width: 9, height: 9, borderRadius: 5, marginRight: 7 },
  nucleoLabel: { fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  nucleoTag: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginLeft: 6,
    flexShrink: 1,
  },
  body: { paddingHorizontal: space.xl },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
    overflow: 'hidden',
  },
  eventStripe: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: palette.primary,
    marginRight: space.lg,
    ...glow(palette.primary, 8, 0.6),
  },
  eventName: { color: palette.text, fontSize: 16, fontWeight: '800' },
  eventMeta: { color: palette.textMuted, fontSize: 13, marginTop: 3 },
  eventTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  going: { flexDirection: 'row', alignItems: 'center', marginLeft: 2 },
  goingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.success,
    marginRight: 5,
    ...glow(palette.success, 6, 0.8),
  },
  goingText: { color: palette.textMuted, fontSize: 12, fontWeight: '700' },
  chevron: { color: palette.primary, fontSize: 26, fontWeight: '800', marginLeft: 8 },
  actRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  actDivider: { borderTopWidth: 1, borderTopColor: palette.borderSoft },
  actIcon: { fontSize: 22, marginRight: 14 },
  actTitle: { color: palette.text, fontSize: 14, fontWeight: '700' },
  actSub: { color: palette.textMuted, fontSize: 12, marginTop: 2 },
  actTime: { color: palette.textFaint, fontSize: 12, marginLeft: 8 },
});
