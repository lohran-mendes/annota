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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Mock Exams')
@Controller('mock-exams')
export class MockExamController {
  constructor(private readonly mockExamService: MockExamService) {}

  @Get()
  @ApiOperation({ summary: 'List all mock exam sessions' })
  @ApiQuery({ name: 'examId', required: false, type: String, description: 'Filter by exam ObjectId' })
  @ApiQuery({ name: 'status', required: false, enum: ['available', 'in_progress', 'completed'], description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'List of mock exam sessions' })
  async findAll(@Query() filter: FilterMockExamDto) {
    const mockExams = await this.mockExamService.findAll(filter.examId, filter.status);
    return { data: mockExams, total: mockExams.length };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new mock exam session' })
  @ApiBody({ type: CreateMockExamDto })
  @ApiResponse({ status: 201, description: 'Mock exam session created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(@Body() dto: CreateMockExamDto) {
    const session = await this.mockExamService.create(dto);
    return { data: session };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a mock exam session by ID' })
  @ApiParam({ name: 'id', description: 'Mock exam session ObjectId' })
  @ApiResponse({ status: 200, description: 'Mock exam session found' })
  @ApiResponse({ status: 404, description: 'Mock exam session not found' })
  async getSession(@Param('id', ParseObjectIdPipe) id: string) {
    const session = await this.mockExamService.getSession(id);
    return { data: session };
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit answers for a mock exam session' })
  @ApiParam({ name: 'id', description: 'Mock exam session ObjectId' })
  @ApiBody({ type: SubmitMockExamDto })
  @ApiResponse({ status: 201, description: 'Mock exam submitted and result generated' })
  @ApiResponse({ status: 400, description: 'Invalid submission payload' })
  @ApiResponse({ status: 404, description: 'Mock exam session not found' })
  async submit(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: SubmitMockExamDto,
  ) {
    const result = await this.mockExamService.submit(id, dto);
    return { data: result };
  }

  @Get(':id/result')
  @ApiOperation({ summary: 'Get the result of a completed mock exam' })
  @ApiParam({ name: 'id', description: 'Mock exam session ObjectId' })
  @ApiResponse({ status: 200, description: 'Mock exam result retrieved' })
  @ApiResponse({ status: 404, description: 'Mock exam or result not found' })
  async getResult(@Param('id', ParseObjectIdPipe) id: string) {
    const result = await this.mockExamService.getResult(id);
    return { data: result };
  }
}
