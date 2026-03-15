import {
  IsArray,
  IsInt,
  IsString,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { SubmitMockExamDto as ISubmitMockExamDto } from '@annota/shared';

class MockExamAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsInt()
  @Min(0)
  selectedIndex: number;
}

export class SubmitMockExamDto implements ISubmitMockExamDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MockExamAnswerDto)
  answers: MockExamAnswerDto[];

  @IsInt()
  @Min(0)
  timeSpent: number;
}
