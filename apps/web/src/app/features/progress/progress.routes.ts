import { Routes } from '@angular/router';

export const progressRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./progress-dashboard/progress-dashboard').then(
        (m) => m.ProgressDashboard,
      ),
  },
];
