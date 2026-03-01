// @annota/shared - Tipos e interfaces compartilhados entre frontend e backend

export interface Exam {
  id: string;
  name: string;
  description: string;
  year: number;
  institution: string;
  questionCount: number;
  subjectCount: number;
}

export interface Subject {
  id: string;
  examId: string;
  name: string;
  icon: string;
  questionCount: number;
  completedCount: number;
  color: string;
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

export interface MockExamConfig {
  id: string;
  examId: string;
  name: string;
  questionCount: number;
  duration: number;
  status: 'available' | 'in_progress' | 'completed';
  score?: number;
  completedAt?: string;
}
