import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Flashcard, FlashcardSchema } from './flashcard.schema';
import { Deck, DeckSchema } from '../deck/deck.schema';
import { FlashcardController } from './flashcard.controller';
import { FlashcardService } from './flashcard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Flashcard.name, schema: FlashcardSchema },
      { name: Deck.name, schema: DeckSchema },
    ]),
  ],
  controllers: [FlashcardController],
  providers: [FlashcardService],
  exports: [FlashcardService, MongooseModule],
})
export class FlashcardModule {}
