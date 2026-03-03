import { IsInt, Min, Max } from 'class-validator';
import type { ReviewFlashcardDto as IReviewFlashcardDto } from '@annota/shared';

export class ReviewFlashcardDto implements IReviewFlashcardDto {
  @IsInt()
  @Min(1)
  @Max(4)
  rating: 1 | 2 | 3 | 4;
}
