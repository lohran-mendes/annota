import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type DeckDocument = HydratedDocument<Deck>;

@Schema({ timestamps: true })
export class Deck {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 0 })
  cardCount: number;

  @Prop({ default: 0 })
  dueCount: number;
}

export const DeckSchema = SchemaFactory.createForClass(Deck);

DeckSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.userId = ret.userId?.toString();
    delete ret._id;
  },
});
