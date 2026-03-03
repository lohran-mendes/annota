import { IsString, IsOptional } from 'class-validator';
import type { UpdateDeckDto as IUpdateDeckDto } from '@annota/shared';

export class UpdateDeckDto implements IUpdateDeckDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
