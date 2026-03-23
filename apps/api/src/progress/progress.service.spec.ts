import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UserAnswer } from '../answer/answer.schema';
import { Subject } from '../subject/subject.schema';
import { Topic } from '../topic/topic.schema';
import { Exam } from '../exam/exam.schema';
import { Question } from '../question/question.schema';

// Fábrica de mock do modelo Mongoose.
// Retorna um objeto com todos os métodos de consulta usados no ProgressService.
const buildModel = () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  aggregate: jest.fn(),
  distinct: jest.fn(),
});

describe('ProgressService', () => {
  let service: ProgressService;
  let userAnswerModel: ReturnType<typeof buildModel>;
  let subjectModel: ReturnType<typeof buildModel>;
  let topicModel: ReturnType<typeof buildModel>;
  let examModel: ReturnType<typeof buildModel>;
  let questionModel: ReturnType<typeof buildModel>;

  beforeEach(async () => {
    userAnswerModel = buildModel();
    subjectModel = buildModel();
    topicModel = buildModel();
    examModel = buildModel();
    questionModel = buildModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: getModelToken(UserAnswer.name), useValue: userAnswerModel },
        { provide: getModelToken(Subject.name), useValue: subjectModel },
        { provide: getModelToken(Topic.name), useValue: topicModel },
        { provide: getModelToken(Exam.name), useValue: examModel },
        { provide: getModelToken(Question.name), useValue: questionModel },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // getGlobalProgress
  // ----------------------------------------------------------------

  describe('getGlobalProgress', () => {
    const userId = 'user-id-1';

    // Configura os mocks do userAnswerModel para o cenário de "sem respostas"
    const setupEmptyAnswers = () => {
      userAnswerModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(0) }) // totalAnswered
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(0) }); // totalCorrect

      userAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      userAnswerModel.aggregate.mockResolvedValue([]);
      subjectModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    };

    it('deve retornar zeros quando não há respostas', async () => {
      setupEmptyAnswers();

      const result = await service.getGlobalProgress(userId);

      expect(result.totalAnswered).toBe(0);
      expect(result.totalCorrect).toBe(0);
      expect(result.streak).toBe(0);
      expect(result.bySubject).toEqual([]);
    });

    it('deve calcular os totais corretamente a partir das respostas', async () => {
      userAnswerModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(10) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(7) });

      userAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { correct: true },
          { correct: true },
          { correct: false },
        ]),
      });

      userAnswerModel.aggregate.mockResolvedValue([]);
      subjectModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      const result = await service.getGlobalProgress(userId);

      expect(result.totalAnswered).toBe(10);
      expect(result.totalCorrect).toBe(7);
      // streak para no false: 2 corretas antes do false
      expect(result.streak).toBe(2);
    });

    it('deve agrupar o progresso por matéria corretamente', async () => {
      userAnswerModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(5) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(3) });

      userAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const subjectId = { toString: () => 'sub-1' };

      // Agregação retorna uma matéria com 5 respondidas e 3 corretas
      userAnswerModel.aggregate.mockResolvedValue([
        { _id: subjectId, answered: 5, correct: 3 },
      ]);

      subjectModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { _id: subjectId, name: 'Matemática', color: '#ff0000' },
        ]),
      });

      const result = await service.getGlobalProgress(userId);

      expect(result.bySubject).toHaveLength(1);
      expect(result.bySubject[0].subjectId).toBe('sub-1');
      expect(result.bySubject[0].subjectName).toBe('Matemática');
      expect(result.bySubject[0].answered).toBe(5);
      expect(result.bySubject[0].correct).toBe(3);
      expect(result.bySubject[0].color).toBe('#ff0000');
    });

    it('deve usar "Desconhecida" e cor padrão quando a matéria não está no mapa', async () => {
      userAnswerModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(1) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(0) });

      userAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const unknownId = { toString: () => 'unknown-sub-id' };
      userAnswerModel.aggregate.mockResolvedValue([
        { _id: unknownId, answered: 1, correct: 0 },
      ]);

      // Nenhuma matéria retornada — subjectMap fica vazio
      subjectModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      const result = await service.getGlobalProgress(userId);

      expect(result.bySubject[0].subjectName).toBe('Desconhecida');
      expect(result.bySubject[0].color).toBe('#999');
    });
  });

  // ----------------------------------------------------------------
  // getExamProgress
  // ----------------------------------------------------------------

  describe('getExamProgress', () => {
    const userId = 'user-id-1';
    const examId = 'exam-id-1';

    // Monta o cenário básico de um exam válido com todas as consultas derivadas
    const setupExamProgress = (examDoc: any, answers: any[] = []) => {
      examModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(examDoc) });

      userAnswerModel.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(answers.length) })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(answers.filter((a) => a.correct).length),
        });

      userAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(answers),
      });

      questionModel.distinct.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      subjectModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      userAnswerModel.aggregate.mockResolvedValue([]);
      topicModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    };

    it('deve lançar NotFoundException se o exam não existir', async () => {
      examModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.getExamProgress(userId, 'nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.getExamProgress(userId, 'nonexistent-id')).rejects.toThrow(
        'Exam with id nonexistent-id not found',
      );
    });

    it('deve retornar zeros quando o exam não tem respostas', async () => {
      const examDoc = { _id: examId, questionIds: [] };
      setupExamProgress(examDoc, []);

      const result = await service.getExamProgress(userId, examId);

      expect(result.examId).toBe(examId);
      expect(result.totalAnswered).toBe(0);
      expect(result.totalCorrect).toBe(0);
      expect(result.streak).toBe(0);
    });

    it('deve filtrar contagens pelo examId', async () => {
      const examDoc = { _id: examId, questionIds: ['q1', 'q2'] };

      examModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(examDoc) });

      // Esperamos que countDocuments seja chamado com o filtro { examId }
      const countDocSpy = jest
        .fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(3) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(2) });
      userAnswerModel.countDocuments = countDocSpy;

      userAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([{ correct: true }, { correct: true }]),
      });
      questionModel.distinct.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      subjectModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      userAnswerModel.aggregate.mockResolvedValue([]);
      topicModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      const result = await service.getExamProgress(userId, examId);

      // Verifica que o filtro com userId e examId foi passado para countDocuments
      expect(countDocSpy).toHaveBeenCalledWith({ userId, examId });
      expect(countDocSpy).toHaveBeenCalledWith({ userId, examId, correct: true });
      expect(result.totalAnswered).toBe(3);
      expect(result.totalCorrect).toBe(2);
    });

    it('deve calcular o streak apenas com respostas do exam', async () => {
      const examDoc = { _id: examId, questionIds: [] };
      const answers = [
        { correct: true },
        { correct: true },
        { correct: false },
        { correct: true },
      ];
      setupExamProgress(examDoc, answers);

      const result = await service.getExamProgress(userId, examId);

      // streak para em false: 2 corretas
      expect(result.streak).toBe(2);
    });

    it('deve retornar bySubject e byTopic nos campos corretos', async () => {
      const examDoc = { _id: examId, questionIds: [] };
      setupExamProgress(examDoc);

      const result = await service.getExamProgress(userId, examId);

      expect(result).toHaveProperty('bySubject');
      expect(result).toHaveProperty('byTopic');
      expect(Array.isArray(result.bySubject)).toBe(true);
      expect(Array.isArray(result.byTopic)).toBe(true);
    });
  });
});
