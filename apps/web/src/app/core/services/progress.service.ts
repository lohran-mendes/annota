import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { UserProgress, ApiResponse, ExamProgress } from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env?.NG_APP_API_URL ?? 'http://localhost:3000/api';

  getGlobalProgress() {
    return this.http.get<ApiResponse<UserProgress>>(`${this.apiUrl}/progress`);
  }

  getExamProgress(examId: string) {
    return this.http.get<ApiResponse<ExamProgress>>(`${this.apiUrl}/progress/exams/${examId}`);
  }
}
