import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError, type ArvoreResponse } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

export function ArvoreScreen({ navigation }: ScreenProps<'Arvore'>) {
  const [data, setData] = useState<ArvoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api
      .getArvore()
      .then(setData)
      .catch(() => setError('Não foi possível carregar sua árvore.'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const share = async () => {
    setInviting(true);
    try {
      const invite = await api.createInvite();
      await Share.share({ message: `${invite.message}\n\n${invite.link}` });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao gerar convite.');
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }

  const term = data?.superiorTerm ?? 'RHÄN';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>SEU {term}</Text>
      {data?.superior ? (
        <View style={styles.card}>
          <View style={[styles.avatar, { backgroundColor: palette.primary }]}>
            <Text style={styles.avatarText}>
              {data.superior.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.name}>{data.superior.name}</Text>
            <Text style={styles.username}>@{data.superior.username}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyMsg}>{data?.message}</Text>
          <Button
            label="Encontrar quem me inseriu"
            onPress={() => navigation.navigate('ConfirmSuperior')}
            style={styles.cta}
          />
        </View>
      )}

      <View style={styles.thranHeader}>
        <Text style={styles.sectionLabel}>SEUS THRÄNS</Text>
        <Text style={styles.count}>{data?.thranCount ?? 0}</Text>
      </View>

      {data && data.thrans.length > 0 ? (
        data.thrans.map((t) => (
          <View key={t.id} style={styles.card}>
            <View style={[styles.avatar, { backgroundColor: palette.surfaceAlt }]}>
              <Text style={styles.avatarText}>
                {t.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.name}>{t.name}</Text>
              <Text style={styles.username}>@{t.username}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.muted}>
          Ninguém ainda. Convide alguém para a cena.
        </Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        label="Convidar para a cena"
        onPress={share}
        loading={inviting}
        style={styles.invite}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 24, paddingBottom: 48 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  sectionLabel: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    marginTop: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: palette.bg, fontWeight: '900', fontSize: 18 },
  flex: { flex: 1 },
  name: { color: palette.text, fontSize: 16, fontWeight: '700' },
  username: { color: palette.textMuted, fontSize: 13, marginTop: 2 },
  emptyCard: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    marginTop: 12,
  },
  emptyMsg: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  cta: { marginTop: 18 },
  thranHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 36,
  },
  count: { color: palette.primary, fontSize: 18, fontWeight: '900' },
  muted: { color: palette.textMuted, marginTop: 12, fontSize: 14 },
  error: { color: palette.danger, marginTop: 16, fontSize: 14 },
  invite: { marginTop: 32 },
});
