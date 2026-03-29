import {
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { AdminSaveScheduleDto as IAdminSaveScheduleDto } from '@annota/shared';

class ScheduleActivityDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsIn(['study', 'review', 'practice', 'mock-exam'])
  type: 'study' | 'review' | 'practice' | 'mock-exam';

  @IsInt()
  @Min(5)
  @Max(480)
  duration: number;
}

class ScheduleDayDto {
  @IsString()
  @IsNotEmpty()
  dayOfWeek: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleActivityDto)
  activities: ScheduleActivityDto[];
}

class ScheduleWeekDto {
  @IsInt()
  @Min(1)
  weekNumber: number;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDayDto)
  days: ScheduleDayDto[];
}

export class AdminSaveScheduleDto implements IAdminSaveScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleWeekDto)
  weeks: ScheduleWeekDto[];
}
