import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FilterQuestionDto } from './dto/filter-question.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Questions')
@Controller()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('questions')
  async findAll(@Query() pagination: PaginationDto, @Query() filter: FilterQuestionDto) {
    return this.questionService.findAll(pagination.page, pagination.limit, filter);
  }

  @Get('topics/:topicId/questions')
  async findByTopic(@Param('topicId', ParseObjectIdPipe) topicId: string) {
    const questions = await this.questionService.findByTopic(topicId);
    return { data: questions, total: questions.length };
  }

  @Get('questions/:id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const question = await this.questionService.findOne(id);
    return { data: question };
  }

  @Post('questions')
  async create(@Body() dto: CreateQuestionDto) {
    const question = await this.questionService.create(dto);
    return { data: question };
  }

  @Put('questions/:id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    const question = await this.questionService.update(id, dto);
    return { data: question };
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.questionService.remove(id);
  }
}
