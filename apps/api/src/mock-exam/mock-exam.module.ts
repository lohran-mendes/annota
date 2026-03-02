import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MockExam, MockExamSchema } from './mock-exam.schema';
import {
  MockExamResult,
  MockExamResultSchema,
} from './mock-exam-result.schema';
import { MockExamController } from './mock-exam.controller';
import { MockExamService } from './mock-exam.service';
import { Question, QuestionSchema } from '../question/question.schema';
import { Subject, SubjectSchema } from '../subject/subject.schema';
import { Exam, ExamSchema } from '../exam/exam.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MockExam.name, schema: MockExamSchema },
      { name: MockExamResult.name, schema: MockExamResultSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Exam.name, schema: ExamSchema },
    ]),
  ],
  controllers: [MockExamController],
  providers: [MockExamService],
})
export class MockExamModule {}
