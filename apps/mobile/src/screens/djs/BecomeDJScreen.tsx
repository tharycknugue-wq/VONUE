import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

export function BecomeDJScreen({ navigation }: ScreenProps<'BecomeDJ'>) {
  const [artistName, setArtistName] = useState('');
  const [bio, setBio] = useState('');
  const [style, setStyle] = useState('');
  const [bpm, setBpm] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .myDJ()
      .then(({ dj }) => {
        if (!dj) return;
        setArtistName(dj.artistName);
        setBio(dj.bio ?? '');
        setStyle(dj.style.join(', '));
        setBpm(dj.bpm ? String(dj.bpm) : '');
        setCountry(dj.country ?? '');
      })
      .catch(() => {});
  }, []);

  const submit = async () => {
    const styles_ = style
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (artistName.trim().length < 2 || styles_.length === 0) {
      Alert.alert('Atenção', 'Informe o nome artístico e ao menos um estilo.');
      return;
    }
    const bpmN = bpm ? Number(bpm) : undefined;
    setLoading(true);
    try {
      await api.becomeDJ({
        artistName: artistName.trim(),
        bio: bio.trim() || undefined,
        style: styles_,
        bpm: Number.isFinite(bpmN) ? bpmN : undefined,
        country: country.trim() || undefined,
      });
      Alert.alert('Perfil de DJ salvo', 'Você está na cena como artista.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Nome artístico" value={artistName} onChangeText={setArtistName} />
        <Field label="Bio" value={bio} onChangeText={setBio} multiline />
        <Field
          label="Estilos (separados por vírgula)"
          value={style}
          onChangeText={setStyle}
          placeholder="Fullon, Dark, Progressive"
        />
        <Field
          label="BPM preferido"
          value={bpm}
          onChangeText={setBpm}
          keyboardType="number-pad"
          placeholder="145"
        />
        <Field label="País" value={country} onChangeText={setCountry} placeholder="Brasil" />

        <Button
          label="Salvar perfil de DJ"
          onPress={submit}
          loading={loading}
          style={styles.submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={palette.textMuted}
        style={[styles.input, props.multiline && styles.inputMulti]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 24, paddingBottom: 48 },
  field: { marginBottom: 14 },
  label: { color: palette.textMuted, fontSize: 13, marginBottom: 8, marginTop: 6 },
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
  submit: { marginTop: 24 },
});
