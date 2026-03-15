import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProgressService } from '../../../core/services/progress.service';
import type { UserProgress } from '@annota/shared';

const EMPTY_PROGRESS: UserProgress = {
  totalAnswered: 0,
  totalCorrect: 0,
  streak: 0,
  bySubject: [],
};

@Component({
  selector: 'annota-progress-dashboard',
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './progress-dashboard.html',
  styleUrl: './progress-dashboard.scss',
})
export class ProgressDashboard implements OnInit {
  private readonly progressService = inject(ProgressService);

  progress = signal<UserProgress>(EMPTY_PROGRESS);
  loading = signal(true);
  error = signal(false);

  accuracy = computed(() => {
    const p = this.progress();
    return p.totalAnswered > 0
      ? Math.round((p.totalCorrect / p.totalAnswered) * 100)
      : 0;
  });

  weakestSubject = computed(() => {
    const subjects = this.progress().bySubject;
    if (subjects.length === 0) return null;

    let weakest = subjects[0];
    let lowestAccuracy = this.getSubjectAccuracy(weakest.answered, weakest.correct);

    for (const sub of subjects) {
      const acc = this.getSubjectAccuracy(sub.answered, sub.correct);
      if (acc < lowestAccuracy) {
        lowestAccuracy = acc;
        weakest = sub;
      }
    }

    return weakest;
  });

  hasData = computed(() => this.progress().totalAnswered > 0);

  ngOnInit(): void {
    this.progressService.getGlobalProgress().subscribe({
      next: (res) => {
        this.progress.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  getSubjectAccuracy(answered: number, correct: number): number {
    return answered > 0 ? Math.round((correct / answered) * 100) : 0;
  }
}
