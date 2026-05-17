import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, orkut } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { GENRE_SECTIONS } from '../../data/genres';
import { api, ApiError } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { ScreenProps } from '../../navigation/types';

export function OnboardingScreen({ navigation }: ScreenProps<'Onboarding'>) {
  const applyNucleo = useAuthStore((s) => s.applyNucleo);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flat = useMemo(
    () => GENRE_SECTIONS.flatMap((s) => s.genres),
    []
  );
  const count = selected.size;
  const pct = Math.min((count / 5) * 100, 100);

  const toggle = (id: string) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const discover = async () => {
    if (count === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const genres = [...selected];
      const result = await api.completeOnboarding(genres);
      await applyNucleo(result.nucleoType);
      navigation.navigate('NucleoReveal', {
        nucleoType: result.nucleoType,
        genres,
      });
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Erro ao descobrir sua tribo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <View style={st.hdr}>
        <Text style={st.logo}>vonue</Text>
        <Text style={st.title}>O que toca na sua cabeça?</Text>
        <Text style={st.sub}>
          ESCOLHA OS ESTILOS QUE VOCÊ CURTE · SEM LIMITES
        </Text>
        <View style={st.progBg}>
          <View style={[st.progFill, { width: `${pct}%` }]} />
        </View>
        <Text style={st.progCount}>
          {count} {count === 1 ? 'SELECIONADO' : 'SELECIONADOS'}
        </Text>
      </View>

      <ScrollView
        style={st.flex}
        contentContainerStyle={st.content}
        showsVerticalScrollIndicator={false}
      >
        {GENRE_SECTIONS.map((section) => (
          <View key={section.title} style={st.section}>
            <View style={st.secLabel}>
              <Text style={st.secIcon}>{section.icon}</Text>
              <View style={st.flex}>
                <Text style={st.secTitle}>{section.title}</Text>
                <Text style={st.secDesc}>{section.desc}</Text>
              </View>
            </View>
            <View style={st.grid}>
              {section.genres.map((g) => {
                const on = selected.has(g.id);
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => toggle(g.id)}
                    style={[
                      st.card,
                      g.wide ? st.cardWide : st.cardHalf,
                      on && {
                        borderColor: g.color,
                        backgroundColor: g.color + '14',
                      },
                    ]}
                  >
                    <View
                      style={[
                        st.check,
                        on && {
                          backgroundColor: g.color,
                          borderColor: g.color,
                        },
                      ]}
                    >
                      {on ? <Text style={st.checkTx}>✓</Text> : null}
                    </View>
                    <Text style={st.emoji}>{g.emoji}</Text>
                    <Text
                      style={[st.name, on && { color: g.color }]}
                      numberOfLines={1}
                    >
                      {g.name}
                    </Text>
                    <Text style={st.bpm}>{g.bpm}</Text>
                    <Text style={st.desc}>{g.desc}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={st.bottom}>
        {error ? <Text style={st.err}>{error}</Text> : null}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.tags}
        >
          {count === 0 ? (
            <Text style={st.tagsEmpty}>Selecione pelo menos 1 estilo</Text>
          ) : (
            flat
              .filter((g) => selected.has(g.id))
              .map((g) => (
                <View
                  key={g.id}
                  style={[st.tag, { borderColor: g.color }]}
                >
                  <Text style={[st.tagTx, { color: g.color }]}>{g.name}</Text>
                </View>
              ))
          )}
        </ScrollView>
        <Pressable
          onPress={discover}
          disabled={count === 0 || submitting}
          style={[st.cta, count > 0 ? st.ctaReady : st.ctaOff]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={[
                st.ctaTx,
                { color: count > 0 ? '#fff' : palette.textFaint },
              ]}
            >
              DESCOBRIR MINHA TRIBO
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  flex: { flex: 1 },

  hdr: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  logo: {
    fontFamily: font.disp,
    fontSize: 20,
    color: orkut.magenta,
    marginBottom: 8,
  },
  title: {
    fontFamily: font.disp,
    fontSize: 19,
    color: palette.text,
    marginBottom: 5,
  },
  sub: {
    fontFamily: font.mono,
    fontSize: 8,
    color: palette.textMuted,
    letterSpacing: 1.5,
  },
  progBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.bgSoft,
    overflow: 'hidden',
    marginTop: 12,
  },
  progFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: orkut.magenta,
  },
  progCount: {
    fontFamily: font.mono,
    fontSize: 8,
    color: palette.textMuted,
    letterSpacing: 1.5,
    marginTop: 5,
    textAlign: 'right',
  },

  content: { padding: 14, paddingBottom: 28 },
  section: { marginBottom: 22 },
  secLabel: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  secIcon: { fontSize: 20 },
  secTitle: {
    fontFamily: font.disp,
    fontSize: 12,
    color: palette.text,
    letterSpacing: 1,
  },
  secDesc: {
    fontFamily: font.mono,
    fontSize: 8,
    color: palette.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 12,
    padding: 12,
  },
  cardHalf: { width: '48.5%' },
  cardWide: { width: '100%' },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkTx: { color: '#fff', fontSize: 10, fontWeight: '900' },
  emoji: { fontSize: 26, marginBottom: 7 },
  name: {
    fontFamily: font.disp,
    fontSize: 11,
    color: palette.text,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  bpm: {
    fontFamily: font.mono,
    fontSize: 7,
    color: palette.textMuted,
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  desc: {
    fontFamily: font.body,
    fontSize: 10,
    color: palette.textMuted,
    lineHeight: 14,
  },

  bottom: {
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
  },
  err: {
    fontFamily: font.mono,
    fontSize: 9,
    color: palette.danger,
    marginBottom: 8,
  },
  tags: { gap: 8, minHeight: 26, alignItems: 'center' },
  tagsEmpty: {
    fontFamily: font.mono,
    fontSize: 9,
    color: palette.textMuted,
    letterSpacing: 1,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagTx: { fontFamily: font.mono, fontSize: 7, letterSpacing: 1 },
  cta: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
  },
  ctaReady: { backgroundColor: orkut.magenta },
  ctaOff: { backgroundColor: palette.bgSoft },
  ctaTx: {
    fontFamily: font.disp,
    fontSize: 11,
    letterSpacing: 2,
  },
});
