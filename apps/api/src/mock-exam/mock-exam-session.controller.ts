import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MockExamService } from './mock-exam.service';
import { StartSessionDto } from './dto/start-session.dto';
import { SubmitMockExamDto } from './dto/submit-mock-exam.dto';
import { FilterSessionDto } from './dto/filter-session.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Mock Exam Sessions (Student)')
@Controller('mock-exam-sessions')
export class MockExamSessionController {
  constructor(private readonly mockExamService: MockExamService) {}

  @Get()
  @ApiOperation({ summary: 'List all mock exam sessions for the student' })
  @ApiQuery({
    name: 'mockExamId',
    required: false,
    type: String,
    description: 'Filter sessions by mock exam ObjectId',
  })
  @ApiResponse({ status: 200, description: 'List of mock exam sessions' })
  async listSessions(@Query('mockExamId') mockExamId?: string) {
    const sessions = await this.mockExamService.listSessions(mockExamId);
    return { data: sessions, total: sessions.length };
  }

  @Post()
  @ApiOperation({ summary: 'Start a new mock exam session' })
  @ApiBody({ type: StartSessionDto })
  @ApiResponse({
    status: 201,
    description: 'Session started — returns config and sanitized questions',
  })
  @ApiResponse({ status: 400, description: 'Mock exam is not published' })
  @ApiResponse({ status: 404, description: 'Mock exam not found' })
  async startSession(@Body() dto: StartSessionDto) {
    const sessionData = await this.mockExamService.startSession(dto);
    return { data: sessionData };
  }

  // ----------------------------------------------------------------
  // Admin endpoints
  // ----------------------------------------------------------------

  @Get('admin/all')
  @ApiOperation({ summary: '[Admin] List all sessions with optional filters' })
  @ApiQuery({
    name: 'mockExamId',
    required: false,
    type: String,
    description: 'Filter by mock exam ObjectId',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['in_progress', 'completed'],
    description: 'Filter by session status',
  })
  @ApiResponse({ status: 200, description: 'List of all sessions' })
  async listAllSessions(@Query() filter: FilterSessionDto) {
    const sessions = await this.mockExamService.listAllSessions(
      filter.mockExamId,
      filter.status,
    );
    return { data: sessions, total: sessions.length };
  }

  @Get('admin/stats')
  @ApiOperation({ summary: '[Admin] Get aggregate stats across all sessions' })
  @ApiResponse({ status: 200, description: 'Session aggregate statistics' })
  async getSessionStats() {
    const stats = await this.mockExamService.getSessionStats();
    return { data: stats };
  }

  @Delete('admin/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Delete a session and its associated result' })
  @ApiParam({ name: 'id', description: 'Mock exam session ObjectId' })
  @ApiResponse({ status: 204, description: 'Session deleted' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async deleteSession(@Param('id', ParseObjectIdPipe) id: string) {
    await this.mockExamService.deleteSession(id);
  }

  // ----------------------------------------------------------------
  // Student endpoints
  // ----------------------------------------------------------------

  @Get(':id')
  @ApiOperation({ summary: 'Get an active mock exam session by ID' })
  @ApiParam({ name: 'id', description: 'Mock exam session ObjectId' })
  @ApiResponse({ status: 200, description: 'Session found with questions (no answers)' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSession(@Param('id', ParseObjectIdPipe) id: string) {
    const sessionData = await this.mockExamService.getSession(id);
    return { data: sessionData };
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit answers and finish a mock exam session' })
  @ApiParam({ name: 'id', description: 'Mock exam session ObjectId' })
  @ApiBody({ type: SubmitMockExamDto })
  @ApiResponse({ status: 201, description: 'Submission graded — result returned' })
  @ApiResponse({ status: 400, description: 'Invalid submission payload' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async submitSession(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: SubmitMockExamDto,
  ) {
    const result = await this.mockExamService.submitSession(id, dto);
    return { data: result };
  }

  @Get(':id/result')
  @ApiOperation({ summary: 'Get the detailed result of a completed session' })
  @ApiParam({ name: 'id', description: 'Mock exam session ObjectId' })
  @ApiResponse({ status: 200, description: 'Result retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Result not found' })
  async getSessionResult(@Param('id', ParseObjectIdPipe) id: string) {
    const result = await this.mockExamService.getSessionResult(id);
    return { data: result };
  }
}
