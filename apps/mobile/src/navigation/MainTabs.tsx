import { Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { palette, orkut, glow } from '../theme/colors';
import { font } from '../theme/fonts';
import { InicioScreen } from '../screens/main/InicioScreen';
import { EventosScreen } from '../screens/main/EventosScreen';
import { ComunidadesScreen } from '../screens/main/ComunidadesScreen';
import { ScrapsScreen } from '../screens/main/ScrapsScreen';
import { PerfilScreen } from '../screens/main/PerfilScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, string> = {
  Inicio: '🏠',
  Eventos: '🎉',
  Comunidades: '👥',
  Scraps: '💬',
  Perfil: '👤',
};

const LABELS: Record<keyof MainTabParamList, string> = {
  Inicio: 'INÍCIO',
  Eventos: 'EVENTOS',
  Comunidades: 'COMUNIDADES',
  Scraps: 'SCRAPS',
  Perfil: 'PERFIL',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: orkut.blue,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: orkut.bg2,
          borderTopColor: palette.borderBlue,
          borderTopWidth: 2,
          height: Platform.OS === 'ios' ? 84 : 62,
          paddingBottom: Platform.OS === 'ios' ? 26 : 8,
          paddingTop: 7,
        },
        tabBarLabelStyle: {
          fontFamily: font.mono,
          fontSize: 7,
          letterSpacing: 1,
        },
        tabBarLabel: LABELS[route.name],
        tabBarIcon: ({ focused }) => (
          <Text
            style={[
              { fontSize: 19 },
              focused ? glow(orkut.blue, 8, 0.7) : { opacity: 0.6 },
            ]}
          >
            {ICONS[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen name="Eventos" component={EventosScreen} />
      <Tab.Screen name="Comunidades" component={ComunidadesScreen} />
      <Tab.Screen name="Scraps" component={ScrapsScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
