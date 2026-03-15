import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { Flashcard } from './flashcard.schema';
import { Deck } from '../deck/deck.schema';

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

// Cria um cartão com os valores padrão do SM-2 (novo cartão sem revisões)
const makeCard = (overrides: Partial<Record<string, any>> = {}) => ({
  _id: 'card-id-1',
  deckId: { toString: () => 'deck-id-1' },
  front: 'Frente',
  back: 'Verso',
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
  nextReviewDate: new Date(),
  lastReviewedAt: null,
  ...overrides,
});

// Fábrica de mock do modelo Flashcard — suporta new Model() + métodos estáticos
const buildFlashcardModel = () => {
  const mockSave = jest.fn();
  const FlashcardConstructor = jest.fn().mockImplementation((data: any) => ({
    ...data,
    save: mockSave,
  }));

  FlashcardConstructor.findById = jest.fn();
  FlashcardConstructor.find = jest.fn();
  FlashcardConstructor.findByIdAndUpdate = jest.fn();
  FlashcardConstructor.findByIdAndDelete = jest.fn();
  FlashcardConstructor.countDocuments = jest.fn();

  return { FlashcardConstructor, mockSave };
};

// Fábrica simples do modelo Deck
const buildDeckModel = () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
});

// ----------------------------------------------------------------
// Suite principal
// ----------------------------------------------------------------

