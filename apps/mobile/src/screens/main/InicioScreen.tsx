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
  EmojiAvatar,
  Stars,
  FeedEventCard,
  RowItem,
} from '../../components/orkut';
import { palette, orkut, glow } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { NUCLEO_META } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useAppNav } from '../../hooks/useAppNav';
import { api, type EventListItem, type DJListItem } from '../../services/api';
import { FRIENDS, COMMUNITIES, RATINGS } from '../../data/social';

const EV_BG = [
  ['#1A0400', '#3D1020', '#0A0830'],
  ['#0A0030', '#200050', '#0A1800'],
  ['#001810', '#002A20', '#001030'],
] as const;
const EV_EMOJI = ['🌳', '🌀', '⚡'];

function MiniProfile() {
  const user = useAuthStore((s) => s.user);
  const meta = user?.nucleoType ? NUCLEO_META[user.nucleoType] : null;
  const [stats, setStats] = useState({ ev: 0, selos: 0, thrans: 0 });

  useFocusEffect(
    useCallback(() => {
      api
        .timeline()
        .then((d) =>
          setStats((s) => ({
            ...s,
            ev: d.items.filter((i) => i.type === 'CHECKIN').length,
          }))
        )
        .catch(() => {});
      api
        .getSelos()
        .then((d) => setStats((s) => ({ ...s, selos: d.total })))
        .catch(() => {});
      api
        .getArvore()
        .then((d) => setStats((s) => ({ ...s, thrans: d.thranCount })))
        .catch(() => {});
    }, [])
  );

  return (
    <Widget title="MEU PERFIL">
      <View style={s.mp}>
        <PhotoAvatar size={78} />
        <Text style={s.mpName}>{user?.name ?? 'raver'}</Text>
        <Text style={s.mpUser}>@{user?.username ?? '—'}</Text>
        {meta && (
          <View style={[s.mpNucleo, { borderColor: meta.color }]}>
            <Text style={[s.mpNucleoTx, { color: meta.color }]}>
              {meta.emoji} {meta.label.toUpperCase()}
            </Text>
          </View>
        )}
        <View style={s.ratings}>
          {RATINGS.map((r) => (
            <View key={r.label} style={s.ratingRow}>
              <Text style={s.ratingLabel}>{r.label}</Text>
              <Stars filled={r.filled} color={r.color} />
            </View>
          ))}
        </View>
        <View style={s.statRow}>
          {[
            { n: stats.ev, l: 'EVENTOS' },
            { n: stats.selos, l: 'SELOS' },
            { n: stats.thrans, l: 'THRÄNS' },
          ].map((st, i) => (
            <View key={st.l} style={[s.stat, i < 2 && s.statBorder]}>
              <Text style={s.statN}>{st.n}</Text>
              <Text style={s.statL}>{st.l}</Text>
            </View>
          ))}
        </View>
      </View>
    </Widget>
  );
}

function AmigosWidget() {
  const { root } = useAppNav();
  return (
    <Widget
      title="AMIGOS"
      action={{ label: 'VER TODOS', onPress: () => root?.navigate('Connections') }}
    >
      <View style={s.friendGrid}>
        {FRIENDS.map((f) => (
          <View key={f.handle} style={s.friend}>
            <EmojiAvatar emoji={f.emoji} grad={f.grad} size={46} />
            <Text style={s.friendName}>{f.handle}</Text>
          </View>
        ))}
      </View>
    </Widget>
  );
}

function ComunidadesWidget() {
  const { tab } = useAppNav();
  return (
    <Widget
      title="COMUNIDADES"
      action={{ label: 'VER TODAS', onPress: () => tab.navigate('Comunidades') }}
    >
      {COMMUNITIES.slice(0, 4).map((c) => (
        <RowItem
          key={c.name}
          left={<Text style={s.commIco}>{c.ico}</Text>}
          title={c.name}
          sub={c.members}
        />
      ))}
    </Widget>
  );
}

function ArvoreWidget() {
  const { root } = useAppNav();
  const user = useAuthStore((s) => s.user);
  return (
    <Widget
      title="MINHA ÁRVORE"
      action={{ label: 'VER', onPress: () => root?.navigate('Arvore') }}
    >
      <View style={s.awMe}>
        <EmojiAvatar emoji="🔥" grad={[orkut.orange, orkut.yellow]} size={36} />
        <View>
          <Text style={s.awName}>{user?.name ?? 'Você'}</Text>
          <Text style={s.awRole}>ORIGEM DO VONUE</Text>
        </View>
      </View>
      <View style={s.awLine} />
      <View style={s.awThrans}>
        <Text style={s.awThransTitle}>SEUS THRÄNS</Text>
        <View style={s.awThranRow}>
          {['+', '+', '+'].map((d, i) => (
            <View key={i} style={s.awDot}>
              <Text style={s.awDotTx}>{d}</Text>
            </View>
          ))}
          <Pressable onPress={() => root?.navigate('Arvore')}>
            <Text style={s.awInvite}>convidar</Text>
          </Pressable>
        </View>
      </View>
    </Widget>
  );
}

