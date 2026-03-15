import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AccessLogService } from './access-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Access Logs')
@ApiBearerAuth()
@Controller('access-logs')
@UseGuards(JwtAuthGuard)
export class AccessLogController {
  constructor(private readonly accessLogService: AccessLogService) {}

  @Post()
  @ApiOperation({ summary: 'Register an access log entry for the current day' })
  @ApiResponse({ status: 201, description: 'Access log registered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async register(@Req() req: any) {
    const log = await this.accessLogService.register({ userId: req.user.sub });
    return { data: log };
  }

  @Get('streak')
  @ApiOperation({ summary: 'Get the current study streak' })
  @ApiResponse({ status: 200, description: 'Streak data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStreak(@Req() req: any) {
    const streak = await this.accessLogService.getStreak(req.user.sub);
    return { data: streak };
  }

  @Get()
  @ApiOperation({ summary: 'Get all access log entries for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of access logs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Req() req: any) {
    const logs = await this.accessLogService.findAll(req.user.sub);
    return { data: logs, total: logs.length };
  }
}
