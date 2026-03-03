import { Routes } from '@angular/router';

export const flashcardsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./deck-list/deck-list').then((m) => m.DeckList),
  },
  {
    path: ':deckId',
    loadComponent: () => import('./deck-detail/deck-detail').then((m) => m.DeckDetail),
  },
  {
    path: ':deckId/review',
    loadComponent: () => import('./review-session/review-session').then((m) => m.ReviewSession),
  },
];
