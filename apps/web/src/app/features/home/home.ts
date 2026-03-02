import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ExamService } from '../../core/services/exam.service';
import { ProgressService } from '../../core/services/progress.service';
import { MOCK_EXAMS, MOCK_PROGRESS } from '../../core/mock-data';
import { mergeWithMock } from '../../core/utils/data-merge';
import type { Exam, UserProgress } from '@annota/shared';

@Component({
  selector: 'annota-home',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly examService = inject(ExamService);
  private readonly progressService = inject(ProgressService);

  exams = signal<Exam[]>(MOCK_EXAMS);
  loading = signal(false);
  progress = signal<UserProgress>(MOCK_PROGRESS);

  ngOnInit() {
    this.loadExams();
    this.loadProgress();
  }

  private loadExams() {
    this.loading.set(true);
    this.examService.getAll().subscribe({
      next: (res) => {
        this.exams.set(mergeWithMock(res.data, MOCK_EXAMS));
        this.loading.set(false);
      },
      error: () => {
        this.exams.set(MOCK_EXAMS);
        this.loading.set(false);
      },
    });
  }

  private loadProgress() {
    this.progressService.getGlobalProgress().subscribe({
      next: (res) => {
        this.progress.set(res.data);
      },
      error: () => {
        this.progress.set(MOCK_PROGRESS);
      },
    });
  }

  get accuracyPercent(): number {
    const p = this.progress();
    return p.totalAnswered > 0
      ? Math.round((p.totalCorrect / p.totalAnswered) * 100)
      : 0;
  }
}
