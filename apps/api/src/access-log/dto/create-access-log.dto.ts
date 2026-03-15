import { IsOptional, IsString } from 'class-validator';
import type { CreateAccessLogDto as ICreateAccessLogDto } from '@annota/shared';

export class CreateAccessLogDto implements ICreateAccessLogDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
