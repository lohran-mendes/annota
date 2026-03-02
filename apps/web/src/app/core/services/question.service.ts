import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Question, ApiListResponse, ApiResponse, CreateQuestionDto, UpdateQuestionDto } from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env.NG_APP_API_URL ?? 'http://localhost:3000/api';

  getAll() {
    return this.http.get<ApiListResponse<Question>>(`${this.apiUrl}/questions`);
  }

  getByTopic(topicId: string) {
    return this.http.get<ApiListResponse<Question>>(`${this.apiUrl}/topics/${topicId}/questions`);
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Question>>(`${this.apiUrl}/questions/${id}`);
  }

  create(dto: CreateQuestionDto) {
    return this.http.post<ApiResponse<Question>>(`${this.apiUrl}/questions`, dto);
  }

  update(id: string, dto: UpdateQuestionDto) {
    return this.http.put<ApiResponse<Question>>(`${this.apiUrl}/questions/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/questions/${id}`);
  }
}
