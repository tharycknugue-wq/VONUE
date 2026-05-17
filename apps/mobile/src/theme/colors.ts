// Identidade Vonue — Orkut clássico (claro) encontra psytrance.
// Tema CLARO: nada de fundo preto. Fundo azul-claro, cards brancos,
// cabeçalho rosa/magenta, texto escuro — nostalgia Orkut/Facebook 2008.
export const orkut = {
  blue: '#2E5AA8',
  orange: '#E8730C',
  yellow: '#E8A100',
  magenta: '#E0218A',
  violet: '#6A2BD9',
  cyan: '#0E8FB0',
  green: '#2FA84F',
  link: '#1B5FBF',
  bg2: '#FFFFFF', // superfície de card/widget
  bg3: '#EDF2F8', // seção clara
};

// `palette` mantém TODAS as chaves usadas pelas ~35 telas de detalhe —
// só os VALORES mudam (escuro → claro). Tudo fica consistente de uma vez.
export const palette = {
  bg: '#E3EAF3',
  bgSoft: '#EDF2F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F6FB',
  surfaceGlass: 'rgba(0,0,0,0.03)',
  border: '#CBD8E6',
  borderSoft: 'rgba(0,0,0,0.07)',
  borderBlue: '#A9C5E6',
  text: '#16202C',
  textMuted: '#5A6B7B',
  textFaint: '#93A2B2',
  primary: '#2E5AA8',
  primaryDeep: '#1C3A6B',
  accent: '#0E8FB0',
  hot: '#E0218A',
  danger: '#D6336C',
  success: '#2FA84F',
  gold: '#E8A100',
  link: '#1B5FBF',
};

export const gradients = {
  brand: ['#E0218A', '#6A2BD9', '#1B5FBF'] as const,
  hero: ['#F6DCEE', '#E3EAF3', '#FFFFFF'] as const,
  header: ['#F5379B', '#E0218A', '#A81E97'] as const,
  hot: ['#E8730C', '#E0218A'] as const,
  cyber: ['#0E8FB0', '#6A2BD9'] as const,
  sunrise: ['#E8730C', '#E8A100'] as const,
  blueviolet: ['#2E5AA8', '#6A2BD9'] as const,
  dark: ['#FFFFFF', '#EDF2F8'] as const,
};

// Glow/sombra suave (mapeia p/ box-shadow no react-native-web).
export function glow(color: string, radius = 14, opacity = 0.35) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(radius / 3),
  };
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 32 };
export const radius = { sm: 6, md: 8, lg: 12, xl: 18, pill: 100 };

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
  emoji: string;
  color: string;
  gradient: [string, string];
}

export const NUCLEO_META: Record<NucleoType, NucleoMeta> = {
  FULLON: {
    label: 'Fullon',
    tagline: 'Energia no pico, melodia épica, pista no talo.',
    emoji: '⚡',
    color: orkut.orange,
    gradient: [orkut.orange, '#FFFFFF'],
  },
  PROGRESSIVO: {
    label: 'Progressivo',
    tagline: 'A viagem hipnótica que constrói sem pressa.',
    emoji: '🌿',
    color: orkut.cyan,
    gradient: [orkut.cyan, '#FFFFFF'],
  },
  DARK_FOREST: {
    label: 'Dark Forest',
    tagline: 'O escuro, o peso e a floresta de madrugada.',
    emoji: '🌑',
    color: orkut.violet,
    gradient: [orkut.violet, '#FFFFFF'],
  },
  TECHNO: {
    label: 'Techno',
    tagline: 'Kick reto, groove de máquina, precisão.',
    emoji: '🤖',
    color: orkut.blue,
    gradient: [orkut.blue, '#FFFFFF'],
  },
  FAROFEIRO: {
    label: 'Farofeiro',
    tagline: 'Vai em tudo. Reclama de tudo. Volta em tudo.',
    emoji: '🔥',
    color: orkut.magenta,
    gradient: [orkut.magenta, '#FFFFFF'],
  },
  MISTICO: {
    label: 'Místico',
    tagline: 'Raiz, natureza e conexão no sunrise.',
    emoji: '🔮',
    color: orkut.yellow,
    gradient: [orkut.yellow, '#FFFFFF'],
  },
};
