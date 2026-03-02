import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Exam, ApiListResponse, ApiResponse, CreateExamDto, UpdateExamDto } from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env.NG_APP_API_URL ?? 'http://localhost:3000/api';

  getAll() {
    return this.http.get<ApiListResponse<Exam>>(`${this.apiUrl}/exams`);
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Exam>>(`${this.apiUrl}/exams/${id}`);
  }

  create(dto: CreateExamDto) {
    return this.http.post<ApiResponse<Exam>>(`${this.apiUrl}/exams`, dto);
  }

  update(id: string, dto: UpdateExamDto) {
    return this.http.put<ApiResponse<Exam>>(`${this.apiUrl}/exams/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/exams/${id}`);
  }
}
