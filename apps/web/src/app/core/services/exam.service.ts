import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  Exam,
  Question,
  ExamSubject,
  ApiListResponse,
  ApiResponse,
  CreateExamDto,
  UpdateExamDto,
  LinkQuestionsDto,
} from '@annota/shared';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = import.meta.env?.NG_APP_API_URL ?? 'http://localhost:3000/api';

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

  linkQuestions(examId: string, dto: LinkQuestionsDto) {
    return this.http.post<ApiResponse<Exam>>(
      `${this.apiUrl}/exams/${examId}/questions/link`,
      dto,
    );
  }

  unlinkQuestions(examId: string, dto: LinkQuestionsDto) {
    return this.http.post<ApiResponse<Exam>>(
      `${this.apiUrl}/exams/${examId}/questions/unlink`,
      dto,
    );
  }

  getExamQuestions(examId: string) {
    return this.http.get<ApiListResponse<Question>>(
      `${this.apiUrl}/exams/${examId}/questions`,
    );
  }

  getExamSubjects(examId: string) {
    return this.http.get<ApiListResponse<ExamSubject>>(
      `${this.apiUrl}/exams/${examId}/subjects`,
    );
  }
}
