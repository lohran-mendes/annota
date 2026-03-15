import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccessLogDocument = HydratedDocument<AccessLog>;

@Schema({ timestamps: true })
export class AccessLog {
  @Prop({ required: true })
  accessDate: string;

  @Prop()
  userId: string;
}

export const AccessLogSchema = SchemaFactory.createForClass(AccessLog);

AccessLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});
