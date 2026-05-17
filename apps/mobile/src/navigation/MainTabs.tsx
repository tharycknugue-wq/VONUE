import { Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { palette, glow } from '../theme/colors';
import { FeedScreen } from '../screens/main/FeedScreen';
import { ExploreScreen } from '../screens/main/ExploreScreen';
import { CreateScreen } from '../screens/main/CreateScreen';
import { ConexoesTabScreen } from '../screens/main/ConexoesTabScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, string> = {
  Feed: '⌂',
  Explore: '⌕',
  Create: '＋',
  ConexoesTab: '📲',
  Profile: '◔',
};

const LABELS: Record<keyof MainTabParamList, string> = {
  Feed: 'Início',
  Explore: 'Explorar',
  Create: 'Criar',
  ConexoesTab: 'Conexões',
  Profile: 'Perfil',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textFaint,
        tabBarStyle: {
          backgroundColor: palette.bgSoft,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 66,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarLabel: LABELS[route.name],
        tabBarIcon: ({ focused, color }) => (
          <Text
            style={[
              { fontSize: route.name === 'Create' ? 26 : 22, color },
              focused && route.name !== 'ConexoesTab'
                ? glow(palette.primary, 10, 0.7)
                : null,
            ]}
          >
            {ICONS[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="ConexoesTab" component={ConexoesTabScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