function SelosWidget() {
  const { root } = useAppNav();
  const [selos, setSelos] = useState<{ emoji: string; name: string }[]>([]);
  useFocusEffect(
    useCallback(() => {
      api
        .getSelos()
        .then((d) =>
          setSelos(
            d.selos.map((u) => ({ emoji: u.selo.emoji, name: u.selo.name }))
          )
        )
        .catch(() => {});
    }, [])
  );
  return (
    <Widget
      title="MEUS SELOS"
      action={{ label: 'VER TODOS', onPress: () => root?.navigate('Selos') }}
    >
      {selos.length === 0 ? (
        <Text style={s.empty}>Seus selos aparecem aqui ao curtir a cena.</Text>
      ) : (
        <View style={s.seloRow}>
          {selos.slice(0, 6).map((sl, i) => (
            <View key={i} style={s.selo}>
              <View style={s.seloIco}>
                <Text style={s.seloEmoji}>{sl.emoji}</Text>
              </View>
              <Text style={s.seloName} numberOfLines={1}>
                {sl.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Widget>
  );
}

function DJsWidget() {
  const { root } = useAppNav();
  const [djs, setDjs] = useState<DJListItem[]>([]);
  useFocusEffect(
    useCallback(() => {
      api.djs().then((d) => setDjs(d.djs)).catch(() => {});
    }, [])
  );
  return (
    <Widget
      title="DJS EM ALTA"
      action={{ label: 'RANKING', onPress: () => root?.navigate('DJs') }}
    >
      {djs.length === 0 ? (
        <Text style={s.empty}>O ranking de DJs aparece aqui.</Text>
      ) : (
        djs.slice(0, 3).map((dj) => (
          <RowItem
            key={dj.id}
            onPress={() => root?.navigate('DJDetail', { djId: dj.id })}
            left={
              <EmojiAvatar
                emoji="🎧"
                grad={[orkut.orange, orkut.magenta]}
                size={36}
              />
            }
            title={dj.artistName}
            sub={`${dj.style.join(' · ') || 'PSY'} · ${dj.followerCount} seg.`}
            right={<Text style={s.djRank}>#{dj.position}</Text>}
          />
        ))
      )}
    </Widget>
  );
}

function EventosFeed() {
  const { root, tab } = useAppNav();
  const [events, setEvents] = useState<EventListItem[]>([]);
  useFocusEffect(
    useCallback(() => {
      api.listEvents('upcoming').then((d) => setEvents(d.events)).catch(() => {});
    }, [])
  );
  if (events.length === 0) {
    return (
      <Widget title="EVENTOS">
        <Text style={s.empty}>Nenhum evento publicado ainda.</Text>
      </Widget>
    );
  }
  return (
    <>
      {events.slice(0, 5).map((ev, i) => (
        <FeedEventCard
          key={ev.id}
          tag={ev.styles.slice(0, 3).join(' · ') || 'PSYTRANCE'}
          name={ev.name}
          meta={`📍 ${ev.venue.city}, ${ev.venue.state}  ·  👥 ${ev.checkinCount} indo`}
          bg={EV_BG[i % EV_BG.length]}
          bigEmoji={EV_EMOJI[i % EV_EMOJI.length]}
          onPress={() => root?.navigate('EventDetail', { eventId: ev.id })}
        >
          <View style={s.feFriends}>
            {FRIENDS.slice(0, 3).map((f, j) => (
              <View key={f.handle} style={{ marginRight: j < 2 ? -8 : 10 }}>
                <EmojiAvatar emoji={f.emoji} grad={f.grad} size={24} />
              </View>
            ))}
            <Text style={s.feFriendsTx}>amigos confirmados</Text>
          </View>
          <View style={s.feActions}>
            <Pressable
              style={[s.evBtn, s.evBtnPrimary]}
              onPress={() => root?.navigate('EventDetail', { eventId: ev.id })}
            >
              <Text style={s.evBtnPrimaryTx}>COMPRAR INGRESSO</Text>
            </Pressable>
            <Pressable
              style={[s.evBtn, s.evBtnGhost]}
              onPress={() => tab.navigate('Eventos')}
            >
              <Text style={s.evBtnGhostTx}>VER MAIS</Text>
            </Pressable>
          </View>
        </FeedEventCard>
      ))}
    </>
  );
}

export function InicioScreen() {
  const { width } = useWindowDimensions();
  const twoCol = width >= 760;

  if (twoCol) {
    return (
      <OrkutScreen current="Inicio">
        <View style={s.layout}>
          <View style={s.colL}>
            <MiniProfile />
            <AmigosWidget />
            <ComunidadesWidget />
            <ArvoreWidget />
          </View>
          <View style={s.colR}>
            <SelosWidget />
            <DJsWidget />
            <EventosFeed />
          </View>
        </View>
      </OrkutScreen>
    );
  }

  return (
    <OrkutScreen current="Inicio">
      <View style={s.single}>
        <MiniProfile />
        <SelosWidget />
        <DJsWidget />
        <EventosFeed />
        <AmigosWidget />
        <ComunidadesWidget />
        <ArvoreWidget />
      </View>
    </OrkutScreen>
  );
}

const s = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    maxWidth: 860,
    alignSelf: 'center',
    width: '100%',
  },
  colL: { width: 250 },
  colR: { flex: 1 },
  single: { padding: 12 },

  mp: { alignItems: 'center', paddingVertical: 6 },
  mpName: {
    fontFamily: font.disp,
    fontSize: 15,
    color: palette.text,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  mpUser: {
    fontFamily: font.mono,
    fontSize: 8,
    color: palette.textMuted,
    letterSpacing: 1,
    marginTop: 3,
  },
  mpNucleo: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 9,
  },
  mpNucleoTx: { fontFamily: font.mono, fontSize: 7, letterSpacing: 1.5 },
  ratings: {
    width: '100%',
    gap: 5,
    paddingVertical: 10,
    marginTop: 10,
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
  statRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: palette.border,
    marginTop: 4,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  statBorder: { borderRightWidth: 1, borderRightColor: palette.border },
  statN: {
    fontFamily: font.disp,
    fontSize: 16,
    color: orkut.yellow,
  },
  statL: {
    fontFamily: font.mono,
    fontSize: 6,
    color: palette.textMuted,
    letterSpacing: 1,
    marginTop: 1,
  },

  friendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  friend: { width: 46, alignItems: 'center' },
  friendName: {
    fontFamily: font.mono,
    fontSize: 6,
    color: palette.textMuted,
    marginTop: 4,
  },

  commIco: { fontSize: 22, width: 26, textAlign: 'center' },

  awMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,107,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.2)',
  },
  awName: { fontFamily: font.dispBold, fontSize: 9, color: palette.text },
  awRole: {
    fontFamily: font.mono,
    fontSize: 7,
    color: orkut.orange,
    letterSpacing: 1,
    marginTop: 2,
  },
  awLine: {
    width: 1,
    height: 12,
    marginLeft: 18,
    marginVertical: 6,
    backgroundColor: 'rgba(123,47,255,0.4)',
  },
  awThrans: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(123,47,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(123,47,255,0.15)',
  },
  awThransTitle: {
    fontFamily: font.mono,
    fontSize: 7,
    letterSpacing: 1.5,
    color: 'rgba(123,47,255,0.8)',
    marginBottom: 6,
  },
  awThranRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  awDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,214,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  awDotTx: { color: palette.textMuted, fontSize: 12 },
  awInvite: {
    fontFamily: font.mono,
    fontSize: 7,
    color: palette.textMuted,
    marginLeft: 4,
  },

  seloRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  selo: { width: 52, alignItems: 'center' },
  seloIco: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: 'rgba(255,214,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    ...glow(orkut.yellow, 6, 0.12),
  },
  seloEmoji: { fontSize: 20 },
  seloName: {
    fontFamily: font.mono,
    fontSize: 5,
    color: palette.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
  },

  djRank: {
    fontFamily: font.mono,
    fontSize: 8,
    color: orkut.orange,
    letterSpacing: 1,
  },

  feFriends: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  feFriendsTx: {
    fontFamily: font.mono,
    fontSize: 8,
    color: palette.textMuted,
    letterSpacing: 0.5,
  },
  feActions: { flexDirection: 'row', gap: 8 },
  evBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: 'center',
  },
  evBtnPrimary: {
    backgroundColor: orkut.orange,
    ...glow(orkut.orange, 12, 0.25),
  },
  evBtnPrimaryTx: {
    fontFamily: font.mono,
    fontSize: 8,
    color: '#fff',
    letterSpacing: 1.5,
  },
  evBtnGhost: { borderWidth: 1, borderColor: palette.borderBlue },
  evBtnGhostTx: {
    fontFamily: font.mono,
    fontSize: 8,
    color: palette.link,
    letterSpacing: 1.5,
  },

  empty: {
    fontFamily: font.bodyLight,
    fontSize: 12,
    color: palette.textMuted,
    lineHeight: 18,
  },
});
