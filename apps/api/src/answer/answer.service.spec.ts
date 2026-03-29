import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { AnswerService } from './answer.service';
import { UserAnswer } from './answer.schema';
import { QuestionService } from '../question/question.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

// Helpers para construir objetos de teste reutilizáveis
const makeObjectId = () => new Types.ObjectId().toString();

const makeQuestion = (overrides: Partial<Record<string, any>> = {}) => ({
  _id: makeObjectId(),
  topicId: { toString: () => 'topic-id-1' },
  subjectId: { toString: () => 'subject-id-1' },
  correctAnswerIndex: 2,
  explanation: 'Explicação da questão.',
  ...overrides,
});

// Fábrica de mock para o modelo UserAnswer.
// O modelo precisa suportar tanto chamadas de instância (new Model()) quanto
// métodos estáticos (.findOne(), .find()).
const buildUserAnswerModel = () => {
  const mockSave = jest.fn();

  const MockUserAnswerModel = jest.fn().mockImplementation((data: any) => ({
    ...data,
    save: mockSave,
  }));

  // Métodos estáticos adicionados ao construtor
  MockUserAnswerModel.findOne = jest.fn();
  MockUserAnswerModel.find = jest.fn();

  return { MockUserAnswerModel, mockSave };
};

describe('AnswerService', () => {
  const userId = 'user-id-1';
  let service: AnswerService;
  let MockUserAnswerModel: any;
  let mockSave: jest.Mock;
  let questionService: jest.Mocked<QuestionService>;

  beforeEach(async () => {
    const built = buildUserAnswerModel();
    MockUserAnswerModel = built.MockUserAnswerModel;
    mockSave = built.mockSave;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerService,
        {
          provide: getModelToken(UserAnswer.name),
          useValue: MockUserAnswerModel,
        },
        {
          provide: QuestionService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnswerService>(AnswerService);
    questionService = module.get(QuestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // submitAnswer
  // ----------------------------------------------------------------

  describe('submitAnswer', () => {
    const dto: SubmitAnswerDto = {
      questionId: 'question-id-1',
      selectedIndex: 2,
      examId: undefined as any,
    };

    it('deve retornar correct=true quando selectedIndex corresponde ao correctAnswerIndex', async () => {
      const question = makeQuestion({ correctAnswerIndex: 2 });
      questionService.findOne.mockResolvedValue(question as any);
      MockUserAnswerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockSave.mockResolvedValue({});
      MockUserAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.submitAnswer(userId, { ...dto, selectedIndex: 2 });

      expect(result.correct).toBe(true);
      expect(result.correctAnswerIndex).toBe(2);
      expect(result.explanation).toBe('Explicação da questão.');
    });

    it('deve retornar correct=false quando selectedIndex não corresponde', async () => {
      const question = makeQuestion({ correctAnswerIndex: 2 });
      questionService.findOne.mockResolvedValue(question as any);
      MockUserAnswerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockSave.mockResolvedValue({});
      MockUserAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.submitAnswer(userId, { ...dto, selectedIndex: 0 });

      expect(result.correct).toBe(false);
    });

    it('deve lançar NotFoundException se a questão não existir', async () => {
      questionService.findOne.mockRejectedValue(
        new NotFoundException('Question with id question-id-1 not found'),
      );

      await expect(service.submitAnswer(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('deve incluir o streak calculado no resultado', async () => {
      const question = makeQuestion({ correctAnswerIndex: 2 });
      questionService.findOne.mockResolvedValue(question as any);
      MockUserAnswerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockSave.mockResolvedValue({});
      // Simula 3 respostas corretas recentes
      MockUserAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { correct: true },
          { correct: true },
          { correct: true },
        ]),
      });

      const result = await service.submitAnswer(userId, { ...dto, selectedIndex: 2 });

      expect(result.streak).toBe(3);
    });
  });

  // ----------------------------------------------------------------
  // getStreak
  // ----------------------------------------------------------------

  describe('getStreak', () => {
    it('deve retornar 0 quando não há respostas', async () => {
      MockUserAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const streak = await service.getStreak(userId);

      expect(streak).toBe(0);
    });

    it('deve contar respostas corretas consecutivas', async () => {
      MockUserAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { correct: true },
          { correct: true },
          { correct: true },
        ]),
      });

      const streak = await service.getStreak(userId);

      expect(streak).toBe(3);
    });

    it('deve parar de contar na primeira resposta incorreta', async () => {
      MockUserAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { correct: true },
          { correct: true },
          { correct: false }, // interrompe o streak aqui
          { correct: true },
          { correct: true },
        ]),
      });

      const streak = await service.getStreak(userId);

      expect(streak).toBe(2);
    });

    it('deve retornar 0 quando a primeira resposta é incorreta', async () => {
      MockUserAnswerModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { correct: false },
          { correct: true },
        ]),
      });

      const streak = await service.getStreak(userId);

      expect(streak).toBe(0);
    });
  });
});
