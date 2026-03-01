import { Controller, Post, Body } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  async submitAnswer(@Body() dto: SubmitAnswerDto) {
    const result = await this.answerService.submitAnswer(dto);
    return { data: result };
  }
}
