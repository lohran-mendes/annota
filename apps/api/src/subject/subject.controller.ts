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
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Controller()
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get('subjects')
  async findAll() {
    const subjects = await this.subjectService.findAll();
    return { data: subjects, total: subjects.length };
  }

  @Get('exams/:examId/subjects')
  async findByExam(@Param('examId') examId: string) {
    const subjects = await this.subjectService.findByExam(examId);
    return { data: subjects, total: subjects.length };
  }

  @Get('subjects/:id')
  async findOne(@Param('id') id: string) {
    const subject = await this.subjectService.findOne(id);
    return { data: subject };
  }

  @Post('subjects')
  async create(@Body() dto: CreateSubjectDto) {
    const subject = await this.subjectService.create(dto);
    return { data: subject };
  }

  @Put('subjects/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    const subject = await this.subjectService.update(id, dto);
    return { data: subject };
  }

  @Delete('subjects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.subjectService.remove(id);
  }
}
