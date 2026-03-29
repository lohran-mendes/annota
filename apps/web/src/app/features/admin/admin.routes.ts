import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard').then(
        (m) => m.AdminDashboard,
      ),
  },
  {
    path: 'exams',
    loadComponent: () =>
      import('./exam-management/exam-management').then(
        (m) => m.ExamManagement,
      ),
  },
  {
    path: 'subjects',
    loadComponent: () =>
      import('./subject-management/subject-management').then(
        (m) => m.SubjectManagement,
      ),
  },
  {
    path: 'topics',
    loadComponent: () =>
      import('./topic-management/topic-management').then(
        (m) => m.TopicManagement,
      ),
  },
  {
    path: 'questions',
    loadComponent: () =>
      import('./question-management/question-management').then(
        (m) => m.QuestionManagement,
      ),
  },
  {
    path: 'mock-exams',
    loadComponent: () =>
      import('./mock-exam-management/mock-exam-management').then(
        (m) => m.MockExamManagement,
      ),
  },
  {
    path: 'schedules',
    loadComponent: () =>
      import('./schedule-management/schedule-management').then(
        (m) => m.ScheduleManagement,
      ),
  },
];
