import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiResponse, AccessLogStreak } from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class AccessLogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env?.NG_APP_API_URL ?? 'http://localhost:3000/api';

  registerAccess() {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/access-logs`, {});
  }

  getStreak() {
    return this.http.get<ApiResponse<AccessLogStreak>>(`${this.apiUrl}/access-logs/streak`);
  }
}
