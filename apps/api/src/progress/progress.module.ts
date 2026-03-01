import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { UserAnswer, UserAnswerSchema } from '../answer/answer.schema';
import { Subject, SubjectSchema } from '../subject/subject.schema';
import { Topic, TopicSchema } from '../topic/topic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAnswer.name, schema: UserAnswerSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Topic.name, schema: TopicSchema },
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
