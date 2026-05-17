import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError, type NfcConnection } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

export function ConnectionsScreen(_props: ScreenProps<'Connections'>) {
  const [connections, setConnections] = useState<NfcConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [secsLeft, setSecsLeft] = useState(0);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(() => {
    api
      .nfcConnections()
      .then((d) => setConnections(d.connections))
      .catch(() => setConnections([]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const generate = async () => {
    setBusy('token');
    try {
      const res = await api.nfcToken();
      setToken(res.token);
      setSecsLeft(res.expiresInSec);
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(() => {
        setSecsLeft((s) => {
          if (s <= 1) {
            if (timer.current) clearInterval(timer.current);
            setToken(null);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha ao gerar etiqueta.');
    } finally {
      setBusy(null);
    }
  };

  const doConnect = async () => {
    const value = code.trim().toUpperCase();
    if (!value) return;
    setBusy('connect');
    try {
      const res = await api.nfcConnect(value);
      setCode('');
      Alert.alert(
        'Conectados!',
        `Você e ${res.connection.otherUser?.name ?? 'alguém'} se conectaram.` +
          (res.seloAwarded ? '\n\n🤝 Selo "Primeira Conexão" garantido.' : '') +
          '\n\nVocê tem 1h para se arrepender.'
      );
      load();
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha ao conectar.');
    } finally {
      setBusy(null);
    }
  };

  const act = async (id: string, action: 'accept' | 'reject') => {
    setBusy(id);
    try {
      if (action === 'accept') await api.nfcAccept(id);
      else await api.nfcReject(id);
      load();
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Ação falhou.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>APROXIME OS CELULARES</Text>
      <View style={styles.tagBox}>
        {token ? (
          <>
            <Text style={styles.token}>{token}</Text>
            <Text style={styles.tokenHint}>
              Expira em {secsLeft}s — o outro digita esse código abaixo.
            </Text>
          </>
        ) : (
          <Text style={styles.tokenHint}>
            Gere uma etiqueta NFC e mostre para quem está do seu lado.
          </Text>
        )}
      </View>
      <Button
        label="Gerar etiqueta NFC"
        onPress={generate}
        loading={busy === 'token'}
        style={styles.gap}
      />

      <Text style={styles.section}>CONECTAR POR CÓDIGO</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder="código da etiqueta"
        placeholderTextColor={palette.textMuted}
        style={styles.input}
      />
      <Button
        label="Conectar"
        onPress={doConnect}
        loading={busy === 'connect'}
        style={styles.gap}
      />

      <Text style={styles.section}>MINHAS CONEXÕES</Text>
      {loading ? (
        <ActivityIndicator color={palette.primary} style={{ marginTop: 20 }} />
      ) : connections.length === 0 ? (
        <Text style={styles.muted}>Nenhuma conexão ainda.</Text>
      ) : (
        connections.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.name}>
                  {c.otherUser?.name ?? 'Raver'}
                </Text>
                <Text style={styles.username}>
                  @{c.otherUser?.username ?? '???'} ·{' '}
                  {c.role === 'INITIATED' ? 'você iniciou' : 'te conectou'}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  c.state === 'CONFIRMED' ? styles.badgeOk : styles.badgePend,
                ]}
              >
                <Text style={styles.badgeText}>
                  {c.state === 'CONFIRMED' ? 'Conectados' : 'Arrependível'}
                </Text>
              </View>
            </View>

            {c.state === 'PENDING' && (
              <View style={styles.actions}>
                <Button
                  label="Confirmar"
                  onPress={() => act(c.id, 'accept')}
                  loading={busy === c.id}
                  style={styles.flex}
                />
                <Button
                  label="Arrepender"
                  variant="ghost"
                  onPress={() => act(c.id, 'reject')}
                  loading={busy === c.id}
                  style={styles.flex}
                />
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 24, paddingBottom: 48 },
  section: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 12,
  },
  tagBox: {
    padding: 22,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.primary,
    alignItems: 'center',
  },
  token: {
    color: palette.primary,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 6,
    fontFamily: 'monospace',
  },
  tokenHint: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  gap: { marginTop: 14 },
  input: {
    height: 50,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    color: palette.text,
    fontSize: 18,
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  muted: { color: palette.textMuted, fontSize: 14, marginTop: 8 },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  name: { color: palette.text, fontSize: 16, fontWeight: '700' },
  username: { color: palette.textMuted, fontSize: 13, marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 10,
  },
  badgeOk: { backgroundColor: palette.surfaceAlt },
  badgePend: { backgroundColor: palette.border },
  badgeText: { color: palette.primary, fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 14 },
});
