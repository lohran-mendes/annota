import { IsOptional, IsString } from 'class-validator';

export class FilterTopicDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;
}
