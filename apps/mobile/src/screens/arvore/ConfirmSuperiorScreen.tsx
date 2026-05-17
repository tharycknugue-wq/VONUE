import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

export function ConfirmSuperiorScreen({ navigation }: ScreenProps<'ConfirmSuperior'>) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onConfirm = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Cole o código ou o final do link de convite.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Aceita tanto o código puro quanto a URL completa /join/<code>.
      const value = trimmed.split('/').pop() ?? trimmed;
      const res = await api.confirmSuperior(value);
      Alert.alert(
        'Vínculo confirmado',
        `${res.superior.name} agora é seu ${res.superiorTerm}.`,
        [{ text: 'Ver minha árvore', onPress: () => navigation.navigate('Arvore') }]
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível confirmar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.quote}>
        “A cena conecta quem o tempo separa. Encontre quem te inseriu nessa
        história.”
      </Text>

      <Text style={styles.label}>Código ou link de convite</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="vonue.app/join/abc123  ou  abc123"
        placeholderTextColor={palette.textMuted}
        style={styles.input}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        label="Confirmar vínculo"
        onPress={onConfirm}
        loading={loading}
        style={styles.submit}
      />
      <Text style={styles.hint}>
        O vínculo é único e definitivo: você só pode ter um Drün/Rhän.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 24 },
  quote: {
    color: palette.text,
    fontSize: 18,
    lineHeight: 27,
    fontStyle: 'italic',
    marginTop: 12,
    marginBottom: 36,
  },
  label: { color: palette.textMuted, fontSize: 13, marginBottom: 8 },
  input: {
    height: 50,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    color: palette.text,
    fontSize: 16,
  },
  error: { color: palette.danger, marginTop: 16, fontSize: 14 },
  submit: { marginTop: 28 },
  hint: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
  },
});
