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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Flashcards')
@Controller()
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Get('decks/:deckId/flashcards')
  @ApiOperation({ summary: 'List all flashcards in a deck' })
  @ApiParam({ name: 'deckId', description: 'Deck ObjectId' })
  @ApiResponse({ status: 200, description: 'List of flashcards for the deck' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async findByDeck(@Param('deckId', ParseObjectIdPipe) deckId: string) {
    const flashcards = await this.flashcardService.findByDeck(deckId);
    return { data: flashcards, total: flashcards.length };
  }

  @Get('decks/:deckId/flashcards/due')
  @ApiOperation({ summary: 'List flashcards due for review in a deck' })
  @ApiParam({ name: 'deckId', description: 'Deck ObjectId' })
  @ApiResponse({ status: 200, description: 'List of due flashcards' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async findDueByDeck(@Param('deckId', ParseObjectIdPipe) deckId: string) {
    const flashcards = await this.flashcardService.findDueByDeck(deckId);
    return { data: flashcards, total: flashcards.length };
  }

  @Get('flashcards/:id')
  @ApiOperation({ summary: 'Get a flashcard by ID' })
  @ApiParam({ name: 'id', description: 'Flashcard ObjectId' })
  @ApiResponse({ status: 200, description: 'Flashcard found' })
  @ApiResponse({ status: 404, description: 'Flashcard not found' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const flashcard = await this.flashcardService.findOne(id);
    return { data: flashcard };
  }

  @Post('flashcards')
  @ApiOperation({ summary: 'Create a new flashcard' })
  @ApiBody({ type: CreateFlashcardDto })
  @ApiResponse({ status: 201, description: 'Flashcard created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(@Body() dto: CreateFlashcardDto) {
    const flashcard = await this.flashcardService.create(dto);
    return { data: flashcard };
  }

  @Put('flashcards/:id')
  @ApiOperation({ summary: 'Update a flashcard' })
  @ApiParam({ name: 'id', description: 'Flashcard ObjectId' })
  @ApiBody({ type: UpdateFlashcardDto })
  @ApiResponse({ status: 200, description: 'Flashcard updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Flashcard not found' })
  async update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateFlashcardDto) {
    const flashcard = await this.flashcardService.update(id, dto);
    return { data: flashcard };
  }

  @Delete('flashcards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a flashcard' })
  @ApiParam({ name: 'id', description: 'Flashcard ObjectId' })
  @ApiResponse({ status: 204, description: 'Flashcard deleted successfully' })
  @ApiResponse({ status: 404, description: 'Flashcard not found' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.flashcardService.remove(id);
  }

  @Post('flashcards/:id/review')
  @ApiOperation({ summary: 'Submit a review rating for a flashcard (SM-2 algorithm)' })
  @ApiParam({ name: 'id', description: 'Flashcard ObjectId' })
  @ApiBody({ type: ReviewFlashcardDto })
  @ApiResponse({ status: 201, description: 'Review recorded with updated scheduling' })
  @ApiResponse({ status: 404, description: 'Flashcard not found' })
  async review(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: ReviewFlashcardDto) {
    const result = await this.flashcardService.review(id, dto.rating);
    return { data: result };
  }

  @Get('flashcards/:id/predict')
  @ApiOperation({ summary: 'Predict next review intervals for a flashcard' })
  @ApiParam({ name: 'id', description: 'Flashcard ObjectId' })
  @ApiResponse({ status: 200, description: 'Predicted intervals for each rating' })
  @ApiResponse({ status: 404, description: 'Flashcard not found' })
  async predict(@Param('id', ParseObjectIdPipe) id: string) {
    const card = await this.flashcardService.findOne(id);
    const intervals = this.flashcardService.predictIntervals(card);
    return { data: intervals };
  }
}
