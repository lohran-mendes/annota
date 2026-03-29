import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  Schedule,
  UserScheduleSummary,
  ApiResponse,
  SaveScheduleDto,
  AdminSaveScheduleDto,
  ScheduleWeek,
} from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env?.NG_APP_API_URL ?? 'http://localhost:3000/api';

  // ── Student ────────────────────────────────────────────────────────────────

  getByExam(examId: string) {
    return this.http.get<ApiResponse<Schedule | null>>(`${this.apiUrl}/schedules/${examId}`);
  }

  save(dto: SaveScheduleDto) {
    return this.http.put<ApiResponse<Schedule>>(`${this.apiUrl}/schedules/${dto.examId}`, dto);
  }

  delete(examId: string) {
    return this.http.delete<void>(`${this.apiUrl}/schedules/${examId}`);
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  adminListUsers() {
    return this.http.get<ApiResponse<UserScheduleSummary[]>>(
      `${this.apiUrl}/schedules/admin/users`,
    );
  }

  adminGetSchedule(userId: string, examId: string) {
    return this.http.get<ApiResponse<Schedule | null>>(
      `${this.apiUrl}/schedules/admin/users/${userId}/${examId}`,
    );
  }

  adminSaveSchedule(userId: string, examId: string, weeks: ScheduleWeek[]) {
    const dto: AdminSaveScheduleDto = { weeks };
    return this.http.put<ApiResponse<Schedule>>(
      `${this.apiUrl}/schedules/admin/users/${userId}/${examId}`,
      dto,
    );
  }

  adminDeleteSchedule(userId: string, examId: string) {
    return this.http.delete<void>(
      `${this.apiUrl}/schedules/admin/users/${userId}/${examId}`,
    );
  }
}
