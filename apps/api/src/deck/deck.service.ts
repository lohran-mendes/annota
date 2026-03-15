import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { DeckStats } from '@annota/shared';
import { Deck, DeckDocument } from './deck.schema';
import { Flashcard, FlashcardDocument } from '../flashcard/flashcard.schema';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

@Injectable()
export class DeckService {
  constructor(
    @InjectModel(Deck.name) private deckModel: Model<DeckDocument>,
    @InjectModel(Flashcard.name)
    private flashcardModel: Model<FlashcardDocument>,
  ) {}

  async findAll(): Promise<Deck[]> {
    const decks = await this.deckModel
      .find()
      .sort({ createdAt: -1 })
      .exec();

    const now = new Date();

    const decksWithDueCount = await Promise.all(
      decks.map(async (deck) => {
        const dueCount = await this.flashcardModel
          .countDocuments({
            deckId: deck._id,
            nextReviewDate: { $lte: now },
          })
          .exec();
        const json = deck.toJSON();
        return { ...json, dueCount };
      }),
    );

    return decksWithDueCount as unknown as Deck[];
  }

  async findOne(id: string): Promise<Deck> {
    const deck = await this.deckModel.findById(id).exec();
    if (!deck) {
      throw new NotFoundException(`Deck with id ${id} not found`);
    }

    const now = new Date();
    const dueCount = await this.flashcardModel
      .countDocuments({ deckId: id, nextReviewDate: { $lte: now } })
      .exec();

    const json = deck.toJSON();
    return { ...json, dueCount } as unknown as Deck;
  }

  async create(dto: CreateDeckDto): Promise<Deck> {
    const deck = new this.deckModel({
      name: dto.name,
      description: dto.description ?? '',
    });
    return deck.save();
  }

  async update(id: string, dto: UpdateDeckDto): Promise<Deck> {
    const deck = await this.deckModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!deck) {
      throw new NotFoundException(`Deck with id ${id} not found`);
    }
    return deck;
  }

  async remove(id: string): Promise<void> {
    const result = await this.deckModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Deck with id ${id} not found`);
    }
    await this.flashcardModel.deleteMany({ deckId: id }).exec();
  }

  async getStats(id: string): Promise<DeckStats> {
    const deck = await this.deckModel.findById(id).lean().exec();
    if (!deck) {
      throw new NotFoundException(`Deck with id ${id} not found`);
    }

    const now = new Date();

    const [totalCards, dueCards, newCards, learningCards, reviewCards] =
      await Promise.all([
        this.flashcardModel.countDocuments({ deckId: id }).exec(),
        this.flashcardModel
          .countDocuments({ deckId: id, nextReviewDate: { $lte: now } })
          .exec(),
        this.flashcardModel
          .countDocuments({
            deckId: id,
            repetitions: 0,
            nextReviewDate: { $lte: now },
          })
          .exec(),
        this.flashcardModel
          .countDocuments({
            deckId: id,
            repetitions: { $gt: 0, $lt: 2 },
            nextReviewDate: { $lte: now },
          })
          .exec(),
        this.flashcardModel
          .countDocuments({
            deckId: id,
            repetitions: { $gte: 2 },
            nextReviewDate: { $lte: now },
          })
          .exec(),
      ]);

    return {
      deckId: id,
      totalCards,
      dueCards,
      newCards,
      learningCards,
      reviewCards,
    };
  }

  async recomputeCardCount(deckId: string): Promise<void> {
    const cardCount = await this.flashcardModel
      .countDocuments({ deckId })
      .exec();
    await this.deckModel
      .findByIdAndUpdate(deckId, { cardCount })
      .exec();
  }
}
