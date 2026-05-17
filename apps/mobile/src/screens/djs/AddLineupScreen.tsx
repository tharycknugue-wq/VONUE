import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError, type DJListItem } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

export function AddLineupScreen({ route, navigation }: ScreenProps<'AddLineup'>) {
  const { eventId, eventName } = route.params;
  const [djs, setDjs] = useState<DJListItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [order, setOrder] = useState('1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .djs()
      .then((d) => setDjs(d.djs))
      .catch(() => setDjs([]))
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!selected) {
      Alert.alert('Atenção', 'Escolha um DJ.');
      return;
    }
    setSaving(true);
    try {
      await api.addLineup(eventId, {
        djId: selected,
        order: Number(order) || 0,
      });
      Alert.alert('Line-up atualizado', 'DJ adicionado e notificado.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha ao adicionar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.event}>{eventName}</Text>
      <Text style={styles.hint}>Apenas o organizador do evento pode montar o line-up.</Text>

      <Text style={styles.label}>Ordem</Text>
      <TextInput
        value={order}
        onChangeText={setOrder}
        keyboardType="number-pad"
        placeholderTextColor={palette.textMuted}
        style={styles.input}
      />

      <Text style={styles.label}>Escolha o DJ</Text>
      {loading ? (
        <ActivityIndicator color={palette.primary} style={{ marginTop: 20 }} />
      ) : djs.length === 0 ? (
        <Text style={styles.hint}>Nenhum DJ cadastrado ainda.</Text>
      ) : (
        djs.map((dj) => {
          const on = selected === dj.id;
          return (
            <Pressable
              key={dj.id}
              onPress={() => setSelected(dj.id)}
              style={[styles.dj, on && styles.djOn]}
            >
              <Text style={[styles.djName, on && styles.djNameOn]}>
                {dj.artistName}
              </Text>
              <Text style={styles.djMeta}>
                {dj.style.slice(0, 2).join(' · ') || 'sem estilo'}
              </Text>
            </Pressable>
          );
        })
      )}

      <Button
        label="Adicionar ao line-up"
        onPress={submit}
        loading={saving}
        style={styles.submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 24, paddingBottom: 48 },
  event: { color: palette.primary, fontSize: 18, fontWeight: '800' },
  hint: { color: palette.textMuted, fontSize: 13, marginTop: 8 },
  label: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 24,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    color: palette.text,
    fontSize: 16,
  },
  dj: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 8,
  },
  djOn: { borderColor: palette.primary, backgroundColor: palette.surfaceAlt },
  djName: { color: palette.text, fontSize: 15, fontWeight: '700' },
  djNameOn: { color: palette.primary },
  djMeta: { color: palette.textMuted, fontSize: 12, marginTop: 2 },
  submit: { marginTop: 28 },
});
