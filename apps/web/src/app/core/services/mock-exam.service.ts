import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  MockExamConfig,
  ApiListResponse,
  ApiResponse,
  CreateMockExamDto,
  MockExamSession,
  SubmitMockExamDto,
  MockExamResult,
} from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class MockExamService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env?.NG_APP_API_URL ?? 'http://localhost:3000/api';

  getAll() {
    return this.http.get<ApiListResponse<MockExamConfig>>(`${this.apiUrl}/mock-exams`);
  }

  getByExam(examId: string) {
    return this.http.get<ApiListResponse<MockExamConfig>>(`${this.apiUrl}/mock-exams`, {
      params: { examId },
    });
  }

  create(dto: CreateMockExamDto) {
    return this.http.post<ApiResponse<MockExamSession>>(`${this.apiUrl}/mock-exams`, dto);
  }

  getById(id: string) {
    return this.http.get<ApiResponse<MockExamSession>>(`${this.apiUrl}/mock-exams/${id}`);
  }

  submit(id: string, dto: SubmitMockExamDto) {
    return this.http.post<ApiResponse<MockExamResult>>(`${this.apiUrl}/mock-exams/${id}/submit`, dto);
  }

  getResult(id: string) {
    return this.http.get<ApiResponse<MockExamResult>>(`${this.apiUrl}/mock-exams/${id}/result`);
  }
}
