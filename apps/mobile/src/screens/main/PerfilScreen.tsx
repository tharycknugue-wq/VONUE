import { useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  OrkutScreen,
  Widget,
  PhotoAvatar,
  Stars,
  ScrapCard,
  DepoimentoCard,
} from '../../components/orkut';
import { palette, orkut } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { NUCLEO_META } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { DEPOIMENTOS, SCRAPS, RATINGS } from '../../data/social';

function MiniCard() {
  const user = useAuthStore((s) => s.user);
  const meta = user?.nucleoType ? NUCLEO_META[user.nucleoType] : null;
  return (
    <Widget title="MEU PERFIL">
      <View style={st.mp}>
        <PhotoAvatar size={84} />
        <Text style={st.name}>{user?.name ?? 'raver'}</Text>
        <Text style={st.user}>@{user?.username ?? '—'}</Text>
        {meta && (
          <View style={[st.nucleo, { borderColor: meta.color }]}>
            <Text style={[st.nucleoTx, { color: meta.color }]}>
              {meta.emoji} {meta.label.toUpperCase()} · {meta.tagline}
            </Text>
          </View>
        )}
        <View style={st.ratings}>
          {RATINGS.map((r) => (
            <View key={r.label} style={st.ratingRow}>
              <Text style={st.ratingLabel}>{r.label}</Text>
              <Stars filled={r.filled} color={r.color} />
            </View>
          ))}
        </View>
      </View>
    </Widget>
  );
}

function SelosGrid() {
  const [selos, setSelos] = useState<{ emoji: string; name: string }[]>([]);
  useFocusEffect(
    useCallback(() => {
      api
        .getSelos()
        .then((d) =>
          setSelos(d.selos.map((u) => ({ emoji: u.selo.emoji, name: u.selo.name })))
        )
        .catch(() => {});
    }, [])
  );
  return (
    <Widget title="MEUS SELOS">
      {selos.length === 0 ? (
        <Text style={st.empty}>
          Sua coleção de selos aparece aqui conforme você vive a cena.
        </Text>
      ) : (
        <View style={st.seloGrid}>
          {selos.map((sl, i) => (
            <View key={i} style={st.selo}>
              <View style={st.seloIco}>
                <Text style={st.seloEmoji}>{sl.emoji}</Text>
              </View>
              <Text style={st.seloName} numberOfLines={1}>
                {sl.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Widget>
  );
}

export function PerfilScreen() {
  const { width } = useWindowDimensions();
  const twoCol = width >= 760;
  const logout = useAuthStore((s) => s.logout);

  const Left = <MiniCard />;
  const Right = (
    <>
      <SelosGrid />
      <Widget title="DEPOIMENTOS" action={{ label: 'ESCREVER', onPress: () => {} }}>
        {DEPOIMENTOS.map((d) => (
          <DepoimentoCard key={d.author} author={d.author} text={d.text} />
        ))}
      </Widget>
      <Widget title="MURAL DE SCRAPS">
        {SCRAPS.slice(0, 3).map((sc, i) => (
          <ScrapCard key={i} {...sc} />
        ))}
      </Widget>
      <Pressable style={st.logout} onPress={logout}>
        <Text style={st.logoutTx}>SAIR DA CONTA</Text>
      </Pressable>
    </>
  );

  return (
    <OrkutScreen current="Perfil">
      {twoCol ? (
        <View style={st.layout}>
          <View style={st.colL}>{Left}</View>
          <View style={st.colR}>{Right}</View>
        </View>
      ) : (
        <View style={st.single}>
          {Left}
          {Right}
        </View>
      )}
    </OrkutScreen>
  );
}

const st = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    maxWidth: 860,
    alignSelf: 'center',
    width: '100%',
  },
  colL: { width: 260 },
  colR: { flex: 1 },
  single: { padding: 12 },

  mp: { alignItems: 'center', paddingVertical: 6 },
  name: {
    fontFamily: font.disp,
    fontSize: 16,
    color: palette.text,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  user: {
    fontFamily: font.mono,
    fontSize: 8,
    color: palette.textMuted,
    letterSpacing: 1,
    marginTop: 3,
  },
  nucleo: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 9,
  },
  nucleoTx: {
    fontFamily: font.mono,
    fontSize: 7,
    letterSpacing: 1,
    textAlign: 'center',
  },
  ratings: {
    width: '100%',
    gap: 6,
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontFamily: font.mono,
    fontSize: 7,
    color: palette.textMuted,
    letterSpacing: 1,
  },

  seloGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  selo: { width: 58, alignItems: 'center' },
  seloIco: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: 'rgba(255,214,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seloEmoji: { fontSize: 24 },
  seloName: {
    fontFamily: font.mono,
    fontSize: 5,
    color: palette.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  empty: {
    fontFamily: font.bodyLight,
    fontSize: 12,
    color: palette.textMuted,
    lineHeight: 18,
  },
  logout: {
    borderWidth: 1,
    borderColor: orkut.magenta,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  logoutTx: {
    fontFamily: font.mono,
    fontSize: 9,
    color: orkut.magenta,
    letterSpacing: 2,
  },
});
