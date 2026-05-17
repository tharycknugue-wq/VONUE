import type { NucleoType } from '../theme/colors';

// A "tribo" é a persona narrativa em cima de cada um dos 6 núcleos do
// backend. (ZERAK/hitech e SAELEN/ambient do mockup caem em MORAN e
// AURAN — os estilos deles já roteiam pra esses núcleos na API.)
export interface Tribo {
  name: string;
  genre: string;
  sub: string;
  emoji: string;
  color: string; // legível no tema claro
  msg: string[];
}

export const TRIBOS: Record<NucleoType, Tribo> = {
  FULLON: {
    name: 'VEKON',
    genre: 'FULL ON',
    sub: 'O GUERREIRO DA PISTA',
    emoji: '⚡',
    color: '#2E5AA8',
    msg: [
      'Você é a pista. Você ativa o ambiente quando chega.',
      'Full On no sangue — melódico, acelerado, pista fechada. Você conhece todos os DJs da line antes de comprar o ingresso. E vai ficar até o último set.',
      'A galera sente quando você saiu.',
    ],
  },
  PROGRESSIVO: {
    name: 'SYLAN',
    genre: 'PROGRESSIVO',
    sub: 'O VIAJANTE INTERIOR',
    emoji: '🌿',
    color: '#1F9D57',
    msg: [
      'Você não precisa de barulho. Você precisa de profundidade.',
      'O amanhecer na pista é sagrado. A construção lenta, camada por camada, que te leva longe sem você perceber. Você fecha os olhos no pico do set e some por alguns minutos.',
      'Ninguém vai embora quando o prog do amanhecer começa.',
    ],
  },
  DARK_FOREST: {
    name: 'MORAN',
    genre: 'DARK / FOREST',
    sub: 'O HABITANTE DAS SOMBRAS',
    emoji: '🌑',
    color: '#7B2FD9',
    msg: [
      'Enquanto todo mundo vai pro mainfloor, você some pro palco alternativo.',
      'Você conhece a diferença entre um som que assusta e um que transforma. Dark, Forest, Twisted, Hitech — você sabe o que é cada um.',
      'Quando o dark começa, você não sorri. Você desaparece.',
    ],
  },
  TECHNO: {
    name: 'DREXAN',
    genre: 'TECHNO / ELECTRO',
    sub: 'A MÁQUINA HUMANA',
    emoji: '🎛️',
    color: '#D6336C',
    msg: [
      'Você funciona no ritmo de máquina. Preciso. Repetitivo. Hipnótico.',
      'O Techno de Detroit que virou religião no mundo. Batidas mecânicas, kicks que cortam. Você não precisa de melodia elaborada — precisa de profundidade.',
      'Você dança até o sol raiar sem perceber que o sol raiu.',
    ],
  },
  FAROFEIRO: {
    name: 'FLURAN',
    genre: 'MÚLTIPLOS ESTILOS',
    sub: 'O ESPÍRITO LIVRE DA CENA',
    emoji: '🔥',
    color: '#E0730C',
    msg: [
      'Você curte o que é bom. Ponto. Sem ego de gênero.',
      'House, Trap, Full On, Techno — tanto faz. Você é a pessoa mais divertida do evento porque não tem preconceito com nada e não precisa provar nada pra ninguém.',
      'A cena precisa de quem carrega leveza. Você é essa pessoa.',
    ],
  },
  MISTICO: {
    name: 'AURAN',
    genre: 'GOA / TRANCE / AMBIENT',
    sub: 'O GUARDIÃO DAS ORIGENS',
    emoji: '🕉️',
    color: '#C98A00',
    msg: [
      'Você respeita a origem. E isso diz tudo sobre quem você é.',
      'Goa, Trance, Acid, Ambient — você sabe de onde tudo veio. Os riffs de synth infinitos vindos da Índia, a mutação que virou Psytrance. Pra você a música é portal.',
      'Cada set é uma peregrinação sonora. A frequência certa muda tudo.',
    ],
  },
};
