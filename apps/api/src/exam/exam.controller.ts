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
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { LinkQuestionsDto } from './dto/link-questions.dto';

@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get()
  async findAll() {
    const exams = await this.examService.findAll();
    return { data: exams, total: exams.length };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const exam = await this.examService.findOne(id);
    return { data: exam };
  }

  @Post()
  async create(@Body() dto: CreateExamDto) {
    const exam = await this.examService.create(dto);
    return { data: exam };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateExamDto,
  ) {
    const exam = await this.examService.update(id, dto);
    return { data: exam };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.examService.remove(id);
  }

  @Post(':examId/questions/link')
  async linkQuestions(
    @Param('examId') examId: string,
    @Body() dto: LinkQuestionsDto,
  ) {
    const exam = await this.examService.linkQuestions(examId, dto.questionIds);
    return { data: exam };
  }

  @Post(':examId/questions/unlink')
  async unlinkQuestions(
    @Param('examId') examId: string,
    @Body() dto: LinkQuestionsDto,
  ) {
    const exam = await this.examService.unlinkQuestions(
      examId,
      dto.questionIds,
    );
    return { data: exam };
  }

  @Get(':examId/questions')
  async getExamQuestions(@Param('examId') examId: string) {
    const questions = await this.examService.getExamQuestions(examId);
    return { data: questions, total: questions.length };
  }

  @Get(':examId/subjects')
  async getExamSubjects(@Param('examId') examId: string) {
    const subjects = await this.examService.getExamSubjects(examId);
    return { data: subjects, total: subjects.length };
  }
}
