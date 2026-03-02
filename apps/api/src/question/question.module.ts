import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './question.schema';
import { Exam, ExamSchema } from '../exam/exam.schema';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { TopicModule } from '../topic/topic.module';
import { SubjectModule } from '../subject/subject.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Exam.name, schema: ExamSchema },
    ]),
    TopicModule,
    SubjectModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService, MongooseModule],
})
export class QuestionModule {}
