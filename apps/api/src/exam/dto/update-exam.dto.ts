import { IsString, IsOptional, IsInt, Min } from 'class-validator';
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
}
