import { useState } from 'react';
import {
  Alert,
  Pressable,
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

export function ReviewScreen({ route, navigation }: ScreenProps<'Review'>) {
  const params = route.params;
  const COPY = {
    organizer: {
      heading: 'Avaliar a organização',
      placeholder: 'Como foi a organização do rolê?',
      hint: 'Só é possível avaliar após o check-in, uma vez por evento.',
    },
    dj: {
      heading: 'Avaliar o DJ',
      placeholder: 'Como foi o set?',
      hint: 'Só dá pra avaliar um DJ que tocou num evento em que você esteve.',
    },
    photographer: {
      heading: 'Avaliar o fotógrafo',
      placeholder: 'Como ficaram as fotos?',
      hint: 'Você precisa ter aprovado uma foto desse fotógrafo.',
    },
    promoter: {
      heading: 'Avaliar o promoter',
      placeholder: 'Como foi comprar com esse promoter?',
      hint: 'Você precisa ter comprado ingresso através desse promoter.',
    },
    freelancer: {
      heading: 'Avaliar o freelancer',
      placeholder: 'Como foi o trabalho dele na vaga?',
      hint: 'Só o organizador que contratou avalia o freelancer.',
    },
  }[params.mode];
  const { heading, placeholder, hint } = COPY;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (rating < 1) {
      Alert.alert('Atenção', 'Escolha de 1 a 5 estrelas.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        rating,
        comment: comment.trim() || undefined,
        anonymous,
      };
      if (params.mode === 'dj') {
        await api.reviewDJ(params.djId, payload);
      } else if (params.mode === 'photographer') {
        await api.reviewPhotographer(params.photoId, payload);
      } else if (params.mode === 'promoter') {
        await api.reviewPromoter(params.promoterId, payload);
      } else if (params.mode === 'freelancer') {
        await api.reviewFreelancer(params.jobId, payload);
      } else {
        await api.reviewOrganizer(params.eventId, payload);
      }
      Alert.alert('Avaliação enviada', 'Obrigado por fortalecer a cena.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(
        'Erro',
        e instanceof ApiError ? e.message : 'Não foi possível avaliar.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{heading}</Text>
      <Text style={styles.subtitle}>{params.title}</Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)} hitSlop={8}>
            <Text style={[styles.star, n <= rating && styles.starOn]}>★</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Comentário (opcional)</Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        multiline
        maxLength={500}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        style={styles.input}
      />

      <View style={styles.anonRow}>
        <View style={styles.flex}>
          <Text style={styles.anonTitle}>Avaliação anônima</Text>
          <Text style={styles.anonDesc}>Seu nome não aparece para o avaliado.</Text>
        </View>
        <Switch
          value={anonymous}
          onValueChange={setAnonymous}
          trackColor={{ true: palette.primary, false: palette.border }}
          thumbColor={palette.text}
        />
      </View>

      <Button
        label="Enviar avaliação"
        onPress={submit}
        loading={loading}
        style={styles.submit}
      />
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 24 },
  title: { color: palette.text, fontSize: 24, fontWeight: '900', marginTop: 8 },
  subtitle: { color: palette.primary, fontSize: 15, fontWeight: '700', marginTop: 6 },
  stars: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 28,
    justifyContent: 'center',
  },
  star: { fontSize: 44, color: palette.border },
  starOn: { color: '#FFC83D' },
  label: { color: palette.textMuted, fontSize: 13, marginTop: 32, marginBottom: 8 },
  input: {
    minHeight: 100,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    color: palette.text,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    padding: 16,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  flex: { flex: 1 },
  anonTitle: { color: palette.text, fontSize: 15, fontWeight: '700' },
  anonDesc: { color: palette.textMuted, fontSize: 13, marginTop: 2 },
  submit: { marginTop: 28 },
  hint: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 14,
    textAlign: 'center',
  },
});
