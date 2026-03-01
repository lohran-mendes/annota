import { Controller, Get, Param } from '@nestjs/common';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async getGlobalProgress() {
    const progress = await this.progressService.getGlobalProgress();
    return { data: progress };
  }

  @Get('exams/:examId')
  async getExamProgress(@Param('examId') examId: string) {
    const progress = await this.progressService.getExamProgress(examId);
    return { data: progress };
  }
}
