import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { UpdateQuestionDto as IUpdateQuestionDto } from '@annota/shared';
import { AlternativeDto } from './create-question.dto';

export class UpdateQuestionDto implements IUpdateQuestionDto {
  @IsString()
  @IsOptional()
  statement?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => AlternativeDto)
  @IsOptional()
  alternatives?: AlternativeDto[];

  @IsInt()
  @Min(0)
  @IsOptional()
  correctAnswerIndex?: number;

  @IsString()
  @IsOptional()
  explanation?: string;
}
