import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AccessLogService } from './access-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('access-logs')
@UseGuards(JwtAuthGuard)
export class AccessLogController {
  constructor(private readonly accessLogService: AccessLogService) {}

  @Post()
  async register(@Req() req: any) {
    const log = await this.accessLogService.register({ userId: req.user.sub });
    return { data: log };
  }

  @Get('streak')
  async getStreak(@Req() req: any) {
    const streak = await this.accessLogService.getStreak(req.user.sub);
    return { data: streak };
  }

  @Get()
  async findAll(@Req() req: any) {
    const logs = await this.accessLogService.findAll(req.user.sub);
    return { data: logs, total: logs.length };
  }
}
