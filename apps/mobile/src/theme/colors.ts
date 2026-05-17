// Identidade Vonue — Orkut nostálgico encontra psytrance.
// As cores cruas da cena:
export const orkut = {
  blue: '#1A73E8',
  orange: '#FF6B00',
  yellow: '#FFD600',
  magenta: '#FF2D9B',
  violet: '#7B2FFF',
  cyan: '#00E5CC',
  green: '#AAFF00',
  link: '#6BA5FF',
  bg2: '#131625',
  bg3: '#1A1E35',
};

// `palette` mantém TODAS as chaves usadas pelas ~35 telas de detalhe
// (remapeadas para a paleta Orkut) — nada quebra.
export const palette = {
  bg: '#0D0F1A',
  bgSoft: '#131625',
  surface: '#131625',
  surfaceAlt: '#1A1E35',
  surfaceGlass: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.09)',
  borderSoft: 'rgba(255,255,255,0.06)',
  borderBlue: 'rgba(26,115,232,0.3)',
  text: '#F0F2FF',
  textMuted: 'rgba(240,242,255,0.45)',
  textFaint: 'rgba(240,242,255,0.28)',
  primary: '#1A73E8',
  primaryDeep: '#7B2FFF',
  accent: '#00E5CC',
  hot: '#FF2D9B',
  danger: '#FF2D9B',
  success: '#AAFF00',
  gold: '#FFD600',
  link: '#6BA5FF',
};

export const gradients = {
  brand: ['#1A73E8', '#7B2FFF', '#00E5CC'] as const,
  hero: ['#1A1E35', '#131625', '#0D0F1A'] as const,
  hot: ['#FF6B00', '#FF2D9B'] as const,
  cyber: ['#00E5CC', '#7B2FFF'] as const,
  sunrise: ['#FF6B00', '#FFD600'] as const,
  blueviolet: ['#1A73E8', '#7B2FFF'] as const,
  dark: ['#131625', '#0D0F1A'] as const,
};

// Sombra/glow neon (mapeia p/ box-shadow no react-native-web).
export function glow(color: string, radius = 16, opacity = 0.5) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(radius / 2),
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
    gradient: [orkut.orange, '#0D0F1A'],
  },
  PROGRESSIVO: {
    label: 'Progressivo',
    tagline: 'A viagem hipnótica que constrói sem pressa.',
    emoji: '🌿',
    color: orkut.cyan,
    gradient: [orkut.cyan, '#0D0F1A'],
  },
  DARK_FOREST: {
    label: 'Dark Forest',
    tagline: 'O escuro, o peso e a floresta de madrugada.',
    emoji: '🌑',
    color: orkut.violet,
    gradient: [orkut.violet, '#0D0F1A'],
  },
  TECHNO: {
    label: 'Techno',
    tagline: 'Kick reto, groove de máquina, precisão.',
    emoji: '🤖',
    color: orkut.blue,
    gradient: [orkut.blue, '#0D0F1A'],
  },
  FAROFEIRO: {
    label: 'Farofeiro',
    tagline: 'Vai em tudo. Reclama de tudo. Volta em tudo.',
    emoji: '🔥',
    color: orkut.magenta,
    gradient: [orkut.magenta, '#0D0F1A'],
  },
  MISTICO: {
    label: 'Místico',
    tagline: 'Raiz, natureza e conexão no sunrise.',
    emoji: '🔮',
    color: orkut.yellow,
    gradient: [orkut.yellow, '#0D0F1A'],
  },
};
