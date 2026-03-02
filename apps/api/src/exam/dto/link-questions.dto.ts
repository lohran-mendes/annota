import { IsArray, IsString, ArrayMinSize } from 'class-validator';
import type { LinkQuestionsDto as ILinkQuestionsDto } from '@annota/shared';

export class LinkQuestionsDto implements ILinkQuestionsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  questionIds: string[];
}
