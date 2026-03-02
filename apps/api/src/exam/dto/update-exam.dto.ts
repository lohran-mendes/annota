import { IsString, IsOptional, IsInt, Min, IsArray } from 'class-validator';
import type { UpdateExamDto as IUpdateExamDto } from '@annota/shared';

export class UpdateExamDto implements IUpdateExamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(2000)
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  institution?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  questionIds?: string[];
}
