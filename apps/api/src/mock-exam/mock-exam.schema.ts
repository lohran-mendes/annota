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

  @Prop({ required: true })
  questionCount: number;

  @Prop({ required: true })
  duration: number;

  @Prop({
    type: String,
    enum: ['available', 'in_progress', 'completed'],
    default: 'available',
  })
  status: string;

  @Prop()
  score?: number;

  @Prop()
  completedAt?: Date;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }] })
  questionIds: mongoose.Types.ObjectId[];
}

export const MockExamSchema = SchemaFactory.createForClass(MockExam);

MockExamSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.examId = ret.examId?.toString();
    if (ret.completedAt) {
      ret.completedAt = ret.completedAt.toISOString().split('T')[0];
    }
    delete ret._id;
    delete ret.questionIds;
  },
});
