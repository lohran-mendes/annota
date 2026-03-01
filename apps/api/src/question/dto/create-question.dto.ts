import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { CreateQuestionDto as ICreateQuestionDto } from '@annota/shared';

export class AlternativeDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}

export class CreateQuestionDto implements ICreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  topicId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  statement: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => AlternativeDto)
  alternatives: AlternativeDto[];

  @IsInt()
  @Min(0)
  correctAnswerIndex: number;

  @IsString()
  @IsNotEmpty()
  explanation: string;
}
