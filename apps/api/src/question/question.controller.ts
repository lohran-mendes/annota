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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Questions')
@Controller()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('questions')
  @ApiOperation({ summary: 'List all questions with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by statement' })
  @ApiQuery({ name: 'subjectId', required: false, type: String, description: 'Filter by subject ObjectId' })
  @ApiQuery({ name: 'topicId', required: false, type: String, description: 'Filter by topic ObjectId' })
  @ApiResponse({ status: 200, description: 'Paginated list of questions' })
  async findAll(@Query() pagination: PaginationDto, @Query() filter: FilterQuestionDto) {
    return this.questionService.findAll(pagination.page, pagination.limit, filter);
  }

  @Get('topics/:topicId/questions')
  @ApiOperation({ summary: 'Get all questions for a topic' })
  @ApiParam({ name: 'topicId', description: 'Topic ObjectId' })
  @ApiResponse({ status: 200, description: 'List of questions for the topic' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async findByTopic(@Param('topicId', ParseObjectIdPipe) topicId: string) {
    const questions = await this.questionService.findByTopic(topicId);
    return { data: questions, total: questions.length };
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get a question by ID' })
  @ApiParam({ name: 'id', description: 'Question ObjectId' })
  @ApiResponse({ status: 200, description: 'Question found' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const question = await this.questionService.findOne(id);
    return { data: question };
  }

  @Post('questions')
  @ApiOperation({ summary: 'Create a new question' })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(@Body() dto: CreateQuestionDto) {
    const question = await this.questionService.create(dto);
    return { data: question };
  }

  @Put('questions/:id')
  @ApiOperation({ summary: 'Update a question' })
  @ApiParam({ name: 'id', description: 'Question ObjectId' })
  @ApiBody({ type: UpdateQuestionDto })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    const question = await this.questionService.update(id, dto);
    return { data: question };
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a question' })
  @ApiParam({ name: 'id', description: 'Question ObjectId' })
  @ApiResponse({ status: 204, description: 'Question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.questionService.remove(id);
  }
}
