import { Routes } from '@angular/router';

export const mockExamRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./mock-exam-setup/mock-exam-setup').then((m) => m.MockExamSetup),
  },
  {
    path: ':sessionId',
    loadComponent: () =>
      import('./mock-exam-session/mock-exam-session').then(
        (m) => m.MockExamSession,
      ),
  },
  {
    path: ':sessionId/result',
    loadComponent: () =>
      import('./mock-exam-result/mock-exam-result').then(
        (m) => m.MockExamResult,
      ),
  },
];
