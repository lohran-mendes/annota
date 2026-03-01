import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/user-shell/user-shell').then((m) => m.UserShell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'study',
        loadChildren: () =>
          import('./features/study/study.routes').then((m) => m.studyRoutes),
      },
      {
        path: 'progress',
        loadChildren: () =>
          import('./features/progress/progress.routes').then(
            (m) => m.progressRoutes,
          ),
      },
      {
        path: 'mock-exam',
        loadChildren: () =>
          import('./features/mock-exam/mock-exam.routes').then(
            (m) => m.mockExamRoutes,
          ),
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./layout/admin-shell/admin-shell').then((m) => m.AdminShell),
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found').then(
        (m) => m.NotFound,
      ),
  },
];
