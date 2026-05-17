import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ScreenScroll,
  GradientHero,
  Avatar,
  StatTile,
} from '../../components/ui';
import { Button } from '../../components/Button';
import {
  palette,
  glow,
  space,
  radius,
  NUCLEO_META,
} from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import type { RootNav } from '../../navigation/types';

const LINKS: { emoji: string; label: string; go: (n: RootNav) => void }[] = [
  { emoji: '💼', label: 'Carteira', go: (n) => n.navigate('Wallet') },
  { emoji: '🎟️', label: 'Ingressos', go: (n) => n.navigate('Tickets') },
  { emoji: '🏅', label: 'Selos', go: (n) => n.navigate('Selos') },
  { emoji: '🌳', label: 'Árvore', go: (n) => n.navigate('Arvore') },
  { emoji: '🪙', label: 'Gorjetas', go: (n) => n.navigate('Tips') },
  { emoji: '🗓️', label: 'História', go: (n) => n.navigate('Timeline') },
  { emoji: '🛍️', label: 'Loja', go: (n) => n.navigate('Store') },
  { emoji: '📦', label: 'Pedidos', go: (n) => n.navigate('Orders') },
  { emoji: '🔔', label: 'Notificações', go: (n) => n.navigate('Notifications') },
  { emoji: '🔎', label: 'Buscar', go: (n) => n.navigate('Search') },
];

export function ProfileScreen() {
  const nav = useNavigation<RootNav>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const meta = user?.nucleoType ? NUCLEO_META[user.nucleoType] : null;

  const [selos, setSelos] = useState(0);
  const [conns, setConns] = useState(0);
  const [thrans, setThrans] = useState(0);

  useFocusEffect(
    useCallback(() => {
      api.getSelos().then((d) => setSelos(d.total)).catch(() => {});
      api
        .nfcConnections()
        .then((d) =>
          setConns(d.connections.filter((c) => c.state === 'CONFIRMED').length)
        )
        .catch(() => {});
      api.getArvore().then((d) => setThrans(d.thranCount)).catch(() => {});
    }, [])
  );

  return (
    <ScreenScroll edges={['top']}>
      <GradientHero
        colors={meta ? [meta.color, '#0C0C16', '#07070D'] : undefined}
      >
        <View style={styles.idRow}>
          <Avatar
            name={user?.name ?? '?'}
            size={72}
            ring={meta?.color ?? palette.primary}
          />
          <View style={styles.idText}>
            <Text style={styles.name}>{user?.name ?? 'raver'}</Text>
            <Text style={styles.username}>@{user?.username ?? '—'}</Text>
            {meta && (
              <View style={[styles.nucleo, { borderColor: meta.color }]}>
                <Text style={[styles.nucleoText, { color: meta.color }]}>
                  NÚCLEO {meta.label.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </GradientHero>

      <View style={styles.body}>
        <View style={styles.stats}>
          <StatTile
            value={selos}
            label="Selos"
            color={palette.gold}
            onPress={() => nav.navigate('Selos')}
          />
          <StatTile
            value={conns}
            label="Conexões"
            color={palette.accent}
          />
          <StatTile
            value={thrans}
            label="Thräns"
            color={palette.primary}
            onPress={() => nav.navigate('Arvore')}
          />
        </View>

        <Text style={styles.section}>Sua conta</Text>
        <View style={styles.grid}>
          {LINKS.map((l) => (
            <Pressable
              key={l.label}
              onPress={() => l.go(nav)}
              style={({ pressed }) => [
                styles.tile,
                pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.tileEmoji}>{l.emoji}</Text>
              <Text style={styles.tileLabel}>{l.label}</Text>
            </Pressable>
          ))}
        </View>

        <Button
          label="Sair da conta"
          variant="ghost"
          onPress={logout}
          style={styles.logout}
        />
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  idRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  idText: { flex: 1 },
  name: { color: palette.text, fontSize: 24, fontWeight: '900' },
  username: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 2 },
  nucleo: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
    backgroundColor: 'rgba(7,7,13,0.4)',
  },
  nucleoText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  body: { paddingHorizontal: space.xl, paddingTop: space.xl },
  stats: { flexDirection: 'row', gap: space.md },
  section: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: space.xxl,
    marginBottom: space.lg,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    width: '30.5%',
    flexGrow: 1,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    alignItems: 'center',
    ...glow(palette.primary, 6, 0.12),
  },
  tileEmoji: { fontSize: 24 },
  tileLabel: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  logout: { marginTop: space.xxl },
});
