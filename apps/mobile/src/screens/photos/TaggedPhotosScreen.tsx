import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError, type TaggedPhoto } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

const STATUS: Record<TaggedPhoto['status'], string> = {
  PENDING: 'Aguardando você',
  APPROVED: 'Aprovada',
  REJECTED: 'Recusada',
};

export function TaggedPhotosScreen({ navigation }: ScreenProps<'TaggedPhotos'>) {
  const [tags, setTags] = useState<TaggedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .taggedPhotos()
      .then((d) => setTags(d.tags))
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const act = async (tagId: string, approve: boolean) => {
    setBusy(tagId);
    try {
      if (approve) {
        await api.approvePhotoTag(tagId);
        Alert.alert('Aprovada', 'Foto liberada. Pode render o selo 🎞️.');
      } else {
        await api.rejectPhotoTag(tagId);
      }
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {tags.length === 0 ? (
        <Text style={styles.empty}>Ninguém te marcou em fotos ainda.</Text>
      ) : (
        tags.map((t) => (
          <View key={t.tagId} style={styles.card}>
            <Image
              source={{ uri: t.photo.thumbnailUrl ?? t.photo.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.meta}>
              <Text style={styles.event}>{t.photo.eventName}</Text>
              <Text style={styles.status}>{STATUS[t.status]}</Text>
              {t.status === 'PENDING' && (
                <View style={styles.actions}>
                  <Button
                    label="Aprovar"
                    onPress={() => act(t.tagId, true)}
                    loading={busy === t.tagId}
                    style={styles.flex}
                  />
                  <Button
                    label="Recusar"
                    variant="ghost"
                    onPress={() => act(t.tagId, false)}
                    loading={busy === t.tagId}
                    style={styles.flex}
                  />
                </View>
              )}
              {t.status === 'APPROVED' && (
                <Button
                  label="Avaliar fotógrafo"
                  variant="ghost"
                  onPress={() =>
                    navigation.navigate('Review', {
                      mode: 'photographer',
                      photoId: t.photo.id,
                      title: t.photo.eventName,
                    })
                  }
                  style={styles.reviewBtn}
                />
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 16, paddingBottom: 40 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  empty: {
    color: palette.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 60,
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
  },
  image: { width: '100%', height: 220, backgroundColor: palette.surfaceAlt },
  meta: { padding: 14 },
  event: { color: palette.text, fontSize: 15, fontWeight: '800' },
  status: { color: palette.textMuted, fontSize: 13, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 14 },
  reviewBtn: { marginTop: 14 },
  flex: { flex: 1 },
});
