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
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Decks')
@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Get()
  @ApiOperation({ summary: 'List all decks' })
  @ApiResponse({ status: 200, description: 'List of all decks' })
  async findAll() {
    const decks = await this.deckService.findAll();
    return { data: decks, total: decks.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a deck by ID' })
  @ApiParam({ name: 'id', description: 'Deck ObjectId' })
  @ApiResponse({ status: 200, description: 'Deck found' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const deck = await this.deckService.findOne(id);
    return { data: deck };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new deck' })
  @ApiBody({ type: CreateDeckDto })
  @ApiResponse({ status: 201, description: 'Deck created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(@Body() dto: CreateDeckDto) {
    const deck = await this.deckService.create(dto);
    return { data: deck };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a deck' })
  @ApiParam({ name: 'id', description: 'Deck ObjectId' })
  @ApiBody({ type: UpdateDeckDto })
  @ApiResponse({ status: 200, description: 'Deck updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateDeckDto) {
    const deck = await this.deckService.update(id, dto);
    return { data: deck };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a deck' })
  @ApiParam({ name: 'id', description: 'Deck ObjectId' })
  @ApiResponse({ status: 204, description: 'Deck deleted successfully' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.deckService.remove(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get deck statistics' })
  @ApiParam({ name: 'id', description: 'Deck ObjectId' })
  @ApiResponse({ status: 200, description: 'Deck statistics retrieved' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async getStats(@Param('id', ParseObjectIdPipe) id: string) {
    const stats = await this.deckService.getStats(id);
    return { data: stats };
  }
}
