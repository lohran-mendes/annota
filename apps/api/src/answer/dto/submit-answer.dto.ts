import { IsString, IsNotEmpty, IsInt, Min, IsOptional, IsMongoId } from 'class-validator';
import type { SubmitAnswerDto as ISubmitAnswerDto } from '@annota/shared';

export class SubmitAnswerDto implements ISubmitAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsInt()
  @Min(0)
  selectedIndex: number;

  @IsString()
  @IsOptional()
  examId: string;
}
