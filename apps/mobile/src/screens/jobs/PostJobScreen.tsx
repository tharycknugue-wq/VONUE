import { useState } from 'react';
import {
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
import { api, ApiError, type JobRole } from '../../services/api';
import { ROLE_LABEL, ROLES } from './roles';
import type { ScreenProps } from '../../navigation/types';

export function PostJobScreen({ route, navigation }: ScreenProps<'PostJob'>) {
  const { eventId, eventName } = route.params;
  const [role, setRole] = useState<JobRole>('BARTENDER');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (title.trim().length < 3) {
      Alert.alert('Atenção', 'Dê um título à vaga (mín. 3 caracteres).');
      return;
    }
    const b = budget ? Number(budget.replace(',', '.')) : undefined;
    setLoading(true);
    try {
      await api.postJob(eventId, {
        role,
        title: title.trim(),
        description: description.trim() || undefined,
        budget: b != null && Number.isFinite(b) ? b : undefined,
      });
      Alert.alert('Vaga publicada', 'Freelancers já podem se candidatar.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha ao publicar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.event}>{eventName}</Text>

      <Text style={styles.label}>Função</Text>
      <View style={styles.chips}>
        {ROLES.map((r) => (
          <Pressable
            key={r}
            onPress={() => setRole(r)}
            style={[styles.chip, role === r && styles.chipOn]}
          >
            <Text style={[styles.chipText, role === r && styles.chipTextOn]}>
              {ROLE_LABEL[r]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Título</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Ex.: Bartender para o open bar"
        placeholderTextColor={palette.textMuted}
        style={styles.input}
      />

      <Text style={styles.label}>Descrição (opcional)</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={2000}
        placeholder="Horário, requisitos, etc."
        placeholderTextColor={palette.textMuted}
        style={[styles.input, styles.inputMulti]}
      />

      <Text style={styles.label}>Cachê (R$, opcional)</Text>
      <TextInput
        value={budget}
        onChangeText={setBudget}
        keyboardType="decimal-pad"
        placeholder="0,00"
        placeholderTextColor={palette.textMuted}
        style={styles.input}
      />

      <Button
        label="Publicar vaga"
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
  label: { color: palette.textMuted, fontSize: 13, marginTop: 24, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chipOn: { borderColor: palette.primary, backgroundColor: palette.surfaceAlt },
  chipText: { color: palette.textMuted, fontSize: 13, fontWeight: '700' },
  chipTextOn: { color: palette.primary },
  input: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    color: palette.text,
    fontSize: 16,
  },
  inputMulti: { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 },
  cta: { marginTop: 28 },
});
