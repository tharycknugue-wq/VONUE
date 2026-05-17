import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, type EventPhoto } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

export function EventPhotosScreen({ route, navigation }: ScreenProps<'EventPhotos'>) {
  const { eventId, eventName } = route.params;
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api
      .eventPhotos(eventId)
      .then((d) => setPhotos(d.photos))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Button
        label="Adicionar foto"
        onPress={() =>
          navigation.navigate('UploadPhoto', { eventId, eventName })
        }
        style={styles.add}
      />

      {loading ? (
        <ActivityIndicator color={palette.primary} style={{ marginTop: 40 }} />
      ) : photos.length === 0 ? (
        <Text style={styles.empty}>
          Nenhuma foto pública ainda. Seja o primeiro a registrar o rolê.
        </Text>
      ) : (
        photos.map((p) => (
          <View key={p.id} style={styles.card}>
            <Image
              source={{ uri: p.thumbnailUrl ?? p.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.meta}>
              <Text style={styles.photographer}>📷 {p.photographer}</Text>
              {p.taggedPeople.length > 0 && (
                <Text style={styles.tagged}>
                  com {p.taggedPeople.join(', ')}
                </Text>
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
  add: { marginBottom: 16 },
  empty: {
    color: palette.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
  },
  image: { width: '100%', height: 240, backgroundColor: palette.surfaceAlt },
  meta: { padding: 14 },
  photographer: { color: palette.text, fontSize: 14, fontWeight: '700' },
  tagged: { color: palette.textMuted, fontSize: 13, marginTop: 4 },
});
