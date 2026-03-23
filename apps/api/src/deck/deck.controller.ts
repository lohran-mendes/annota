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
  UseGuards,
  Req,
} from '@nestjs/common';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Decks')
@ApiBearerAuth()
@Controller('decks')
@UseGuards(JwtAuthGuard)
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Get()
  @ApiOperation({ summary: 'List all decks for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user decks' })
  async findAll(@Req() req: any) {
    const decks = await this.deckService.findAll(req.user.sub);
    return { data: decks, total: decks.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a deck by ID' })
  @ApiParam({ name: 'id', description: 'Deck ObjectId' })
  @ApiResponse({ status: 200, description: 'Deck found' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async findOne(@Req() req: any, @Param('id', ParseObjectIdPipe) id: string) {
    const deck = await this.deckService.findOne(req.user.sub, id);
    return { data: deck };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new deck' })
  @ApiBody({ type: CreateDeckDto })
  @ApiResponse({ status: 201, description: 'Deck created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(@Req() req: any, @Body() dto: CreateDeckDto) {
    const deck = await this.deckService.create(req.user.sub, dto);
    return { data: deck };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a deck' })
  @ApiParam({ name: 'id', description: 'Deck ObjectId' })
  @ApiBody({ type: UpdateDeckDto })
  @ApiResponse({ status: 200, description: 'Deck updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async update(@Req() req: any, @Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateDeckDto) {
    const deck = await this.deckService.update(req.user.sub, id, dto);
    return { data: deck };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a deck' })
  @ApiParam({ name: 'id', description: 'Deck ObjectId' })
  @ApiResponse({ status: 204, description: 'Deck deleted successfully' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async remove(@Req() req: any, @Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.deckService.remove(req.user.sub, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get deck statistics' })
  @ApiParam({ name: 'id', description: 'Deck ObjectId' })
  @ApiResponse({ status: 200, description: 'Deck statistics retrieved' })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async getStats(@Req() req: any, @Param('id', ParseObjectIdPipe) id: string) {
    const stats = await this.deckService.getStats(req.user.sub, id);
    return { data: stats };
  }
}
