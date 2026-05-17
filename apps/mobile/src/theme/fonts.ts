import {
  Orbitron_700Bold,
  Orbitron_900Black,
} from '@expo-google-fonts/orbitron';
import { ShareTechMono_400Regular } from '@expo-google-fonts/share-tech-mono';
import {
  Exo2_300Light,
  Exo2_400Regular,
  Exo2_500Medium,
  Exo2_700Bold,
} from '@expo-google-fonts/exo-2';

// Mapa passado ao useFonts no App. Chave = nome usado em fontFamily.
export const fontMap = {
  Orbitron_700Bold,
  Orbitron_900Black,
  ShareTechMono_400Regular,
  Exo2_300Light,
  Exo2_400Regular,
  Exo2_500Medium,
  Exo2_700Bold,
};

// Famílias semânticas da identidade Orkut + psytrance.
export const font = {
  disp: 'Orbitron_900Black', // títulos/logos
  dispBold: 'Orbitron_700Bold',
  mono: 'ShareTechMono_400Regular', // rótulos, metadados
  body: 'Exo2_400Regular',
  bodyLight: 'Exo2_300Light',
  bodyMedium: 'Exo2_500Medium',
  bodyBold: 'Exo2_700Bold',
} as const;
