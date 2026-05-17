import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenScroll, GradientHero } from '../../components/ui';
import { palette, gradients, glow, space, radius } from '../../theme/colors';
import type { RootNav } from '../../navigation/types';

type Action = {
  emoji: string;
  title: string;
  desc: string;
  color: string;
  go: (nav: RootNav) => void;
};

const ACTIONS: Action[] = [
  {
    emoji: '🎉',
    title: 'Check-in',
    desc: 'Marque presença num evento',
    color: palette.primary,
    go: (n) => n.navigate('Discover'),
  },
  {
    emoji: '🛍️',
    title: 'Anunciar',
    desc: 'Venda na loja com escrow',
    color: palette.accent,
    go: (n) => n.navigate('SellProduct'),
  },
  {
    emoji: '🎧',
    title: 'Virar DJ',
    desc: 'Crie seu perfil de artista',
    color: palette.hot,
    go: (n) => n.navigate('BecomeDJ'),
  },
  {
    emoji: '📸',
    title: 'Fotos comigo',
    desc: 'Aprove onde te marcaram',
    color: palette.gold,
    go: (n) => n.navigate('TaggedPhotos'),
  },
  {
    emoji: '📣',
    title: 'Promoter',
    desc: 'Seu código e comissões',
    color: palette.success,
    go: (n) => n.navigate('Promoter'),
  },
  {
    emoji: '🧰',
    title: 'Vagas',
    desc: 'Trabalhe na cena',
    color: palette.primaryDeep,
    go: (n) => n.navigate('Jobs'),
  },
];

export function CreateScreen() {
  const nav = useNavigation<RootNav>();
  return (
    <ScreenScroll edges={['top']}>
      <GradientHero colors={gradients.hot}>
        <Text style={styles.title}>Criar</Text>
        <Text style={styles.sub}>Bota algo seu na cena.</Text>
      </GradientHero>

      <View style={styles.grid}>
        {ACTIONS.map((a) => (
          <Pressable
            key={a.title}
            onPress={() => a.go(nav)}
            style={({ pressed }) => [
              styles.tile,
              { borderColor: a.color },
              glow(a.color, 10, 0.25),
              pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.tileEmoji}>{a.emoji}</Text>
            <Text style={styles.tileTitle}>{a.title}</Text>
            <Text style={styles.tileDesc}>{a.desc}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  title: { color: palette.bg, fontSize: 32, fontWeight: '900' },
  sub: { color: 'rgba(7,7,13,0.7)', fontSize: 14, fontWeight: '600', marginTop: 2 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    gap: space.md,
  },
  tile: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    minHeight: 128,
    justifyContent: 'flex-end',
  },
  tileEmoji: { fontSize: 30, marginBottom: 'auto' },
  tileTitle: { color: palette.text, fontSize: 17, fontWeight: '900', marginTop: 10 },
  tileDesc: { color: palette.textMuted, fontSize: 12, marginTop: 3 },
});
