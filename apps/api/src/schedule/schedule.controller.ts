import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { SaveScheduleDto } from './dto/save-schedule.dto';
import { AdminSaveScheduleDto } from './dto/admin-save-schedule.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Schedules')
@ApiBearerAuth()
@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // ── Admin endpoints (must be before parameterized routes) ──────────────────

  @Get('admin/users')
  @ApiOperation({ summary: '[Admin] List all users with their schedules' })
  @ApiResponse({ status: 200, description: 'List of users with schedule summaries' })
  async listUsersWithSchedules() {
    const data = await this.scheduleService.listUsersWithSchedules();
    return { data };
  }

  @Get('admin/users/:userId/:examId')
  @ApiOperation({ summary: '[Admin] Get a specific user schedule' })
  @ApiParam({ name: 'userId', description: 'User ObjectId' })
  @ApiParam({ name: 'examId', description: 'Exam ObjectId' })
  @ApiResponse({ status: 200, description: 'Schedule found or null' })
  async getUserSchedule(
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Param('examId', ParseObjectIdPipe) examId: string,
  ) {
    const schedule = await this.scheduleService.findByExamForUser(examId, userId);
    return { data: schedule };
  }

  @Put('admin/users/:userId/:examId')
  @ApiOperation({ summary: '[Admin] Save or update a user schedule' })
  @ApiParam({ name: 'userId', description: 'User ObjectId' })
  @ApiParam({ name: 'examId', description: 'Exam ObjectId' })
  @ApiResponse({ status: 200, description: 'Schedule saved' })
  async saveUserSchedule(
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Param('examId', ParseObjectIdPipe) examId: string,
    @Body() dto: AdminSaveScheduleDto,
  ) {
    const schedule = await this.scheduleService.saveForUser(examId, userId, dto.weeks);
    return { data: schedule };
  }

  @Delete('admin/users/:userId/:examId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Delete a user schedule' })
  @ApiParam({ name: 'userId', description: 'User ObjectId' })
  @ApiParam({ name: 'examId', description: 'Exam ObjectId' })
  @ApiResponse({ status: 204, description: 'Schedule deleted' })
  async removeUserSchedule(
    @Param('userId', ParseObjectIdPipe) userId: string,
    @Param('examId', ParseObjectIdPipe) examId: string,
  ): Promise<void> {
    await this.scheduleService.removeForUser(examId, userId);
  }

  // ── Student endpoints ──────────────────────────────────────────────────────

  @Get(':examId')
  @ApiOperation({ summary: 'Get my custom schedule for an exam' })
  @ApiParam({ name: 'examId', description: 'Exam ObjectId' })
  @ApiResponse({ status: 200, description: 'Schedule found or null' })
  async findByExam(
    @Req() req: any,
    @Param('examId', ParseObjectIdPipe) examId: string,
  ) {
    const schedule = await this.scheduleService.findByExam(examId, req.user.sub);
    return { data: schedule };
  }

  @Put(':examId')
  @ApiOperation({ summary: 'Save or update my custom schedule for an exam' })
  @ApiParam({ name: 'examId', description: 'Exam ObjectId' })
  @ApiResponse({ status: 200, description: 'Schedule saved successfully' })
  async save(
    @Req() req: any,
    @Param('examId', ParseObjectIdPipe) examId: string,
    @Body() dto: SaveScheduleDto,
  ) {
    const schedule = await this.scheduleService.save(
      { ...dto, examId },
      req.user.sub,
    );
    return { data: schedule };
  }

  @Delete(':examId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete my custom schedule' })
  @ApiParam({ name: 'examId', description: 'Exam ObjectId' })
  @ApiResponse({ status: 204, description: 'Schedule deleted' })
  async remove(
    @Req() req: any,
    @Param('examId', ParseObjectIdPipe) examId: string,
  ): Promise<void> {
    await this.scheduleService.remove(examId, req.user.sub);
  }
}
