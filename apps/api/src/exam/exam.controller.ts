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
}
