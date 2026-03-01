import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type SubjectDocument = HydratedDocument<Subject>;

@Schema({ timestamps: true })
export class Subject {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true })
  examId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ default: 0 })
  questionCount: number;

  @Prop({ default: 0 })
  completedCount: number;

  @Prop({ required: true })
  color: string;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);

SubjectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.examId = ret.examId?.toString();
    delete ret._id;
  },
});
