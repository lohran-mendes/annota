import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type MockExamDocument = HydratedDocument<MockExam>;

@Schema({ timestamps: true })
export class MockExam {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true })
  examId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }] })
  questionIds: mongoose.Types.ObjectId[];

  @Prop({ default: false })
  published: boolean;
}

export const MockExamSchema = SchemaFactory.createForClass(MockExam);

MockExamSchema.index({ examId: 1, published: 1 });

MockExamSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.examId = ret.examId?.toString();
    ret.questionCount = Array.isArray(ret.questionIds)
      ? ret.questionIds.length
      : 0;
    if (Array.isArray(ret.questionIds)) {
      ret.questionIds = ret.questionIds.map((id: any) => id.toString());
    }
    delete ret._id;
  },
});
