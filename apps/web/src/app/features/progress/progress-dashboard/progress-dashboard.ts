import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MOCK_PROGRESS } from '../../../core/mock-data';
import { ProgressService } from '../../../core/services/progress.service';
import type { UserProgress } from '@annota/shared';

@Component({
  selector: 'annota-progress-dashboard',
  imports: [MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './progress-dashboard.html',
  styleUrl: './progress-dashboard.scss',
})
export class ProgressDashboard implements OnInit {
  private readonly progressService = inject(ProgressService);

  progress = signal<UserProgress>(MOCK_PROGRESS);
  loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.progressService.getGlobalProgress().subscribe({
      next: (res) => {
        this.progress.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  get accuracy(): number {
    const p = this.progress();
    return p.totalAnswered > 0
      ? Math.round((p.totalCorrect / p.totalAnswered) * 100)
      : 0;
  }

  getSubjectAccuracy(answered: number, correct: number): number {
    return answered > 0 ? Math.round((correct / answered) * 100) : 0;
  }
}
