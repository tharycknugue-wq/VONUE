import { useCallback, useState } from 'react';
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
import { api, ApiError, type JobDetail } from '../../services/api';
import { ROLE_LABEL } from './roles';
import type { ScreenProps } from '../../navigation/types';

const APP_STATUS: Record<string, string> = {
  PENDING: 'Pendente',
  ACCEPTED: 'Contratado',
  REJECTED: 'Não selecionado',
};

export function JobDetailScreen({ route, navigation }: ScreenProps<'JobDetail'>) {
  const { jobId } = route.params;
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .job(jobId)
      .then(setJob)
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [jobId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const run = async (key: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(key);
    try {
      await fn();
      Alert.alert('Pronto', ok);
      load();
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Ação falhou.');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }
  if (!job) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.muted}>Vaga não encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.sub}>
        {ROLE_LABEL[job.role]} · {job.event.name}
      </Text>
      <Text style={styles.status}>
        {job.status === 'OPEN'
          ? 'Vaga aberta'
          : job.status === 'FILLED'
            ? 'Vaga preenchida'
            : 'Vaga encerrada'}
        {job.budget != null ? ` · R$ ${job.budget.toFixed(2)}` : ' · a combinar'}
      </Text>
      {job.description && <Text style={styles.desc}>{job.description}</Text>}

      {/* ----- Visão do organizador ----- */}
      {job.isOrganizer && (
        <>
          <Text style={styles.section}>CANDIDATOS</Text>
          {(job.applications ?? []).length === 0 ? (
            <Text style={styles.muted}>Ninguém se candidatou ainda.</Text>
          ) : (
            (job.applications ?? []).map((a) => (
              <View key={a.id} style={styles.card}>
                <Text style={styles.name}>{a.applicant.name}</Text>
                <Text style={styles.handle}>@{a.applicant.username}</Text>
                {a.message && <Text style={styles.msg}>“{a.message}”</Text>}
                <Text style={styles.appStatus}>{APP_STATUS[a.status]}</Text>
                {job.status === 'OPEN' && a.status === 'PENDING' && (
                  <Button
                    label="Contratar"
                    onPress={() =>
                      run(
                        a.id,
                        () => api.acceptApplication(a.id),
                        'Freelancer contratado.'
                      )
                    }
                    loading={busy === a.id}
                    style={styles.cta}
                  />
                )}
              </View>
            ))
          )}
          {job.status === 'FILLED' && job.hiredUserId && (
            <Button
              label="Avaliar freelancer"
              variant="ghost"
              onPress={() =>
                navigation.navigate('Review', {
                  mode: 'freelancer',
                  jobId: job.id,
                  title: job.title,
                })
              }
              style={styles.cta}
            />
          )}
        </>
      )}

      {/* ----- Visão do candidato ----- */}
      {!job.isOrganizer && (
        <>
          {job.myApplicationStatus ? (
            <View style={styles.card}>
              <Text style={styles.name}>Sua candidatura</Text>
              <Text style={styles.appStatus}>
                {APP_STATUS[job.myApplicationStatus]}
              </Text>
            </View>
          ) : job.status === 'OPEN' ? (
            <>
              <Text style={styles.section}>CANDIDATAR-SE</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
                placeholder="Conte por que você é a pessoa certa"
                placeholderTextColor={palette.textMuted}
                style={styles.input}
              />
              <Button
                label="Enviar candidatura"
                onPress={() =>
                  run(
                    'apply',
                    () => api.applyJob(jobId, message.trim() || undefined),
                    'Candidatura enviada.'
                  )
                }
                loading={busy === 'apply'}
                style={styles.cta}
              />
            </>
          ) : (
            <Text style={styles.muted}>Esta vaga não está mais aberta.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 24, paddingBottom: 48 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: palette.textMuted, fontSize: 15, marginTop: 12 },
  title: { color: palette.text, fontSize: 24, fontWeight: '900' },
  sub: { color: palette.primary, fontSize: 15, fontWeight: '700', marginTop: 6 },
  status: { color: palette.textMuted, fontSize: 14, marginTop: 8 },
  desc: { color: palette.text, fontSize: 15, lineHeight: 22, marginTop: 18 },
  section: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 30,
    marginBottom: 10,
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  name: { color: palette.text, fontSize: 16, fontWeight: '700' },
  handle: { color: palette.textMuted, fontSize: 13, marginTop: 2 },
  msg: { color: palette.text, fontSize: 14, marginTop: 8, fontStyle: 'italic' },
  appStatus: { color: palette.primary, fontSize: 13, fontWeight: '700', marginTop: 8 },
  input: {
    minHeight: 90,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    color: palette.text,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  cta: { marginTop: 14 },
});
