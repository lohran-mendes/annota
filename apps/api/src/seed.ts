import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const ExamSchema = new mongoose.Schema({
  name: String,
  description: String,
  year: Number,
  institution: String,
  questionIds: [{ type: mongoose.Schema.Types.ObjectId }],
  questionCount: { type: Number, default: 0 },
  subjectCount: { type: Number, default: 0 },
  duration: { type: Number, default: 180 },
});

const SubjectSchema = new mongoose.Schema({
  name: String,
  icon: String,
  questionCount: { type: Number, default: 0 },
  completedCount: { type: Number, default: 0 },
  color: String,
});

const TopicSchema = new mongoose.Schema({
  subjectId: mongoose.Schema.Types.ObjectId,
  name: String,
  questionCount: { type: Number, default: 0 },
  completedCount: { type: Number, default: 0 },
});

const AlternativeSchema = new mongoose.Schema(
  { label: String, text: String },
  { _id: false },
);

const QuestionSchema = new mongoose.Schema({
  topicId: mongoose.Schema.Types.ObjectId,
  subjectId: mongoose.Schema.Types.ObjectId,
  statement: String,
  alternatives: [AlternativeSchema],
  correctAnswerIndex: Number,
  explanation: String,
});

const DeckSeedSchema = new mongoose.Schema({
  name: String,
  description: String,
  cardCount: { type: Number, default: 0 },
  dueCount: { type: Number, default: 0 },
}, { timestamps: true });

const FlashcardSeedSchema = new mongoose.Schema({
  deckId: mongoose.Schema.Types.ObjectId,
  front: String,
  back: String,
  interval: { type: Number, default: 0 },
  easeFactor: { type: Number, default: 2.5 },
  repetitions: { type: Number, default: 0 },
  nextReviewDate: { type: Date, default: () => new Date() },
  lastReviewedAt: { type: Date, default: null },
}, { timestamps: true });

const Exam = mongoose.model('Exam', ExamSchema);
const Subject = mongoose.model('Subject', SubjectSchema);
const Topic = mongoose.model('Topic', TopicSchema);
const Question = mongoose.model('Question', QuestionSchema);
const DeckModel = mongoose.model('Deck', DeckSeedSchema);
const FlashcardModel = mongoose.model('Flashcard', FlashcardSeedSchema);

