import { NucleoType } from '@prisma/client';

export type NucleoKey =
  | 'fullon'
  | 'progressivo'
  | 'dark_forest'
  | 'techno'
  | 'farofeiro'
  | 'mistico';

export type Scores = Record<NucleoKey, number>;

export const NUCLEO_KEYS: NucleoKey[] = [
  'fullon',
  'progressivo',
  'dark_forest',
  'techno',
  'farofeiro',
  'mistico',
];

const KEY_TO_ENUM: Record<NucleoKey, NucleoType> = {
  fullon: NucleoType.FULLON,
  progressivo: NucleoType.PROGRESSIVO,
  dark_forest: NucleoType.DARK_FOREST,
  techno: NucleoType.TECHNO,
  farofeiro: NucleoType.FAROFEIRO,
  mistico: NucleoType.MISTICO,
};

export function emptyScores(): Scores {
  return { fullon: 0, progressivo: 0, dark_forest: 0, techno: 0, farofeiro: 0, mistico: 0 };
}

export function tallyScores(partials: Array<Partial<Scores>>): Scores {
  const scores = emptyScores();
  for (const partial of partials) {
    for (const key of NUCLEO_KEYS) {
      scores[key] += partial[key] ?? 0;
    }
  }
  return scores;
}

export function calculateNucleo(partials: Array<Partial<Scores>>): {
  scores: Scores;
  key: NucleoKey;
  nucleoType: NucleoType;
} {
  const scores = tallyScores(partials);
  const sorted = (Object.entries(scores) as Array<[NucleoKey, number]>).sort(
    (a, b) => b[1] - a[1]
  );
  const key = sorted[0][0];
  return { scores, key, nucleoType: KEY_TO_ENUM[key] };
}
