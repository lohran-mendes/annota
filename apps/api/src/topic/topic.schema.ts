import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type TopicDocument = HydratedDocument<Topic>;

@Schema({ timestamps: true })
export class Topic {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true })
  subjectId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0 })
  questionCount: number;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);

TopicSchema.index({ subjectId: 1 });

TopicSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.subjectId = ret.subjectId?.toString();
    delete ret._id;
  },
});
