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

@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Get()
  async findAll() {
    const decks = await this.deckService.findAll();
    return { data: decks, total: decks.length };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const deck = await this.deckService.findOne(id);
    return { data: deck };
  }

  @Post()
  async create(@Body() dto: CreateDeckDto) {
    const deck = await this.deckService.create(dto);
    return { data: deck };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDeckDto) {
    const deck = await this.deckService.update(id, dto);
    return { data: deck };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deckService.remove(id);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    const stats = await this.deckService.getStats(id);
    return { data: stats };
  }
}
