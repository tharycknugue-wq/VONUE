import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  OrkutScreen,
  Widget,
  ScrapCard,
  DepoimentoCard,
} from '../../components/orkut';
import { palette, orkut } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { SCRAPS, DEPOIMENTOS, type Scrap } from '../../data/social';

export function ScrapsScreen() {
  const [draft, setDraft] = useState('');
  const [scraps, setScraps] = useState<Scrap[]>(SCRAPS);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setScraps((cur) => [
      {
        handle: '@tharyck',
        emoji: '🔥',
        grad: [orkut.orange, orkut.yellow] as const,
        time: 'agora',
        text: t,
      },
      ...cur,
    ]);
    setDraft('');
  };

  return (
    <OrkutScreen current="Scraps">
      <View style={st.inputWrap}>
        <TextInput
          style={st.input}
          placeholder="Deixa um scrap no mural..."
          placeholderTextColor={palette.textMuted}
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <Pressable style={st.send} onPress={send}>
          <Text style={st.sendTx}>ENVIAR</Text>
        </Pressable>
      </View>

      <View style={st.pad}>
        <Widget title="DEPOIMENTOS" action={{ label: 'ESCREVER', onPress: () => {} }}>
          {DEPOIMENTOS.map((d) => (
            <DepoimentoCard key={d.author} author={d.author} text={d.text} />
          ))}
        </Widget>

        <Widget title="SCRAPS RECENTES">
          {scraps.map((sc, i) => (
            <ScrapCard key={`${sc.handle}-${i}`} {...sc} />
          ))}
        </Widget>
      </View>
    </OrkutScreen>
  );
}

const st = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(26,115,232,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: palette.borderBlue,
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 90,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: palette.borderBlue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: palette.text,
    fontFamily: font.bodyLight,
    fontSize: 13,
  },
  send: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 6,
    backgroundColor: orkut.blue,
  },
  sendTx: {
    fontFamily: font.mono,
    fontSize: 8,
    color: '#fff',
    letterSpacing: 1.5,
  },
  pad: { padding: 12 },
});
