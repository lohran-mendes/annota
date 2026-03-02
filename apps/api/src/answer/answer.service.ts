import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAnswer, UserAnswerDocument } from './answer.schema';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { QuestionService } from '../question/question.service';
import { TopicService } from '../topic/topic.service';
import { SubjectService } from '../subject/subject.service';
import type { AnswerResult } from '@annota/shared';

@Injectable()
export class AnswerService {
  constructor(
    @InjectModel(UserAnswer.name)
    private userAnswerModel: Model<UserAnswerDocument>,
    private readonly questionService: QuestionService,
    private readonly topicService: TopicService,
    private readonly subjectService: SubjectService,
  ) {}

  async submitAnswer(dto: SubmitAnswerDto): Promise<AnswerResult> {
    const question = await this.questionService.findOne(dto.questionId);
    const correct = dto.selectedIndex === question.correctAnswerIndex;

    // Verificar se e a primeira vez que o usuario responde esta questao
    const alreadyAnswered = await this.userAnswerModel
      .findOne({ questionId: dto.questionId })
      .exec();

    // Salvar resposta com examId vindo do DTO
    const userAnswer = new this.userAnswerModel({
      questionId: dto.questionId,
      selectedIndex: dto.selectedIndex,
      correct,
      subjectId: question.subjectId,
      topicId: question.topicId,
      examId: dto.examId,
    });
    await userAnswer.save();

    // Atualizar completedCount se primeira resposta para esta questao
    if (!alreadyAnswered) {
      await this.topicService.incrementCompletedCount(
        question.topicId.toString(),
        1,
      );
      await this.subjectService.incrementCompletedCount(
        question.subjectId.toString(),
        1,
      );
    }

    const streak = await this.getStreak();

    return {
      correct,
      correctAnswerIndex: question.correctAnswerIndex,
      explanation: question.explanation,
      streak,
    };
  }

  async getStreak(): Promise<number> {
    const recentAnswers = await this.userAnswerModel
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    let streak = 0;
    for (const answer of recentAnswers) {
      if (answer.correct) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
}
