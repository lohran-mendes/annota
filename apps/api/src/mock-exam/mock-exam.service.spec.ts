import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { MockExamService } from './mock-exam.service';
import { MockExam } from './mock-exam.schema';
import { MockExamResult } from './mock-exam-result.schema';
import { Question } from '../question/question.schema';
import { Subject } from '../subject/subject.schema';
import { Exam } from '../exam/exam.schema';
import { SubmitMockExamDto } from './dto/submit-mock-exam.dto';

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

const makeId = () => new Types.ObjectId().toString();

const makeQuestion = (overrides: Partial<Record<string, any>> = {}) => {
  const id = makeId();
  return {
    _id: { toString: () => id },
    topicId: { toString: () => 'topic-1' },
    subjectId: { toString: () => 'subject-1' },
    statement: 'Enunciado da questão',
    alternatives: [
      { label: 'A', text: 'Alternativa A' },
      { label: 'B', text: 'Alternativa B' },
    ],
    correctAnswerIndex: 1,
    explanation: 'Explicação',
    ...overrides,
  };
};

// Fábrica do modelo MockExam — suporta new Model() + métodos estáticos
const buildMockExamModel = () => {
  const mockSave = jest.fn();
  const MockExamConstructor = jest.fn().mockImplementation((data: any) => ({
    ...data,
    save: mockSave,
    toJSON: jest.fn().mockReturnValue({ ...data, id: makeId() }),
  }));

  MockExamConstructor.findById = jest.fn();
  MockExamConstructor.find = jest.fn();
  MockExamConstructor.findByIdAndUpdate = jest.fn();

  return { MockExamConstructor, mockSave };
};

// Fábrica do modelo MockExamResult — suporta new Model() + métodos estáticos
const buildMockExamResultModel = () => {
  const mockSave = jest.fn();
  const MockExamResultConstructor = jest.fn().mockImplementation((data: any) => ({
    ...data,
    save: mockSave,
  }));

  MockExamResultConstructor.findOne = jest.fn();

  return { MockExamResultConstructor, mockSave: mockSave };
};

// ----------------------------------------------------------------
// Suite principal
// ----------------------------------------------------------------

