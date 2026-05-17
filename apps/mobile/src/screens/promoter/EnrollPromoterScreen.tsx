import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

export function EnrollPromoterScreen({ route, navigation }: ScreenProps<'EnrollPromoter'>) {
  const { eventId, eventName } = route.params;
  const [username, setUsername] = useState('');
  const [commission, setCommission] = useState('10');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const u = username.trim().toLowerCase();
    if (!u) {
      Alert.alert('Atenção', 'Informe o usuário do promoter.');
      return;
    }
    const pct = Number(commission.replace(',', '.'));
    setLoading(true);
    try {
      const res = await api.enrollPromoter(eventId, {
        username: u,
        commission: Number.isFinite(pct) ? pct / 100 : undefined,
      });
      Alert.alert(
        'Promoter credenciado',
        `Código para ele divulgar:\n\n${res.code}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha ao credenciar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.event}>{eventName}</Text>
      <Text style={styles.hint}>
        Só o organizador credencia. O promoter recebe um código; quem comprar
        com ele gera comissão.
      </Text>

      <Text style={styles.label}>Usuário do promoter</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="@usuario"
        placeholderTextColor={palette.textMuted}
        style={styles.input}
      />

      <Text style={styles.label}>Comissão (%)</Text>
      <TextInput
        value={commission}
        onChangeText={setCommission}
        keyboardType="decimal-pad"
        placeholder="10"
        placeholderTextColor={palette.textMuted}
        style={styles.input}
      />

      <Button
        label="Credenciar promoter"
        onPress={submit}
        loading={loading}
        style={styles.cta}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 24, paddingBottom: 48 },
  event: { color: palette.primary, fontSize: 18, fontWeight: '800' },
  hint: { color: palette.textMuted, fontSize: 13, marginTop: 8, lineHeight: 19 },
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
  cta: { marginTop: 28 },
});
