import { Controller, Get, Param } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get global user progress' })
  @ApiResponse({ status: 200, description: 'Global progress retrieved successfully' })
  async getGlobalProgress() {
    const progress = await this.progressService.getGlobalProgress();
    return { data: progress };
  }

  @Get('exams/:examId')
  @ApiOperation({ summary: 'Get progress for a specific exam' })
  @ApiParam({ name: 'examId', description: 'MongoDB ObjectId of the exam' })
  @ApiResponse({ status: 200, description: 'Exam progress retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  async getExamProgress(@Param('examId', ParseObjectIdPipe) examId: string) {
    const progress = await this.progressService.getExamProgress(examId);
    return { data: progress };
  }
}
