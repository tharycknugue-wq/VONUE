// Conteúdo de demonstração para as camadas sociais "estilo Orkut" que
// ainda não têm backend (scraps, depoimentos, comunidades, amigos).
// Eventos / DJs / selos / árvore / perfil usam dados REAIS da API.

export type Grad = readonly [string, string];

export interface Friend {
  handle: string;
  emoji: string;
  grad: Grad;
}

export const FRIENDS: Friend[] = [
  { handle: '@fernanda', emoji: '🌙', grad: ['#4A0080', '#9B35FF'] },
  { handle: '@lucas', emoji: '🔥', grad: ['#FF6B00', '#FFD600'] },
  { handle: '@marina', emoji: '🌿', grad: ['#006688', '#00E5CC'] },
  { handle: '@caio', emoji: '⚙️', grad: ['#FF2D9B', '#9B35FF'] },
  { handle: '@pedro', emoji: '⚡', grad: ['#004488', '#4D9FFF'] },
  { handle: '@ana', emoji: '🔮', grad: ['#880033', '#FF2D9B'] },
];

export interface Community {
  ico: string;
  name: string;
  desc: string;
  members: string;
  heat: string;
}

export const COMMUNITIES: Community[] = [
  {
    ico: '🔥',
    name: 'Farofeiros Unidos',
    desc: 'Vai em tudo. Reclama de tudo. Volta em tudo. A maior do app.',
    members: '31.8k membros',
    heat: 'ativo agora',
  },
  {
    ico: '⚡',
    name: 'Fullonfeiros BR',
    desc: 'Da pista do início ao fim. +145 BPM ou não vale.',
    members: '12.4k membros',
    heat: 'muito ativo',
  },
  {
    ico: '🌑',
    name: 'Dark Forest Brasil',
    desc: 'A névoa, o peso, o mistério. Quem conhece sabe.',
    members: '5.1k membros',
    heat: 'ativo',
  },
  {
    ico: '🌿',
    name: 'Prog do Amanhecer',
    desc: 'O sol nasceu. O set continua. Ninguém foi embora.',
    members: '9.7k membros',
    heat: 'muito ativo',
  },
  {
    ico: '🌳',
    name: 'Árvore da Vida',
    desc: 'Comunidade oficial da Fazenda Meia Lua. Dicas, fotos, carona.',
    members: '8.2k membros',
    heat: 'ativo',
  },
  {
    ico: '🚐',
    name: 'Excursões e Caronas',
    desc: 'Procurando excur? Tem vaga no carro? É aqui.',
    members: '22.1k membros',
    heat: 'muito ativo',
  },
  {
    ico: '📸',
    name: 'Fotógrafos da Cena',
    desc: 'Fotógrafos credenciados, portfólios e contratações.',
    members: '3.4k membros',
    heat: 'ativo',
  },
  {
    ico: '🗑️',
    name: 'Lixeira do Trance BR',
    desc: 'Org ruim? Estrutura horrível? Vem reclamar aqui.',
    members: '41.2k membros',
    heat: 'muito ativo',
  },
];

export interface Scrap {
  handle: string;
  emoji: string;
  grad: Grad;
  time: string;
  text: string;
  eventTag?: string;
}

export const SCRAPS: Scrap[] = [
  {
    handle: '@fernanda_dark',
    emoji: '🌙',
    grad: ['#4A0080', '#9B35FF'],
    time: '2h atrás',
    text: 'Salve tropa! Alguém vai na PsyFly esse sábado? Tô procurando carona saindo de SP centro 🚗',
    eventTag: '🪰 PSYFLY',
  },
  {
    handle: '@lucas_faro',
    emoji: '🔥',
    grad: ['#FF6B00', '#FFD600'],
    time: '5h atrás',
    text: 'Mano que set do Vegas na Árvore. Não voltei mais. Tô renovado até hoje kkkk',
    eventTag: '🌳 ÁRVORE DA VIDA',
  },
  {
    handle: '@marina_prog',
    emoji: '🌿',
    grad: ['#006688', '#00E5CC'],
    time: '1d atrás',
    text: 'Quem foi na Athena ontem? O palco de prog às 6h da manhã foi o pico. Saí destruída mas feliz demais.',
    eventTag: '☀️ ATHENA',
  },
  {
    handle: '@caio_techno',
    emoji: '⚙️',
    grad: ['#FF2D9B', '#9B35FF'],
    time: '2d atrás',
    text: 'Crew nova fazendo excur pro UP em dezembro. Ainda tem vaga. Me chama no chat quem tiver interesse.',
  },
];

export interface Depoimento {
  author: string;
  text: string;
}

export const DEPOIMENTOS: Depoimento[] = [
  {
    author: '@fernanda_dark',
    text: '"Tharyck é o tipo de raver que você quer do seu lado na pista. Vai em tudo, reclama de tudo, mas nunca falta num rolê. Farofeiro raiz."',
  },
  {
    author: '@lucas_faro',
    text: '"Meu parceiro de excur desde a Árvore de 2022. Deu perrengue? Tharyck tava lá. Confiável demais."',
  },
];

export interface Rating {
  label: string;
  filled: number;
  color: string;
}

// As estrelas do Orkut, repaginadas pra cena.
export const RATINGS: Rating[] = [
  { label: 'RAIZ', filled: 3, color: '#FFD600' },
  { label: 'ANIMADO', filled: 4, color: '#FF2D9B' },
  { label: 'CONFIÁVEL', filled: 5, color: '#00E5CC' },
];
