import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAnswer, UserAnswerSchema } from './answer.schema';
import { AnswerController } from './answer.controller';
import { AnswerService } from './answer.service';
import { QuestionModule } from '../question/question.module';
import { TopicModule } from '../topic/topic.module';
import { SubjectModule } from '../subject/subject.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAnswer.name, schema: UserAnswerSchema },
    ]),
    QuestionModule,
    TopicModule,
    SubjectModule,
  ],
  controllers: [AnswerController],
  providers: [AnswerService],
  exports: [AnswerService, MongooseModule],
})
export class AnswerModule {}
