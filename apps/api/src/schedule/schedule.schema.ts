import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type ScheduleDocument = HydratedDocument<Schedule>;

@Schema()
class ScheduleActivity {
  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['study', 'review', 'practice', 'mock-exam'] })
  type: string;

  @Prop({ required: true })
  duration: number;
}

@Schema()
class ScheduleDay {
  @Prop({ required: true })
  dayOfWeek: string;

  @Prop({ type: [ScheduleActivity], default: [] })
  activities: ScheduleActivity[];
}

@Schema()
class ScheduleWeek {
  @Prop({ required: true })
  weekNumber: number;

  @Prop({ required: true })
  label: string;

  @Prop({ type: [ScheduleDay], default: [] })
  days: ScheduleDay[];
}

@Schema({ timestamps: true })
export class Schedule {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true })
  examId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: [ScheduleWeek], default: [] })
  weeks: ScheduleWeek[];
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

ScheduleSchema.index({ examId: 1, userId: 1 }, { unique: true });

ScheduleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.examId = ret.examId?.toString();
    ret.userId = ret.userId?.toString();
    delete ret._id;
  },
});
