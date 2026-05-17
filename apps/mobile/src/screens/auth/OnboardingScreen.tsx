import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError, type OnboardingQuestion } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { ScreenProps } from '../../navigation/types';

export function OnboardingScreen({ navigation }: ScreenProps<'Onboarding'>) {
  const applyNucleo = useAuthStore((s) => s.applyNucleo);

  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getQuestions()
      .then((data) => setQuestions(data.questions))
      .catch(() => setError('Não foi possível carregar as perguntas.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={palette.primary} />
      </Screen>
    );
  }

  if (error && questions.length === 0) {
    return (
      <Screen style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </Screen>
    );
  }

  const question = questions[index];
  const selected = answers[question.id];
  const isLast = index === questions.length - 1;
  const progress = (index + 1) / questions.length;

  const choose = (optionId: string) =>
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));

  const next = async () => {
    if (!selected) return;
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        optionId: answers[q.id],
      }));
      const result = await api.completeOnboarding(payload);
      await applyNucleo(result.nucleoType);
      navigation.navigate('NucleoReveal', { nucleoType: result.nucleoType });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao enviar respostas.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.step}>
          {index + 1} / {questions.length}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.question}>{question.text}</Text>

        <View style={styles.options}>
          {question.options.map((opt) => {
            const active = selected === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => choose(opt.id)}
                style={[styles.option, active && styles.optionActive]}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        {index > 0 && (
          <Button
            label="Voltar"
            variant="ghost"
            onPress={() => setIndex((i) => i - 1)}
            style={styles.backBtn}
          />
        )}
        <Button
          label={isLast ? 'Revelar meu núcleo' : 'Próxima'}
          onPress={next}
          disabled={!selected}
          loading={submitting}
          style={styles.flex}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: { paddingTop: 16 },
  step: { color: palette.textMuted, fontSize: 13, marginBottom: 8 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.surface,
    overflow: 'hidden',
  },
  progressFill: { height: 6, backgroundColor: palette.primary },
  scroll: { paddingVertical: 28 },
  question: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 28,
  },
  options: { gap: 12 },
  option: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  optionActive: { borderColor: palette.primary, backgroundColor: palette.surfaceAlt },
  optionText: { color: palette.text, fontSize: 16 },
  optionTextActive: { color: palette.primary, fontWeight: '700' },
  footer: { flexDirection: 'row', gap: 12, paddingVertical: 16 },
  backBtn: { width: 110 },
  flex: { flex: 1 },
  error: { color: palette.danger, marginTop: 18, fontSize: 14 },
});
