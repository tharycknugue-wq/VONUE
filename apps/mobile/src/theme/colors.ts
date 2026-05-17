export const palette = {
  bg: '#0B0B12',
  surface: '#15151F',
  surfaceAlt: '#1E1E2C',
  border: '#2A2A3A',
  text: '#FFFFFF',
  textMuted: '#8A8A9A',
  primary: '#C9A0FF',
  danger: '#FF5570',
  success: '#39FF14',
};

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
