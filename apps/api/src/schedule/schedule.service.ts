import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from './schedule.schema';
import { User, UserDocument } from '../auth/user.schema';
import { Exam, ExamDocument } from '../exam/exam.schema';
import { SaveScheduleDto } from './dto/save-schedule.dto';
import type { UserScheduleSummary, ScheduleWeek } from '@annota/shared';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name)
    private scheduleModel: Model<ScheduleDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Exam.name)
    private examModel: Model<ExamDocument>,
  ) {}

  // ── Student endpoints ──────────────────────────────────────────────────────

  async findByExam(examId: string, userId: string): Promise<Schedule | null> {
    return this.scheduleModel.findOne({ examId, userId }).exec();
  }

  async save(dto: SaveScheduleDto, userId: string): Promise<Schedule> {
    const schedule = await this.scheduleModel.findOneAndUpdate(
      { examId: dto.examId, userId },
      { examId: dto.examId, userId, weeks: dto.weeks },
      { returnDocument: 'after', upsert: true },
    ).exec();
    return schedule!;
  }

  async remove(examId: string, userId: string): Promise<void> {
    await this.scheduleModel.deleteOne({ examId, userId }).exec();
  }

  // ── Admin endpoints ────────────────────────────────────────────────────────

  async listUsersWithSchedules(): Promise<UserScheduleSummary[]> {
    const schedules = await this.scheduleModel.find().lean().exec();

    if (schedules.length === 0) return [];

    const userIds = [...new Set(schedules.map((s) => s.userId?.toString()).filter(Boolean))];
    const examIds = [...new Set(schedules.map((s) => s.examId?.toString()).filter(Boolean))];

    const [users, exams] = await Promise.all([
      this.userModel.find({ _id: { $in: userIds } }).lean().exec(),
      this.examModel.find({ _id: { $in: examIds } }).lean().exec(),
    ]);

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    const examMap = new Map(exams.map((e) => [e._id.toString(), e]));

    const grouped = new Map<string, UserScheduleSummary>();

    for (const schedule of schedules) {
      const uid = schedule.userId?.toString();
      if (!uid) continue;

      const user = userMap.get(uid);
      if (!user) continue;

      if (!grouped.has(uid)) {
        grouped.set(uid, {
          userId: uid,
          userName: user.name,
          userEmail: user.email,
          schedules: [],
        });
      }

      const exam = examMap.get(schedule.examId?.toString());
      grouped.get(uid)!.schedules.push({
        id: (schedule as any)._id.toString(),
        examId: schedule.examId?.toString(),
        examName: exam?.name ?? 'Prova removida',
        weekCount: schedule.weeks?.length ?? 0,
        updatedAt: (schedule as any).updatedAt?.toISOString(),
      });
    }

    return Array.from(grouped.values());
  }

  async findByExamForUser(examId: string, userId: string): Promise<Schedule | null> {
    return this.scheduleModel.findOne({ examId, userId }).exec();
  }

  async saveForUser(examId: string, userId: string, weeks: ScheduleWeek[]): Promise<Schedule> {
    const schedule = await this.scheduleModel.findOneAndUpdate(
      { examId, userId },
      { examId, userId, weeks },
      { returnDocument: 'after', upsert: true },
    ).exec();
    return schedule!;
  }

  async removeForUser(examId: string, userId: string): Promise<void> {
    await this.scheduleModel.deleteOne({ examId, userId }).exec();
  }
}
