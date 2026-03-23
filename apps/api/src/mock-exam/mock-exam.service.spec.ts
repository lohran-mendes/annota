import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { MockExamService } from './mock-exam.service';
import { MockExam } from './mock-exam.schema';
import { MockExamSession } from './mock-exam-session.schema';
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

const makeMockExamDoc = (overrides: Partial<Record<string, any>> = {}) => {
  const questions = [makeQuestion(), makeQuestion()];
  return {
    _id: { toString: () => makeId() },
    examId: { toString: () => 'exam-id-1' },
    name: 'Simulado Completo',
    description: '',
    duration: 60,
    questionIds: questions.map((q) => q._id),
    published: true,
    ...overrides,
  };
};

// Fábrica do modelo MockExam (template)
const buildMockExamModel = () => {
  const MockExamConstructor = jest.fn().mockImplementation((data: any) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ _id: { toString: () => makeId() } }),
  }));
  MockExamConstructor.findById = jest.fn();
  MockExamConstructor.find = jest.fn();
  MockExamConstructor.findByIdAndUpdate = jest.fn();
  MockExamConstructor.findByIdAndDelete = jest.fn();
  MockExamConstructor.countDocuments = jest.fn();
  return MockExamConstructor;
};

// Fábrica do modelo MockExamSession
const buildSessionModel = () => {
  const defaultToJSON = jest.fn().mockReturnValue({
    id: makeId(),
    mockExamId: 'mock-exam-id',
    mockExamName: 'Simulado',
    questionCount: 2,
    duration: 60,
    status: 'in_progress',
  });
  const sessionSave = jest.fn();
  const SessionConstructor = jest.fn().mockImplementation((data: any) => {
    const instance: any = {
      ...data,
      toJSON: defaultToJSON,
    };
    instance.save = sessionSave.mockResolvedValue(instance);
    return instance;
  });
  SessionConstructor.findById = jest.fn();
  SessionConstructor.findOne = jest.fn();
  SessionConstructor.find = jest.fn();
  SessionConstructor.findByIdAndUpdate = jest.fn();
  return { SessionConstructor, sessionSave };
};

// Fábrica do modelo MockExamResult
const buildResultModel = () => {
  const mockSave = jest.fn();
  const ResultConstructor = jest.fn().mockImplementation((data: any) => ({
    ...data,
    save: mockSave,
    toJSON: jest.fn().mockReturnThis(),
  }));
  ResultConstructor.findOne = jest.fn();
  return { ResultConstructor, mockSave };
};

// ----------------------------------------------------------------
// Suite principal
// ----------------------------------------------------------------

