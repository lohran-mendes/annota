import { IsString, IsNotEmpty } from 'class-validator';
import type { StartMockExamSessionDto as IStartMockExamSessionDto } from '@annota/shared';

export class StartSessionDto implements IStartMockExamSessionDto {
  @IsString()
  @IsNotEmpty()
  mockExamId: string;
}
