import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Deck, DeckSchema } from './deck.schema';
import { Flashcard, FlashcardSchema } from '../flashcard/flashcard.schema';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Deck.name, schema: DeckSchema },
      { name: Flashcard.name, schema: FlashcardSchema },
    ]),
  ],
  controllers: [DeckController],
  providers: [DeckService],
  exports: [DeckService],
})
export class DeckModule {}
