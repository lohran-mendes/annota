// @annota/shared - Contratos da API (DTOs e tipos de request/response)
// Interfaces compartilhadas entre frontend (Angular) e backend (NestJS).
// No NestJS, os DTOs devem ser classes que implementam estas interfaces
// e adicionam decorators de validacao (class-validator).

import type { Alternative, MockExamSessionConfig, ScheduleWeek, SubjectProgress } from './index';

// ============================================================
// API Response Wrapper
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

// ============================================================
// Exam DTOs
// ============================================================

export interface CreateExamDto {
  name: string;
  description: string;
  year: number;
  institution: string;
  duration: number;
  questionIds?: string[];
}

export interface UpdateExamDto {
  name?: string;
  description?: string;
  year?: number;
  institution?: string;
  duration?: number;
  questionIds?: string[];
}

export interface LinkQuestionsDto {
  questionIds: string[];
}

// ============================================================
// Subject DTOs
// ============================================================

export interface CreateSubjectDto {
  name: string;
  icon: string;
  color: string;
}

export interface UpdateSubjectDto {
  name?: string;
  icon?: string;
  color?: string;
}

// ============================================================
// Topic DTOs
// ============================================================

export interface CreateTopicDto {
  subjectId: string;
  name: string;
}

export interface UpdateTopicDto {
  name?: string;
}

// ============================================================
// Question DTOs
// ============================================================

