import { Routes } from '@angular/router';

export const scheduleRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./schedule-dashboard/schedule-dashboard').then(
        (m) => m.ScheduleDashboard,
      ),
  },
];
