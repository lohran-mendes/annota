import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import type { CreateExamDto as ICreateExamDto } from '@annota/shared';

export class CreateExamDto implements ICreateExamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(2000)
  year: number;

  @IsString()
  @IsNotEmpty()
  institution: string;
}
