import type {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type { NucleoType } from '../theme/colors';

// Abas da casca principal (bottom tabs). Vivem dentro da rota `Home`
// do stack — telas de detalhe continuam no stack e são alcançadas via
// useNavigation tipado como RootStackParamList.
export type MainTabParamList = {
  Inicio: undefined;
  Eventos: undefined;
  Comunidades: undefined;
  Scraps: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Onboarding: undefined;
  NucleoReveal: { nucleoType: NucleoType; genres?: string[] };
  Home: undefined;
  Arvore: undefined;
  Selos: undefined;
  ConfirmSuperior: undefined;
  Discover: undefined;
  EventDetail: { eventId: string };
  LiveMap: { eventId: string; eventName: string; lat: number; lng: number };
  Purchase: {
    ticketTypeId: string;
    lotName: string;
    price: number;
    eventName: string;
  };
  Tickets: undefined;
  Connections: undefined;
  Store: undefined;
  SellProduct: undefined;
  ProductDetail: { productId: string };
  Orders: undefined;
  Notifications: undefined;
  Review:
    | { mode: 'organizer'; eventId: string; title: string }
    | { mode: 'dj'; djId: string; title: string }
    | { mode: 'photographer'; photoId: string; title: string }
    | { mode: 'promoter'; promoterId: string; title: string }
    | { mode: 'freelancer'; jobId: string; title: string };
  EventPhotos: { eventId: string; eventName: string };
  UploadPhoto: { eventId: string; eventName: string };
  TaggedPhotos: undefined;
  DJs: undefined;
  DJDetail: { djId: string };
  BecomeDJ: undefined;
  AddLineup: { eventId: string; eventName: string };
  SendTip: { djId: string; artistName: string };
  Tips: undefined;
  Wallet: undefined;
  Timeline: undefined;
  Search: undefined;
  EnrollPromoter: { eventId: string; eventName: string };
  Promoter: undefined;
  Jobs: undefined;
  JobDetail: { jobId: string };
  PostJob: { eventId: string; eventName: string };
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

// Navegação tipada p/ uso dentro das abas (push p/ telas do stack pai).
export type RootNav = NativeStackNavigationProp<RootStackParamList>;
