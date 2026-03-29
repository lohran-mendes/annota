import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Schedule, ScheduleSchema } from './schedule.schema';
import { User, UserSchema } from '../auth/user.schema';
import { Exam, ExamSchema } from '../exam/exam.schema';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
      { name: User.name, schema: UserSchema },
      { name: Exam.name, schema: ExamSchema },
    ]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
