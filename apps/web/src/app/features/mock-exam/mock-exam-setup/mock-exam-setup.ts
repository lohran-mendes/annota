import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ExamService } from '../../../core/services/exam.service';
import { MockExamService } from '../../../core/services/mock-exam.service';
import type { Exam, MockExam, MockExamSessionConfig } from '@annota/shared';

@Component({
  selector: 'annota-mock-exam-setup',
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule, DatePipe,
  ],
  templateUrl: './mock-exam-setup.html',
  styleUrl: './mock-exam-setup.scss',
})
export class MockExamSetup implements OnInit {
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);
  private readonly mockExamService = inject(MockExamService);
  private readonly snackBar = inject(MatSnackBar);

  publishedMockExams = signal<MockExam[]>([]);
  sessionHistory = signal<MockExamSessionConfig[]>([]);
  private examMap = signal<Map<string, Exam>>(new Map());

  loadingTemplates = signal(false);
  loadingHistory = signal(false);
  startingExam = signal<string | null>(null);

  // Map examId to exam name for display in cards
  getExamName = computed(() => (examId: string) => this.examMap().get(examId)?.name ?? '');

  ngOnInit(): void {
    this.loadTemplates();
    this.loadHistory();
  }

  loadTemplates() {
    this.loadingTemplates.set(true);
    forkJoin({
      mockExams: this.mockExamService.getAll({ published: 'true' }),
      exams: this.examService.getAll(),
    }).subscribe({
      next: ({ mockExams, exams }) => {
        this.publishedMockExams.set(mockExams.data);
        this.examMap.set(new Map(exams.data.map((e) => [e.id, e])));
        this.loadingTemplates.set(false);
      },
      error: () => {
        this.loadingTemplates.set(false);
      },
    });
  }

  loadHistory() {
    this.loadingHistory.set(true);
    this.mockExamService.getSessions().subscribe({
      next: (res) => {
        this.sessionHistory.set(res.data);
        this.loadingHistory.set(false);
      },
      error: () => {
        this.loadingHistory.set(false);
      },
    });
  }

  startMockExam(mockExam: MockExam) {
    this.startingExam.set(mockExam.id);
    this.mockExamService.startSession(mockExam.id).subscribe({
      next: (res) => {
        this.startingExam.set(null);
        this.router.navigate(['/mock-exam', res.data.config.id]);
      },
      error: () => {
        this.startingExam.set(null);
        this.snackBar.open('Erro ao iniciar simulado. Tente novamente.', 'OK', { duration: 3000 });
      },
    });
  }

  continueSession(session: MockExamSessionConfig) {
    this.router.navigate(['/mock-exam', session.id]);
  }

  viewResult(session: MockExamSessionConfig) {
    this.router.navigate(['/mock-exam', session.id, 'result']);
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
  }
}
