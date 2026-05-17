import type { Scores } from '../utils/nucleo';

export interface OnboardingOption {
  id: string;
  label: string;
  scores: Partial<Scores>;
}

export interface OnboardingQuestion {
  id: string;
  text: string;
  options: OnboardingOption[];
}

// 20 perguntas. As pontuações de cada opção são definidas no servidor —
// o cliente envia apenas { questionId, optionId } e a API recalcula o núcleo.
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'q1',
    text: 'O que te leva pra uma festa?',
    options: [
      { id: 'a', label: 'A energia e o pico da pista', scores: { fullon: 3 } },
      { id: 'b', label: 'A viagem da música rolando', scores: { progressivo: 3 } },
      { id: 'c', label: 'O escuro e o peso do som', scores: { dark_forest: 3 } },
      { id: 'd', label: 'Estar com a galera', scores: { farofeiro: 3 } },
    ],
  },
  {
    id: 'q2',
    text: 'Que horas a festa fica boa pra você?',
    options: [
      { id: 'a', label: 'Pôr do sol, energia subindo', scores: { fullon: 3 } },
      { id: 'b', label: 'De madrugada, no escuro total', scores: { dark_forest: 3 } },
      { id: 'c', label: 'O sunrise, primeira luz', scores: { mistico: 3 } },
      { id: 'd', label: 'Tanto faz, vim pra ficar', scores: { farofeiro: 2, techno: 1 } },
    ],
  },
  {
    id: 'q3',
    text: 'Qual BPM faz seu coração bater junto?',
    options: [
      { id: 'a', label: '140-145, dança o tempo todo', scores: { fullon: 3 } },
      { id: 'b', label: '134-138, hipnótico', scores: { progressivo: 3 } },
      { id: 'c', label: '150+, sem freio', scores: { dark_forest: 3 } },
      { id: 'd', label: '125-130, batida seca', scores: { techno: 3 } },
    ],
  },
  {
    id: 'q4',
    text: 'Como você escolhe um festival?',
    options: [
      { id: 'a', label: 'Pelo line-up internacional', scores: { fullon: 2, progressivo: 1 } },
      { id: 'b', label: 'Pela locação na natureza', scores: { mistico: 3 } },
      { id: 'c', label: 'Pela cena underground', scores: { dark_forest: 2, techno: 1 } },
      { id: 'd', label: 'Pelos amigos que vão', scores: { farofeiro: 3 } },
    ],
  },
  {
    id: 'q5',
    text: 'Seu lugar na pista é...',
    options: [
      { id: 'a', label: 'Grudado na grade, na frente', scores: { fullon: 3 } },
      { id: 'b', label: 'No meio, fechando o olho', scores: { progressivo: 2, mistico: 1 } },
      { id: 'c', label: 'No fundo escuro, no peso', scores: { dark_forest: 3 } },
      { id: 'd', label: 'Circulando, achando todo mundo', scores: { farofeiro: 3 } },
    ],
  },
  {
    id: 'q6',
    text: 'O som ideal tem...',
    options: [
      { id: 'a', label: 'Melodia épica e leads', scores: { fullon: 3 } },
      { id: 'b', label: 'Camadas que evoluem devagar', scores: { progressivo: 3 } },
      { id: 'c', label: 'Atmosfera sombria e glitches', scores: { dark_forest: 3 } },
      { id: 'd', label: 'Kick reto e groove de máquina', scores: { techno: 3 } },
    ],
  },
  {
    id: 'q7',
    text: 'Depois da festa, você...',
    options: [
      { id: 'a', label: 'Já planeja a próxima', scores: { fullon: 2, farofeiro: 1 } },
      { id: 'b', label: 'Fica refletindo a viagem', scores: { mistico: 3 } },
      { id: 'c', label: 'Procura o after mais escuro', scores: { dark_forest: 3 } },
      { id: 'd', label: 'Vai pro pós com a tribo', scores: { farofeiro: 3 } },
    ],
  },
  {
    id: 'q8',
    text: 'Sua relação com a natureza nas festas:',
    options: [
      { id: 'a', label: 'Mato, rio, conexão total', scores: { mistico: 3 } },
      { id: 'b', label: 'Floresta densa, à noite', scores: { dark_forest: 3 } },
      { id: 'c', label: 'Campo aberto com palco grande', scores: { fullon: 3 } },
      { id: 'd', label: 'Tanto faz, foco é o rolê', scores: { farofeiro: 2, techno: 1 } },
    ],
  },
  {
    id: 'q9',
    text: 'Um DJ te ganha quando...',
    options: [
      { id: 'a', label: 'Solta o hino que todo mundo espera', scores: { fullon: 3 } },
      { id: 'b', label: 'Constrói um set sem pressa', scores: { progressivo: 3 } },
      { id: 'c', label: 'Vai pro mais cru e pesado', scores: { dark_forest: 3 } },
      { id: 'd', label: 'Lê a pista e mantém o groove', scores: { techno: 3 } },
    ],
  },
  {
    id: 'q10',
    text: 'Como você se descreve na cena?',
    options: [
      { id: 'a', label: 'Fullonfeiro raiz', scores: { fullon: 3 } },
      { id: 'b', label: 'Viajante progressivo', scores: { progressivo: 3 } },
      { id: 'c', label: 'Criatura da floresta', scores: { dark_forest: 3 } },
      { id: 'd', label: 'BDO de carteirinha', scores: { farofeiro: 3 } },
    ],
  },
  {
    id: 'q11',
    text: 'Seu visual de festa é...',
    options: [
      { id: 'a', label: 'Colorido, fluor, brilho', scores: { fullon: 2, farofeiro: 1 } },
      { id: 'b', label: 'Preto total, discreto', scores: { dark_forest: 2, techno: 1 } },
      { id: 'c', label: 'Tribal, artesanal, étnico', scores: { mistico: 3 } },
      { id: 'd', label: 'Confortável pra aguentar 12h', scores: { progressivo: 2, farofeiro: 1 } },
    ],
  },
  {
    id: 'q12',
    text: 'O que não pode faltar na sua mochila?',
    options: [
      { id: 'a', label: 'Glitter e adereço', scores: { farofeiro: 3 } },
      { id: 'b', label: 'Casaco pro frio do sunrise', scores: { mistico: 2, progressivo: 1 } },
      { id: 'c', label: 'Lanterna e energia pro escuro', scores: { dark_forest: 3 } },
      { id: 'd', label: 'Protetor auricular, fico até o fim', scores: { techno: 3 } },
    ],
  },
  {
    id: 'q13',
    text: 'O melhor momento de um set é...',
    options: [
      { id: 'a', label: 'O drop que explode a pista', scores: { fullon: 3 } },
      { id: 'b', label: 'A tensão crescendo lentamente', scores: { progressivo: 3 } },
      { id: 'c', label: 'Quando fica sinistro de verdade', scores: { dark_forest: 3 } },
      { id: 'd', label: 'O loop hipnótico que não larga', scores: { techno: 3 } },
    ],
  },
  {
    id: 'q14',
    text: 'Festa perfeita tem quantas pessoas?',
    options: [
      { id: 'a', label: 'Multidão, mega palco', scores: { fullon: 3 } },
      { id: 'b', label: 'Média, todo mundo conectado', scores: { progressivo: 2, mistico: 1 } },
      { id: 'c', label: 'Pequena e secreta', scores: { dark_forest: 2, techno: 1 } },
      { id: 'd', label: 'Quanto mais gente conhecida, melhor', scores: { farofeiro: 3 } },
    ],
  },
  {
    id: 'q15',
    text: 'Você curte psytrance há...',
    options: [
      { id: 'a', label: 'Desde sempre, sou raiz', scores: { mistico: 2, progressivo: 1 } },
      { id: 'b', label: 'Anos, vivo de fullon', scores: { fullon: 3 } },
      { id: 'c', label: 'Migrei do techno/underground', scores: { techno: 3 } },
      { id: 'd', label: 'Comecei agora, tô amando', scores: { farofeiro: 3 } },
    ],
  },
  {
    id: 'q16',
    text: 'Qual frase é mais sua?',
    options: [
      { id: 'a', label: '"Vai ter pico hoje!"', scores: { fullon: 3 } },
      { id: 'b', label: '"Deixa a música te levar"', scores: { progressivo: 3 } },
      { id: 'c', label: '"O escuro chama"', scores: { dark_forest: 3 } },
      { id: 'd', label: '"A cena é a família"', scores: { mistico: 2, farofeiro: 1 } },
    ],
  },
  {
    id: 'q17',
    text: 'No camping você...',
    options: [
      { id: 'a', label: 'Monta a base social da galera', scores: { farofeiro: 3 } },
      { id: 'b', label: 'Quase não vai, fico na pista', scores: { fullon: 2, dark_forest: 1 } },
      { id: 'c', label: 'Curte o silêncio e a mata', scores: { mistico: 3 } },
      { id: 'd', label: 'Recarrego pra próxima leva', scores: { progressivo: 3 } },
    ],
  },
  {
    id: 'q18',
    text: 'Som urbano (warehouse, club) pra você é...',
    options: [
      { id: 'a', label: 'Meu habitat, techno raiz', scores: { techno: 3 } },
      { id: 'b', label: 'Bom, mas prefiro a mata', scores: { mistico: 2, progressivo: 1 } },
      { id: 'c', label: 'Curto o lado mais dark dele', scores: { dark_forest: 3 } },
      { id: 'd', label: 'Vou por causa da galera', scores: { farofeiro: 3 } },
    ],
  },
  {
    id: 'q19',
    text: 'O que você leva de uma festa pra vida?',
    options: [
      { id: 'a', label: 'A adrenalina e as histórias', scores: { fullon: 2, farofeiro: 1 } },
      { id: 'b', label: 'Insights e autoconhecimento', scores: { mistico: 3 } },
      { id: 'c', label: 'A intensidade que poucos entendem', scores: { dark_forest: 3 } },
      { id: 'd', label: 'A precisão de um bom set', scores: { techno: 3 } },
    ],
  },
  {
    id: 'q20',
    text: 'Se a cena fosse um elemento, seria...',
    options: [
      { id: 'a', label: 'Fogo — explosão de energia', scores: { fullon: 3 } },
      { id: 'b', label: 'Água — fluxo contínuo', scores: { progressivo: 3 } },
      { id: 'c', label: 'Terra — raiz e escuridão', scores: { dark_forest: 2, mistico: 1 } },
      { id: 'd', label: 'Metal — máquina e repetição', scores: { techno: 3 } },
    ],
  },
];

const QUESTION_INDEX = new Map(ONBOARDING_QUESTIONS.map((q) => [q.id, q]));

/** Resolve { questionId, optionId } para o mapa de pontuação do servidor. */
export function resolveAnswerScores(
  questionId: string,
  optionId: string
): Partial<Scores> | null {
  const question = QUESTION_INDEX.get(questionId);
  const option = question?.options.find((o) => o.id === optionId);
  return option ? option.scores : null;
}

/** Versão pública (sem expor as pontuações) enviada ao app. */
export function publicQuestions() {
  return ONBOARDING_QUESTIONS.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options.map((o) => ({ id: o.id, label: o.label })),
  }));
}
