import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ScreenScroll,
  GradientHero,
  Card,
  Avatar,
  Pill,
  EmptyState,
} from '../../components/ui';
import { palette, gradients, glow, space } from '../../theme/colors';
import { NUCLEO_META } from '../../theme/colors';
import { api, type NfcConnection } from '../../services/api';
import type { RootNav } from '../../navigation/types';

export function ConexoesTabScreen() {
  const nav = useNavigation<RootNav>();
  const [conns, setConns] = useState<NfcConnection[]>([]);

  const load = useCallback(() => {
    api.nfcConnections().then((d) => setConns(d.connections)).catch(() => {});
  }, []);
  useFocusEffect(useCallback(() => load(), [load]));

  const act = async (fn: Promise<unknown>) => {
    try {
      await fn;
    } finally {
      load();
    }
  };

  const confirmed = conns.filter((c) => c.state === 'CONFIRMED');
  const pending = conns.filter(
    (c) => c.state === 'PENDING' && c.role === 'RECEIVED'
  );

  return (
    <ScreenScroll edges={['top']}>
      <GradientHero colors={gradients.brand}>
        <Text style={styles.title}>Conexões</Text>
        <Text style={styles.sub}>
          {confirmed.length} na sua rede da pista
        </Text>
        <Pressable
          style={[styles.cta, glow(palette.bg, 10, 0.3)]}
          onPress={() => nav.navigate('Connections')}
        >
          <Text style={styles.ctaText}>📲  Conectar por NFC</Text>
        </Pressable>
      </GradientHero>

      <View style={styles.body}>
        {pending.length > 0 && (
          <>
            <Text style={styles.section}>Pedidos pra você</Text>
            {pending.map((c) => (
              <Card key={c.id} style={styles.row} accent={palette.hot}>
                <Avatar name={c.otherUser?.name ?? '?'} ring={palette.hot} />
                <View style={styles.flex}>
                  <Text style={styles.name}>
                    {c.otherUser?.name ?? 'Alguém'}
                  </Text>
                  <Text style={styles.meta}>quer te conectar</Text>
                </View>
                <Pressable
                  style={[styles.btn, styles.accept]}
                  onPress={() => act(api.nfcAccept(c.id))}
                >
                  <Text style={styles.btnText}>Aceitar</Text>
                </Pressable>
                <Pressable
                  style={styles.btnGhost}
                  onPress={() => act(api.nfcReject(c.id))}
                >
                  <Text style={styles.btnGhostText}>✕</Text>
                </Pressable>
              </Card>
            ))}
          </>
        )}

        <Text style={styles.section}>Sua rede</Text>
        {confirmed.length === 0 ? (
          <Card>
            <EmptyState
              emoji="📲"
              title="Nenhuma conexão ainda"
              hint="Encoste o celular em alguém na pista pra começar."
            />
          </Card>
        ) : (
          confirmed.map((c) => {
            const nm = c.otherUser?.nucleoType
              ? NUCLEO_META[c.otherUser.nucleoType]
              : null;
            return (
              <Card key={c.id} style={styles.row}>
                <Avatar
                  name={c.otherUser?.name ?? '?'}
                  ring={nm?.color}
                />
                <View style={styles.flex}>
                  <Text style={styles.name}>
                    {c.otherUser?.name ?? 'Conexão'}
                  </Text>
                  <Text style={styles.meta}>
                    @{c.otherUser?.username ?? '—'}
                  </Text>
                </View>
                {nm ? <Pill label={nm.label} color={nm.color} /> : null}
              </Card>
            );
          })
        )}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { color: palette.bg, fontSize: 32, fontWeight: '900' },
  sub: { color: 'rgba(7,7,13,0.7)', fontSize: 14, fontWeight: '700', marginTop: 2 },
  cta: {
    backgroundColor: palette.bg,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: space.lg,
  },
  ctaText: { color: palette.text, fontSize: 15, fontWeight: '800' },
  body: { paddingHorizontal: space.xl, paddingTop: space.lg },
  section: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: space.xl,
    marginBottom: space.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: space.md },
  flex: { flex: 1 },
  name: { color: palette.text, fontSize: 15, fontWeight: '800' },
  meta: { color: palette.textMuted, fontSize: 12, marginTop: 2 },
  btn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  accept: { backgroundColor: palette.success },
  btnText: { color: palette.bg, fontWeight: '800', fontSize: 13 },
  btnGhost: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: palette.border,
  },
  btnGhostText: { color: palette.textMuted, fontWeight: '800', fontSize: 13 },
});
