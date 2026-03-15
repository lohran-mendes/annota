import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { MockExamService } from './mock-exam.service';
import { CreateMockExamDto } from './dto/create-mock-exam.dto';
import { SubmitMockExamDto } from './dto/submit-mock-exam.dto';
import { FilterMockExamDto } from './dto/filter-mock-exam.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Mock Exams')
@Controller('mock-exams')
export class MockExamController {
  constructor(private readonly mockExamService: MockExamService) {}

  @Get()
  async findAll(@Query() filter: FilterMockExamDto) {
    const mockExams = await this.mockExamService.findAll(filter.examId, filter.status);
    return { data: mockExams, total: mockExams.length };
  }

  @Post()
  async create(@Body() dto: CreateMockExamDto) {
    const session = await this.mockExamService.create(dto);
    return { data: session };
  }

  @Get(':id')
  async getSession(@Param('id', ParseObjectIdPipe) id: string) {
    const session = await this.mockExamService.getSession(id);
    return { data: session };
  }

  @Post(':id/submit')
  async submit(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: SubmitMockExamDto,
  ) {
    const result = await this.mockExamService.submit(id, dto);
    return { data: result };
  }

  @Get(':id/result')
  async getResult(@Param('id', ParseObjectIdPipe) id: string) {
    const result = await this.mockExamService.getResult(id);
    return { data: result };
  }
}
