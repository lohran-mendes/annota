import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get global user progress' })
  @ApiResponse({ status: 200, description: 'Global progress retrieved successfully' })
  async getGlobalProgress(@Req() req: any) {
    const progress = await this.progressService.getGlobalProgress(req.user.sub);
    return { data: progress };
  }

  @Get('exams/:examId')
  @ApiOperation({ summary: 'Get progress for a specific exam' })
  @ApiParam({ name: 'examId', description: 'MongoDB ObjectId of the exam' })
  @ApiResponse({ status: 200, description: 'Exam progress retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  async getExamProgress(@Req() req: any, @Param('examId', ParseObjectIdPipe) examId: string) {
    const progress = await this.progressService.getExamProgress(req.user.sub, examId);
    return { data: progress };
  }
}
