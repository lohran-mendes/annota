import type { Exam, Subject, Topic, Question, UserProgress, MockExamConfig } from '@annota/shared';

export const MOCK_EXAMS: Exam[] = [
  {
    id: '1',
    name: 'Vestibulinho ETEC 2026',
    description:
      'Processo seletivo para ingresso no Ensino Médio das Escolas Técnicas Estaduais de São Paulo. Prova com questões de múltipla escolha abrangendo Matemática, Português, Ciências, História e Geografia.',
    year: 2026,
    institution: 'Centro Paula Souza',
    questionCount: 50,
    subjectCount: 5,
  },
  {
    id: '2',
    name: 'ENEM 2026',
    description:
      'Exame Nacional do Ensino Médio. Avalia o desempenho dos estudantes ao final da educação básica, servindo como porta de entrada para universidades públicas e programas do governo.',
    year: 2026,
    institution: 'INEP/MEC',
    questionCount: 180,
    subjectCount: 4,
  },
  {
    id: '3',
    name: 'A Criar',
    description:
      'Ainda sem descrição, é necessário adicionar o novo exame.',
    year: 2026,
    institution: 'A Criar',
    questionCount: 0,
    subjectCount: 0,
  },
  {
    id: '4',
    name: 'A Criar',
    description:
      'Ainda sem descrição, é necessário adicionar o novo exame.',
    year: 2026,
    institution: 'A Criar',
    questionCount: 0,
    subjectCount: 0,
  },
];

export const MOCK_SUBJECTS: Subject[] = [
  {
    id: '1',
    examId: '1',
    name: 'Matemática',
    icon: 'calculate',
    questionCount: 15,
    completedCount: 8,
    color: '#E91E63',
  },
  {
    id: '2',
    examId: '1',
    name: 'Português',
    icon: 'menu_book',
    questionCount: 12,
    completedCount: 5,
    color: '#9C27B0',
  },
  {
    id: '3',
    examId: '1',
    name: 'Ciências',
    icon: 'science',
    questionCount: 10,
    completedCount: 3,
    color: '#00BCD4',
  },
  {
    id: '4',
    examId: '1',
    name: 'História',
    icon: 'history_edu',
    questionCount: 8,
    completedCount: 6,
    color: '#FF7043',
  },
  {
    id: '5',
    examId: '1',
    name: 'Geografia',
    icon: 'public',
    questionCount: 5,
    completedCount: 2,
    color: '#66BB6A',
  },
];

