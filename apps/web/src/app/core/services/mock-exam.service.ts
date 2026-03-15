import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  MockExam,
  MockExamSessionConfig,
  ApiListResponse,
  ApiResponse,
  CreateMockExamDto,
  UpdateMockExamDto,
  MockExamSessionData,
  SubmitMockExamDto,
  MockExamResult,
} from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class MockExamService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env?.NG_APP_API_URL ?? 'http://localhost:3000/api';

  // Admin methods — mock exam templates

  getAll(params?: { examId?: string; published?: string }) {
    return this.http.get<ApiListResponse<MockExam>>(`${this.apiUrl}/mock-exams`, { params });
  }

  getById(id: string) {
    return this.http.get<ApiResponse<MockExam>>(`${this.apiUrl}/mock-exams/${id}`);
  }

  create(dto: CreateMockExamDto) {
    return this.http.post<ApiResponse<MockExam>>(`${this.apiUrl}/mock-exams`, dto);
  }

  update(id: string, dto: UpdateMockExamDto) {
    return this.http.put<ApiResponse<MockExam>>(`${this.apiUrl}/mock-exams/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/mock-exams/${id}`);
  }

  // Session methods — student taking exams

  getSessions(mockExamId?: string) {
    const params: Record<string, string> = {};
    if (mockExamId) params['mockExamId'] = mockExamId;
    return this.http.get<ApiListResponse<MockExamSessionConfig>>(`${this.apiUrl}/mock-exam-sessions`, { params });
  }

  startSession(mockExamId: string) {
    return this.http.post<ApiResponse<MockExamSessionData>>(`${this.apiUrl}/mock-exam-sessions`, { mockExamId });
  }

  getSession(sessionId: string) {
    return this.http.get<ApiResponse<MockExamSessionData>>(`${this.apiUrl}/mock-exam-sessions/${sessionId}`);
  }

  submitSession(sessionId: string, dto: SubmitMockExamDto) {
    return this.http.post<ApiResponse<MockExamResult>>(`${this.apiUrl}/mock-exam-sessions/${sessionId}/submit`, dto);
  }

  getSessionResult(sessionId: string) {
    return this.http.get<ApiResponse<MockExamResult>>(`${this.apiUrl}/mock-exam-sessions/${sessionId}/result`);
  }
}
