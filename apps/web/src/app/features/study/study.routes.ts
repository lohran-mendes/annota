import { Routes } from '@angular/router';

export const studyRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./exam-selector/exam-selector').then((m) => m.ExamSelector),
  },
  {
    path: ':examId',
    loadComponent: () =>
      import('./study-dashboard/study-dashboard').then((m) => m.StudyDashboard),
  },
  {
    path: ':examId/:subjectId/:topicId',
    loadComponent: () =>
      import('./question-solver/question-solver').then((m) => m.QuestionSolver),
  },
];
