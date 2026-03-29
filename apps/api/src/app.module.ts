import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamModule } from './exam/exam.module';
import { SubjectModule } from './subject/subject.module';
import { TopicModule } from './topic/topic.module';
import { QuestionModule } from './question/question.module';
import { AnswerModule } from './answer/answer.module';
import { ProgressModule } from './progress/progress.module';
import { MockExamModule } from './mock-exam/mock-exam.module';
import { DeckModule } from './deck/deck.module';
import { FlashcardModule } from './flashcard/flashcard.module';
import { AccessLogModule } from './access-log/access-log.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/annota',
        ),
      }),
    }),
    ExamModule,
    SubjectModule,
    TopicModule,
    QuestionModule,
    AnswerModule,
    ProgressModule,
    MockExamModule,
    DeckModule,
    FlashcardModule,
    AccessLogModule,
    ScheduleModule,
    AuthModule,
  ],
})
export class AppModule {}
