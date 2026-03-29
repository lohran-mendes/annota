// @annota/shared - Tipos e interfaces compartilhados entre frontend e backend

export type {
  ApiResponse,
  ApiListResponse,
  ApiErrorResponse,
  CreateExamDto,
  UpdateExamDto,
  LinkQuestionsDto,
  CreateSubjectDto,
  UpdateSubjectDto,
  CreateTopicDto,
  UpdateTopicDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  SubmitAnswerDto,
  AnswerResult,
  ExamProgress,
  TopicProgress,
  CreateMockExamDto,
  UpdateMockExamDto,
  StartMockExamSessionDto,
  MockExamSessionData,
  MockExamQuestion,
  SubmitMockExamDto,
  MockExamAnswer,
  MockExamResult,
  MockExamSubjectResult,
  MockExamQuestionResult,
  MockExamSessionAdmin,
  MockExamSessionStats,
  CreateDeckDto,
  UpdateDeckDto,
  CreateFlashcardDto,
  UpdateFlashcardDto,
  ReviewFlashcardDto,
  ReviewResult,
  PredictedIntervals,
  DeckStats,
  CreateAccessLogDto,
  AccessLogStreak,
  LoginDto,
  AuthResponse,
  SaveScheduleDto,
  AdminSaveScheduleDto,
} from './api-contracts';

export interface Exam {
  id: string;
  name: string;
  description: string;
  year: number;
  institution: string;
  questionIds: string[];
  questionCount: number;
  subjectCount: number;
  duration: number;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  questionCount: number;
  completedCount: number;
  color: string;
}

export interface ExamSubject {
  id: string;
  name: string;
  icon: string;
  color: string;
  questionCount: number;
  topics: ExamTopic[];
}

export interface ExamTopic {
  id: string;
  name: string;
  questionCount: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  questionCount: number;
  completedCount: number;
}

export interface Alternative {
  label: string;
  text: string;
}

export interface Question {
  id: string;
  topicId: string;
  subjectId: string;
  statement: string;
  alternatives: Alternative[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface UserProgress {
  totalAnswered: number;
  totalCorrect: number;
  streak: number;
  bySubject: SubjectProgress[];
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  answered: number;
  correct: number;
  color: string;
}

export interface MockExam {
  id: string;
  examId: string;
  name: string;
  description: string;
  questionIds: string[];
  questionCount: number;
  duration: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MockExamSessionConfig {
  id: string;
  mockExamId: string;
  mockExamName: string;
  questionCount: number;
  duration: number;
  status: 'in_progress' | 'completed';
  score?: number;
  timeSpent?: number;
  completedAt?: string;
  createdAt?: string;
}

// === Schedule ===

export interface ScheduleActivity {
  subject: string;
  description: string;
  type: 'study' | 'review' | 'practice' | 'mock-exam';
  duration: number;
}

export interface ScheduleDay {
  dayOfWeek: string;
  activities: ScheduleActivity[];
}

export interface ScheduleWeek {
  weekNumber: number;
  label: string;
  days: ScheduleDay[];
}

export interface Schedule {
  id: string;
  examId: string;
  userId?: string;
  weeks: ScheduleWeek[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserScheduleSummary {
  userId: string;
  userName: string;
  userEmail: string;
  schedules: {
    id: string;
    examId: string;
    examName: string;
    weekCount: number;
    updatedAt?: string;
  }[];
}

// === User ===

export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

// === Access Log ===

export interface AccessLog {
  id: string;
  userId?: string;
  accessDate: string;
  createdAt?: string;
}

// === Flashcard / Deck ===

export type FlashcardRating = 1 | 2 | 3 | 4;

export interface Deck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  dueCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}
