import { IsString, IsOptional } from 'class-validator';
import type { UpdateSubjectDto as IUpdateSubjectDto } from '@annota/shared';

export class UpdateSubjectDto implements IUpdateSubjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
