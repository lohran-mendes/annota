import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Subject, ApiListResponse, ApiResponse, CreateSubjectDto, UpdateSubjectDto } from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env.NG_APP_API_URL ?? 'http://localhost:3000/api';

  getAll() {
    return this.http.get<ApiListResponse<Subject>>(`${this.apiUrl}/subjects`);
  }

  getByExam(examId: string) {
    return this.http.get<ApiListResponse<Subject>>(`${this.apiUrl}/exams/${examId}/subjects`);
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Subject>>(`${this.apiUrl}/subjects/${id}`);
  }

  create(dto: CreateSubjectDto) {
    return this.http.post<ApiResponse<Subject>>(`${this.apiUrl}/subjects`, dto);
  }

  update(id: string, dto: UpdateSubjectDto) {
    return this.http.put<ApiResponse<Subject>>(`${this.apiUrl}/subjects/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/subjects/${id}`);
  }
}
