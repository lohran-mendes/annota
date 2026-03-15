import { IsOptional, IsString } from 'class-validator';

export class FilterMockExamDto {
  @IsOptional()
  @IsString()
  examId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
