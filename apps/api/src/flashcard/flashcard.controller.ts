import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

@Controller()
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Get('decks/:deckId/flashcards')
  async findByDeck(@Param('deckId', ParseObjectIdPipe) deckId: string) {
    const flashcards = await this.flashcardService.findByDeck(deckId);
    return { data: flashcards, total: flashcards.length };
  }

  @Get('decks/:deckId/flashcards/due')
  async findDueByDeck(@Param('deckId', ParseObjectIdPipe) deckId: string) {
    const flashcards = await this.flashcardService.findDueByDeck(deckId);
    return { data: flashcards, total: flashcards.length };
  }

  @Get('flashcards/:id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const flashcard = await this.flashcardService.findOne(id);
    return { data: flashcard };
  }

  @Post('flashcards')
  async create(@Body() dto: CreateFlashcardDto) {
    const flashcard = await this.flashcardService.create(dto);
    return { data: flashcard };
  }

  @Put('flashcards/:id')
  async update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateFlashcardDto) {
    const flashcard = await this.flashcardService.update(id, dto);
    return { data: flashcard };
  }

  @Delete('flashcards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.flashcardService.remove(id);
  }

  @Post('flashcards/:id/review')
  async review(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: ReviewFlashcardDto) {
    const result = await this.flashcardService.review(id, dto.rating);
    return { data: result };
  }

  @Get('flashcards/:id/predict')
  async predict(@Param('id', ParseObjectIdPipe) id: string) {
    const card = await this.flashcardService.findOne(id);
    const intervals = this.flashcardService.predictIntervals(card);
    return { data: intervals };
  }
}
