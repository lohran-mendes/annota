import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiResponse, SubmitAnswerDto, AnswerResult } from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class AnswerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env.NG_APP_API_URL ?? 'http://localhost:3000/api';

  submitAnswer(dto: SubmitAnswerDto) {
    return this.http.post<ApiResponse<AnswerResult>>(`${this.apiUrl}/answers`, dto);
  }
}
