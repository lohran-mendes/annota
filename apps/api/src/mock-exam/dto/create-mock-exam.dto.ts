import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import type { CreateMockExamDto as ICreateMockExamDto } from '@annota/shared';

export class CreateMockExamDto implements ICreateMockExamDto {
  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  questionIds: string[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
