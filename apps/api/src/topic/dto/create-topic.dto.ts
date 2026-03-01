import { IsString, IsNotEmpty } from 'class-validator';
import type { CreateTopicDto as ICreateTopicDto } from '@annota/shared';

export class CreateTopicDto implements ICreateTopicDto {
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
