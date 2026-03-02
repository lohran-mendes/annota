import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Topic, ApiListResponse, ApiResponse, CreateTopicDto, UpdateTopicDto } from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env?.NG_APP_API_URL ?? 'http://localhost:3000/api';

  getAll() {
    return this.http.get<ApiListResponse<Topic>>(`${this.apiUrl}/topics`);
  }

  getBySubject(subjectId: string) {
    return this.http.get<ApiListResponse<Topic>>(`${this.apiUrl}/subjects/${subjectId}/topics`);
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Topic>>(`${this.apiUrl}/topics/${id}`);
  }

  create(dto: CreateTopicDto) {
    return this.http.post<ApiResponse<Topic>>(`${this.apiUrl}/topics`, dto);
  }

  update(id: string, dto: UpdateTopicDto) {
    return this.http.put<ApiResponse<Topic>>(`${this.apiUrl}/topics/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/topics/${id}`);
  }
}
