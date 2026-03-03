import { IsString, IsOptional } from 'class-validator';
import type { UpdateFlashcardDto as IUpdateFlashcardDto } from '@annota/shared';

export class UpdateFlashcardDto implements IUpdateFlashcardDto {
  @IsString()
  @IsOptional()
  front?: string;

  @IsString()
  @IsOptional()
  back?: string;
}
