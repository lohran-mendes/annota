import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './question.schema';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { TopicModule } from '../topic/topic.module';
import { SubjectModule } from '../subject/subject.module';
import { ExamModule } from '../exam/exam.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
    TopicModule,
    SubjectModule,
    ExamModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService, MongooseModule],
})
export class QuestionModule {}
