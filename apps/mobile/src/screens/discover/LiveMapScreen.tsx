import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Switch, Text, View } from 'react-native';
import { palette, NUCLEO_META, type NucleoType } from '../../theme/colors';
import { liveMap, type LivePeer } from '../../services/socket';
import { useLocation } from '../../hooks/useLocation';
import type { ScreenProps } from '../../navigation/types';

const SIZE = Math.min(Dimensions.get('window').width - 40, 360);
const CENTER = SIZE / 2;
const RADIUS_M = 250; // o raio do radar representa ~250m
const SCALE = (CENTER - 10) / RADIUS_M;
const STALE_MS = 60_000;

function peerColor(nucleoType: string | null): string {
  if (nucleoType && nucleoType in NUCLEO_META) {
    return NUCLEO_META[nucleoType as NucleoType].color;
  }
  return palette.textMuted;
}

export function LiveMapScreen({ route }: ScreenProps<'LiveMap'>) {
  const { eventId, lat, lng } = route.params;
  const me = useLocation({ lat, lng });
  const [peers, setPeers] = useState<Record<string, LivePeer>>({});
  const [ghost, setGhost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const joined = useRef(false);

  useEffect(() => {
    const unsubs = [
      liveMap.onSnapshot(({ eventId: ev, peers: list }) => {
        if (ev !== eventId) return;
        setPeers(Object.fromEntries(list.map((p) => [p.userId, p])));
      }),
      liveMap.onPeer((p) => setPeers((prev) => ({ ...prev, [p.userId]: p }))),
      liveMap.onPeerLeft(({ userId }) =>
        setPeers((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        })
      ),
      liveMap.onError(({ message }) => setError(message)),
    ];

    liveMap.join(eventId);
    joined.current = true;

    const prune = setInterval(() => {
      const now = Date.now();
      setPeers((prev) => {
        const next: Record<string, LivePeer> = {};
        for (const [id, p] of Object.entries(prev)) {
          if (now - p.updatedAt <= STALE_MS) next[id] = p;
        }
        return next;
      });
    }, 10_000);

    return () => {
      clearInterval(prune);
      unsubs.forEach((u) => u());
      if (joined.current) liveMap.leave(eventId);
      liveMap.disconnect();
    };
  }, [eventId]);

  // Envia minha localização (a não ser em modo fantasma).
  useEffect(() => {
    if (me.coords && !ghost) {
      liveMap.sendLocation(eventId, me.coords.lat, me.coords.lng);
    }
  }, [me.coords, ghost, eventId]);

  useEffect(() => {
    liveMap.setGhost(eventId, ghost);
  }, [ghost, eventId]);

  const dots = useMemo(() => {
    if (!me.coords) return [];
    const cosLat = Math.cos((me.coords.lat * Math.PI) / 180);
    return Object.values(peers)
      .filter((p) => !me.coords || p.lat !== me.coords.lat || p.lng !== me.coords.lng)
      .map((p) => {
        const mLat = (p.lat - me.coords!.lat) * 111320;
        const mLng = (p.lng - me.coords!.lng) * 111320 * cosLat;
        let x = CENTER + mLng * SCALE;
        let y = CENTER - mLat * SCALE;
        const dx = x - CENTER;
        const dy = y - CENTER;
        const dist = Math.hypot(dx, dy);
        const max = CENTER - 8;
        if (dist > max) {
          x = CENTER + (dx / dist) * max;
          y = CENTER + (dy / dist) * max;
        }
        return { ...p, x, y };
      });
  }, [peers, me.coords]);

  const peerCount = Object.keys(peers).length;

  return (
    <View style={styles.container}>
      {(error || me.error) && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{error ?? me.error}</Text>
        </View>
      )}

      <Text style={styles.count}>
        {peerCount} {peerCount === 1 ? 'pessoa' : 'pessoas'} na cena perto de você
      </Text>
      <Text style={styles.sub}>Raio do radar ≈ {RADIUS_M} m</Text>

      <View style={styles.radar}>
        {[1, 0.66, 0.33].map((r) => (
          <View
            key={r}
            style={[
              styles.ring,
              {
                width: SIZE * r,
                height: SIZE * r,
                borderRadius: (SIZE * r) / 2,
              },
            ]}
          />
        ))}

        {dots.map((d) => (
          <View
            key={d.userId}
            style={[
              styles.peer,
              { left: d.x - 7, top: d.y - 7, backgroundColor: peerColor(d.nucleoType) },
            ]}
          />
        ))}

        <View style={[styles.meDot, { left: CENTER - 9, top: CENTER - 9 }]} />
      </View>

      <View style={styles.ghostRow}>
        <View style={styles.flex}>
          <Text style={styles.ghostTitle}>Modo fantasma</Text>
          <Text style={styles.ghostDesc}>
            Ninguém vê sua posição enquanto ativo.
          </Text>
        </View>
        <Switch
          value={ghost}
          onValueChange={setGhost}
          trackColor={{ true: palette.primary, false: palette.border }}
          thumbColor={palette.text}
        />
      </View>

      {me.simulated && (
        <Text style={styles.note}>Posição simulada (sem GPS real).</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 20, alignItems: 'center' },
  banner: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  bannerText: { color: palette.textMuted, fontSize: 13, textAlign: 'center' },
  count: { color: palette.text, fontSize: 18, fontWeight: '800', marginTop: 8 },
  sub: { color: palette.textMuted, fontSize: 12, marginTop: 4, marginBottom: 18 },
  radar: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: palette.border,
  },
  peer: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: palette.bg,
  },
  meDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.primary,
    borderWidth: 2,
    borderColor: palette.text,
  },
  ghostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 28,
    padding: 16,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  flex: { flex: 1 },
  ghostTitle: { color: palette.text, fontSize: 16, fontWeight: '700' },
  ghostDesc: { color: palette.textMuted, fontSize: 13, marginTop: 2 },
  note: { color: palette.textMuted, fontSize: 12, marginTop: 16 },
});