export interface CreateQuestionDto {
  topicId: string;
  subjectId: string;
  statement: string;
  alternatives: Alternative[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface UpdateQuestionDto {
  statement?: string;
  alternatives?: Alternative[];
  correctAnswerIndex?: number;
  explanation?: string;
}

// ============================================================
// Answer Submission (usuario responde questao)
// ============================================================

export interface SubmitAnswerDto {
  questionId: string;
  selectedIndex: number;
  examId?: string;
}

export interface AnswerResult {
  correct: boolean;
  correctAnswerIndex: number;
  explanation: string;
  streak: number;
}

// ============================================================
// Progress
// ============================================================

export interface ExamProgress {
  examId: string;
  totalAnswered: number;
  totalCorrect: number;
  streak: number;
  bySubject: SubjectProgress[];
  byTopic: TopicProgress[];
}

export interface TopicProgress {
  topicId: string;
  topicName: string;
  subjectId: string;
  answered: number;
  correct: number;
}

// ============================================================
// Mock Exam DTOs (Admin - template management)
// ============================================================

export interface CreateMockExamDto {
  examId: string;
  name: string;
  description?: string;
  duration: number;
  questionIds: string[];
  published?: boolean;
}

export interface UpdateMockExamDto {
  name?: string;
  description?: string;
  duration?: number;
  questionIds?: string[];
  published?: boolean;
}

// ============================================================
// Mock Exam Session DTOs (Student - taking exams)
// ============================================================

export interface StartMockExamSessionDto {
  mockExamId: string;
}

export interface MockExamSessionData {
  config: MockExamSessionConfig;
  questions: MockExamQuestion[];
}

export interface MockExamQuestion {
  id: string;
  topicId: string;
  subjectId: string;
  statement: string;
  alternatives: Alternative[];
}

export interface SubmitMockExamDto {
  answers: MockExamAnswer[];
  timeSpent: number;
}

export interface MockExamAnswer {
  questionId: string;
  selectedIndex: number;
}

export interface MockExamResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  timeSpent: number;
  bySubject: MockExamSubjectResult[];
  details: MockExamQuestionResult[];
}

export interface MockExamSubjectResult {
  subjectId: string;
  subjectName: string;
  total: number;
  correct: number;
  color: string;
}

export interface MockExamQuestionResult {
  questionId: string;
  subjectId: string;
  subjectName: string;
  statement: string;
  alternatives: Alternative[];
  selectedIndex: number;
  correctAnswerIndex: number;
  correct: boolean;
  explanation: string;
}

// ============================================================
// Mock Exam Session Admin types
// ============================================================

export interface MockExamSessionAdmin {
  id: string;
  mockExamId: string;
  mockExamName: string;
  status: 'in_progress' | 'completed';
  score?: number;
  timeSpent?: number;
  completedAt?: string;
  createdAt?: string;
}

export interface MockExamSessionStats {
  total: number;
  completed: number;
  inProgress: number;
  averageScore: number;
  averageTimeSpent: number;
}

// ============================================================
// Deck DTOs
// ============================================================

export interface CreateDeckDto {
  name: string;
  description?: string;
}

export interface UpdateDeckDto {
  name?: string;
  description?: string;
}

// ============================================================
// Flashcard DTOs
// ============================================================

export interface CreateFlashcardDto {
  deckId: string;
  front: string;
  back: string;
}

export interface UpdateFlashcardDto {
  front?: string;
  back?: string;
}

export interface ReviewFlashcardDto {
  rating: 1 | 2 | 3 | 4;
}

export interface ReviewResult {
  flashcardId: string;
  nextReviewDate: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface PredictedIntervals {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

export interface DeckStats {
  deckId: string;
  totalCards: number;
  dueCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
}

// ============================================================
// Schedule DTOs
// ============================================================

export interface SaveScheduleDto {
  examId: string;
  weeks: ScheduleWeek[];
}

export interface AdminSaveScheduleDto {
  weeks: ScheduleWeek[];
}

// ============================================================
// Auth DTOs
// ============================================================

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'student';
  };
}

// ============================================================
// Access Log DTOs
// ============================================================

export interface CreateAccessLogDto {
  userId?: string;
}

export interface AccessLogStreak {
  currentStreak: number;
  lastAccessDate: string | null;
  gracePeriodDays: number;
}

// ============================================================
// API Endpoints Reference
// ============================================================
//
// Exams:
//   GET    /api/exams                          → ApiListResponse<Exam>
//   GET    /api/exams/:id                      → ApiResponse<Exam>
//   POST   /api/exams                          → ApiResponse<Exam>
//   PUT    /api/exams/:id                      → ApiResponse<Exam>
//   DELETE /api/exams/:id                      → 204
//   POST   /api/exams/:examId/questions/link   → ApiResponse<Exam>
//   POST   /api/exams/:examId/questions/unlink → ApiResponse<Exam>
//   GET    /api/exams/:examId/questions        → ApiListResponse<Question>
//   GET    /api/exams/:examId/subjects         → ApiListResponse<ExamSubject>
//
// Subjects:
//   GET    /api/subjects                       → ApiListResponse<Subject>
//   GET    /api/subjects/:id                   → ApiResponse<Subject>
//   POST   /api/subjects                       → ApiResponse<Subject>
//   PUT    /api/subjects/:id                   → ApiResponse<Subject>
//   DELETE /api/subjects/:id                   → 204
//
// Topics:
//   GET    /api/subjects/:subjectId/topics     → ApiListResponse<Topic>
//   GET    /api/topics/:id                     → ApiResponse<Topic>
//   POST   /api/topics                         → ApiResponse<Topic>
//   PUT    /api/topics/:id                     → ApiResponse<Topic>
//   DELETE /api/topics/:id                     → 204
//
// Questions:
//   GET    /api/topics/:topicId/questions       → ApiListResponse<Question>
//   GET    /api/questions/:id                   → ApiResponse<Question>
//   POST   /api/questions                       → ApiResponse<Question>
//   PUT    /api/questions/:id                   → ApiResponse<Question>
//   DELETE /api/questions/:id                   → 204
//
// Answers:
//   POST   /api/answers                         → ApiResponse<AnswerResult>
//
// Progress:
//   GET    /api/progress                        → ApiResponse<UserProgress>
//   GET    /api/progress/exams/:examId          → ApiResponse<ExamProgress>
//
// Mock Exams (Admin):
//   GET    /api/mock-exams                      → ApiListResponse<MockExam>
//   POST   /api/mock-exams                      → ApiResponse<MockExam>
//   GET    /api/mock-exams/:id                  → ApiResponse<MockExam>
//   PUT    /api/mock-exams/:id                  → ApiResponse<MockExam>
//   DELETE /api/mock-exams/:id                  → 204
//
// Mock Exam Sessions (Student):
//   GET    /api/mock-exam-sessions              → ApiListResponse<MockExamSessionConfig>
//   POST   /api/mock-exam-sessions              → ApiResponse<MockExamSessionData>
//   GET    /api/mock-exam-sessions/:id          → ApiResponse<MockExamSessionData>
//   POST   /api/mock-exam-sessions/:id/submit   → ApiResponse<MockExamResult>
//   GET    /api/mock-exam-sessions/:id/result   → ApiResponse<MockExamResult>
//
// Mock Exam Sessions (Admin):
//   GET    /api/mock-exam-sessions/admin/all    → ApiListResponse<MockExamSessionAdmin>
//   GET    /api/mock-exam-sessions/admin/stats  → ApiResponse<MockExamSessionStats>
//   DELETE /api/mock-exam-sessions/admin/:id    → 204
//
// Decks:
//   GET    /api/decks                             → ApiListResponse<Deck>
//   GET    /api/decks/:id                         → ApiResponse<Deck>
//   POST   /api/decks                             → ApiResponse<Deck>
//   PUT    /api/decks/:id                         → ApiResponse<Deck>
//   DELETE /api/decks/:id                         → 204
//   GET    /api/decks/:id/stats                   → ApiResponse<DeckStats>
//
// Flashcards:
//   GET    /api/decks/:deckId/flashcards           → ApiListResponse<Flashcard>
//   GET    /api/decks/:deckId/flashcards/due       → ApiListResponse<Flashcard>
//   GET    /api/flashcards/:id                     → ApiResponse<Flashcard>
//   POST   /api/flashcards                         → ApiResponse<Flashcard>
//   PUT    /api/flashcards/:id                     → ApiResponse<Flashcard>
//   DELETE /api/flashcards/:id                     → 204
//   POST   /api/flashcards/:id/review              → ApiResponse<ReviewResult>
//
// Schedules (Student - requires auth):
//   GET    /api/schedules/:examId                → ApiResponse<Schedule>
//   PUT    /api/schedules/:examId                → ApiResponse<Schedule>
//   DELETE /api/schedules/:examId                → 204
//
// Schedules (Admin):
//   GET    /api/schedules/admin/users             → ApiResponse<UserScheduleSummary[]>
//   GET    /api/schedules/admin/users/:userId/:examId → ApiResponse<Schedule>
//   PUT    /api/schedules/admin/users/:userId/:examId → ApiResponse<Schedule>
//   DELETE /api/schedules/admin/users/:userId/:examId → 204
//
// Access Logs:
//   POST   /api/access-logs                          → ApiResponse<AccessLog>
//   GET    /api/access-logs/streak                   → ApiResponse<AccessLogStreak>
//   GET    /api/access-logs                          → ApiListResponse<AccessLog>
//
// Auth:
//   POST   /api/auth/register                        → ApiResponse<AuthResponse>
//   POST   /api/auth/login                           → ApiResponse<AuthResponse>
//   GET    /api/auth/me                              → ApiResponse<User>
