import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { palette } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { NucleoRevealScreen } from '../screens/auth/NucleoRevealScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ArvoreScreen } from '../screens/arvore/ArvoreScreen';
import { ConfirmSuperiorScreen } from '../screens/arvore/ConfirmSuperiorScreen';
import { SelosScreen } from '../screens/selos/SelosScreen';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { EventDetailScreen } from '../screens/discover/EventDetailScreen';
import { LiveMapScreen } from '../screens/discover/LiveMapScreen';
import { PurchaseScreen } from '../screens/discover/PurchaseScreen';
import { TicketsScreen } from '../screens/discover/TicketsScreen';
import { ConnectionsScreen } from '../screens/nfc/ConnectionsScreen';
import { StoreScreen } from '../screens/store/StoreScreen';
import { SellProductScreen } from '../screens/store/SellProductScreen';
import { ProductDetailScreen } from '../screens/store/ProductDetailScreen';
import { OrdersScreen } from '../screens/store/OrdersScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ReviewScreen } from '../screens/discover/ReviewScreen';
import { EventPhotosScreen } from '../screens/photos/EventPhotosScreen';
import { UploadPhotoScreen } from '../screens/photos/UploadPhotoScreen';
import { TaggedPhotosScreen } from '../screens/photos/TaggedPhotosScreen';
import { DJsScreen } from '../screens/djs/DJsScreen';
import { DJDetailScreen } from '../screens/djs/DJDetailScreen';
import { BecomeDJScreen } from '../screens/djs/BecomeDJScreen';
import { AddLineupScreen } from '../screens/djs/AddLineupScreen';
import { SendTipScreen } from '../screens/djs/SendTipScreen';
import { TipsScreen } from '../screens/djs/TipsScreen';
import { WalletScreen } from '../screens/wallet/WalletScreen';
import { TimelineScreen } from '../screens/timeline/TimelineScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { EnrollPromoterScreen } from '../screens/promoter/EnrollPromoterScreen';
import { PromoterScreen } from '../screens/promoter/PromoterScreen';
import { JobsScreen } from '../screens/jobs/JobsScreen';
import { JobDetailScreen } from '../screens/jobs/JobDetailScreen';
import { PostJobScreen } from '../screens/jobs/PostJobScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: palette.bg },
};

export function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}
        initialRouteName={
          status === 'authed'
            ? user?.nucleoType
              ? 'Home'
              : 'Onboarding'
            : 'Welcome'
        }
      >
        {status === 'unauth' ? (
          <Stack.Group>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen
              name="NucleoReveal"
              component={NucleoRevealScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Group
              screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: palette.surface },
                headerTintColor: palette.text,
                headerTitleStyle: { fontWeight: '800' },
                headerShadowVisible: false,
              }}
            >
              <Stack.Screen
                name="Arvore"
                component={ArvoreScreen}
                options={{ title: 'Minha árvore' }}
              />
              <Stack.Screen
                name="ConfirmSuperior"
                component={ConfirmSuperiorScreen}
                options={{ title: 'Quem te inseriu' }}
              />
              <Stack.Screen
                name="Selos"
                component={SelosScreen}
                options={{ title: 'Meus selos' }}
              />
              <Stack.Screen
                name="Discover"
                component={DiscoverScreen}
                options={{ title: 'Eventos' }}
              />
              <Stack.Screen
                name="EventDetail"
                component={EventDetailScreen}
                options={{ title: 'Evento' }}
              />
              <Stack.Screen
                name="LiveMap"
                component={LiveMapScreen}
                options={({ route }) => ({ title: route.params.eventName })}
              />
              <Stack.Screen
                name="Purchase"
                component={PurchaseScreen}
                options={{ title: 'Comprar ingresso' }}
              />
              <Stack.Screen
                name="Tickets"
                component={TicketsScreen}
                options={{ title: 'Meus ingressos' }}
              />
              <Stack.Screen
                name="Connections"
                component={ConnectionsScreen}
                options={{ title: 'Conexões NFC' }}
              />
              <Stack.Screen
                name="Store"
                component={StoreScreen}
                options={{ title: 'Loja' }}
              />
              <Stack.Screen
                name="SellProduct"
                component={SellProductScreen}
                options={{ title: 'Anunciar produto' }}
              />
              <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{ title: 'Produto' }}
              />
              <Stack.Screen
                name="Orders"
                component={OrdersScreen}
                options={{ title: 'Pedidos' }}
              />
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ title: 'Notificações' }}
              />
              <Stack.Screen
                name="Review"
                component={ReviewScreen}
                options={{ title: 'Avaliar' }}
              />
              <Stack.Screen
                name="EventPhotos"
                component={EventPhotosScreen}
                options={({ route }) => ({ title: route.params.eventName })}
              />
              <Stack.Screen
                name="UploadPhoto"
                component={UploadPhotoScreen}
                options={{ title: 'Adicionar foto' }}
              />
              <Stack.Screen
                name="TaggedPhotos"
                component={TaggedPhotosScreen}
                options={{ title: 'Fotos comigo' }}
              />
              <Stack.Screen
                name="DJs"
                component={DJsScreen}
                options={{ title: 'DJs' }}
              />
              <Stack.Screen
                name="DJDetail"
                component={DJDetailScreen}
                options={{ title: 'DJ' }}
              />
              <Stack.Screen
                name="BecomeDJ"
                component={BecomeDJScreen}
                options={{ title: 'Perfil de DJ' }}
              />
              <Stack.Screen
                name="AddLineup"
                component={AddLineupScreen}
                options={{ title: 'Line-up' }}
              />
              <Stack.Screen
                name="SendTip"
                component={SendTipScreen}
                options={{ title: 'Gorjeta' }}
              />
              <Stack.Screen
                name="Tips"
                component={TipsScreen}
                options={{ title: 'Gorjetas' }}
              />
              <Stack.Screen
                name="Wallet"
                component={WalletScreen}
                options={{ title: 'Carteira' }}
              />
              <Stack.Screen
                name="Timeline"
                component={TimelineScreen}
                options={{ title: 'Minha história' }}
              />
              <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{ title: 'Buscar' }}
              />
              <Stack.Screen
                name="EnrollPromoter"
                component={EnrollPromoterScreen}
                options={{ title: 'Credenciar promoter' }}
              />
              <Stack.Screen
                name="Promoter"
                component={PromoterScreen}
                options={{ title: 'Promoter' }}
              />
              <Stack.Screen
                name="Jobs"
                component={JobsScreen}
                options={{ title: 'Vagas' }}
              />
              <Stack.Screen
                name="JobDetail"
                component={JobDetailScreen}
                options={{ title: 'Vaga' }}
              />
              <Stack.Screen
                name="PostJob"
                component={PostJobScreen}
                options={{ title: 'Publicar vaga' }}
              />
            </Stack.Group>
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
