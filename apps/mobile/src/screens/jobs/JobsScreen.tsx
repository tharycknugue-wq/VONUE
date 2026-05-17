import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { palette } from '../../theme/colors';
import { api, type JobListItem } from '../../services/api';
import { ROLE_LABEL } from './roles';
import type { ScreenProps } from '../../navigation/types';

export function JobsScreen({ navigation }: ScreenProps<'Jobs'>) {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api
      .openJobs()
      .then((d) => setJobs(d.jobs))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {jobs.length === 0 ? (
        <Text style={styles.empty}>
          Nenhuma vaga aberta agora. Organizadores publicam vagas pelo evento.
        </Text>
      ) : (
        jobs.map((j) => (
          <Pressable
            key={j.id}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.navigate('JobDetail', { jobId: j.id })}
          >
            <View style={styles.row}>
              <Text style={styles.title}>{j.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{ROLE_LABEL[j.role]}</Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {j.event.name} ·{' '}
              {new Date(j.event.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
            <Text style={styles.meta}>
              {j.budget != null ? `R$ ${j.budget.toFixed(2)}` : 'a combinar'} ·{' '}
              {j.applicationCount} candidato(s)
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 20, paddingBottom: 40 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  empty: {
    color: palette.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 50,
    lineHeight: 22,
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { color: palette.text, fontSize: 16, fontWeight: '800', flex: 1 },
  badge: {
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 10,
  },
  badgeText: { color: palette.primary, fontSize: 11, fontWeight: '700' },
  meta: { color: palette.textMuted, fontSize: 13, marginTop: 6 },
});
