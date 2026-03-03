import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  Deck,
  ApiListResponse,
  ApiResponse,
  CreateDeckDto,
  UpdateDeckDto,
  DeckStats,
} from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env?.NG_APP_API_URL ?? 'http://localhost:3000/api';

  getAll() {
    return this.http.get<ApiListResponse<Deck>>(`${this.apiUrl}/decks`);
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Deck>>(`${this.apiUrl}/decks/${id}`);
  }

  create(dto: CreateDeckDto) {
    return this.http.post<ApiResponse<Deck>>(`${this.apiUrl}/decks`, dto);
  }

  update(id: string, dto: UpdateDeckDto) {
    return this.http.put<ApiResponse<Deck>>(`${this.apiUrl}/decks/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/decks/${id}`);
  }

  getStats(id: string) {
    return this.http.get<ApiResponse<DeckStats>>(`${this.apiUrl}/decks/${id}/stats`);
  }
}
