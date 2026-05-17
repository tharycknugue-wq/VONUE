import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList, RootNav } from '../navigation/types';

// Dentro de uma aba: `tab` troca de aba (tipado por MainTabParamList),
// `root` empurra telas de detalhe do stack pai (tipado por Root).
export function useAppNav() {
  const tab = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const root = tab.getParent<RootNav>();
  return { tab, root };
}
