import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, orkut, glow } from '../../theme/colors';
import { font } from '../../theme/fonts';
import type { ScreenProps } from '../../navigation/types';

export function WelcomeScreen({ navigation }: ScreenProps<'Welcome'>) {
  return (
    <LinearGradient
      colors={['#FBE3F1', '#E9EFF8', '#E3EAF3']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.hero}>
            <View style={[styles.orb, glow(orkut.magenta, 60, 0.4)]} />
            <Text style={[styles.logo, glow(orkut.magenta, 18, 0.4)]}>vonue</Text>
            <View style={styles.taglineWrap}>
              <View style={styles.line} />
              <Text style={styles.tagline}>A CENA EM UM LUGAR</Text>
              <View style={styles.line} />
            </View>
          </View>

          <Text style={styles.desc}>
            Raves, festivais e a tribo eletrônica do Brasil. Reencontre a
            cena: amigos, scraps, comunidades, árvore e a sua história.
          </Text>

          <View style={styles.footer}>
            <Pressable
              style={styles.cta}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.ctaTx}>ENTRAR NA CENA</Text>
            </Pressable>
            <Text style={styles.foot}>18+ · sua tribo, sua história</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 44,
  },
  hero: { marginTop: 76, alignItems: 'center' },
  orb: {
    position: 'absolute',
    top: -8,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: orkut.magenta,
    opacity: 0.14,
  },
  logo: {
    fontFamily: font.disp,
    fontSize: 54,
    color: orkut.magenta,
    letterSpacing: 1,
  },
  taglineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  line: { width: 26, height: 1, backgroundColor: orkut.blue, opacity: 0.6 },
  tagline: {
    fontFamily: font.mono,
    fontSize: 11,
    color: palette.link,
    letterSpacing: 3,
  },
  desc: {
    fontFamily: font.bodyLight,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 24,
    color: palette.textMuted,
  },
  footer: { gap: 14 },
  cta: {
    backgroundColor: orkut.blue,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    ...glow(orkut.blue, 18, 0.5),
  },
  ctaTx: {
    fontFamily: font.mono,
    fontSize: 12,
    color: '#fff',
    letterSpacing: 3,
  },
  foot: {
    fontFamily: font.mono,
    textAlign: 'center',
    color: palette.textFaint,
    fontSize: 9,
    letterSpacing: 1,
  },
});
