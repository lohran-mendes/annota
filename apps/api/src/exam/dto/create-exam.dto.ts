import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsArray,
  IsOptional,
} from 'class-validator';
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
  @Max(2100)
  year: number;

  @IsString()
  @IsNotEmpty()
  institution: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  questionIds?: string[];
}
