import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type UserAnswerDocument = HydratedDocument<UserAnswer>;

@Schema({ timestamps: true })
export class UserAnswer {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true })
  questionId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  selectedIndex: number;

  @Prop({ required: true })
  correct: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true })
  subjectId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true })
  topicId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' })
  examId: mongoose.Types.ObjectId;
}

export const UserAnswerSchema = SchemaFactory.createForClass(UserAnswer);

UserAnswerSchema.index({ questionId: 1, createdAt: -1 });
UserAnswerSchema.index({ examId: 1, subjectId: 1 });
UserAnswerSchema.index({ subjectId: 1, topicId: 1 });

UserAnswerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.questionId = ret.questionId?.toString();
    ret.subjectId = ret.subjectId?.toString();
    ret.topicId = ret.topicId?.toString();
    ret.examId = ret.examId?.toString();
    delete ret._id;
  },
});