describe('MockExamService', () => {
  let service: MockExamService;
  let MockExamConstructor: any;
  let mockExamSave: jest.Mock;
  let MockExamResultConstructor: any;
  let mockExamResultSave: jest.Mock;
  let questionModel: {
    find: jest.Mock;
    findById: jest.Mock;
  };
  let subjectModel: { find: jest.Mock };
  let examModel: { findById: jest.Mock };

  beforeEach(async () => {
    const builtExam = buildMockExamModel();
    MockExamConstructor = builtExam.MockExamConstructor;
    mockExamSave = builtExam.mockSave;

    const builtResult = buildMockExamResultModel();
    MockExamResultConstructor = builtResult.MockExamResultConstructor;
    mockExamResultSave = builtResult.mockSave;

    questionModel = { find: jest.fn(), findById: jest.fn() };
    subjectModel = { find: jest.fn() };
    examModel = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockExamService,
        { provide: getModelToken(MockExam.name), useValue: MockExamConstructor },
        { provide: getModelToken(MockExamResult.name), useValue: MockExamResultConstructor },
        { provide: getModelToken(Question.name), useValue: questionModel },
        { provide: getModelToken(Subject.name), useValue: subjectModel },
        { provide: getModelToken(Exam.name), useValue: examModel },
      ],
    }).compile();

    service = module.get<MockExamService>(MockExamService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // create
  // ----------------------------------------------------------------

  describe('create', () => {
    const dto = {
      examId: 'exam-id-1',
      name: 'Simulado 1',
      questionCount: 2,
      duration: 60,
    };

    it('deve lançar NotFoundException se o exam não existir', async () => {
      examModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      await expect(service.create(dto)).rejects.toThrow(
        `Exam with id ${dto.examId} not found`,
      );
    });

    it('deve criar um mock exam com as questões selecionadas aleatoriamente', async () => {
      const questions = [makeQuestion(), makeQuestion(), makeQuestion()];
      const examDoc = { _id: 'exam-id-1', questionIds: questions.map((q) => q._id) };

      examModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(examDoc) });
      questionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(questions) });
      mockExamSave.mockResolvedValue({ toJSON: jest.fn().mockReturnValue({ id: makeId() }) });

      const session = await service.create(dto);

      // Devem ser selecionadas no máximo questionCount questões
      expect(session.questions).toHaveLength(dto.questionCount);
      // O construtor do mock exam deve ter sido invocado
      expect(MockExamConstructor).toHaveBeenCalledTimes(1);
      expect(mockExamSave).toHaveBeenCalledTimes(1);
    });

    it('deve retornar questões sem o gabarito (sem correctAnswerIndex)', async () => {
      const questions = [makeQuestion(), makeQuestion()];
      const examDoc = { _id: 'exam-id-1', questionIds: questions.map((q) => q._id) };

      examModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(examDoc) });
      questionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(questions) });
      mockExamSave.mockResolvedValue({ toJSON: jest.fn().mockReturnValue({ id: makeId() }) });

      const session = await service.create({ ...dto, questionCount: 2 });

      for (const q of session.questions) {
        expect(q).not.toHaveProperty('correctAnswerIndex');
        expect(q).not.toHaveProperty('explanation');
      }
    });

    it('deve selecionar todas as questões quando questionCount excede o total disponível', async () => {
      const questions = [makeQuestion()];
      const examDoc = { _id: 'exam-id-1', questionIds: questions.map((q) => q._id) };

      examModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(examDoc) });
      questionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(questions) });
      mockExamSave.mockResolvedValue({ toJSON: jest.fn().mockReturnValue({ id: makeId() }) });

      // Pede 10 mas só existe 1
      const session = await service.create({ ...dto, questionCount: 10 });

      expect(session.questions).toHaveLength(1);
    });
  });

  // ----------------------------------------------------------------
  // submit
  // ----------------------------------------------------------------

  describe('submit', () => {
    const mockExamId = 'mock-exam-id-1';

    // Monta uma questão e a resposta correspondente, controlando se acerta ou não
    const buildScenario = (
      answers: Array<{ correct: boolean }>,
    ) => {
      const questions = answers.map((a) => {
        const correctIndex = 1;
        const selectedIndex = a.correct ? correctIndex : 0;
        const q = makeQuestion({ correctAnswerIndex: correctIndex });
        return { question: q, answer: { questionId: q._id.toString(), selectedIndex } };
      });

      const mockExamDoc = {
        _id: mockExamId,
        questionIds: questions.map((q) => q.question._id),
        questionCount: questions.length,
      };

      const dto: SubmitMockExamDto = {
        answers: questions.map((q) => q.answer),
        timeSpent: 1800,
      };

      return { questions: questions.map((q) => q.question), mockExamDoc, dto };
    };

    it('deve lançar NotFoundException se o mock exam não existir', async () => {
      MockExamConstructor.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.submit('nonexistent-id', { answers: [], timeSpent: 0 } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve calcular o score corretamente', async () => {
      // 2 corretas de 4 = 50%
      const { mockExamDoc, questions, dto } = buildScenario([
        { correct: true },
        { correct: true },
        { correct: false },
        { correct: false },
      ]);

      MockExamConstructor.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExamDoc),
      });
      questionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(questions) });
      subjectModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      MockExamConstructor.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockExamResultSave.mockResolvedValue({});

      const result = await service.submit(mockExamId, dto);

      expect(result.correctCount).toBe(2);
      expect(result.score).toBe(50);
    });

    it('deve agrupar os resultados por matéria corretamente', async () => {
      // Duas questões de matérias diferentes
      const q1 = makeQuestion({ correctAnswerIndex: 1, subjectId: { toString: () => 'sub-1' } });
      const q2 = makeQuestion({ correctAnswerIndex: 1, subjectId: { toString: () => 'sub-2' } });
      const mockExamDoc = { _id: mockExamId, questionIds: [q1._id, q2._id], questionCount: 2 };
      const dto: SubmitMockExamDto = {
        answers: [
          { questionId: q1._id.toString(), selectedIndex: 1 }, // correta
          { questionId: q2._id.toString(), selectedIndex: 0 }, // errada
        ],
        timeSpent: 600,
      };

      MockExamConstructor.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExamDoc),
      });
      questionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([q1, q2]) });
      subjectModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      MockExamConstructor.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockExamResultSave.mockResolvedValue({});

      const result = await service.submit(mockExamId, dto);

      expect(result.bySubject).toHaveLength(2);
      const sub1 = result.bySubject.find((s) => s.subjectId === 'sub-1');
      const sub2 = result.bySubject.find((s) => s.subjectId === 'sub-2');
      expect(sub1?.correct).toBe(1);
      expect(sub2?.correct).toBe(0);
    });

    it('deve atualizar o status do mock exam para completed', async () => {
      const { mockExamDoc, questions, dto } = buildScenario([{ correct: true }]);

      MockExamConstructor.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExamDoc),
      });
      questionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(questions) });
      subjectModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      MockExamConstructor.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockExamResultSave.mockResolvedValue({});

      await service.submit(mockExamId, dto);

      expect(MockExamConstructor.findByIdAndUpdate).toHaveBeenCalledWith(
        mockExamId,
        expect.objectContaining({ status: 'completed' }),
      );
    });

    it('deve salvar o resultado detalhado no banco', async () => {
      const { mockExamDoc, questions, dto } = buildScenario([{ correct: true }]);

      MockExamConstructor.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExamDoc),
      });
      questionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(questions) });
      subjectModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      MockExamConstructor.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockExamResultSave.mockResolvedValue({});

      await service.submit(mockExamId, dto);

      expect(MockExamResultConstructor).toHaveBeenCalledTimes(1);
      expect(mockExamResultSave).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------------------
  // getResult
  // ----------------------------------------------------------------

  describe('getResult', () => {
    it('deve retornar o resultado salvo', async () => {
      const savedResult = {
        mockExamId: 'mock-exam-id-1',
        score: 75,
        totalQuestions: 4,
        correctCount: 3,
        timeSpent: 1200,
        bySubject: [],
        details: [],
        toJSON: jest.fn().mockReturnThis(),
      };

      MockExamResultConstructor.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(savedResult),
      });

      const result = await service.getResult('mock-exam-id-1');

      expect(result).toBeDefined();
      expect(MockExamResultConstructor.findOne).toHaveBeenCalledWith({
        mockExamId: 'mock-exam-id-1',
      });
    });

    it('deve lançar NotFoundException se o resultado não existir', async () => {
      MockExamResultConstructor.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getResult('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.getResult('nonexistent-id')).rejects.toThrow(
        'Result for MockExam with id nonexistent-id not found',
      );
    });
  });
});
