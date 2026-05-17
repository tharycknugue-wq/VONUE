import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OrkutScreen } from '../../components/orkut';
import { palette, orkut, glow } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { COMMUNITIES } from '../../data/social';

export function ComunidadesScreen() {
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  return (
    <OrkutScreen current="Comunidades">
      <View style={st.pad}>
        <Text style={st.intro}>
          GRUPOS POR INTERESSE — ENCONTRE SUA GALERA
        </Text>
        {COMMUNITIES.map((c) => {
          const inIt = joined[c.name];
          return (
            <View key={c.name} style={st.item}>
              <Text style={st.ico}>{c.ico}</Text>
              <View style={st.body}>
                <Text style={st.name}>{c.name}</Text>
                <Text style={st.desc}>{c.desc}</Text>
                <Text style={st.meta}>
                  {c.members} · {c.heat}
                </Text>
              </View>
              <Pressable
                style={[st.join, inIt && st.joinOn]}
                onPress={() =>
                  setJoined((j) => ({ ...j, [c.name]: !j[c.name] }))
                }
              >
                <Text style={st.joinTx}>{inIt ? 'MEMBRO' : 'ENTRAR'}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </OrkutScreen>
  );
}

const st = StyleSheet.create({
  pad: { padding: 12 },
  intro: {
    fontFamily: font.mono,
    fontSize: 8,
    color: palette.textMuted,
    letterSpacing: 2,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: orkut.bg2,
    borderWidth: 1,
    borderColor: palette.borderBlue,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ico: { fontSize: 30 },
  body: { flex: 1 },
  name: {
    fontFamily: font.disp,
    fontSize: 12,
    color: palette.text,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  desc: {
    fontFamily: font.bodyLight,
    fontSize: 11,
    color: palette.textMuted,
    lineHeight: 16,
    marginBottom: 5,
  },
  meta: {
    fontFamily: font.mono,
    fontSize: 7,
    color: palette.textMuted,
    letterSpacing: 1,
  },
  join: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: orkut.blue,
    ...glow(orkut.blue, 8, 0.35),
  },
  joinOn: { backgroundColor: orkut.violet },
  joinTx: {
    fontFamily: font.mono,
    fontSize: 7,
    color: '#fff',
    letterSpacing: 1.5,
  },
});
