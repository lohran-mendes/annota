import { Controller, Post, Body } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Answers')
@Controller('answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an answer to a question' })
  @ApiBody({ type: SubmitAnswerDto })
  @ApiResponse({ status: 201, description: 'Answer submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async submitAnswer(@Body() dto: SubmitAnswerDto) {
    const result = await this.answerService.submitAnswer(dto);
    return { data: result };
  }
}
