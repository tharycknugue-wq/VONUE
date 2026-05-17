import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

interface Attendee {
  id: string;
  name: string;
  username: string;
}

export function UploadPhotoScreen({ route, navigation }: ScreenProps<'UploadPhoto'>) {
  const { eventId, eventName } = route.params;
  const [imageUrl, setImageUrl] = useState(
    `https://picsum.photos/seed/${Math.random().toString(36).slice(2, 8)}/900/700`
  );
  const [isPublic, setIsPublic] = useState(true);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .getEventCheckins(eventId)
      .then((d) => setAttendees(d.checkins.map((c) => c.user)))
      .catch(() => setAttendees([]));
  }, [eventId]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submit = async () => {
    if (!imageUrl.trim()) {
      Alert.alert('Atenção', 'Informe a URL da imagem.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.uploadPhoto(eventId, {
        imageUrl: imageUrl.trim(),
        isPublic,
        tagUserIds: [...selected],
      });
      Alert.alert(
        'Foto publicada',
        res.taggedCount > 0
          ? `${res.taggedCount} pessoa(s) marcada(s) — elas precisam aprovar.`
          : 'Foto adicionada ao álbum.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha ao publicar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.event}>{eventName}</Text>

      <Text style={styles.label}>URL da imagem</Text>
      <TextInput
        value={imageUrl}
        onChangeText={setImageUrl}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={palette.textMuted}
        style={styles.input}
      />
      <Text style={styles.hint}>
        Sandbox: sem upload de arquivo. Use uma URL pública (ex.: picsum).
      </Text>

      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={styles.rowTitle}>Foto pública</Text>
          <Text style={styles.rowDesc}>Aparece no álbum do evento.</Text>
        </View>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ true: palette.primary, false: palette.border }}
          thumbColor={palette.text}
        />
      </View>

      <Text style={styles.label}>Marcar quem estava lá</Text>
      {attendees.length === 0 ? (
        <Text style={styles.hint}>Ninguém com check-in para marcar.</Text>
      ) : (
        attendees.map((a) => {
          const on = selected.has(a.id);
          return (
            <Pressable
              key={a.id}
              onPress={() => toggle(a.id)}
              style={[styles.attendee, on && styles.attendeeOn]}
            >
              <Text style={[styles.attendeeName, on && styles.attendeeNameOn]}>
                {a.name}
              </Text>
              <Text style={styles.attendeeAt}>@{a.username}</Text>
            </Pressable>
          );
        })
      )}

      <Button
        label="Publicar foto"
        onPress={submit}
        loading={loading}
        style={styles.submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 24, paddingBottom: 48 },
  event: { color: palette.primary, fontSize: 16, fontWeight: '800' },
  label: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 24,
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.text,
    fontSize: 14,
  },
  hint: { color: palette.textMuted, fontSize: 12, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  flex: { flex: 1 },
  rowTitle: { color: palette.text, fontSize: 15, fontWeight: '700' },
  rowDesc: { color: palette.textMuted, fontSize: 13, marginTop: 2 },
  attendee: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 8,
  },
  attendeeOn: { borderColor: palette.primary, backgroundColor: palette.surfaceAlt },
  attendeeName: { color: palette.text, fontSize: 15, fontWeight: '600' },
  attendeeNameOn: { color: palette.primary },
  attendeeAt: { color: palette.textMuted, fontSize: 12, marginTop: 2 },
  submit: { marginTop: 28 },
});