describe('FlashcardService', () => {
  let service: FlashcardService;
  let FlashcardConstructor: any;
  let deckModel: ReturnType<typeof buildDeckModel>;

  beforeEach(async () => {
    const built = buildFlashcardModel();
    FlashcardConstructor = built.FlashcardConstructor;

    deckModel = buildDeckModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashcardService,
        { provide: getModelToken(Flashcard.name), useValue: FlashcardConstructor },
        { provide: getModelToken(Deck.name), useValue: deckModel },
      ],
    }).compile();

    service = module.get<FlashcardService>(FlashcardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // review — algoritmo SM-2
  // ----------------------------------------------------------------

  describe('review', () => {
    // Configura os mocks para que findById retorne o cartão e findByIdAndUpdate resolva
    const setupReview = (card: ReturnType<typeof makeCard>) => {
      FlashcardConstructor.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(card),
      });
      FlashcardConstructor.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      // recomputeDeckCardCount depende de countDocuments e deckModel.findByIdAndUpdate
      FlashcardConstructor.countDocuments
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(5) }) // cardCount
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(2) }); // dueCount
      deckModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    };

    it('rating 1 (Again): deve resetar repetitions para 0 e interval para 0', async () => {
      const card = makeCard({ repetitions: 3, interval: 10, easeFactor: 2.5 });
      setupReview(card);

      const result = await service.review('card-id-1', 1);

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(0);
    });

    it('rating 1 (Again): deve diminuir o easeFactor em 0.2 (mínimo 1.3)', async () => {
      const card = makeCard({ easeFactor: 2.5 });
      setupReview(card);

      const result = await service.review('card-id-1', 1);

      expect(result.easeFactor).toBeCloseTo(2.3);
    });

    it('rating 1 (Again): não deve deixar o easeFactor cair abaixo de 1.3', async () => {
      const card = makeCard({ easeFactor: 1.3 });
      setupReview(card);

      const result = await service.review('card-id-1', 1);

      expect(result.easeFactor).toBe(1.3);
    });

    it('rating 3 (Good) na primeira revisão: deve definir interval para 1', async () => {
      const card = makeCard({ repetitions: 0, interval: 0, easeFactor: 2.5 });
      setupReview(card);

      const result = await service.review('card-id-1', 3);

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it('rating 3 (Good) na segunda revisão (repetitions=1): deve definir interval para 6', async () => {
      const card = makeCard({ repetitions: 1, interval: 1, easeFactor: 2.5 });
      setupReview(card);

      const result = await service.review('card-id-1', 3);

      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    it('rating 3 (Good) após revisões seguintes: deve multiplicar interval pelo easeFactor', async () => {
      const card = makeCard({ repetitions: 2, interval: 6, easeFactor: 2.5 });
      setupReview(card);

      const result = await service.review('card-id-1', 3);

      expect(result.interval).toBe(Math.round(6 * 2.5)); // 15
    });

    it('rating 4 (Easy) na primeira revisão: deve definir interval para 4', async () => {
      const card = makeCard({ repetitions: 0, interval: 0, easeFactor: 2.5 });
      setupReview(card);

      const result = await service.review('card-id-1', 4);

      expect(result.interval).toBe(4);
      expect(result.repetitions).toBe(1);
    });

    it('rating 4 (Easy): deve aumentar o easeFactor em 0.15', async () => {
      const card = makeCard({ easeFactor: 2.5 });
      setupReview(card);

      const result = await service.review('card-id-1', 4);

      expect(result.easeFactor).toBeCloseTo(2.65);
    });

    it('rating 4 (Easy) após a primeira revisão: deve aplicar bônus de 1.3 no intervalo', async () => {
      const card = makeCard({ repetitions: 1, interval: 1, easeFactor: 2.5 });
      setupReview(card);

      const result = await service.review('card-id-1', 4);

      expect(result.interval).toBe(Math.round(6 * 1.3)); // 8
    });

    it('rating 2 (Hard) na primeira revisão: deve definir interval para 1', async () => {
      const card = makeCard({ repetitions: 0, interval: 0, easeFactor: 2.5 });
      setupReview(card);

      const result = await service.review('card-id-1', 2);

      expect(result.interval).toBe(1);
    });

    it('rating 2 (Hard): deve diminuir o easeFactor em 0.15', async () => {
      const card = makeCard({ easeFactor: 2.5 });
      setupReview(card);

      const result = await service.review('card-id-1', 2);

      expect(result.easeFactor).toBeCloseTo(2.35);
    });

    it('deve lançar NotFoundException se o cartão não existir', async () => {
      FlashcardConstructor.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.review('nonexistent-id', 3)).rejects.toThrow(NotFoundException);
    });

    it('deve persistir os campos atualizados via findByIdAndUpdate', async () => {
      const card = makeCard({ repetitions: 0, interval: 0, easeFactor: 2.5 });
      setupReview(card);

      await service.review('card-id-1', 3);

      expect(FlashcardConstructor.findByIdAndUpdate).toHaveBeenCalledWith(
        'card-id-1',
        expect.objectContaining({
          interval: expect.any(Number),
          easeFactor: expect.any(Number),
          repetitions: expect.any(Number),
          nextReviewDate: expect.any(Date),
          lastReviewedAt: expect.any(Date),
        }),
      );
    });
  });

  // ----------------------------------------------------------------
  // findDueByDeck
  // ----------------------------------------------------------------

  describe('findDueByDeck', () => {
    it('deve lançar NotFoundException se o deck não existir', async () => {
      deckModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findDueByDeck('nonexistent-deck')).rejects.toThrow(NotFoundException);
    });

    it('deve retornar apenas cartões com nextReviewDate <= agora', async () => {
      deckModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ _id: 'deck-id-1', name: 'Deck 1' }),
      });

      const now = new Date();
      const dueCard = makeCard({ nextReviewDate: new Date(now.getTime() - 1000) }); // passado
      const futureCard = makeCard({ nextReviewDate: new Date(now.getTime() + 86400000) }); // futuro

      // O serviço usa { deckId, nextReviewDate: { $lte: now } } no find —
      // a lógica real está no Mongoose. No mock, simulamos que o DB já filtrou corretamente.
      FlashcardConstructor.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([dueCard]),
      });

      const result = await service.findDueByDeck('deck-id-1');

      // Verificamos que o find foi chamado com o filtro correto
      expect(FlashcardConstructor.find).toHaveBeenCalledWith(
        expect.objectContaining({ nextReviewDate: expect.objectContaining({ $lte: expect.any(Date) }) }),
      );
      expect(result).toHaveLength(1);
      // O cartão futuro não deve estar no resultado (não foi incluído no mock)
      expect(result).not.toContain(futureCard);
    });

    it('deve retornar array vazio quando nenhum cartão está pendente', async () => {
      deckModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ _id: 'deck-id-1', name: 'Deck 1' }),
      });

      FlashcardConstructor.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findDueByDeck('deck-id-1');

      expect(result).toHaveLength(0);
    });
  });

  // ----------------------------------------------------------------
  // predictIntervals — método síncrono puro
  // ----------------------------------------------------------------

  describe('predictIntervals', () => {
    it('rating 1 (Again): deve sempre retornar interval 0', () => {
      const result = service.predictIntervals({ interval: 10, easeFactor: 2.5, repetitions: 5 });
      expect(result.again).toBe(0);
    });

    it('rating 3 (Good) na primeira revisão (repetitions=0): deve retornar 1', () => {
      const result = service.predictIntervals({ interval: 0, easeFactor: 2.5, repetitions: 0 });
      expect(result.good).toBe(1);
    });

    it('rating 3 (Good) na segunda revisão (repetitions=1): deve retornar 6', () => {
      const result = service.predictIntervals({ interval: 1, easeFactor: 2.5, repetitions: 1 });
      expect(result.good).toBe(6);
    });

    it('rating 4 (Easy) na primeira revisão (repetitions=0): deve retornar 4', () => {
      const result = service.predictIntervals({ interval: 0, easeFactor: 2.5, repetitions: 0 });
      expect(result.easy).toBe(4);
    });

    it('rating 4 (Easy) na segunda revisão (repetitions=1): deve retornar round(6 * 1.3) = 8', () => {
      const result = service.predictIntervals({ interval: 1, easeFactor: 2.5, repetitions: 1 });
      expect(result.easy).toBe(Math.round(6 * 1.3));
    });

    it('rating 2 (Hard) na primeira revisão (repetitions=0): deve retornar 1', () => {
      const result = service.predictIntervals({ interval: 0, easeFactor: 2.5, repetitions: 0 });
      expect(result.hard).toBe(1);
    });

    it('rating 2 (Hard) após repetições: deve retornar round(interval * 1.2) com mínimo 1', () => {
      const result = service.predictIntervals({ interval: 10, easeFactor: 2.5, repetitions: 3 });
      expect(result.hard).toBe(Math.max(1, Math.round(10 * 1.2)));
    });

    it('deve retornar todos os 4 ratings no objeto de resultado', () => {
      const result = service.predictIntervals({ interval: 6, easeFactor: 2.5, repetitions: 2 });
      expect(result).toHaveProperty('again');
      expect(result).toHaveProperty('hard');
      expect(result).toHaveProperty('good');
      expect(result).toHaveProperty('easy');
    });

    it('rating 3 (Good) com repetitions >= 2: deve usar interval * easeFactor', () => {
      const result = service.predictIntervals({ interval: 6, easeFactor: 2.5, repetitions: 2 });
      expect(result.good).toBe(Math.round(6 * 2.5));
    });

    it('rating 4 (Easy) com repetitions >= 2: deve usar interval * easeFactor * 1.3', () => {
      const result = service.predictIntervals({ interval: 6, easeFactor: 2.5, repetitions: 2 });
      expect(result.easy).toBe(Math.round(6 * 2.5 * 1.3));
    });
  });
});
