import { Controller, Get, Param } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async getGlobalProgress() {
    const progress = await this.progressService.getGlobalProgress();
    return { data: progress };
  }

  @Get('exams/:examId')
  async getExamProgress(@Param('examId', ParseObjectIdPipe) examId: string) {
    const progress = await this.progressService.getExamProgress(examId);
    return { data: progress };
  }
}
