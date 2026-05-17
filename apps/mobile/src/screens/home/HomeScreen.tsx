import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { palette, NUCLEO_META } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

const ACTIVE = [
  { emoji: '🔎', title: 'Buscar', desc: 'Eventos, DJs e produtos.', route: 'Search' as const },
  { emoji: '🎉', title: 'Eventos', desc: 'Descubra e faça check-in.', route: 'Discover' as const },
  { emoji: '🎟️', title: 'Meus ingressos', desc: 'Compre e valide na portaria.', route: 'Tickets' as const },
  { emoji: '📲', title: 'Conexões', desc: 'Encoste celulares e conecte.', route: 'Connections' as const },
  { emoji: '🛍️', title: 'Loja', desc: 'Compre e venda com escrow.', route: 'Store' as const },
  { emoji: '🔔', title: 'Notificações', desc: 'Tudo que rolou na cena.', route: 'Notifications' as const },
  { emoji: '📸', title: 'Fotos comigo', desc: 'Aprove onde te marcaram.', route: 'TaggedPhotos' as const },
  { emoji: '🎧', title: 'DJs', desc: 'Ranking, perfil e seguir.', route: 'DJs' as const },
  { emoji: '🪙', title: 'Gorjetas', desc: 'Enviadas e recebidas.', route: 'Tips' as const },
  { emoji: '💼', title: 'Carteira', desc: 'Saldo, extrato e saque.', route: 'Wallet' as const },
  { emoji: '📣', title: 'Promoter', desc: 'Seu código e comissões.', route: 'Promoter' as const },
  { emoji: '🧰', title: 'Vagas', desc: 'Trabalhe na cena.', route: 'Jobs' as const },
  { emoji: '🗓️', title: 'Minha história', desc: 'Sua linha do tempo na cena.', route: 'Timeline' as const },
  { emoji: '🌳', title: 'Minha árvore', desc: 'Drün/Rhän e seus Thräns.', route: 'Arvore' as const },
  { emoji: '🏅', title: 'Meus selos', desc: 'Sua coleção na cena.', route: 'Selos' as const },
];

const NEXT_FEATURES = [
  { emoji: '⭐', title: 'Reviews +', desc: 'Avaliar freelancers e fotógrafos.' },
  { emoji: '💳', title: 'PSP real', desc: 'Stripe/Pix no lugar do sandbox.' },
  { emoji: '🌎', title: 'AEON', desc: 'O app paralelo, acima do Vonue.' },
];

export function HomeScreen({ navigation }: ScreenProps<'Home'>) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const meta = user?.nucleoType ? NUCLEO_META[user.nucleoType] : null;
  const [unread, setUnread] = useState(0);

  useFocusEffect(
    useCallback(() => {
      api
        .notifications(true)
        .then((d) => setUnread(d.unreadCount))
        .catch(() => setUnread(0));
    }, [])
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.hello}>Salve,</Text>
        <Text style={styles.name}>{user?.name ?? 'raver'}</Text>

        {meta && (
          <View style={[styles.chip, { borderColor: meta.color }]}>
            <View style={[styles.dot, { backgroundColor: meta.color }]} />
            <Text style={[styles.chipText, { color: meta.color }]}>
              Núcleo {meta.label}
            </Text>
          </View>
        )}

        <Text style={styles.section}>Acesse agora</Text>
        <View style={styles.cards}>
          {ACTIVE.map((f) => (
            <Pressable
              key={f.route}
              style={({ pressed }) => [
                styles.card,
                styles.cardActive,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => navigation.navigate(f.route)}
            >
              <Text style={styles.cardEmoji}>{f.emoji}</Text>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardDesc}>{f.desc}</Text>
              </View>
              {f.route === 'Notifications' && unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                </View>
              )}
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Em breve no Vonue</Text>
        <View style={styles.cards}>
          {NEXT_FEATURES.map((f) => (
            <View key={f.title} style={styles.card}>
              <Text style={styles.cardEmoji}>{f.emoji}</Text>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button label="Sair" variant="ghost" onPress={logout} style={styles.logout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: 28 },
  hello: { color: palette.textMuted, fontSize: 18 },
  name: { color: palette.text, fontSize: 32, fontWeight: '900' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 16,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  chipText: { fontWeight: '700', fontSize: 14 },
  section: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 36,
    marginBottom: 14,
  },
  cards: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardActive: { borderColor: palette.primary },
  cardEmoji: { fontSize: 26 },
  flex: { flex: 1 },
  cardTitle: { color: palette.text, fontSize: 16, fontWeight: '700' },
  cardDesc: { color: palette.textMuted, fontSize: 13, marginTop: 2 },
  chevron: { color: palette.primary, fontSize: 24, fontWeight: '800' },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: palette.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: palette.text, fontSize: 12, fontWeight: '800' },
  logout: { marginTop: 36 },
});
