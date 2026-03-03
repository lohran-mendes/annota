import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  Flashcard,
  ApiListResponse,
  ApiResponse,
  CreateFlashcardDto,
  UpdateFlashcardDto,
  ReviewFlashcardDto,
  ReviewResult,
} from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class FlashcardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env?.NG_APP_API_URL ?? 'http://localhost:3000/api';

  getByDeck(deckId: string) {
    return this.http.get<ApiListResponse<Flashcard>>(
      `${this.apiUrl}/decks/${deckId}/flashcards`,
    );
  }

  getDueByDeck(deckId: string) {
    return this.http.get<ApiListResponse<Flashcard>>(
      `${this.apiUrl}/decks/${deckId}/flashcards/due`,
    );
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Flashcard>>(`${this.apiUrl}/flashcards/${id}`);
  }

  create(dto: CreateFlashcardDto) {
    return this.http.post<ApiResponse<Flashcard>>(`${this.apiUrl}/flashcards`, dto);
  }

  update(id: string, dto: UpdateFlashcardDto) {
    return this.http.put<ApiResponse<Flashcard>>(`${this.apiUrl}/flashcards/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/flashcards/${id}`);
  }

  review(id: string, dto: ReviewFlashcardDto) {
    return this.http.post<ApiResponse<ReviewResult>>(
      `${this.apiUrl}/flashcards/${id}/review`,
      dto,
    );
  }
}
