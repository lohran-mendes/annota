import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccessLog, AccessLogDocument } from './access-log.schema';
import { CreateAccessLogDto } from './dto/create-access-log.dto';

@Injectable()
export class AccessLogService {
  private readonly GRACE_PERIOD_DAYS = 4;

  constructor(
    @InjectModel(AccessLog.name)
    private accessLogModel: Model<AccessLogDocument>,
  ) {}

  async register(dto: CreateAccessLogDto): Promise<AccessLog> {
    const today = this.getTodayString();

    const existing = await this.accessLogModel
      .findOne({ accessDate: today, userId: dto.userId ?? null })
      .lean()
      .exec();

    if (existing) {
      return existing as unknown as AccessLog;
    }

    const log = new this.accessLogModel({
      accessDate: today,
      userId: dto.userId,
    });
    return log.save();
  }

  async getStreak(userId?: string): Promise<{
    currentStreak: number;
    lastAccessDate: string | null;
    gracePeriodDays: number;
  }> {
    const filter: any = { userId: userId ?? null };

    const logs = await this.accessLogModel
      .find(filter)
      .sort({ accessDate: -1 })
      .lean()
      .exec();

    if (logs.length === 0) {
      return {
        currentStreak: 0,
        lastAccessDate: null,
        gracePeriodDays: this.GRACE_PERIOD_DAYS,
      };
    }

    const today = this.getTodayString();
    const lastAccess = logs[0].accessDate;

    const daysSinceLastAccess = this.daysBetween(lastAccess, today);

    if (daysSinceLastAccess > this.GRACE_PERIOD_DAYS) {
      return {
        currentStreak: 0,
        lastAccessDate: lastAccess,
        gracePeriodDays: this.GRACE_PERIOD_DAYS,
      };
    }

    let streak = 1;
    for (let i = 0; i < logs.length - 1; i++) {
      const gap = this.daysBetween(logs[i + 1].accessDate, logs[i].accessDate);

      if (gap <= this.GRACE_PERIOD_DAYS) {
        streak++;
      } else {
        break;
      }
    }

    return {
      currentStreak: streak,
      lastAccessDate: lastAccess,
      gracePeriodDays: this.GRACE_PERIOD_DAYS,
    };
  }

  async findAll(userId?: string): Promise<AccessLog[]> {
    const filter: any = { userId: userId ?? null };
    return this.accessLogModel
      .find(filter)
      .sort({ accessDate: -1 })
      .lean()
      .exec() as unknown as AccessLog[];
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private daysBetween(dateA: string, dateB: string): number {
    const a = new Date(dateA).getTime();
    const b = new Date(dateB).getTime();
    return Math.round(Math.abs(b - a) / (1000 * 60 * 60 * 24));
  }
}
