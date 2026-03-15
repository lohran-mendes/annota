import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MockExamService } from '../../../core/services/mock-exam.service';
import type { MockExamSubjectResult, MockExamQuestionResult } from '@annota/shared';

@Component({
  selector: 'annota-mock-exam-result',
  imports: [
    RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatProgressSpinnerModule,
    MatDividerModule, MatSlideToggleModule, MatTabsModule,
  ],
  templateUrl: './mock-exam-result.html',
  styleUrl: './mock-exam-result.scss',
})
export class MockExamResult implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly mockExamService = inject(MockExamService);

  score = signal(0);
  totalQuestions = signal(0);
  correctAnswers = signal(0);
  timeSpent = signal('');
  subjectResults = signal<MockExamSubjectResult[]>([]);
  questionDetails = signal<MockExamQuestionResult[]>([]);
  showOnlyErrors = signal(false);
  loading = signal(true);
  error = signal(false);

  private mockExamId = '';

  ngOnInit() {
    this.mockExamId = this.route.snapshot.paramMap.get('sessionId') ?? '';
    this.loadResult(this.mockExamId);
  }

  reload(): void {
    this.error.set(false);
    this.loadResult(this.mockExamId);
  }

  private loadResult(id: string) {
    this.loading.set(true);
    this.mockExamService.getSessionResult(id).subscribe({
      next: (res) => {
        const result = res.data;
        this.score.set(result.score);
        this.totalQuestions.set(result.totalQuestions);
        this.correctAnswers.set(result.correctCount);
        this.timeSpent.set(this.formatTimeSpent(result.timeSpent));
        this.subjectResults.set(result.bySubject);
        this.questionDetails.set(result.details ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private formatTimeSpent(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) {
      return `${h}h ${m}min`;
    }
    return `${m}min`;
  }

  detailsBySubject = computed(() => {
    const details = this.questionDetails();
    const onlyErrors = this.showOnlyErrors();
    const grouped = new Map<string, { subjectName: string; color: string; questions: MockExamQuestionResult[] }>();

    for (const detail of details) {
      if (onlyErrors && detail.correct) continue;
      const key = detail.subjectId;
      if (!grouped.has(key)) {
        const sub = this.subjectResults().find((s) => s.subjectId === key);
        grouped.set(key, {
          subjectName: detail.subjectName,
          color: sub?.color ?? '#999',
          questions: [],
        });
      }
      grouped.get(key)!.questions.push(detail);
    }

    return Array.from(grouped.values());
  });

  getPercent(correct: number, total: number): number {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }

  toggleShowOnlyErrors(): void {
    this.showOnlyErrors.update((v) => !v);
  }

  getSubjectErrorCount(questions: MockExamQuestionResult[]): number {
    return questions.filter((q) => !q.correct).length;
  }
}