export const MOCK_TOPICS: Topic[] = [
  // Matemática
  { id: '1', subjectId: '1', name: 'Equações do 1º grau', questionCount: 4, completedCount: 3 },
  { id: '2', subjectId: '1', name: 'Porcentagem e Juros', questionCount: 3, completedCount: 2 },
  { id: '3', subjectId: '1', name: 'Geometria Básica', questionCount: 4, completedCount: 1 },
  { id: '4', subjectId: '1', name: 'Razão e Proporção', questionCount: 4, completedCount: 2 },
  // Português
  { id: '5', subjectId: '2', name: 'Interpretação de Texto', questionCount: 5, completedCount: 3 },
  { id: '6', subjectId: '2', name: 'Gramática', questionCount: 4, completedCount: 1 },
  { id: '7', subjectId: '2', name: 'Figuras de Linguagem', questionCount: 3, completedCount: 1 },
  // Ciências
  { id: '8', subjectId: '3', name: 'Corpo Humano', questionCount: 4, completedCount: 2 },
  { id: '9', subjectId: '3', name: 'Ecologia', questionCount: 3, completedCount: 0 },
  { id: '10', subjectId: '3', name: 'Química Básica', questionCount: 3, completedCount: 1 },
  // História
  { id: '11', subjectId: '4', name: 'Brasil Colônia', questionCount: 4, completedCount: 3 },
  { id: '12', subjectId: '4', name: 'Era Vargas', questionCount: 4, completedCount: 3 },
  // Geografia
  { id: '13', subjectId: '5', name: 'Regiões do Brasil', questionCount: 3, completedCount: 1 },
  { id: '14', subjectId: '5', name: 'Clima e Vegetação', questionCount: 2, completedCount: 1 },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    topicId: '1',
    subjectId: '1',
    statement:
      'Uma loja vende cadernos por R$ 12,00 cada. Se Ana comprou alguns cadernos e pagou R$ 84,00, quantos cadernos ela comprou?',
    alternatives: [
      { label: 'A', text: '5 cadernos' },
      { label: 'B', text: '6 cadernos' },
      { label: 'C', text: '7 cadernos' },
      { label: 'D', text: '8 cadernos' },
    ],
    correctAnswerIndex: 2,
    explanation:
      'Para resolver, basta dividir o valor total pela preço de cada caderno: 84 ÷ 12 = 7. Portanto, Ana comprou 7 cadernos.',
  },
  {
    id: '2',
    topicId: '1',
    subjectId: '1',
    statement: 'Se 3x + 7 = 22, qual o valor de x?',
    alternatives: [
      { label: 'A', text: 'x = 3' },
      { label: 'B', text: 'x = 5' },
      { label: 'C', text: 'x = 7' },
      { label: 'D', text: 'x = 15' },
    ],
    correctAnswerIndex: 1,
    explanation: 'Isolando x: 3x + 7 = 22 → 3x = 22 - 7 → 3x = 15 → x = 15/3 → x = 5.',
  },
  {
    id: '3',
    topicId: '2',
    subjectId: '1',
    statement:
      'Um produto custava R$ 80,00 e teve um desconto de 15%. Qual o novo preço do produto?',
    alternatives: [
      { label: 'A', text: 'R$ 65,00' },
      { label: 'B', text: 'R$ 68,00' },
      { label: 'C', text: 'R$ 70,00' },
      { label: 'D', text: 'R$ 72,00' },
    ],
    correctAnswerIndex: 1,
    explanation: '15% de R$ 80,00 = 0,15 × 80 = R$ 12,00. Novo preço: 80 - 12 = R$ 68,00.',
  },
  {
    id: '4',
    topicId: '3',
    subjectId: '1',
    statement: 'Qual é a área de um retângulo com base de 8 cm e altura de 5 cm?',
    alternatives: [
      { label: 'A', text: '13 cm²' },
      { label: 'B', text: '26 cm²' },
      { label: 'C', text: '40 cm²' },
      { label: 'D', text: '45 cm²' },
    ],
    correctAnswerIndex: 2,
    explanation:
      'A área de um retângulo é calculada multiplicando a base pela altura: A = b × h = 8 × 5 = 40 cm².',
  },
  {
    id: '5',
    topicId: '5',
    subjectId: '2',
    statement:
      'Leia o trecho: "A chuva caía mansamente sobre a cidade adormecida, lavando as ruas vazias." Qual a função da chuva no texto?',
    alternatives: [
      { label: 'A', text: 'Causar destruição na cidade' },
      { label: 'B', text: 'Criar uma atmosfera de tranquilidade e renovação' },
      { label: 'C', text: 'Impedir os moradores de sair de casa' },
      { label: 'D', text: 'Representar a tristeza do narrador' },
    ],
    correctAnswerIndex: 1,
    explanation:
      'Os termos "mansamente", "adormecida" e "lavando" constroem uma imagem de serenidade e purificação, indicando que a chuva representa tranquilidade e renovação.',
  },
  {
    id: '6',
    topicId: '8',
    subjectId: '3',
    statement:
      'O sistema respiratório humano é responsável pelas trocas gasosas. Onde ocorrem essas trocas no pulmão?',
    alternatives: [
      { label: 'A', text: 'Nos brônquios' },
      { label: 'B', text: 'Na traqueia' },
      { label: 'C', text: 'Nos alvéolos pulmonares' },
      { label: 'D', text: 'Na laringe' },
    ],
    correctAnswerIndex: 2,
    explanation:
      'As trocas gasosas (hematose) ocorrem nos alvéolos pulmonares, onde o oxigênio passa para o sangue e o gás carbônico é liberado para ser expirado.',
  },
  {
    id: '7',
    topicId: '11',
    subjectId: '4',
    statement:
      'Qual era a principal atividade econômica do Brasil durante o período colonial, entre os séculos XVI e XVII?',
    alternatives: [
      { label: 'A', text: 'Mineração de ouro' },
      { label: 'B', text: 'Produção de café' },
      { label: 'C', text: 'Cultivo de cana-de-açúcar' },
      { label: 'D', text: 'Extração de borracha' },
    ],
    correctAnswerIndex: 2,
    explanation:
      'Nos séculos XVI e XVII, a principal atividade econômica colonial era o cultivo de cana-de-açúcar, especialmente no Nordeste, utilizando mão de obra escravizada.',
  },
  {
    id: '8',
    topicId: '13',
    subjectId: '5',
    statement: 'Qual é a maior região do Brasil em termos de extensão territorial?',
    alternatives: [
      { label: 'A', text: 'Sudeste' },
      { label: 'B', text: 'Nordeste' },
      { label: 'C', text: 'Norte' },
      { label: 'D', text: 'Centro-Oeste' },
    ],
    correctAnswerIndex: 2,
    explanation:
      'A região Norte é a maior do Brasil em extensão territorial, abrangendo cerca de 45% do território nacional, incluindo a maior parte da Floresta Amazônica.',
  },
];

export const MOCK_PROGRESS: UserProgress = {
  totalAnswered: 45,
  totalCorrect: 32,
  streak: 5,
  bySubject: [
    { subjectId: '1', subjectName: 'Matemática', answered: 15, correct: 11, color: '#E91E63' },
    { subjectId: '2', subjectName: 'Português', answered: 10, correct: 7, color: '#9C27B0' },
    { subjectId: '3', subjectName: 'Ciências', answered: 8, correct: 6, color: '#00BCD4' },
    { subjectId: '4', subjectName: 'História', answered: 7, correct: 5, color: '#FF7043' },
    { subjectId: '5', subjectName: 'Geografia', answered: 5, correct: 3, color: '#66BB6A' },
  ],
};

export const MOCK_MOCK_EXAMS: MockExamConfig[] = [
  {
    id: '1',
    examId: '1',
    name: 'Simulado ETEC - Completo',
    questionCount: 50,
    duration: 180,
    status: 'completed',
    score: 72,
    completedAt: '2025-11-15',
  },
  {
    id: '2',
    examId: '1',
    name: 'Simulado ETEC - Matemática',
    questionCount: 15,
    duration: 60,
    status: 'completed',
    score: 80,
    completedAt: '2025-11-20',
  },
  {
    id: '3',
    examId: '1',
    name: 'Simulado ETEC - Revisão Final',
    questionCount: 30,
    duration: 120,
    status: 'available',
  },
  {
    id: '4',
    examId: '1',
    name: 'Simulado Rápido - 10 questões',
    questionCount: 10,
    duration: 30,
    status: 'available',
  },
];
