import { IsString, IsNotEmpty } from 'class-validator';
import type { CreateFlashcardDto as ICreateFlashcardDto } from '@annota/shared';

export class CreateFlashcardDto implements ICreateFlashcardDto {
  @IsString()
  @IsNotEmpty()
  deckId: string;

  @IsString()
  @IsNotEmpty()
  front: string;

  @IsString()
  @IsNotEmpty()
  back: string;
}
