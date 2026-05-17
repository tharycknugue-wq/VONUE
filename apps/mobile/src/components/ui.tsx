import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  palette,
  gradients,
  glow,
  space,
  radius,
} from '../theme/colors';

/* ---------- ScreenScroll: base de toda tela (bg + scroll seguro) -------- */

export function ScreenScroll({
  children,
  edges = ['top', 'bottom'],
  contentStyle,
}: {
  children: ReactNode;
  edges?: ('top' | 'bottom')[];
  contentStyle?: ViewStyle;
}) {
  return (
    <SafeAreaView style={ui.safe} edges={edges}>
      <ScrollView
        style={ui.flex}
        contentContainerStyle={[ui.scrollContent, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- GradientHero: cabeçalho com gradiente + glow ---------------- */

export function GradientHero({
  colors = gradients.hero,
  children,
  style,
}: {
  colors?: readonly string[];
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <LinearGradient
      colors={colors as unknown as string[]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[ui.hero, style]}
    >
      {children}
    </LinearGradient>
  );
}

/* ---------- Card: superfície clicável com borda/glow opcional ---------- */

export function Card({
  children,
  onPress,
  accent,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  accent?: string;
  style?: ViewStyle;
}) {
  const content = (
    <View
      style={[
        ui.card,
        accent ? { borderColor: accent, ...glow(accent, 10, 0.25) } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? ui.pressed : undefined)}
    >
      {content}
    </Pressable>
  );
}

/* ---------- Avatar: círculo com iniciais + cor derivada do nome -------- */

const AVATAR_COLORS = [
  palette.primary,
  palette.accent,
  palette.hot,
  palette.gold,
  palette.success,
  palette.primaryDeep,
];

function hashIndex(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function Avatar({
  name,
  size = 44,
  ring,
}: {
  name: string;
  size?: number;
  ring?: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  const c = AVATAR_COLORS[hashIndex(name || '?', AVATAR_COLORS.length)];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c + '2E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 2 : 1,
        borderColor: ring ?? c,
        ...(ring ? glow(ring, 8, 0.4) : null),
      }}
    >
      <Text style={{ color: c, fontWeight: '900', fontSize: size * 0.38 }}>
        {initials || '?'}
      </Text>
    </View>
  );
}

/* ---------- Pill: chip pequeno ---------------------------------------- */

export function Pill({
  label,
  color = palette.primary,
  filled = false,
}: {
  label: string;
  color?: string;
  filled?: boolean;
}) {
  return (
    <View
      style={[
        ui.pill,
        filled
          ? { backgroundColor: color }
          : { borderWidth: 1, borderColor: color, backgroundColor: color + '1A' },
      ]}
    >
      <Text
        style={[
          ui.pillText,
          { color: filled ? palette.bg : color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/* ---------- StatTile: número grande + rótulo -------------------------- */

export function StatTile({
  value,
  label,
  color = palette.primary,
  onPress,
}: {
  value: string | number;
  label: string;
  color?: string;
  onPress?: () => void;
}) {
  const inner = (
    <View style={ui.stat}>
      <Text style={[ui.statValue, { color }]}>{value}</Text>
      <Text style={ui.statLabel}>{label}</Text>
    </View>
  );
  if (!onPress) return inner;
  return (
    <Pressable
      style={({ pressed }) => [ui.flex, pressed && ui.pressed]}
      onPress={onPress}
    >
      {inner}
    </Pressable>
  );
}

/* ---------- EmptyState ------------------------------------------------- */

export function EmptyState({
  emoji,
  title,
  hint,
}: {
  emoji: string;
  title: string;
  hint?: string;
}) {
  return (
    <View style={ui.empty}>
      <Text style={ui.emptyEmoji}>{emoji}</Text>
      <Text style={ui.emptyTitle}>{title}</Text>
      {hint ? <Text style={ui.emptyHint}>{hint}</Text> : null}
    </View>
  );
}

/* ---------- SectionTitle ---------------------------------------------- */

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={ui.sectionRow}>
      <Text style={ui.section}>{children}</Text>
      {action ? (
        <Pressable onPress={action.onPress}>
          <Text style={ui.sectionAction}>{action.label} ›</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const ui = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  pressed: { opacity: 0.65, transform: [{ scale: 0.985 }] },
  hero: {
    paddingHorizontal: space.xl,
    paddingTop: space.xxl,
    paddingBottom: space.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  stat: {
    flex: 1,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { color: palette.textMuted, fontSize: 12, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  emptyTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyHint: {
    color: palette.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.xxl,
    marginBottom: space.lg,
  },
  section: { color: palette.text, fontSize: 19, fontWeight: '900' },
  sectionAction: { color: palette.primary, fontSize: 14, fontWeight: '700' },
});
