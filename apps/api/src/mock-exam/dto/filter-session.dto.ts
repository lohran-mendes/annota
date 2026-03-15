import { IsOptional, IsString, IsIn } from 'class-validator';

export class FilterSessionDto {
  @IsOptional()
  @IsString()
  mockExamId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['in_progress', 'completed'])
  status?: 'in_progress' | 'completed';
}
