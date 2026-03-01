import { IsString, IsNotEmpty } from 'class-validator';
import type { CreateSubjectDto as ICreateSubjectDto } from '@annota/shared';

export class CreateSubjectDto implements ICreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsNotEmpty()
  color: string;
}
