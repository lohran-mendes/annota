import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';

export type FlashcardDocument = HydratedDocument<Flashcard>;

@Schema({ timestamps: true })
export class Flashcard {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true })
  deckId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  front: string;

  @Prop({ required: true })
  back: string;

  @Prop({ default: 0 })
  interval: number;

  @Prop({ default: 2.5 })
  easeFactor: number;

  @Prop({ default: 0 })
  repetitions: number;

  @Prop({ type: Date, default: () => new Date() })
  nextReviewDate: Date;

  @Prop({ type: Date, default: null })
  lastReviewedAt: Date | null;
}

export const FlashcardSchema = SchemaFactory.createForClass(Flashcard);

FlashcardSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    ret.deckId = ret.deckId?.toString();
    ret.nextReviewDate = ret.nextReviewDate instanceof Date
      ? ret.nextReviewDate.toISOString()
      : ret.nextReviewDate;
    ret.lastReviewedAt = ret.lastReviewedAt instanceof Date
      ? ret.lastReviewedAt.toISOString()
      : null;
    delete ret._id;
  },
});
