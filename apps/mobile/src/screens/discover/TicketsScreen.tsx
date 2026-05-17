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
import { api, ApiError, type MyTicket } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

const STATUS_LABEL: Record<MyTicket['status'], string> = {
  ACTIVE: 'Válido',
  USED: 'Validado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Estornado',
};

export function TicketsScreen({ navigation }: ScreenProps<'Tickets'>) {
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .myTickets()
      .then((d) => setTickets(d.tickets))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const validate = async (t: MyTicket) => {
    setBusy(t.id);
    try {
      const res = await api.ticketCheckin(t.qrCode);
      const lines: string[] = [];
      if (res.eventSelo) {
        lines.push(`${res.eventSelo.emoji} Selo "${res.eventSelo.name}".`);
      }
      if (res.superiorLinked) {
        lines.push(
          `🌳 ${res.superiorLinked.superior.name} virou seu ${res.superiorLinked.superiorTerm}.`
        );
      }
      Alert.alert(
        res.alreadyUsed ? 'Ingresso já validado' : 'Entrada liberada!',
        lines.length ? lines.join('\n\n') : 'Presença registrada na cena.'
      );
      load();
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha na validação.');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {tickets.length === 0 && (
        <Text style={styles.empty}>
          Você ainda não tem ingressos. Compre em Eventos.
        </Text>
      )}

      {tickets.map((t) => (
        <View key={t.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.event}>{t.ticketType.event.name}</Text>
            <View
              style={[
                styles.badge,
                t.status === 'ACTIVE' ? styles.badgeOk : styles.badgeOff,
              ]}
            >
              <Text style={styles.badgeText}>{STATUS_LABEL[t.status]}</Text>
            </View>
          </View>
          <Text style={styles.lot}>
            {t.ticketType.name} · R$ {t.ticketType.price.toFixed(2)}
          </Text>
          <Text style={styles.venue}>
            {t.ticketType.event.venue.name} —{' '}
            {t.ticketType.event.venue.city}/{t.ticketType.event.venue.state}
          </Text>

          <Text style={styles.qrLabel}>Código de entrada</Text>
          <Text selectable style={styles.qr}>
            {t.qrCode}
          </Text>

          {t.status === 'ACTIVE' && (
            <Button
              label="Validar na portaria (sandbox)"
              onPress={() => validate(t)}
              loading={busy === t.id}
              style={styles.cta}
            />
          )}
          {t.promoter && (
            <Button
              label={`Avaliar promoter (${t.promoter.user.name})`}
              variant="ghost"
              onPress={() =>
                navigation.navigate('Review', {
                  mode: 'promoter',
                  promoterId: t.promoter!.id,
                  title: t.promoter!.user.name,
                })
              }
              style={styles.cta}
            />
          )}
        </View>
      ))}
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
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  event: { color: palette.text, fontSize: 17, fontWeight: '800', flex: 1 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 10,
  },
  badgeOk: { backgroundColor: palette.surfaceAlt },
  badgeOff: { backgroundColor: palette.border },
  badgeText: { color: palette.primary, fontSize: 11, fontWeight: '700' },
  lot: { color: palette.primary, fontSize: 14, marginTop: 8, fontWeight: '700' },
  venue: { color: palette.textMuted, fontSize: 13, marginTop: 2 },
  qrLabel: {
    color: palette.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 16,
  },
  qr: {
    color: palette.text,
    fontFamily: 'monospace',
    fontSize: 13,
    marginTop: 6,
    backgroundColor: palette.surfaceAlt,
    padding: 12,
    borderRadius: 10,
  },
  cta: { marginTop: 16 },
});
