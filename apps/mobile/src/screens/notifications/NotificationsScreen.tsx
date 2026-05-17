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
import { api, type AppNotification } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

const ICON: Record<AppNotification['type'], string> = {
  THRAN: '🌱',
  SELO: '🏅',
  NFC: '📲',
  ORDER: '🛍️',
  EVENT: '🎉',
  SYSTEM: '🔔',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function NotificationsScreen(_props: ScreenProps<'Notifications'>) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api
      .notifications()
      .then((d) => setItems(d.notifications))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const open = async (n: AppNotification) => {
    if (n.read) return;
    setItems((prev) =>
      prev.map((i) => (i.id === n.id ? { ...i, read: true } : i))
    );
    try {
      await api.markNotificationRead(n.id);
    } catch {
      load();
    }
  };

  const markAll = async () => {
    setBusy(true);
    try {
      await api.markAllNotificationsRead();
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
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

  const hasUnread = items.some((i) => !i.read);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {hasUnread && (
        <Button
          label="Marcar todas como lidas"
          variant="ghost"
          onPress={markAll}
          loading={busy}
          style={styles.markAll}
        />
      )}

      {items.length === 0 ? (
        <Text style={styles.empty}>Nada por aqui ainda.</Text>
      ) : (
        items.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => open(n)}
            style={({ pressed }) => [
              styles.card,
              !n.read && styles.cardUnread,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.icon}>{ICON[n.type]}</Text>
            <View style={styles.flex}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.body}>{n.body}</Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.time}>{timeAgo(n.createdAt)}</Text>
              {!n.read && <View style={styles.dot} />}
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 20, paddingBottom: 40 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  markAll: { marginBottom: 16 },
  empty: {
    color: palette.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 60,
  },
  card: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cardUnread: { borderColor: palette.primary, backgroundColor: palette.surfaceAlt },
  icon: { fontSize: 22 },
  flex: { flex: 1 },
  title: { color: palette.text, fontSize: 15, fontWeight: '800' },
  body: { color: palette.textMuted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  meta: { alignItems: 'flex-end', gap: 8 },
  time: { color: palette.textMuted, fontSize: 12 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: palette.primary,
  },
});
