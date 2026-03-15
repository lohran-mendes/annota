import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ _id: false })
export class AlternativeSchema {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  text: string;
}

const AlternativeMongoSchema = SchemaFactory.createForClass(AlternativeSchema);

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true })
  topicId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true })
  subjectId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  statement: string;

  @Prop({ type: [AlternativeMongoSchema], required: true })
  alternatives: AlternativeSchema[];

  @Prop({ required: true })
  correctAnswerIndex: number;

  @Prop({ required: true })
  explanation: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

QuestionSchema.index({ topicId: 1 });
QuestionSchema.index({ subjectId: 1 });

QuestionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.topicId = ret.topicId?.toString();
    ret.subjectId = ret.subjectId?.toString();
    delete ret._id;
  },
});
