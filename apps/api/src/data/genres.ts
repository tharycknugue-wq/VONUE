import type { Scores, NucleoKey } from '../utils/nucleo';

// Catálogo de estilos que o usuário seleciona livremente (múltipla
// escolha, sem limite). Cada estilo aponta para um dos 6 núcleos —
// derivado do mapa de tribos, colapsando hitech→dark_forest e
// goa/trance→mistico nos nossos 6 núcleos.
export const GENRE_NUCLEO: Record<string, NucleoKey> = {
  fullon: 'fullon',
  prog: 'progressivo',
  dark: 'dark_forest',
  hitech: 'dark_forest',
  goa: 'mistico',
  techno: 'techno',
  house: 'farofeiro',
  deep: 'progressivo',
  trance: 'mistico',
  dnb: 'dark_forest',
  minimal: 'dark_forest',
  electro: 'dark_forest',
  acid: 'mistico',
  dubstep: 'dark_forest',
  trap: 'farofeiro',
  ambient: 'mistico',
  hardcore: 'dark_forest',
  farofeiro: 'farofeiro',
};

export const GENRE_IDS = Object.keys(GENRE_NUCLEO);

// Cada estilo escolhido vira um voto (peso 3) no núcleo correspondente.
// `forceFarofeiro`: escolheu "farofeiro" direto OU 5+ estilos → a pessoa
// curte tudo sem rótulo (regra do mockup da tribo).
export function scoresFromGenres(genres: string[]): {
  partials: Array<Partial<Scores>>;
  forceFarofeiro: boolean;
  validCount: number;
} {
  const partials: Array<Partial<Scores>> = [];
  let validCount = 0;
  let pickedFarofeiro = false;

  for (const g of genres) {
    const key = GENRE_NUCLEO[g];
    if (!key) continue;
    validCount += 1;
    if (g === 'farofeiro') pickedFarofeiro = true;
    partials.push({ [key]: 3 } as Partial<Scores>);
  }

  return {
    partials,
    forceFarofeiro: pickedFarofeiro || validCount >= 5,
    validCount,
  };
}
