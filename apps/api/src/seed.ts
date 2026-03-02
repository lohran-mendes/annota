import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const ExamSchema = new mongoose.Schema({
  name: String,
  description: String,
  year: Number,
  institution: String,
  questionCount: { type: Number, default: 0 },
  subjectCount: { type: Number, default: 0 },
  duration: { type: Number, default: 180 },
});

const SubjectSchema = new mongoose.Schema({
  examId: mongoose.Schema.Types.ObjectId,
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

const Exam = mongoose.model('Exam', ExamSchema);
const Subject = mongoose.model('Subject', SubjectSchema);
const Topic = mongoose.model('Topic', TopicSchema);
const Question = mongoose.model('Question', QuestionSchema);

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
    questionCount: 8,
    subjectCount: 5,
    duration: 180,
  });

  const exam2 = await Exam.create({
    name: 'ENEM 2026',
    description:
      'Exame Nacional do Ensino Médio. Avalia o desempenho dos estudantes ao final da educação básica, servindo como porta de entrada para universidades públicas e programas do governo.',
    year: 2026,
    institution: 'INEP/MEC',
    questionCount: 0,
    subjectCount: 0,
    duration: 330,
  });

  console.log(`Exams created: ${exam1.name}, ${exam2.name}`);

  // === SUBJECTS (Exam 1) ===
  const subjects = await Subject.insertMany([
    {
      examId: exam1._id,
      name: 'Matemática',
      icon: 'calculate',
      questionCount: 4,
      completedCount: 0,
      color: '#E91E63',
    },
    {
      examId: exam1._id,
      name: 'Português',
      icon: 'menu_book',
      questionCount: 1,
      completedCount: 0,
      color: '#9C27B0',
    },
    {
      examId: exam1._id,
      name: 'Ciências',
      icon: 'science',
      questionCount: 1,
      completedCount: 0,
      color: '#00BCD4',
    },
    {
      examId: exam1._id,
      name: 'História',
      icon: 'history_edu',
      questionCount: 1,
      completedCount: 0,
      color: '#FF7043',
    },
    {
      examId: exam1._id,
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
  console.log('\nSeed completed successfully!');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
