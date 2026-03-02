// @annota/shared - Contratos da API (DTOs e tipos de request/response)
// Interfaces compartilhadas entre frontend (Angular) e backend (NestJS).
// No NestJS, os DTOs devem ser classes que implementam estas interfaces
// e adicionam decorators de validacao (class-validator).

import type { Alternative, MockExamConfig, SubjectProgress } from './index';

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
  examId: string;
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
// Mock Exam DTOs
// ============================================================

export interface CreateMockExamDto {
  examId: string;
  name: string;
  questionCount: number;
  duration: number;
}

export interface MockExamSession {
  config: MockExamConfig;
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
  mockExamId: string;
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
  statement: string;
  alternatives: Alternative[];
  selectedIndex: number;
  correctAnswerIndex: number;
  correct: boolean;
  explanation: string;
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
// Mock Exams:
//   GET    /api/mock-exams?examId=:examId       → ApiListResponse<MockExamConfig>  (examId optional)
//   POST   /api/mock-exams                      → ApiResponse<MockExamSession>
//   GET    /api/mock-exams/:id                  → ApiResponse<MockExamSession>
//   POST   /api/mock-exams/:id/submit           → ApiResponse<MockExamResult>
//   GET    /api/mock-exams/:id/result           → ApiResponse<MockExamResult>
