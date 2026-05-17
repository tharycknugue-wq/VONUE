// Catálogo de estilos do onboarding livre (múltipla escolha). O id é o
// que vai pra API; ela mapeia id → núcleo. Cores legíveis no tema claro.

export interface Genre {
  id: string;
  name: string;
  emoji: string;
  bpm: string;
  desc: string;
  color: string;
  wide?: boolean;
}

export interface GenreSection {
  icon: string;
  title: string;
  desc: string;
  genres: Genre[];
}

export const GENRE_SECTIONS: GenreSection[] = [
  {
    icon: '🌀',
    title: 'PSYTRANCE',
    desc: 'A raiz de tudo. Vindo da Índia, explodiu no Brasil.',
    genres: [
      {
        id: 'fullon',
        name: 'FULL ON',
        emoji: '⚡',
        bpm: '138–148 BPM · ISRAEL / GLOBAL',
        desc: 'Melódico, acelerado, pista fechada. A vertente mais popular do Psytrance.',
        color: '#2E5AA8',
      },
      {
        id: 'prog',
        name: 'PROGRESSIVO',
        emoji: '🌿',
        bpm: '130–140 BPM · INTROSPECTIVO',
        desc: 'Mais calmo, lisérgico, meditativo. O som do amanhecer na pista.',
        color: '#1F9D57',
      },
      {
        id: 'dark',
        name: 'DARK PSY',
        emoji: '🌑',
        bpm: '148–160 BPM · SOMBRIO',
        desc: 'Camadas pesadas, efeitos fantasmagóricos. Forest, Twisted, Weird.',
        color: '#7B2FD9',
      },
      {
        id: 'hitech',
        name: 'HITECH',
        emoji: '⚙️',
        bpm: '180–240+ BPM · EXTREMO',
        desc: 'A vertente mais rápida. Timbres metálicos, glitch picotado.',
        color: '#D6219B',
      },
      {
        id: 'goa',
        name: 'GOA TRANCE',
        emoji: '🕉️',
        bpm: '130–150 BPM · A RAIZ',
        desc: 'A origem de tudo. Riffs de synth infinitos vindos da Índia. Clássico que nunca morre.',
        color: '#C98A00',
        wide: true,
      },
    ],
  },
  {
    icon: '🎵',
    title: 'MÚSICA ELETRÔNICA',
    desc: 'Os grandes gêneros que moldaram tudo.',
    genres: [
      {
        id: 'techno',
        name: 'TECHNO',
        emoji: '🎛️',
        bpm: '130–150 BPM · DETROIT',
        desc: 'Batidas mecânicas, sirenes. O gênero mais frio e preciso.',
        color: '#D6336C',
      },
      {
        id: 'house',
        name: 'HOUSE',
        emoji: '🏠',
        bpm: '120–130 BPM · CHICAGO',
        desc: 'O mais flexível. Influenciou tudo que veio depois.',
        color: '#E0730C',
      },
      {
        id: 'deep',
        name: 'DEEP HOUSE',
        emoji: '🌊',
        bpm: '110–120 BPM · JAZZ / SOUL',
        desc: 'House com Jazz, Funk e Soul. Pra dançar sem pressa.',
        color: '#2E6FB8',
      },
      {
        id: 'trance',
        name: 'TRANCE',
        emoji: '🌌',
        bpm: '128–145 BPM · VOCAIS',
        desc: 'Mais lento com vocais. Explodiu em festivais nos anos 2000.',
        color: '#0E8FB0',
      },
      {
        id: 'dnb',
        name: "DRUM'N'BASS",
        emoji: '🥁',
        bpm: '160–180 BPM · BREAKBEAT',
        desc: 'Pesado, quebrado. O mais energético fora do Psytrance.',
        color: '#4D9A00',
      },
      {
        id: 'minimal',
        name: 'MINIMAL',
        emoji: '🔲',
        bpm: '125–130 BPM · POUCOS SONS',
        desc: 'Poucos elementos. A hipnose do simples.',
        color: '#6A2BD9',
      },
      {
        id: 'electro',
        name: 'ELECTRO',
        emoji: '🤖',
        bpm: 'BPM VARIADO · VOCODER',
        desc: 'Bateria eletrônica e sintetizadores. Vocais distorcidos.',
        color: '#9B4DCA',
      },
      {
        id: 'acid',
        name: 'ACID HOUSE',
        emoji: '🧪',
        bpm: '120–130 BPM · TB-303',
        desc: 'O "som ácido" da Roland TB-303. O que virou Techno.',
        color: '#C97A00',
      },
    ],
  },
  {
    icon: '🔥',
    title: 'OUTROS ESTILOS',
    desc: 'Subgêneros que continuam evoluindo.',
    genres: [
      {
        id: 'dubstep',
        name: 'DUBSTEP',
        emoji: '👹',
        bpm: '138–145 BPM · DROPS PESADOS',
        desc: 'Drops que abalam o chão. Graves extremos.',
        color: '#C2410C',
      },
      {
        id: 'trap',
        name: 'TRAP / FUTURE',
        emoji: '🎤',
        bpm: 'VARIADO · HIP-HOP + ELETRO',
        desc: 'Onde o hip-hop encontrou a eletrônica.',
        color: '#C026A0',
      },
      {
        id: 'ambient',
        name: 'AMBIENT / IDM',
        emoji: '🌙',
        bpm: 'ATMOSFÉRICO · SEM BPM FIXO',
        desc: 'Música pra viajar sem sair do lugar.',
        color: '#2E7FB8',
      },
      {
        id: 'hardcore',
        name: 'HARDCORE / HARDSTYLE',
        emoji: '💢',
        bpm: '150–300 BPM · EXTREMO',
        desc: 'O limite da velocidade. A pista mais pesada que existe.',
        color: '#C0202A',
      },
      {
        id: 'farofeiro',
        name: 'TUDO. DEPENDE DO SET.',
        emoji: '🔥',
        bpm: 'FAROFEIRO · SEM EGO DE GÊNERO',
        desc: 'Se o set é bom, você tá lá. Sem precisar de rótulo.',
        color: '#C98A00',
        wide: true,
      },
    ],
  },
];
