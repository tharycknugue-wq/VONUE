import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import type { ScreenProps } from '../../navigation/types';

export function WelcomeScreen({ navigation }: ScreenProps<'Welcome'>) {
  return (
    <Screen style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>VONUE</Text>
        <Text style={styles.tagline}>A cena em um lugar.</Text>
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between', paddingVertical: 40 },
  hero: { marginTop: 60, alignItems: 'center' },
  logo: {
    fontSize: 56,
    fontWeight: '900',
    color: palette.text,
    letterSpacing: 6,
  },
  tagline: { marginTop: 8, fontSize: 16, color: palette.primary },
  body: { paddingHorizontal: 8 },
  desc: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: palette.textMuted,
  },
  footer: { gap: 12 },
});
