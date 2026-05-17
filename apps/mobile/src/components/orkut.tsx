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
import { palette, orkut, glow, space, radius } from '../theme/colors';
import { font } from '../theme/fonts';
import { useAppNav } from '../hooks/useAppNav';

type Grad = readonly [string, string];

/* ===================== Ambient + Screen ===================== */

function Ambient() {
  return (
    <View pointerEvents="none" style={styles.ambient}>
      <View style={[styles.blob, { top: -60, left: -40, backgroundColor: orkut.blue }]} />
      <View style={[styles.blob, { top: 120, right: -70, backgroundColor: orkut.orange }]} />
      <View style={[styles.blob, { bottom: 40, left: -50, backgroundColor: orkut.violet }]} />
      <View style={[styles.blob, { bottom: -60, right: -30, backgroundColor: orkut.magenta }]} />
    </View>
  );
}

export function OrkutScreen({
  children,
  current,
}: {
  children: ReactNode;
  current: string;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Ambient />
      <AppHeader current={current} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===================== Header + NavTabs ===================== */

const NAVTABS: { label: string; key: string }[] = [
  { label: 'INÍCIO', key: 'Inicio' },
  { label: 'SCRAPS', key: 'Scraps' },
  { label: 'EVENTOS', key: 'Eventos' },
  { label: 'COMUNIDADES', key: 'Comunidades' },
  { label: 'PROFISSIONAIS', key: 'Profissionais' },
  { label: 'PERFIL', key: 'Perfil' },
];

export function AppHeader({ current }: { current: string }) {
  const { tab, root } = useAppNav();

  const go = (key: string) => {
    if (key === 'Profissionais') return root?.navigate('DJs');
    tab.navigate(key as 'Inicio');
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Pressable onPress={() => tab.navigate('Inicio')}>
          <Text style={styles.logo}>VONUE</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.bell}
            onPress={() => root?.navigate('Notifications')}
          >
            <Text style={styles.bellIco}>💬</Text>
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeTx}>3</Text>
            </View>
          </Pressable>
          <Pressable
            style={styles.headerUser}
            onPress={() => tab.navigate('Perfil')}
          >
            <View style={styles.headerAv}>
              <Text style={styles.headerAvTx}>🔥</Text>
            </View>
          </Pressable>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.navtabs}
      >
        {NAVTABS.map((t) => {
          const on = t.key === current;
          return (
            <Pressable
              key={t.key}
              onPress={() => go(t.key)}
              style={[styles.navtab, on && styles.navtabOn]}
            >
              <Text style={[styles.navtabTx, on && styles.navtabTxOn]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ===================== Widget ===================== */

export function Widget({
  title,
  action,
  children,
  bodyStyle,
}: {
  title: string;
  action?: { label: string; onPress: () => void };
  children: ReactNode;
  bodyStyle?: ViewStyle;
}) {
  return (
    <View style={styles.widget}>
      <View style={styles.widgetHead}>
        <Text style={styles.widgetTitle}>{title}</Text>
        {action ? (
          <Pressable onPress={action.onPress}>
            <Text style={styles.widgetAction}>{action.label}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.widgetBody, bodyStyle]}>{children}</View>
    </View>
  );
}

/* ===================== Avatares ===================== */

export function EmojiAvatar({
  emoji,
  grad,
  size = 44,
  ring,
}: {
  emoji: string;
  grad: Grad;
  size?: number;
  ring?: string;
}) {
  return (
    <View style={ring ? { padding: 2 } : undefined}>
      <LinearGradient
        colors={grad as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: ring ? 2 : 1.5,
          borderColor: ring ?? 'rgba(255,255,255,0.12)',
          ...(ring ? glow(ring, 8, 0.45) : null),
        }}
      >
        <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
      </LinearGradient>
    </View>
  );
}

export function PhotoAvatar({ size = 80 }: { size?: number }) {
  return (
    <LinearGradient
      colors={[orkut.orange, orkut.yellow]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,107,0,0.45)',
        ...glow(orkut.orange, 18, 0.3),
      }}
    >
      <Text style={{ fontSize: size * 0.45 }}>🔥</Text>
    </LinearGradient>
  );
}

/* ===================== Estrelas / Ratings ===================== */

export function Stars({ filled, color }: { filled: number; color: string }) {
  return (
    <View style={styles.starsRow}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Text
          key={i}
          style={[
            styles.star,
            { color: i < filled ? color : palette.textFaint },
            i < filled ? glow(color, 4, 0.9) : null,
          ]}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

/* ===================== Chip ===================== */

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipOn : styles.chipOff]}
    >
      <Text style={[styles.chipTx, { color: active ? '#fff' : palette.textMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ===================== Feed Event ===================== */

export function FeedEventCard({
  tag,
  name,
  meta,
  bg,
  bigEmoji,
  onPress,
  children,
}: {
  tag: string;
  name: string;
  meta: string;
  bg: readonly string[];
  bigEmoji: string;
  onPress?: () => void;
  children?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fe, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={bg as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.feImg}
      >
        <Text style={styles.feBigEmoji}>{bigEmoji}</Text>
        <LinearGradient
          colors={['transparent', 'rgba(13,15,26,0.92)']}
          style={styles.feOver}
        />
        <View style={styles.feContent}>
          <View style={styles.feTag}>
            <Text style={styles.feTagTx}>{tag}</Text>
          </View>
          <Text style={styles.feName}>{name}</Text>
          <Text style={styles.feMeta}>{meta}</Text>
        </View>
      </LinearGradient>
      {children ? <View style={styles.feBody}>{children}</View> : null}
    </Pressable>
  );
}

/* ===================== Scrap / Depoimento ===================== */

export function ScrapCard({
  handle,
  emoji,
  grad,
  time,
  text,
  eventTag,
}: {
  handle: string;
  emoji: string;
  grad: Grad;
  time: string;
  text: string;
  eventTag?: string;
}) {
  return (
    <View style={styles.scrap}>
      <View style={styles.scrapHead}>
        <EmojiAvatar emoji={emoji} grad={grad} size={32} />
        <Text style={styles.scrapName}>{handle}</Text>
        <Text style={styles.scrapTime}>{time}</Text>
      </View>
      <Text style={styles.scrapText}>{text}</Text>
      {eventTag ? (
        <View style={styles.scrapEvTag}>
          <Text style={styles.scrapEvTagTx}>{eventTag}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function DepoimentoCard({
  author,
  text,
}: {
  author: string;
  text: string;
}) {
  return (
    <View style={styles.depo}>
      <Text style={styles.depoAuthor}>{author}</Text>
      <Text style={styles.depoText}>{text}</Text>
    </View>
  );
}

/* ===================== Linhas (DJ / Comunidade) ===================== */

export function RowItem({
  left,
  title,
  sub,
  right,
  onPress,
}: {
  left: ReactNode;
  title: string;
  sub: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {left}
      <View style={styles.flex}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      {right}
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  flex: { flex: 1 },
  scroll: { paddingBottom: 28 },
  pressed: { opacity: 0.7 },
  ambient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  blob: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.07,
  },

  /* Header */
  header: {
    backgroundColor: orkut.bg2,
    borderBottomWidth: 2,
    borderBottomColor: palette.borderBlue,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: space.lg,
  },
  logo: {
    fontFamily: font.disp,
    fontSize: 20,
    color: orkut.blue,
    letterSpacing: 3,
    ...glow(orkut.blue, 10, 0.5),
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bell: { position: 'relative' },
  bellIco: { fontSize: 19 },
  bellBadge: {
    position: 'absolute',
    top: -5,
    right: -6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: orkut.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    ...glow(orkut.magenta, 6, 0.6),
  },
  bellBadgeTx: { color: '#fff', fontFamily: font.mono, fontSize: 8 },
  headerUser: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  headerAv: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: orkut.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,107,0,0.4)',
  },
  headerAvTx: { fontSize: 15 },
  navtabs: { paddingHorizontal: space.sm, gap: 0 },
  navtab: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navtabOn: {
    borderBottomColor: orkut.blue,
    backgroundColor: 'rgba(26,115,232,0.07)',
  },
  navtabTx: {
    fontFamily: font.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: palette.textMuted,
  },
  navtabTxOn: { color: orkut.blue },

  /* Widget */
  widget: {
    backgroundColor: orkut.bg2,
    borderWidth: 1,
    borderColor: palette.borderBlue,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: space.md,
  },
  widgetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26,115,232,0.12)',
    borderBottomWidth: 1,
    borderBottomColor: palette.borderBlue,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  widgetTitle: {
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: orkut.blue,
  },
  widgetAction: {
    fontFamily: font.mono,
    fontSize: 8,
    letterSpacing: 1,
    color: palette.link,
  },
  widgetBody: { padding: 12 },

  /* Stars */
  starsRow: { flexDirection: 'row', gap: 3 },
  star: { fontSize: 11 },

  /* Chip */
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    marginRight: 6,
  },
  chipOn: { backgroundColor: orkut.blue, ...glow(orkut.blue, 8, 0.4) },
  chipOff: { borderWidth: 1, borderColor: palette.borderBlue },
  chipTx: { fontFamily: font.mono, fontSize: 8, letterSpacing: 1.5 },

  /* Feed event */
  fe: {
    backgroundColor: orkut.bg2,
    borderWidth: 1,
    borderColor: palette.borderBlue,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: space.md,
  },
  feImg: { height: 150, justifyContent: 'flex-end' },
  feBigEmoji: {
    position: 'absolute',
    alignSelf: 'center',
    top: 22,
    fontSize: 78,
    opacity: 0.1,
  },
  feOver: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 90 },
  feContent: { padding: 12 },
  feTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,107,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.35)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 5,
  },
  feTagTx: {
    fontFamily: font.mono,
    fontSize: 7,
    letterSpacing: 2,
    color: orkut.orange,
  },
  feName: {
    fontFamily: font.disp,
    fontSize: 17,
    color: palette.text,
    letterSpacing: 0.5,
  },
  feMeta: {
    fontFamily: font.mono,
    fontSize: 8,
    color: palette.textMuted,
    letterSpacing: 1,
    marginTop: 3,
  },
  feBody: { padding: 12 },

  /* Scrap */
  scrap: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  scrapHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  scrapName: {
    fontFamily: font.dispBold,
    fontSize: 10,
    color: palette.link,
    letterSpacing: 0.5,
  },
  scrapTime: {
    marginLeft: 'auto',
    fontFamily: font.mono,
    fontSize: 7,
    color: palette.textMuted,
  },
  scrapText: {
    fontFamily: font.bodyLight,
    fontSize: 13,
    color: 'rgba(240,242,255,0.72)',
    lineHeight: 20,
  },
  scrapEvTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    marginTop: 7,
    backgroundColor: 'rgba(26,115,232,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(26,115,232,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scrapEvTagTx: {
    fontFamily: font.mono,
    fontSize: 7,
    letterSpacing: 1.5,
    color: palette.link,
  },

  /* Depoimento */
  depo: {
    backgroundColor: 'rgba(26,115,232,0.05)',
    borderLeftWidth: 3,
    borderLeftColor: orkut.blue,
    borderRadius: 6,
    padding: 11,
    marginBottom: 8,
  },
  depoAuthor: {
    fontFamily: font.dispBold,
    fontSize: 9,
    color: palette.link,
    marginBottom: 4,
  },
  depoText: {
    fontFamily: font.bodyLight,
    fontStyle: 'italic',
    fontSize: 12,
    color: palette.textMuted,
    lineHeight: 19,
  },

  /* Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  rowTitle: {
    fontFamily: font.dispBold,
    fontSize: 10,
    color: palette.text,
    letterSpacing: 0.5,
  },
  rowSub: {
    fontFamily: font.mono,
    fontSize: 8,
    color: palette.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
