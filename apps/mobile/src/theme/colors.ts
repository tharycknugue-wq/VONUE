export const palette = {
  bg: '#07070D',
  bgSoft: '#0C0C16',
  surface: '#14141F',
  surfaceAlt: '#1C1C2B',
  surfaceGlass: 'rgba(255,255,255,0.04)',
  border: '#262636',
  borderSoft: 'rgba(255,255,255,0.07)',
  text: '#FFFFFF',
  textMuted: '#9090A6',
  textFaint: '#5C5C72',
  primary: '#C9A0FF',
  primaryDeep: '#7B3BFF',
  accent: '#36E0FF',
  hot: '#FF3D8B',
  danger: '#FF5570',
  success: '#39FF14',
  gold: '#FFC857',
};

// Gradientes da identidade Neon Rave.
export const gradients = {
  brand: ['#7B3BFF', '#C9A0FF', '#36E0FF'] as const,
  hero: ['#1A0B3D', '#0C0C16', '#07070D'] as const,
  hot: ['#FF3D8B', '#7B3BFF'] as const,
  cyber: ['#36E0FF', '#7B3BFF'] as const,
  dark: ['#15151F', '#0C0C16'] as const,
};

// Sombra/glow neon reaproveitável (mapeia p/ box-shadow no react-native-web).
export function glow(color: string, radius = 16, opacity = 0.55) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(radius / 2),
  };
}

// Tokens de layout — espaçamento, raio e tipografia consistentes.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 36 };
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export type NucleoType =
  | 'FULLON'
  | 'PROGRESSIVO'
  | 'DARK_FOREST'
  | 'TECHNO'
  | 'FAROFEIRO'
  | 'MISTICO';

export interface NucleoMeta {
  label: string;
  tagline: string;
  color: string;
  gradient: [string, string];
}

export const NUCLEO_META: Record<NucleoType, NucleoMeta> = {
  FULLON: {
    label: 'Fullon',
    tagline: 'Energia no pico, melodia épica, pista no talo.',
    color: '#4D9FFF',
    gradient: ['#4D9FFF', '#0B0B12'],
  },
  PROGRESSIVO: {
    label: 'Progressivo',
    tagline: 'A viagem hipnótica que constrói sem pressa.',
    color: '#39FF14',
    gradient: ['#39FF14', '#0B0B12'],
  },
  DARK_FOREST: {
    label: 'Dark Forest',
    tagline: 'O escuro, o peso e a floresta de madrugada.',
    color: '#9B4DCA',
    gradient: ['#9B4DCA', '#0B0B12'],
  },
  TECHNO: {
    label: 'Techno',
    tagline: 'Kick reto, groove de máquina, precisão.',
    color: '#FF5570',
    gradient: ['#FF5570', '#0B0B12'],
  },
  FAROFEIRO: {
    label: 'Farofeiro',
    tagline: 'A cena é a tribo — a festa é o encontro.',
    color: '#FF9A4D',
    gradient: ['#FF9A4D', '#0B0B12'],
  },
  MISTICO: {
    label: 'Místico',
    tagline: 'Raiz, natureza e conexão no sunrise.',
    color: '#C9A0FF',
    gradient: ['#C9A0FF', '#0B0B12'],
  },
};
