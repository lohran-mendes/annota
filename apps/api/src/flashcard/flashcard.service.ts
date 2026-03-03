import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flashcard, FlashcardDocument } from './flashcard.schema';
import { Deck, DeckDocument } from '../deck/deck.schema';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import type { ReviewResult } from '@annota/shared';

@Injectable()
export class FlashcardService {
  constructor(
    @InjectModel(Flashcard.name)
    private flashcardModel: Model<FlashcardDocument>,
    @InjectModel(Deck.name)
    private deckModel: Model<DeckDocument>,
  ) {}

  async findByDeck(deckId: string): Promise<Flashcard[]> {
    const deck = await this.deckModel.findById(deckId).lean().exec();
    if (!deck) {
      throw new NotFoundException(`Deck with id ${deckId} not found`);
    }
    return this.flashcardModel
      .find({ deckId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findDueByDeck(deckId: string): Promise<Flashcard[]> {
    const deck = await this.deckModel.findById(deckId).lean().exec();
    if (!deck) {
      throw new NotFoundException(`Deck with id ${deckId} not found`);
    }
    const now = new Date();
    return this.flashcardModel
      .find({ deckId, nextReviewDate: { $lte: now } })
      .sort({ nextReviewDate: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Flashcard> {
    const flashcard = await this.flashcardModel.findById(id).exec();
    if (!flashcard) {
      throw new NotFoundException(`Flashcard with id ${id} not found`);
    }
    return flashcard;
  }

  async create(dto: CreateFlashcardDto): Promise<Flashcard> {
    const deck = await this.deckModel.findById(dto.deckId).lean().exec();
    if (!deck) {
      throw new NotFoundException(`Deck with id ${dto.deckId} not found`);
    }

    const flashcard = new this.flashcardModel({
      deckId: dto.deckId,
      front: dto.front,
      back: dto.back,
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: new Date(),
      lastReviewedAt: null,
    });
    const saved = await flashcard.save();

    await this.recomputeDeckCardCount(dto.deckId);

    return saved;
  }

  async update(id: string, dto: UpdateFlashcardDto): Promise<Flashcard> {
    const flashcard = await this.flashcardModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!flashcard) {
      throw new NotFoundException(`Flashcard with id ${id} not found`);
    }
    return flashcard;
  }

  async remove(id: string): Promise<void> {
    const flashcard = await this.flashcardModel.findById(id).exec();
    if (!flashcard) {
      throw new NotFoundException(`Flashcard with id ${id} not found`);
    }
    const deckId = flashcard.deckId.toString();
    await this.flashcardModel.findByIdAndDelete(id).exec();
    await this.recomputeDeckCardCount(deckId);
  }

  async review(id: string, rating: 1 | 2 | 3 | 4): Promise<ReviewResult> {
    const card = await this.flashcardModel.findById(id).exec();
    if (!card) {
      throw new NotFoundException(`Flashcard with id ${id} not found`);
    }

    const now = new Date();
    let { interval, easeFactor, repetitions } = card;

    switch (rating) {
      case 1: // Again
        repetitions = 0;
        interval = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        break;
      case 2: // Hard
        interval = Math.max(1, Math.round(interval * 1.2));
        easeFactor = Math.max(1.3, easeFactor - 0.15);
        break;
      case 3: // Good
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.round(interval * easeFactor);
        repetitions++;
        break;
      case 4: // Easy
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.round(interval * easeFactor);
        interval = Math.round(interval * 1.3);
        easeFactor += 0.15;
        repetitions++;
        break;
    }

    const nextReviewDate = new Date(
      now.getTime() + interval * 24 * 60 * 60 * 1000,
    );

    await this.flashcardModel
      .findByIdAndUpdate(id, {
        interval,
        easeFactor,
        repetitions,
        nextReviewDate,
        lastReviewedAt: now,
      })
      .exec();

    return {
      flashcardId: id,
      nextReviewDate: nextReviewDate.toISOString(),
      interval,
      easeFactor,
      repetitions,
    };
  }

  private async recomputeDeckCardCount(deckId: string): Promise<void> {
    const cardCount = await this.flashcardModel
      .countDocuments({ deckId })
      .exec();
    const now = new Date();
    const dueCount = await this.flashcardModel
      .countDocuments({ deckId, nextReviewDate: { $lte: now } })
      .exec();
    await this.deckModel
      .findByIdAndUpdate(deckId, { cardCount, dueCount })
      .exec();
  }
}
