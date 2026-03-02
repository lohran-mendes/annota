import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type ExamDocument = HydratedDocument<Exam>;

@Schema({ timestamps: true })
export class Exam {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  institution: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    default: [],
  })
  questionIds: mongoose.Types.ObjectId[];

  @Prop({ default: 0 })
  questionCount: number;

  @Prop({ default: 0 })
  subjectCount: number;

  @Prop({ required: true, default: 180 })
  duration: number;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);

ExamSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.questionIds = ret.questionIds?.map((id: any) => id.toString()) ?? [];
    delete ret._id;
  },
});
