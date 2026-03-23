import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Answers')
@ApiBearerAuth()
@Controller('answers')
@UseGuards(JwtAuthGuard)
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an answer to a question' })
  @ApiBody({ type: SubmitAnswerDto })
  @ApiResponse({ status: 201, description: 'Answer submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async submitAnswer(@Req() req: any, @Body() dto: SubmitAnswerDto) {
    const result = await this.answerService.submitAnswer(req.user.sub, dto);
    return { data: result };
  }
}
