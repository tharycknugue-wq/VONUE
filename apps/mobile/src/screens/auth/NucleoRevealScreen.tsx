import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, glow } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { TRIBOS } from '../../data/tribos';
import { genreById } from '../../data/genres';
import type { ScreenProps } from '../../navigation/types';

export function NucleoRevealScreen({
  route,
  navigation,
}: ScreenProps<'NucleoReveal'>) {
  const tribo = TRIBOS[route.params.nucleoType];
  const genres = route.params.genres ?? [];
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(rise, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, rise]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[tribo.color + '22', palette.bg, palette.bg]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
        style={styles.ambient}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fade, transform: [{ translateY: rise }] },
          ]}
        >
          <View
            style={[
              styles.orb,
              { backgroundColor: tribo.color + '1F', borderColor: tribo.color },
              glow(tribo.color, 26, 0.4),
            ]}
          >
            <Text style={styles.orbEmoji}>{tribo.emoji}</Text>
          </View>

          <Text style={styles.pre}>SUA TRIBO É</Text>
          <Text
            style={[
              styles.name,
              { color: tribo.color },
              glow(tribo.color, 16, 0.5),
            ]}
          >
            {tribo.name}
          </Text>
          <Text style={styles.sub}>{tribo.sub}</Text>

          <View style={[styles.divider, { backgroundColor: tribo.color }]} />

          {tribo.msg.map((p, i) => (
            <Text key={i} style={styles.msg}>
              {p}
            </Text>
          ))}

          {genres.length > 0 && (
            <View style={styles.tags}>
              {genres.map((id) => {
                const g = genreById(id);
                if (!g) return null;
                return (
                  <View
                    key={id}
                    style={[styles.tag, { borderColor: g.color }]}
                  >
                    <Text style={[styles.tagTx, { color: g.color }]}>
                      {g.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <Pressable
            style={[styles.btn, { backgroundColor: tribo.color }]}
            onPress={() =>
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
            }
          >
            <Text style={styles.btnTx}>ENTRAR NO VONUE</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  ambient: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  content: { alignItems: 'center' },
  orb: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  orbEmoji: { fontSize: 52 },
  pre: {
    fontFamily: font.mono,
    fontSize: 9,
    letterSpacing: 6,
    color: palette.textMuted,
    marginBottom: 6,
  },
  name: {
    fontFamily: font.disp,
    fontSize: 52,
    letterSpacing: 4,
    marginBottom: 4,
  },
  sub: {
    fontFamily: font.disp,
    fontSize: 11,
    letterSpacing: 1.5,
    color: palette.textMuted,
    marginBottom: 18,
  },
  divider: {
    width: 56,
    height: 2,
    borderRadius: 1,
    marginBottom: 18,
    opacity: 0.7,
  },
  msg: {
    fontFamily: font.body,
    fontSize: 13,
    lineHeight: 22,
    color: palette.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 26,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  tagTx: { fontFamily: font.mono, fontSize: 7, letterSpacing: 1.5 },
  btn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 100,
    alignItems: 'center',
  },
  btnTx: {
    fontFamily: font.disp,
    fontSize: 11,
    letterSpacing: 3,
    color: '#FFFFFF',
  },
});
