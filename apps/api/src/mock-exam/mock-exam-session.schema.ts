import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type MockExamSessionDocument = HydratedDocument<MockExamSession>;

@Schema({ timestamps: true })
export class MockExamSession {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockExam',
    required: true,
  })
  mockExamId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  mockExamName: string;

  @Prop({ required: true })
  questionCount: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }] })
  questionIds: mongoose.Types.ObjectId[];

  @Prop({
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
  })
  status: 'in_progress' | 'completed';

  @Prop()
  score?: number;

  @Prop()
  completedAt?: Date;
}

export const MockExamSessionSchema =
  SchemaFactory.createForClass(MockExamSession);

MockExamSessionSchema.index({ mockExamId: 1, status: 1 });

MockExamSessionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.mockExamId = ret.mockExamId?.toString();
    if (ret.completedAt) {
      ret.completedAt = ret.completedAt.toISOString();
    }
    delete ret._id;
    delete ret.questionIds;
  },
});
