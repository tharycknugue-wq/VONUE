import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, gradients, glow } from '../theme/colors';

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'gradient';
  color?: string;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'gradient',
  color = palette.primary,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isGradient = variant === 'gradient';
  const isPrimary = variant === 'primary';

  const labelEl = loading ? (
    <ActivityIndicator color={isGradient || isPrimary ? palette.bg : palette.text} />
  ) : (
    <Text
      style={[
        styles.label,
        { color: isGradient || isPrimary ? palette.bg : palette.text },
      ]}
    >
      {label}
    </Text>
  );

  if (isGradient) {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          glow(palette.primaryDeep, 18, 0.5),
          (pressed || isDisabled) && { opacity: 0.6 },
          style,
        ]}
      >
        <LinearGradient
          colors={gradients.brand as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.base}
        >
          {labelEl}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary
          ? { backgroundColor: color }
          : { borderWidth: 1, borderColor: palette.border },
        (pressed || isDisabled) && { opacity: 0.6 },
        style,
      ]}
    >
      <View style={styles.center}>{labelEl}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  label: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
