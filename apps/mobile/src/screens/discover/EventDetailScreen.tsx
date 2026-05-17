import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import {
  api,
  ApiError,
  type EventDetail,
  type EventReviews,
} from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

function formatRange(date: string, endDate: string | null): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  };
  const start = new Date(date).toLocaleDateString('pt-BR', opts);
  if (!endDate) return start;
  return `${start} → ${new Date(endDate).toLocaleDateString('pt-BR', opts)}`;
}

export function EventDetailScreen({ route, navigation }: ScreenProps<'EventDetail'>) {
  const { eventId } = route.params;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [reviews, setReviews] = useState<EventReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      Promise.all([api.getEvent(eventId), api.eventReviews(eventId)])
        .then(([ev, rv]) => {
          setEvent(ev);
          setReviews(rv);
        })
        .catch(() => setError('Não foi possível carregar o evento.'))
        .finally(() => setLoading(false)),
    [eventId]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const doCheckin = async () => {
    setCheckingIn(true);
    try {
      const res = await api.checkin(eventId);
      setCheckedIn(true);

      const lines: string[] = [];
      if (res.eventSelo) {
        lines.push(`${res.eventSelo.emoji} Selo "${res.eventSelo.name}" garantido.`);
      }
      if (res.superiorLinked) {
        const { superior, superiorTerm } = res.superiorLinked;
        lines.push(
          `🌳 ${superior.name} agora é seu ${superiorTerm}. A árvore cresceu.`
        );
      }
      Alert.alert(
        res.alreadyCheckedIn ? 'Você já estava aqui' : 'Check-in confirmado!',
        lines.length ? lines.join('\n\n') : 'Presença registrada na cena.'
      );
      await load();
    } catch (e) {
      Alert.alert(
        'Erro no check-in',
        e instanceof ApiError ? e.message : 'Tente novamente.'
      );
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.name}>{event.name}</Text>
      <Text style={styles.date}>{formatRange(event.date, event.endDate)}</Text>

      <View style={styles.tags}>
        {event.styles.map((s) => (
          <View key={s} style={styles.tag}>
            <Text style={styles.tagText}>{s}</Text>
          </View>
        ))}
      </View>

      {event.description && <Text style={styles.desc}>{event.description}</Text>}

      <Text style={styles.section}>Local</Text>
      <Text style={styles.body}>{event.venue.name}</Text>
      <Text style={styles.muted}>
        {event.venue.address} — {event.venue.city}/{event.venue.state}
      </Text>

      <Text style={styles.section}>Organização</Text>
      <Text style={styles.body}>
        {event.organizer.companyName ?? event.organizer.user.name}
      </Text>
      {reviews && (
        <>
          <Text style={styles.rating}>
            {reviews.aggregate.count > 0
              ? `★ ${reviews.aggregate.average.toFixed(1)} · ${reviews.aggregate.count} avaliação(ões)`
              : 'Ainda sem avaliações'}
          </Text>
          {reviews.reviews.slice(0, 3).map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <Text style={styles.reviewHead}>
                {'★'.repeat(r.rating)}
                <Text style={styles.reviewWho}>
                  {'  '}
                  {r.reviewer?.name ?? 'Anônimo'}
                </Text>
              </Text>
              {r.comment && (
                <Text style={styles.reviewComment}>{r.comment}</Text>
              )}
            </View>
          ))}
          <Button
            label="Avaliar organização"
            variant="ghost"
            onPress={() =>
              navigation.navigate('Review', {
                mode: 'organizer',
                eventId: event.id,
                title: event.name,
              })
            }
            style={styles.reviewBtn}
          />
        </>
      )}

      {event.lineup.length > 0 && (
        <>
          <Text style={styles.section}>Line-up</Text>
          {event.lineup.map((l) => (
            <Text key={l.order} style={styles.body}>
              • {l.dj.artistName}
            </Text>
          ))}
        </>
      )}

      <Text style={styles.section}>Ingressos</Text>
      {event.tickets.length === 0 ? (
        <Text style={styles.muted}>Ingressos em breve.</Text>
      ) : (
        event.tickets.map((lot) => {
          const left = lot.quantity - lot.sold;
          const soldOut = left <= 0;
          return (
            <View key={lot.id} style={styles.lotRow}>
              <View style={styles.flex}>
                <Text style={styles.body}>{lot.name}</Text>
                <Text style={styles.muted}>
                  R$ {lot.price.toFixed(2)} ·{' '}
                  {soldOut ? 'esgotado' : `${left} disponíveis`}
                </Text>
              </View>
              <Button
                label={soldOut ? 'Esgotado' : 'Comprar'}
                disabled={soldOut}
                onPress={() =>
                  navigation.navigate('Purchase', {
                    ticketTypeId: lot.id,
                    lotName: lot.name,
                    price: lot.price,
                    eventName: event.name,
                  })
                }
                style={styles.lotBtn}
              />
            </View>
          );
        })
      )}

      <View style={styles.statRow}>
        <Text style={styles.muted}>👥 {event._count.checkins} na cena</Text>
      </View>

      <Button
        label={checkedIn ? 'Check-in feito ✓' : 'Fazer check-in'}
        onPress={doCheckin}
        loading={checkingIn}
        disabled={checkedIn}
        style={styles.cta}
      />
      <Button
        label="Ver mapa ao vivo"
        variant="ghost"
        onPress={() =>
          navigation.navigate('LiveMap', {
            eventId: event.id,
            eventName: event.name,
            lat: event.venue.lat,
            lng: event.venue.lng,
          })
        }
        style={styles.mapBtn}
      />
      <Button
        label="📸 Álbum do evento"
        variant="ghost"
        onPress={() =>
          navigation.navigate('EventPhotos', {
            eventId: event.id,
            eventName: event.name,
          })
        }
        style={styles.mapBtn}
      />
      <Button
        label="🎧 Adicionar ao line-up"
        variant="ghost"
        onPress={() =>
          navigation.navigate('AddLineup', {
            eventId: event.id,
            eventName: event.name,
          })
        }
        style={styles.mapBtn}
      />
      <Button
        label="📣 Credenciar promoter"
        variant="ghost"
        onPress={() =>
          navigation.navigate('EnrollPromoter', {
            eventId: event.id,
            eventName: event.name,
          })
        }
        style={styles.mapBtn}
      />
      <Button
        label="🧰 Publicar vaga"
        variant="ghost"
        onPress={() =>
          navigation.navigate('PostJob', {
            eventId: event.id,
            eventName: event.name,
          })
        }
        style={styles.mapBtn}
      />
      <Text style={styles.hint}>
        O check-in registra sua presença, garante o selo do evento e — se você
        entrou por convite — confirma quem te inseriu na cena.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 24, paddingBottom: 48 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  name: { color: palette.text, fontSize: 26, fontWeight: '900' },
  date: { color: palette.primary, fontSize: 15, fontWeight: '700', marginTop: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  tag: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: { color: palette.textMuted, fontSize: 12, fontWeight: '700' },
  desc: { color: palette.text, fontSize: 15, lineHeight: 23, marginTop: 20 },
  section: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 8,
  },
  body: { color: palette.text, fontSize: 16 },
  muted: { color: palette.textMuted, fontSize: 14, marginTop: 2 },
  rating: { color: '#FFC83D', fontSize: 14, fontWeight: '700', marginTop: 8 },
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
  reviewBtn: { marginTop: 14 },
  flex: { flex: 1 },
  lotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  lotBtn: { width: 130 },
  statRow: { marginTop: 28 },
  cta: { marginTop: 20 },
  mapBtn: { marginTop: 12 },
  hint: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 14,
    textAlign: 'center',
    lineHeight: 19,
  },
  error: { color: palette.danger, fontSize: 14 },
});
