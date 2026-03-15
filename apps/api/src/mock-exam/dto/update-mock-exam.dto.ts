import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateMockExamDto } from './create-mock-exam.dto';

export class UpdateMockExamDto extends PartialType(
  OmitType(CreateMockExamDto, ['examId'] as const),
) {}
