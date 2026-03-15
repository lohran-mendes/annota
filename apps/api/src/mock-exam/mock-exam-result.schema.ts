import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type MockExamResultDocument = HydratedDocument<MockExamResult>;

@Schema({ _id: false })
class SubjectResultSchema {
  @Prop({ required: true })
  subjectId: string;

  @Prop({ required: true })
  subjectName: string;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  correct: number;

  @Prop({ required: true })
  color: string;
}

@Schema({ _id: false })
class QuestionResultSchema {
  @Prop({ required: true })
  questionId: string;

  @Prop({ required: true })
  statement: string;

  @Prop({ type: [Object], required: true })
  alternatives: any[];

  @Prop({ required: true })
  selectedIndex: number;

  @Prop({ required: true })
  correctAnswerIndex: number;

  @Prop({ required: true })
  correct: boolean;

  @Prop({ required: true })
  explanation: string;
}

const SubjectResultMongoSchema =
  SchemaFactory.createForClass(SubjectResultSchema);
const QuestionResultMongoSchema =
  SchemaFactory.createForClass(QuestionResultSchema);

@Schema({ timestamps: true })
export class MockExamResult {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockExam',
    required: true,
  })
  mockExamId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  totalQuestions: number;

  @Prop({ required: true })
  correctCount: number;

  @Prop({ required: true })
  timeSpent: number;

  @Prop({ type: [SubjectResultMongoSchema] })
  bySubject: SubjectResultSchema[];

  @Prop({ type: [QuestionResultMongoSchema] })
  details: QuestionResultSchema[];
}

export const MockExamResultSchema =
  SchemaFactory.createForClass(MockExamResult);

MockExamResultSchema.index({ mockExamId: 1 });

MockExamResultSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.mockExamId = ret.mockExamId?.toString();
    delete ret._id;
  },
});
