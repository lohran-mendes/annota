import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import type { CreateMockExamDto as ICreateMockExamDto } from '@annota/shared';

export class CreateMockExamDto implements ICreateMockExamDto {
  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  questionCount: number;

  @IsInt()
  @Min(1)
  duration: number;
}
