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
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('questions')
  async findAll() {
    const questions = await this.questionService.findAll();
    return { data: questions, total: questions.length };
  }

  @Get('topics/:topicId/questions')
  async findByTopic(@Param('topicId') topicId: string) {
    const questions = await this.questionService.findByTopic(topicId);
    return { data: questions, total: questions.length };
  }

  @Get('questions/:id')
  async findOne(@Param('id') id: string) {
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
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    const question = await this.questionService.update(id, dto);
    return { data: question };
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.questionService.remove(id);
  }
}
