import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import type { CreateDeckDto as ICreateDeckDto } from '@annota/shared';

export class CreateDeckDto implements ICreateDeckDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