async function seed() {
  const uri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/annota';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Limpar collections
  await Exam.deleteMany({});
  await Subject.deleteMany({});
  await Topic.deleteMany({});
  await Question.deleteMany({});
  console.log('Collections cleared');

  // === EXAMS ===
  const exam1 = await Exam.create({
    name: 'Vestibulinho ETEC 2026',
    description:
      'Processo seletivo para ingresso no Ensino Médio das Escolas Técnicas Estaduais de São Paulo. Prova com questões de múltipla escolha abrangendo Matemática, Português, Ciências, História e Geografia.',
    year: 2026,
    institution: 'Centro Paula Souza',
    duration: 180,
  });

  const exam2 = await Exam.create({
    name: 'ENEM 2026',
    description:
      'Exame Nacional do Ensino Médio. Avalia o desempenho dos estudantes ao final da educação básica, servindo como porta de entrada para universidades públicas e programas do governo.',
    year: 2026,
    institution: 'INEP/MEC',
    duration: 330,
  });

  console.log(`Exams created: ${exam1.name}, ${exam2.name}`);

  // === SUBJECTS (globais) ===
  const subjects = await Subject.insertMany([
    {
      name: 'Matemática',
      icon: 'calculate',
      questionCount: 4,
      completedCount: 0,
      color: '#E91E63',
    },
    {
      name: 'Português',
      icon: 'menu_book',
      questionCount: 1,
      completedCount: 0,
      color: '#9C27B0',
    },
    {
      name: 'Ciências',
      icon: 'science',
      questionCount: 1,
      completedCount: 0,
      color: '#00BCD4',
    },
    {
      name: 'História',
      icon: 'history_edu',
      questionCount: 1,
      completedCount: 0,
      color: '#FF7043',
    },
    {
      name: 'Geografia',
      icon: 'public',
      questionCount: 1,
      completedCount: 0,
      color: '#66BB6A',
    },
  ]);

  const [mat, por, cie, his, geo] = subjects;
  console.log(`Subjects created: ${subjects.length}`);

  // === TOPICS ===
  const topics = await Topic.insertMany([
    // Matematica
    { subjectId: mat._id, name: 'Equações do 1º grau', questionCount: 2, completedCount: 0 },
    { subjectId: mat._id, name: 'Porcentagem e Juros', questionCount: 1, completedCount: 0 },
    { subjectId: mat._id, name: 'Geometria Básica', questionCount: 1, completedCount: 0 },
    { subjectId: mat._id, name: 'Razão e Proporção', questionCount: 0, completedCount: 0 },
    // Portugues
    { subjectId: por._id, name: 'Interpretação de Texto', questionCount: 1, completedCount: 0 },
    { subjectId: por._id, name: 'Gramática', questionCount: 0, completedCount: 0 },
    { subjectId: por._id, name: 'Figuras de Linguagem', questionCount: 0, completedCount: 0 },
    // Ciencias
    { subjectId: cie._id, name: 'Corpo Humano', questionCount: 1, completedCount: 0 },
    { subjectId: cie._id, name: 'Ecologia', questionCount: 0, completedCount: 0 },
    { subjectId: cie._id, name: 'Química Básica', questionCount: 0, completedCount: 0 },
    // Historia
    { subjectId: his._id, name: 'Brasil Colônia', questionCount: 1, completedCount: 0 },
    { subjectId: his._id, name: 'Era Vargas', questionCount: 0, completedCount: 0 },
    // Geografia
    { subjectId: geo._id, name: 'Regiões do Brasil', questionCount: 1, completedCount: 0 },
    { subjectId: geo._id, name: 'Clima e Vegetação', questionCount: 0, completedCount: 0 },
  ]);

  console.log(`Topics created: ${topics.length}`);

  // Map topics por nome para facilitar referencia
  const topicMap = new Map(topics.map((t) => [t.name, t]));

  // === QUESTIONS ===
  const questions = await Question.insertMany([
    {
      topicId: topicMap.get('Equações do 1º grau')!._id,
      subjectId: mat._id,
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
      topicId: topicMap.get('Equações do 1º grau')!._id,
      subjectId: mat._id,
      statement: 'Se 3x + 7 = 22, qual o valor de x?',
      alternatives: [
        { label: 'A', text: 'x = 3' },
        { label: 'B', text: 'x = 5' },
        { label: 'C', text: 'x = 7' },
        { label: 'D', text: 'x = 15' },
      ],
      correctAnswerIndex: 1,
      explanation:
        'Isolando x: 3x + 7 = 22 → 3x = 22 - 7 → 3x = 15 → x = 15/3 → x = 5.',
    },
    {
      topicId: topicMap.get('Porcentagem e Juros')!._id,
      subjectId: mat._id,
      statement:
        'Um produto custava R$ 80,00 e teve um desconto de 15%. Qual o novo preço do produto?',
      alternatives: [
        { label: 'A', text: 'R$ 65,00' },
        { label: 'B', text: 'R$ 68,00' },
        { label: 'C', text: 'R$ 70,00' },
        { label: 'D', text: 'R$ 72,00' },
      ],
      correctAnswerIndex: 1,
      explanation:
        '15% de R$ 80,00 = 0,15 × 80 = R$ 12,00. Novo preço: 80 - 12 = R$ 68,00.',
    },
    {
      topicId: topicMap.get('Geometria Básica')!._id,
      subjectId: mat._id,
      statement:
        'Qual é a área de um retângulo com base de 8 cm e altura de 5 cm?',
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
      topicId: topicMap.get('Interpretação de Texto')!._id,
      subjectId: por._id,
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
      topicId: topicMap.get('Corpo Humano')!._id,
      subjectId: cie._id,
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
      topicId: topicMap.get('Brasil Colônia')!._id,
      subjectId: his._id,
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
      topicId: topicMap.get('Regiões do Brasil')!._id,
      subjectId: geo._id,
      statement:
        'Qual é a maior região do Brasil em termos de extensão territorial?',
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
  ]);

  console.log(`Questions created: ${questions.length}`);

  // === VINCULAR QUESTOES AO EXAM ===
  const allQuestionIds = questions.map((q) => q._id);
  const distinctSubjectIds = [
    ...new Set(questions.map((q) => q.subjectId!.toString())),
  ];

  await Exam.findByIdAndUpdate(exam1._id, {
    questionIds: allQuestionIds,
    questionCount: allQuestionIds.length,
    subjectCount: distinctSubjectIds.length,
  });

  console.log(
    `Linked ${allQuestionIds.length} questions to ${exam1.name}`,
  );

  // === DECKS & FLASHCARDS ===
  await DeckModel.deleteMany({});
  await FlashcardModel.deleteMany({});
  console.log('Deck and Flashcard collections cleared');

  const deck1 = await DeckModel.create({
    name: 'Matemática - Fórmulas',
    description: 'Fórmulas essenciais de matemática para o vestibulinho',
  });

  const deck2 = await DeckModel.create({
    name: 'Português - Figuras de Linguagem',
    description: 'Principais figuras de linguagem com exemplos',
  });

  const deck3 = await DeckModel.create({
    name: 'Ciências - Corpo Humano',
    description: 'Sistemas do corpo humano e suas funções',
  });

  console.log(`Decks created: ${deck1.name}, ${deck2.name}, ${deck3.name}`);

  const flashcards = await FlashcardModel.insertMany([
    { deckId: deck1._id, front: 'Qual é a fórmula da área do círculo?', back: 'A = π × r² (pi vezes o raio ao quadrado)' },
    { deckId: deck1._id, front: 'Qual é a fórmula de Bhaskara?', back: 'x = (-b ± √(b² - 4ac)) / 2a' },
    { deckId: deck1._id, front: 'Qual é o Teorema de Pitágoras?', back: 'a² = b² + c² (hipotenusa ao quadrado é igual à soma dos catetos ao quadrado)' },
    { deckId: deck1._id, front: 'Como calcular porcentagem de um valor?', back: 'Valor × (porcentagem / 100). Ex: 15% de 80 = 80 × 0,15 = 12' },
    { deckId: deck1._id, front: 'Qual é a fórmula do volume do cilindro?', back: 'V = π × r² × h (área da base vezes a altura)' },
    { deckId: deck2._id, front: 'O que é Metáfora?', back: 'Comparação implícita entre dois elementos sem usar "como" ou "tal qual". Ex: "Ele é um touro" (ele é forte como um touro).' },
    { deckId: deck2._id, front: 'O que é Hipérbole?', back: 'Exagero intencional para dar ênfase. Ex: "Já te disse um milhão de vezes."' },
    { deckId: deck2._id, front: 'O que é Ironia?', back: 'Dizer o contrário do que se pensa, geralmente com tom de humor ou crítica. Ex: "Que lindo, tirou zero na prova!"' },
    { deckId: deck2._id, front: 'O que é Personificação (Prosopopeia)?', back: 'Atribuir características humanas a seres inanimados ou irracionais. Ex: "O sol sorriu para nós naquela manhã."' },
    { deckId: deck3._id, front: 'Qual é a função do sistema circulatório?', back: 'Transportar sangue, nutrientes e oxigênio para todas as células do corpo, e recolher resíduos como gás carbônico.' },
    { deckId: deck3._id, front: 'Onde ocorrem as trocas gasosas no pulmão?', back: 'Nos alvéolos pulmonares. O oxigênio passa para o sangue e o gás carbônico é liberado para ser expirado (hematose).' },
    { deckId: deck3._id, front: 'Qual é a função do sistema nervoso?', back: 'Coordenar e controlar as atividades do corpo, receber e processar informações, e enviar respostas através de impulsos nervosos.' },
  ]);

  await DeckModel.findByIdAndUpdate(deck1._id, { cardCount: 5 });
  await DeckModel.findByIdAndUpdate(deck2._id, { cardCount: 4 });
  await DeckModel.findByIdAndUpdate(deck3._id, { cardCount: 3 });

  console.log(`Flashcards created: ${flashcards.length}`);

  console.log('\nSeed completed successfully!');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
