import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError, type RegisterPayload } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { ScreenProps } from '../../navigation/types';

type Gender = 'MASCULINE' | 'FEMININE';

export function RegisterScreen(_props: ScreenProps<'Register'>) {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    birthDate: '',
    inviteCode: '',
  });
  const [gender, setGender] = useState<Gender | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    setError(null);
    if (!gender) {
      setError('Selecione como você se identifica.');
      return;
    }
    setLoading(true);
    try {
      const invite = form.inviteCode.trim();
      const payload: RegisterPayload = {
        name: form.name,
        password: form.password,
        birthDate: form.birthDate,
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        gender,
        ...(invite ? { inviteCode: invite.split('/').pop() ?? invite } : {}),
      };
      const res = await api.register(payload);
      await setAuth(res); // troca para a stack autenticada (Onboarding)
    } catch (e) {
      if (e instanceof ApiError) {
        const fieldErr =
          e.details && typeof e.details === 'object'
            ? Object.values(e.details as Record<string, string[]>)[0]?.[0]
            : undefined;
        setError(fieldErr ?? e.message);
      } else {
        setError('Não foi possível concluir o cadastro.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>É preciso ter 18 anos ou mais.</Text>

          <Field label="Nome" value={form.name} onChangeText={set('name')} />
          <Field
            label="Usuário"
            value={form.username}
            onChangeText={set('username')}
            autoCapitalize="none"
          />
          <Field
            label="E-mail"
            value={form.email}
            onChangeText={set('email')}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Field
            label="Senha"
            value={form.password}
            onChangeText={set('password')}
            secureTextEntry
          />
          <Field
            label="Nascimento (AAAA-MM-DD)"
            value={form.birthDate}
            onChangeText={set('birthDate')}
            placeholder="2000-05-01"
          />
          <Field
            label="Código de convite (opcional)"
            value={form.inviteCode}
            onChangeText={set('inviteCode')}
            autoCapitalize="none"
            placeholder="quem te trouxe pra cena"
          />

          <Text style={styles.label}>Como você se identifica?</Text>
          <View style={styles.genderRow}>
            {(['FEMININE', 'MASCULINE'] as Gender[]).map((g) => (
              <Button
                key={g}
                label={g === 'FEMININE' ? 'Feminino' : 'Masculino'}
                variant={gender === g ? 'primary' : 'ghost'}
                onPress={() => setGender(g)}
                style={styles.genderBtn}
              />
            ))}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            label="Criar conta"
            onPress={onSubmit}
            loading={loading}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({
  label,
  ...inputProps
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor={palette.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingVertical: 24, gap: 4 },
  title: { fontSize: 28, fontWeight: '800', color: palette.text },
  subtitle: { fontSize: 14, color: palette.textMuted, marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, color: palette.textMuted, marginBottom: 6, marginTop: 8 },
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
  genderRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  genderBtn: { flex: 1 },
  error: { color: palette.danger, marginTop: 14, fontSize: 14 },
  submit: { marginTop: 24 },
});
