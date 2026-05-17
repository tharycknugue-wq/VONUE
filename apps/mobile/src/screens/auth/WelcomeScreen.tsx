import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/Button';
import { palette, glow } from '../../theme/colors';
import type { ScreenProps } from '../../navigation/types';

export function WelcomeScreen({ navigation }: ScreenProps<'Welcome'>) {
  return (
    <LinearGradient
      colors={['#1A0B3D', '#0C0C16', '#07070D']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.hero}>
            <View style={[styles.orb, glow(palette.primaryDeep, 60, 0.55)]} />
            <Text style={[styles.logo, glow(palette.primary, 24, 0.8)]}>
              VONUE
            </Text>
            <View style={styles.taglineWrap}>
              <View style={styles.line} />
              <Text style={styles.tagline}>A CENA EM UM LUGAR</Text>
              <View style={styles.line} />
            </View>
          </View>

          <View style={styles.body}>
            <Text style={styles.desc}>
              Raves, festivais e a tribo eletrônica do Brasil — descoberta,
              conexão e memória num só ecossistema.
            </Text>
          </View>

          <View style={styles.footer}>
            <Button
              label="Entrar na cena"
              onPress={() => navigation.navigate('Register')}
            />
            <Text style={styles.footnote}>
              18+ · sua cena, sua tribo, sua história
            </Text>
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
  hero: { marginTop: 72, alignItems: 'center' },
  orb: {
    position: 'absolute',
    top: -10,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: palette.primaryDeep,
    opacity: 0.18,
  },
  logo: {
    fontSize: 60,
    fontWeight: '900',
    color: palette.text,
    letterSpacing: 8,
  },
  taglineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
  },
  line: { width: 28, height: 1, backgroundColor: palette.primary, opacity: 0.6 },
  tagline: {
    fontSize: 13,
    color: palette.primary,
    fontWeight: '800',
    letterSpacing: 3,
  },
  body: { paddingHorizontal: 8 },
  desc: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 25,
    color: palette.textMuted,
  },
  footer: { gap: 14 },
  footnote: {
    textAlign: 'center',
    color: palette.textFaint,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
