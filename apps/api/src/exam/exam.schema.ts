import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
    delete ret._id;
  },
});
