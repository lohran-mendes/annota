import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamModule } from './exam/exam.module';
import { SubjectModule } from './subject/subject.module';
import { TopicModule } from './topic/topic.module';
import { QuestionModule } from './question/question.module';
import { AnswerModule } from './answer/answer.module';
import { ProgressModule } from './progress/progress.module';

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
  ],
})
export class AppModule {}