describe('MockExamService', () => {
  const userId = 'user-id-1';

  let service: MockExamService;
  let MockExamConstructor: any;
  let SessionConstructor: any;
  let sessionSave: jest.Mock;
  let ResultConstructor: any;
  let resultSave: jest.Mock;
  let questionModel: { find: jest.Mock; countDocuments: jest.Mock };
  let subjectModel: { find: jest.Mock };
  let examModel: { findById: jest.Mock };

  beforeEach(async () => {
    MockExamConstructor = buildMockExamModel();
    const builtSession = buildSessionModel();
    SessionConstructor = builtSession.SessionConstructor;
    sessionSave = builtSession.sessionSave;

    const builtResult = buildResultModel();
    ResultConstructor = builtResult.ResultConstructor;
    resultSave = builtResult.mockSave;

    questionModel = { find: jest.fn(), countDocuments: jest.fn() };
    subjectModel = { find: jest.fn() };
    examModel = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockExamService,
        {
          provide: getModelToken(MockExam.name),
          useValue: MockExamConstructor,
        },
        {
          provide: getModelToken(MockExamSession.name),
          useValue: SessionConstructor,
        },
        {
          provide: getModelToken(MockExamResult.name),
          useValue: ResultConstructor,
        },
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
  // Admin CRUD — create
  // ----------------------------------------------------------------

  describe('create', () => {
    const dto = {
      examId: 'exam-id-1',
      name: 'Simulado 1',
      duration: 60,
      questionIds: [makeId(), makeId()],
      published: true,
    };

    it('deve lançar NotFoundException se o exam não existir', async () => {
      examModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se algum questionId for inválido', async () => {
      examModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'exam-id-1' }),
      });
      questionModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1), // menos que dto.questionIds.length
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('deve criar o template e retornar o mock exam', async () => {
      const savedId = makeId();
      examModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'exam-id-1' }),
      });
      questionModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(dto.questionIds.length),
      });

      // save retorna o doc com _id
      const saveMock = jest.fn().mockResolvedValue({ _id: { toString: () => savedId } });
      MockExamConstructor.mockImplementationOnce((data: any) => ({
        ...data,
        save: saveMock,
      }));

      // findOne precisa de findById
      MockExamConstructor.findById.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue({
            _id: { toString: () => savedId },
            examId: { toString: () => dto.examId },
            name: dto.name,
            description: '',
            duration: dto.duration,
            questionIds: dto.questionIds.map((id) => ({ toString: () => id })),
            published: true,
          }),
        }),
      });

      const result = await service.create(dto);

      expect(result.name).toBe(dto.name);
      expect(result.questionCount).toBe(dto.questionIds.length);
    });
  });

  // ----------------------------------------------------------------
  // Admin CRUD — remove
  // ----------------------------------------------------------------

  describe('remove', () => {
    it('deve lançar NotFoundException se o mock exam não existir', async () => {
      MockExamConstructor.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve deletar o mock exam', async () => {
      MockExamConstructor.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'some-id' }),
      });

      await expect(service.remove('some-id')).resolves.toBeUndefined();
    });
  });

  // ----------------------------------------------------------------
  // Student sessions — startSession
  // ----------------------------------------------------------------

  describe('startSession', () => {
    it('deve lançar NotFoundException se o mock exam não existir', async () => {
      MockExamConstructor.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.startSession(userId, { mockExamId: 'nonexistent-id' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se o mock exam não estiver publicado', async () => {
      const mockExamDoc = makeMockExamDoc({ published: false });
      MockExamConstructor.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExamDoc),
      });

      await expect(
        service.startSession(userId, { mockExamId: 'some-id' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve criar a session e retornar questões sem gabarito', async () => {
      const questions = [makeQuestion(), makeQuestion()];
      const mockExamDoc = makeMockExamDoc({
        questionIds: questions.map((q) => q._id),
        published: true,
      });

      MockExamConstructor.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExamDoc),
      });

      questionModel.find.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue(questions) }),
      });

      const result = await service.startSession(userId, {
        mockExamId: mockExamDoc._id.toString(),
      });

      expect(result.questions).toHaveLength(2);
      for (const q of result.questions) {
        expect(q).not.toHaveProperty('correctAnswerIndex');
        expect(q).not.toHaveProperty('explanation');
      }
      expect(SessionConstructor).toHaveBeenCalledTimes(1);
      expect(sessionSave).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------------------
  // Student sessions — submitSession
  // ----------------------------------------------------------------

  describe('submitSession', () => {
    const sessionId = 'session-id-1';

    const buildScenario = (answers: Array<{ correct: boolean }>) => {
      const questions = answers.map((a) => {
        const correctIndex = 1;
        const selectedIndex = a.correct ? correctIndex : 0;
        const q = makeQuestion({ correctAnswerIndex: correctIndex });
        return { question: q, answer: { questionId: q._id.toString(), selectedIndex } };
      });

      const sessionDoc = {
        _id: sessionId,
        questionIds: questions.map((q) => q.question._id),
        questionCount: questions.length,
      };

      const dto: SubmitMockExamDto = {
        answers: questions.map((q) => q.answer),
        timeSpent: 1800,
      };

      return { questions: questions.map((q) => q.question), sessionDoc, dto };
    };

    it('deve lançar NotFoundException se a session não existir', async () => {
      SessionConstructor.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.submitSession(userId, 'nonexistent-id', { answers: [], timeSpent: 0 } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve calcular o score corretamente', async () => {
      const { sessionDoc, questions, dto } = buildScenario([
        { correct: true },
        { correct: true },
        { correct: false },
        { correct: false },
      ]);

      SessionConstructor.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(sessionDoc),
      });
      questionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(questions),
      });
      subjectModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });
      SessionConstructor.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      resultSave.mockResolvedValue({});

      const result = await service.submitSession(userId, sessionId, dto);

      expect(result.correctCount).toBe(2);
      expect(result.score).toBe(50);
    });

    it('deve agrupar resultados por matéria', async () => {
      const q1 = makeQuestion({
        correctAnswerIndex: 1,
        subjectId: { toString: () => 'sub-1' },
      });
      const q2 = makeQuestion({
        correctAnswerIndex: 1,
        subjectId: { toString: () => 'sub-2' },
      });
      const sessionDoc = {
        _id: sessionId,
        questionIds: [q1._id, q2._id],
        questionCount: 2,
      };
      const dto: SubmitMockExamDto = {
        answers: [
          { questionId: q1._id.toString(), selectedIndex: 1 },
          { questionId: q2._id.toString(), selectedIndex: 0 },
        ],
        timeSpent: 600,
      };

      SessionConstructor.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(sessionDoc),
      });
      questionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([q1, q2]),
      });
      subjectModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });
      SessionConstructor.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      resultSave.mockResolvedValue({});

      const result = await service.submitSession(userId, sessionId, dto);

      expect(result.bySubject).toHaveLength(2);
      const sub1 = result.bySubject.find((s) => s.subjectId === 'sub-1');
      const sub2 = result.bySubject.find((s) => s.subjectId === 'sub-2');
      expect(sub1?.correct).toBe(1);
      expect(sub2?.correct).toBe(0);
    });

    it('deve atualizar o status da session para completed', async () => {
      const { sessionDoc, questions, dto } = buildScenario([{ correct: true }]);

      SessionConstructor.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(sessionDoc),
      });
      questionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(questions),
      });
      subjectModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });
      SessionConstructor.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      resultSave.mockResolvedValue({});

      await service.submitSession(userId, sessionId, dto);

      expect(SessionConstructor.findByIdAndUpdate).toHaveBeenCalledWith(
        sessionId,
        expect.objectContaining({ status: 'completed' }),
      );
    });

    it('deve salvar o resultado detalhado no banco', async () => {
      const { sessionDoc, questions, dto } = buildScenario([{ correct: true }]);

      SessionConstructor.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(sessionDoc),
      });
      questionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(questions),
      });
      subjectModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });
      SessionConstructor.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      resultSave.mockResolvedValue({});

      await service.submitSession(userId, sessionId, dto);

      expect(ResultConstructor).toHaveBeenCalledTimes(1);
      expect(resultSave).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------------------
  // Student sessions — getSessionResult
  // ----------------------------------------------------------------

  describe('getSessionResult', () => {
    it('deve retornar o resultado salvo', async () => {
      const savedResult = {
        sessionId: 'session-id-1',
        score: 75,
        totalQuestions: 4,
        correctCount: 3,
        timeSpent: 1200,
        bySubject: [],
        details: [],
        toJSON: jest.fn().mockReturnThis(),
      };

      ResultConstructor.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(savedResult),
      });

      const result = await service.getSessionResult(userId, 'session-id-1');

      expect(result).toBeDefined();
      expect(ResultConstructor.findOne).toHaveBeenCalledWith({
        sessionId: 'session-id-1',
        userId,
      });
    });

    it('deve lançar NotFoundException se o resultado não existir', async () => {
      ResultConstructor.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getSessionResult(userId, 'nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
