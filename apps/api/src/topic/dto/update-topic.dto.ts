import { IsString, IsOptional } from 'class-validator';
import type { UpdateTopicDto as IUpdateTopicDto } from '@annota/shared';

export class UpdateTopicDto implements IUpdateTopicDto {
  @IsString()
  @IsOptional()
  name?: string;
}
