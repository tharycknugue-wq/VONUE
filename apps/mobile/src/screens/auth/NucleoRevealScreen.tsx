import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { palette, NUCLEO_META } from '../../theme/colors';
import type { ScreenProps } from '../../navigation/types';

export function NucleoRevealScreen({ route, navigation }: ScreenProps<'NucleoReveal'>) {
  const meta = NUCLEO_META[route.params.nucleoType];
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, [fade, scale]);

  return (
    <LinearGradient colors={meta.gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View
          style={[styles.center, { opacity: fade, transform: [{ scale }] }]}
        >
          <Text style={styles.kicker}>SEU NÚCLEO É</Text>
          <Text style={[styles.nucleo, { color: meta.color }]}>
            {meta.label.toUpperCase()}
          </Text>
          <View style={[styles.orb, { backgroundColor: meta.color }]} />
          <Text style={styles.tagline}>{meta.tagline}</Text>
        </Animated.View>

        <View style={styles.footer}>
          <Button
            label="Continuar"
            color={meta.color}
            onPress={() =>
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
            }
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  kicker: {
    color: palette.textMuted,
    fontSize: 14,
    letterSpacing: 3,
    marginBottom: 12,
  },
  nucleo: { fontSize: 44, fontWeight: '900', letterSpacing: 2 },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginVertical: 36,
    opacity: 0.9,
  },
  tagline: {
    color: palette.text,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 12,
  },
  footer: { paddingBottom: 24 },
});
