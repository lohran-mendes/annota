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
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { LinkQuestionsDto } from './dto/link-questions.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterExamDto } from './dto/filter-exam.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Exams')
@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get()
  @ApiOperation({ summary: 'List all exams with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter by year' })
  @ApiQuery({ name: 'institution', required: false, type: String, description: 'Filter by institution' })
  @ApiResponse({ status: 200, description: 'Paginated list of exams' })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filter: FilterExamDto,
  ) {
    return this.examService.findAll(pagination.page, pagination.limit, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an exam by ID' })
  @ApiParam({ name: 'id', description: 'Exam ObjectId' })
  @ApiResponse({ status: 200, description: 'Exam found' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const exam = await this.examService.findOne(id);
    return { data: exam };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new exam' })
  @ApiBody({ type: CreateExamDto })
  @ApiResponse({ status: 201, description: 'Exam created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(@Body() dto: CreateExamDto) {
    const exam = await this.examService.create(dto);
    return { data: exam };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an exam' })
  @ApiParam({ name: 'id', description: 'Exam ObjectId' })
  @ApiBody({ type: UpdateExamDto })
  @ApiResponse({ status: 200, description: 'Exam updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateExamDto,
  ) {
    const exam = await this.examService.update(id, dto);
    return { data: exam };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an exam' })
  @ApiParam({ name: 'id', description: 'Exam ObjectId' })
  @ApiResponse({ status: 204, description: 'Exam deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.examService.remove(id);
  }

  @Post(':examId/questions/link')
  @ApiOperation({ summary: 'Link questions to an exam' })
  @ApiParam({ name: 'examId', description: 'Exam ObjectId' })
  @ApiBody({ type: LinkQuestionsDto })
  @ApiResponse({ status: 201, description: 'Questions linked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  async linkQuestions(
    @Param('examId', ParseObjectIdPipe) examId: string,
    @Body() dto: LinkQuestionsDto,
  ) {
    const exam = await this.examService.linkQuestions(examId, dto.questionIds);
    return { data: exam };
  }

  @Post(':examId/questions/unlink')
  @ApiOperation({ summary: 'Unlink questions from an exam' })
  @ApiParam({ name: 'examId', description: 'Exam ObjectId' })
  @ApiBody({ type: LinkQuestionsDto })
  @ApiResponse({ status: 201, description: 'Questions unlinked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  async unlinkQuestions(
    @Param('examId', ParseObjectIdPipe) examId: string,
    @Body() dto: LinkQuestionsDto,
  ) {
    const exam = await this.examService.unlinkQuestions(
      examId,
      dto.questionIds,
    );
    return { data: exam };
  }

  @Get(':examId/questions')
  @ApiOperation({ summary: 'Get all questions linked to an exam' })
  @ApiParam({ name: 'examId', description: 'Exam ObjectId' })
  @ApiResponse({ status: 200, description: 'List of exam questions' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  async getExamQuestions(@Param('examId', ParseObjectIdPipe) examId: string) {
    const questions = await this.examService.getExamQuestions(examId);
    return { data: questions, total: questions.length };
  }

  @Get(':examId/subjects')
  @ApiOperation({ summary: 'Get all subjects linked to an exam' })
  @ApiParam({ name: 'examId', description: 'Exam ObjectId' })
  @ApiResponse({ status: 200, description: 'List of exam subjects' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  async getExamSubjects(@Param('examId', ParseObjectIdPipe) examId: string) {
    const subjects = await this.examService.getExamSubjects(examId);
    return { data: subjects, total: subjects.length };
  }
}
