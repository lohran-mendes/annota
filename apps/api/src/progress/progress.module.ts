import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { UserAnswer, UserAnswerSchema } from '../answer/answer.schema';
import { Subject, SubjectSchema } from '../subject/subject.schema';
import { Topic, TopicSchema } from '../topic/topic.schema';
import { Exam, ExamSchema } from '../exam/exam.schema';
import { Question, QuestionSchema } from '../question/question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAnswer.name, schema: UserAnswerSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
