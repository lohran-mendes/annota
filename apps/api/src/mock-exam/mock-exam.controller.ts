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
import { MockExamService } from './mock-exam.service';
import { CreateMockExamDto } from './dto/create-mock-exam.dto';
import { UpdateMockExamDto } from './dto/update-mock-exam.dto';
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

@ApiTags('Mock Exams (Admin)')
@Controller('mock-exams')
export class MockExamController {
  constructor(private readonly mockExamService: MockExamService) {}

  @Get()
  @ApiOperation({ summary: 'List all mock exam templates' })
  @ApiQuery({
    name: 'examId',
    required: false,
    type: String,
    description: 'Filter by exam ObjectId',
  })
  @ApiQuery({
    name: 'published',
    required: false,
    type: Boolean,
    description: 'Filter by published status',
  })
  @ApiResponse({ status: 200, description: 'List of mock exam templates' })
  async findAll(@Query() filter: FilterMockExamDto) {
    const mockExams = await this.mockExamService.findAll(
      filter.examId,
      filter.published,
    );
    return { data: mockExams, total: mockExams.length };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new mock exam template' })
  @ApiBody({ type: CreateMockExamDto })
  @ApiResponse({
    status: 201,
    description: 'Mock exam template created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Exam or question not found' })
  async create(@Body() dto: CreateMockExamDto) {
    const mockExam = await this.mockExamService.create(dto);
    return { data: mockExam };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a mock exam template by ID' })
  @ApiParam({ name: 'id', description: 'Mock exam ObjectId' })
  @ApiResponse({ status: 200, description: 'Mock exam template found' })
  @ApiResponse({ status: 404, description: 'Mock exam template not found' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const mockExam = await this.mockExamService.findOne(id);
    return { data: mockExam };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a mock exam template' })
  @ApiParam({ name: 'id', description: 'Mock exam ObjectId' })
  @ApiBody({ type: UpdateMockExamDto })
  @ApiResponse({
    status: 200,
    description: 'Mock exam template updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Mock exam template not found' })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateMockExamDto,
  ) {
    const mockExam = await this.mockExamService.update(id, dto);
    return { data: mockExam };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a mock exam template' })
  @ApiParam({ name: 'id', description: 'Mock exam ObjectId' })
  @ApiResponse({ status: 204, description: 'Mock exam template deleted' })
  @ApiResponse({ status: 404, description: 'Mock exam template not found' })
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.mockExamService.remove(id);
  }
}
